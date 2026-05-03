package com.kaushalya.karnataka.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.kaushalya.karnataka.data.models.*
import com.kaushalya.karnataka.data.repository.MarketplaceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class WorkerViewModel : ViewModel() {
    private val repository = MarketplaceRepository()
    private val auth = FirebaseAuth.getInstance()
    private val workerId = auth.currentUser?.uid ?: ""

    private val _services = MutableStateFlow<List<ServiceCard>>(emptyList())
    val services: StateFlow<List<ServiceCard>> = _services

    private val _requests = MutableStateFlow<List<HireRequest>>(emptyList())
    val requests: StateFlow<List<HireRequest>> = _requests

    private val _reviews = MutableStateFlow<List<Review>>(emptyList())
    val reviews: StateFlow<List<Review>> = _reviews

    init {
        loadWorkerData()
    }

    fun loadWorkerData() {
        viewModelScope.launch {
            if (workerId.isNotEmpty()) {
                _services.value = repository.getWorkerServices(workerId)
                // In a real app we would use a listener for requests
            }
        }
    }

    fun addService(name: String, category: String, price: Double, priceType: String) {
        viewModelScope.launch {
            repository.createHireRequest(HireRequest()) // Placeholder for illustrative purposes
            // Implementation logic...
        }
    }

    fun updateStatus(requestId: String, status: String) {
        viewModelScope.launch {
            repository.updateRequestStatus(requestId, status)
            loadWorkerData()
        }
    }
}
