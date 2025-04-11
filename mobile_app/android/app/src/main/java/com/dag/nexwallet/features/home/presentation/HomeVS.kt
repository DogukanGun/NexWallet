package com.dag.nexwallet.features.home.presentation

import com.dag.nexwallet.base.BaseVS
import com.dag.nexwallet.data.model.User
<<<<<<< HEAD
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
=======
>>>>>>> feat/lilypad_integration

sealed class HomeVS : BaseVS {
    data object Loading : HomeVS()
    data object LoggedOut: HomeVS()
    data class Error(val message: String) : HomeVS()
    data class Success(
        val user: User?,
<<<<<<< HEAD
        val myAgents: List<GetMyAgentsResponse>,
=======
>>>>>>> feat/lilypad_integration
        val isSignedIn: Boolean = false
    ) : HomeVS()

    companion object {
        fun initial() = Loading
    }
}