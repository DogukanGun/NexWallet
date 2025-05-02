package com.dag.nexwallet.features.login.presentation

import com.dag.nexwallet.base.BaseVS
import com.dag.nexwallet.data.model.User

sealed class LoginVS: BaseVS {
    data object Loading : LoginVS()
    data class Error(val message: String) : LoginVS()
    data class NavigateToHome(val user: User) : LoginVS()
}