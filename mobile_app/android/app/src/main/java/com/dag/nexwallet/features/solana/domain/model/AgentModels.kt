package com.dag.nexwallet.features.solana.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class AgentRequest(
    val message: String,
    val wallet: String
)

@Serializable
data class AgentResponse(
    val text: String,
    val transaction: String? = null,
    val error: String? = null,
    val success: Boolean = true
) 