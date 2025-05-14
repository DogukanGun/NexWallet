package com.dag.nexwallet.features.chat.di

import com.dag.nexwallet.features.chat.data.datasource.ChatService
import com.dag.nexwallet.features.chat.data.repository.ChatServiceImpl
import com.dag.nexwallet.features.chat.domain.repository.IChatService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class ChatModule {

    @Singleton
    @Provides
    fun provideChatService(chatService: ChatService): IChatService {
        return ChatServiceImpl(chatService)
    }

}