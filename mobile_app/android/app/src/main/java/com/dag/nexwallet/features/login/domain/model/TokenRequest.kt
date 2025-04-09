package com.dag.nexwallet.features.login.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TokenRequest(
    @SerialName("user_id")
    val userId: String
)
