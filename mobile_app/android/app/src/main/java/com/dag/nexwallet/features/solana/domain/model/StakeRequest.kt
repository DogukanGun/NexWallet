package com.dag.nexwallet.features.solana.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class StakeRequest(
    val amount: String,
    val validator: String? = null
)

@Serializable
data class StakeResponse(
    val transaction: String
)

@Serializable
data class StakeBody(
    val account: String
) 