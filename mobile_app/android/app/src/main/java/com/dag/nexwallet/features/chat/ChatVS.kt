package com.dag.nexwallet.features.chat

sealed class ChatVS {
    data object Initial : ChatVS()
    data object Loading : ChatVS()
    data class Success(val messages: List<ChatMessage>) : ChatVS()
    data class Error(val message: String) : ChatVS()
}