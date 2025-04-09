package com.dag.nexwallet.features.home.presentation

import com.dag.nexwallet.base.BaseVS
import com.dag.nexwallet.data.model.User

sealed class HomeVS : BaseVS {
    data object Loading : HomeVS()
    data object LoggedOut: HomeVS()
    data class Error(val message: String) : HomeVS()
    data class Success(
        val user: User?,
        val isSignedIn: Boolean = false
    ) : HomeVS()

    companion object {
        fun initial() = Loading
    }
}