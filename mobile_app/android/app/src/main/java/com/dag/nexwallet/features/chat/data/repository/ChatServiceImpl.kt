package com.dag.nexwallet.features.chat.data.repository

import com.dag.nexwallet.features.chat.data.datasource.ChatService
import com.dag.nexwallet.features.chat.domain.model.ChatRequest
import com.dag.nexwallet.features.chat.domain.model.ChatResponse
import com.dag.nexwallet.features.chat.domain.repository.IChatService

class ChatServiceImpl(val chatService: ChatService): IChatService {
    override suspend fun chat(body: ChatRequest): ChatResponse? {
        return chatService.chat(body)
    }
}