package com.dag.nexwallet.features.chat.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.chat.domain.model.ChatRequest
import com.dag.nexwallet.features.chat.domain.model.ChatResponse
import com.dag.nexwallet.features.chat.domain.repository.IChatService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class ChatWithAIUseCase @Inject constructor(val chatService: IChatService) :
    BaseUseCase<ChatRequest, ChatResponse?>{
    override fun execute(params: ChatRequest?): Flow<ChatResponse?> = flow {
        params?.let {
            emit(chatService.chat(it))
        }
    }
}