package com.dag.nexwallet.features.home.data.datasource

import com.dag.nexwallet.base.Logger
import com.dag.nexwallet.base.extensions.getResponseData
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class MyAgentsService @Inject constructor(
    @Named("AuthorizedKtor") val ktor: HttpClient,
    private val logger: Logger
) {
    suspend fun getMyAgents(): List<GetMyAgentsResponse> {
        val res = ktor.get("/agent/my")
        return res.getResponseData<List<GetMyAgentsResponse>>(logger) ?: emptyList()
    }
}