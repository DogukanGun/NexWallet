package com.dag.nexwallet.features.login.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class TokenResponse(
    val token: String
)
