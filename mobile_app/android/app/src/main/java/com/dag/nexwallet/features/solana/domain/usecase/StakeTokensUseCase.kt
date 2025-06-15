package com.dag.nexwallet.features.solana.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.solana.domain.model.StakeRequest
import com.dag.nexwallet.features.solana.domain.model.StakeResponse
import com.dag.nexwallet.features.solana.domain.repository.ISolanaService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class StakeTokensUseCase @Inject constructor(
    private val solanaService: ISolanaService
) : BaseUseCase<StakeRequest, StakeResponse?> {
    override fun execute(params: StakeRequest?): Flow<StakeResponse?> = flow {
        params?.let {
            emit(solanaService.stake(it))
        }
    }
} 