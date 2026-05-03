package com.kaushalya.karnataka.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.kaushalya.karnataka.data.models.User
import com.kaushalya.karnataka.data.repository.MarketplaceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val repository = MarketplaceRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        checkUserSession()
    }

    fun checkUserSession() {
        viewModelScope.launch {
            _isLoading.value = true
            _currentUser.value = repository.getCurrentUser()
            _isLoading.value = false
        }
    }

    fun logout() {
        auth.signOut()
        _currentUser.value = null
    }
}
