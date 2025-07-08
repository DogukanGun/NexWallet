package com.dag.nexwallet.features.solana.domain.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class SwapRequest(
    val fromToken: String,
    val toToken: String,
    val amount: String,
    val slippage: Double = 0.5
)

@Serializable
data class SwapBody(
    val quoteResponse: JsonElement,
    val userPublicKey: String,
    val wrapAndUnwrapSol: Boolean = true,
    val dynamicComputeUnitLimit: Boolean = true,
    val dynamicSlippage: Boolean = true,
    val prioritizationFeeLamports: PrioritizationFeeLamports,
    val feeAccount: String? = null
)

@Serializable
data class PrioritizationFeeLamports(
    val priorityLevelWithMaxLamports: PriorityLevelWithMaxLamports
)

@Serializable
data class PriorityLevelWithMaxLamports(
    val maxLamports: Int,
    val global: Boolean,
    val priorityLevel: String
)

@Serializable
data class SwapResponse(
    val swapTransaction: String,
    val lastValidBlockHeight: Long? = null,
    val prioritizationFeeLamports: Long? = null,
    val computeUnitLimit: Long? = null
)