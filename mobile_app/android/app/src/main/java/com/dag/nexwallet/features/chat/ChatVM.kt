package com.dag.nexwallet.features.chat

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.google.firebase.Firebase
import com.google.firebase.vertexai.vertexAI
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatVM @Inject constructor() : BaseVM<ChatVS>(ChatVS.Initial) {
    private val _uiState = MutableStateFlow<ChatVS>(ChatVS.Initial)
    val uiState: StateFlow<ChatVS> = _uiState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    fun sendMessage(content: String) {
        val generativeModel = Firebase.vertexAI.generativeModel("gemini-2.0-flash")

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val prompt = "Write a story about a magic backpack."
                val response = generativeModel.generateContent(prompt)
                _viewState.value = ChatVS.Success(messages =listOf<String>(response.text.toString()))

            } catch (e: Exception) {
                _uiState.value = ChatVS.Error(e.localizedMessage ?: "An error occurred")
            }
        }
    }

    fun clearChat() {
        _messages.value = emptyList()
        _uiState.value = ChatVS.Initial
    }
}