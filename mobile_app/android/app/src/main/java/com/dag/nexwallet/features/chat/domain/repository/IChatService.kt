package com.dag.nexwallet.features.chat.domain.repository

import com.dag.nexwallet.features.chat.domain.model.ChatRequest
import com.dag.nexwallet.features.chat.domain.model.ChatResponse

interface IChatService {
    suspend fun chat(body:ChatRequest): ChatResponse?
}