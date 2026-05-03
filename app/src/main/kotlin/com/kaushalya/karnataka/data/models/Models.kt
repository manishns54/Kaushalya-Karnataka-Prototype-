package com.kaushalya.karnataka.data.models

data class User(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "CUSTOMER", // WORKER, CUSTOMER, ADMIN
    val locality: String = "",
    val tradeCategory: String = "",
    val bio: String = "",
    val avgRating: Double = 0.0,
    val totalReviewCount: Int = 0,
    val totalJobs: Int = 0,
    val isActive: Boolean = true,
    val fcmToken: String = ""
)

data class ServiceCard(
    val id: String = "",
    val workerId: String = "",
    val name: String = "",
    val category: String = "",
    val priceType: String = "Fixed", // Fixed, Starting at
    val price: Double = 0.0,
    val description: String = ""
)

data class HireRequest(
    val id: String = "",
    val customerId: String = "",
    val workerId: String = "",
    val customerName: String = "",
    val workerName: String = "",
    val serviceName: String = "",
    val status: String = "PENDING", // PENDING, ACCEPTED, COMPLETED, REVIEWED, DECLINED
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Review(
    val id: String = "",
    val requestId: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val workerId: String = "",
    val rating: Int = 0,
    val comment: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val flagged: Boolean = false
)
