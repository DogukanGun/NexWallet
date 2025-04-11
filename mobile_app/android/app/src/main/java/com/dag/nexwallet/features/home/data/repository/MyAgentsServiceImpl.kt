package com.dag.nexwallet.features.home.data.repository

<<<<<<< HEAD
import com.dag.nexwallet.features.home.data.datasource.MyAgentsService
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import com.dag.nexwallet.features.home.domain.repository.IMyAgentsService

class MyAgentsServiceImpl(val myAgentsService: MyAgentsService): IMyAgentsService {
    override suspend fun getMyAgents(): List<GetMyAgentsResponse> {
        return myAgentsService.getMyAgents()
    }
=======
class MyAgentsServiceImpl {
>>>>>>> feat/lilypad_integration
}