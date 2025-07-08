package com.dag.nexwallet.features.solana.domain.repository

import com.dag.nexwallet.features.solana.domain.model.AgentResponse
import com.dag.nexwallet.features.solana.domain.model.StakeRequest
import com.dag.nexwallet.features.solana.domain.model.StakeResponse
import com.dag.nexwallet.features.solana.domain.model.SwapRequest
import com.dag.nexwallet.features.solana.domain.model.SwapResponse

interface ISolanaService {
    suspend fun swap(request: SwapRequest): SwapResponse
    suspend fun stake(request: StakeRequest): StakeResponse
    suspend fun sendMessage(message: String): AgentResponse
} 