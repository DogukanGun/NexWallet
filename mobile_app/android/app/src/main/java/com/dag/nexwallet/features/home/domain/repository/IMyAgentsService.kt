package com.dag.nexwallet.features.home.domain.repository

import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse

interface IMyAgentsService {
    suspend fun getMyAgents(): List<GetMyAgentsResponse>
}