package com.dag.nexwallet.features.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.BuildConfig
import com.google.ai.client.generativeai.GenerativeModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ChatVM : ViewModel() {
    private val _uiState = MutableStateFlow<ChatVS>(ChatVS.Initial)
    val uiState: StateFlow<ChatVS> = _uiState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val generativeModel = GenerativeModel(
        modelName = "gemini-pro",
        apiKey = BuildConfig.API_KEY
    )

    private var chat = generativeModel.startChat()

    fun sendMessage(content: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                // Add user message immediately
                val userMessage = ChatMessage(
                    content = content,
                    role = "user"
                )
                _messages.value = _messages.value + userMessage
                _uiState.value = ChatVS.Loading

                // Send to Gemini and get response
                val response = chat.sendMessage(content)
                
                response.text?.let { responseText ->
                    // Add AI response
                    val assistantMessage = ChatMessage(
                        content = responseText,
                        role = "assistant"
                    )
                    _messages.value = _messages.value + assistantMessage
                    _uiState.value = ChatVS.Success(_messages.value)
                }
            } catch (e: Exception) {
                _uiState.value = ChatVS.Error(e.localizedMessage ?: "An error occurred")
            }
        }
    }

    fun clearChat() {
        _messages.value = emptyList()
        chat = generativeModel.startChat()
        _uiState.value = ChatVS.Initial
    }
}