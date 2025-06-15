package com.dag.nexwallet.features.solana.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.solana.domain.model.SwapRequest
import com.dag.nexwallet.features.solana.domain.model.SwapResponse
import com.dag.nexwallet.features.solana.domain.repository.ISolanaService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SwapTokensUseCase @Inject constructor(
    private val solanaService: ISolanaService
) : BaseUseCase<SwapRequest, SwapResponse?> {
    override fun execute(params: SwapRequest?): Flow<SwapResponse?> = flow {
        params?.let {
            emit(solanaService.swap(it))
        }
    }
} 