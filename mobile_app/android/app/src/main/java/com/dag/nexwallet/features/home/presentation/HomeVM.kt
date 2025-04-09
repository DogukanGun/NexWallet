package com.dag.nexwallet.features.home.presentation

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.data.repository.UserRepository
import com.dag.nexwallet.features.home.domain.usecase.GetMyAgentsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeVM @Inject constructor(
    private val userRepository: UserRepository,
    private val getMyAgentsUseCase: GetMyAgentsUseCase
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
                            isSignedIn = user != null,
                            myAgents = emptyList()
                        )
                        getMyAgents()
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

    private fun getMyAgents(){
        viewModelScope.launch {
            try {
                getMyAgentsUseCase.execute().collect { agents ->
                    val currentState = _viewState.value
                    if (currentState is HomeVS.Success) {
                        _viewState.value = currentState.copy(
                            myAgents = agents
                        )
                    }
                }
            } catch (e: Exception) {
                _viewState.value = HomeVS.Error(
                    message = e.message ?: "Failed to get agents"
                )
            }
        }
    }
}