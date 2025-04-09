package com.dag.nexwallet.features.home.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import com.dag.nexwallet.features.home.domain.repository.IMyAgentsService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class GetMyAgentsUseCase @Inject constructor(private val getMyAgentsService: IMyAgentsService):
    BaseUseCase<Unit, List<GetMyAgentsResponse>> {
    
    override fun execute(params: Unit?): Flow<List<GetMyAgentsResponse>> = flow {
        emit(getMyAgentsService.getMyAgents())
    }
}