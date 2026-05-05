package com.kaushalya.karnataka.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kaushalya.karnataka.data.model.UserProfile
import com.kaushalya.karnataka.data.model.UserRole
import com.kaushalya.karnataka.data.repository.AuthRepository
import com.kaushalya.karnataka.data.repository.MarketplaceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class WorkerRegisterState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class WorkerRegisterViewModel(
    private val authRepo: AuthRepository = AuthRepository(),
    private val marketplaceRepo: MarketplaceRepository = MarketplaceRepository()
) : ViewModel() {

    private val _state = MutableStateFlow(WorkerRegisterState())
    val state: StateFlow<WorkerRegisterState> = _state

    fun registerWorker(
        uid: String,
        name: String,
        email: String,
        trade: String,
        locality: String
    ) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            val profile = UserProfile(
                uid = uid,
                name = name,
                email = email,
                role = UserRole.WORKER,
                tradeCategory = trade,
                locality = locality
            )
            val success = marketplaceRepo.saveWorkerProfile(profile)
            _state.value = _state.value.copy(
                isLoading = false,
                isSuccess = success,
                error = if (success) null else "Profile creation failed"
            )
        }
    }
}
