package com.dag.nexwallet.features.chat.data.datasource

import com.dag.nexwallet.base.Logger
import com.dag.nexwallet.base.extensions.getResponseData
import com.dag.nexwallet.features.chat.domain.model.ChatRequest
import com.dag.nexwallet.features.chat.domain.model.ChatResponse
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class ChatService @Inject constructor(
    @Named("AuthorizedFrontendKtor") val ktor: HttpClient,
    private val logger: Logger
) {
    suspend fun chat(body: ChatRequest): ChatResponse? {
        val res = ktor.post("/mobile-solana") {
            contentType(ContentType.Application.Json)
            setBody(body)
        }
        return res.getResponseData<ChatResponse>(logger)
    }
}