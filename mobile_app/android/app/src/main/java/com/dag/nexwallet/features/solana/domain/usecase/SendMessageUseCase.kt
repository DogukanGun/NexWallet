package com.dag.nexwallet.features.solana.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.solana.domain.model.AgentResponse
import com.dag.nexwallet.features.solana.domain.repository.ISolanaService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SendMessageUseCase @Inject constructor(
    private val solanaService: ISolanaService
) : BaseUseCase<String, AgentResponse?> {
    override fun execute(params: String?): Flow<AgentResponse?> = flow {
        params?.let {
            emit(solanaService.sendMessage(it))
        }
    }
} 