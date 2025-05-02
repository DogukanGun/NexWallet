package com.dag.nexwallet.features.home.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import com.dag.nexwallet.features.home.domain.repository.IMyAgentsService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class GetMyAgentsUseCase @Inject constructor(val myAgentService: IMyAgentsService):
    BaseUseCase<Any, List<GetMyAgentsResponse>>{

    override fun execute(params: Any?): Flow<List<GetMyAgentsResponse>> = flow {
        emit(myAgentService.getMyAgents())
    }

}