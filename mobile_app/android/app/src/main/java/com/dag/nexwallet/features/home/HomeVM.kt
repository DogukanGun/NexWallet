package com.dag.nexwallet.features.home

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeVM @Inject constructor(
    private val userRepository: UserRepository
) : BaseVM<HomeVS>(initialValue = HomeVS.initial()) {

    init {
        getUser()
    }

    private fun getUser() {
        viewModelScope.launch {
            _viewState.value = HomeVS.Loading
            try {
                userRepository.getUser()
                    .onSuccess { user ->
                        _viewState.value = HomeVS.Success(
                            user = user,
                            isSignedIn = user != null
                        )
                    }
                    .onFailure { exception ->
                        _viewState.value = HomeVS.Error(
                            message = exception.message ?: "Unknown error occurred"
                        )
                    }
            } catch (e: Exception) {
                _viewState.value = HomeVS.Error(
                    message = e.message ?: "Unknown error occurred"
                )
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            userRepository.clearUser()
            _viewState.value = HomeVS.LoggedOut
        }
    }
}