package com.kaushalya.karnataka.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.kaushalya.karnataka.data.model.UserProfile
import kotlinx.coroutines.tasks.await

class MarketplaceRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    suspend fun saveWorkerProfile(profile: UserProfile): Boolean {
        return try {
            firestore.collection("users").document(profile.uid).set(profile).await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getWorkersByCategory(category: String): List<UserProfile> {
        return try {
            firestore.collection("users")
                .whereEqualTo("role", "WORKER")
                .whereEqualTo("tradeCategory", category)
                .get()
                .await()
                .toObjects(UserProfile::class.java)
        } catch (e: Exception) {
            emptyList()
        }
    }
}
