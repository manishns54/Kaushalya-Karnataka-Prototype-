package com.kaushalya.karnataka.data.model

enum class UserRole {
    CUSTOMER, WORKER, ADMIN
}

data class UserProfile(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val role: UserRole = UserRole.CUSTOMER,
    val tradeCategory: String? = null,
    val locality: String? = null,
    val isActive: Boolean = true,
    val avgRating: Double = 0.0,
    val totalReviewCount: Int = 0,
    val totalJobs: Int = 0,
    val photoUrl: String? = null
)
