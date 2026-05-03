package com.kaushalya.karnataka.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.kaushalya.karnataka.data.models.*
import kotlinx.coroutines.tasks.await

class MarketplaceRepository {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    // --- User Auth & Profile ---
    suspend fun getCurrentUser(): User? {
        val uid = auth.currentUser?.uid ?: return null
        return db.collection("users").document(uid).get().await().toObject(User::class.java)
    }

    suspend fun saveUserProfile(user: User) {
        db.collection("users").document(user.uid).set(user).await()
    }

    // --- Worker Marketplace ---
    suspend fun getActiveWorkers(category: String? = null): List<User> {
        var query = db.collection("users")
            .whereEqualTo("role", "WORKER")
            .whereEqualTo("isActive", true)
        
        if (!category.isNullOrEmpty() && category != "All") {
            query = query.whereEqualTo("tradeCategory", category)
        }
        
        return query.get().await().toObjects(User::class.java)
    }

    // --- Service Cards ---
    suspend fun getWorkerServices(workerId: String): List<ServiceCard> {
        return db.collection("serviceCards")
            .whereEqualTo("workerId", workerId)
            .get().await().toObjects(ServiceCard::class.java)
    }

    // --- Hire Requests & State Machine ---
    suspend fun createHireRequest(request: HireRequest) {
        val doc = db.collection("hireRequests").document()
        db.collection("hireRequests").document(doc.id).set(request.copy(id = doc.id)).await()
    }

    suspend fun updateRequestStatus(requestId: String, status: String) {
        db.collection("hireRequests").document(requestId)
            .update("status", status, "updatedAt", System.currentTimeMillis()).await()
    }

    // --- Atomic Rating Engine ---
    suspend fun submitReview(review: Review, rating: Int) {
        val reviewId = db.collection("reviews").document().id
        val workerId = review.workerId
        
        db.runTransaction { transaction ->
            val workerRef = db.collection("users").document(workerId)
            val workerSnap = transaction.get(workerRef)
            val currentAvg = workerSnap.getDouble("avgRating") ?: 0.0
            val currentCount = workerSnap.getLong("totalReviewCount")?.toInt() ?: 0
            
            val newCount = currentCount + 1
            val newAvg = ((currentAvg * currentCount) + rating) / newCount
            
            transaction.update(workerRef, 
                "avgRating", newAvg,
                "totalReviewCount", newCount,
                "totalJobs", (workerSnap.getLong("totalJobs")?.toInt() ?: 0) + 1
            )
            
            val reviewDoc = review.copy(id = reviewId)
            transaction.set(db.collection("reviews").document(reviewId), reviewDoc)
            
            transaction.update(db.collection("hireRequests").document(review.requestId), "status", "REVIEWED")
        }.await()
    }

    // --- Admin & Moderation ---
    suspend fun toggleWorkerStatus(uid: String, isActive: Boolean) {
        db.collection("users").document(uid).update("isActive", isActive).await()
    }

    suspend fun getFlaggedReviews(): List<Review> {
        return db.collection("reviews").whereEqualTo("flagged", true).get().await().toObjects(Review::class.java)
    }
}
