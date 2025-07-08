package com.dag.nexwallet.features.stellar.presentation

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.components.bottomnav.BottomNavMessageManager
import com.dag.nexwallet.base.scroll.ScrollStateManager
import com.google.firebase.Firebase
import com.google.firebase.ai.Chat
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.GenerativeBackend
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StellarVM @Inject constructor(
    private val scrollManager:ScrollStateManager,
    private val bottomNavManager:BottomNavMessageManager
) : BaseVM<StellarVS>(StellarVS.Loading) {

    init {
        loadWalletData()
    }

    private fun loadWalletData() {
        viewModelScope.launch {
            try {
                bottomNavManager.showMessage("Stellar Wallet")
                _viewState.value = StellarVS.Success(
                    balance = "0",
                    accountId = "",
                    isTestnet = true,
                    aiSuggestions = emptyList(),
                    recentTransactions = emptyList(),
                    chatMessages = listOf(
                        StellarVS.ChatMessage(
                            content = "Hello! I'm your Stellar AI assistant. How can I help you today?",
                            isFromAI = true
                        )
                    )
                )
            } catch (e: Exception) {
                _viewState.value = StellarVS.Error(e.message ?: "An unknown error occurred")
            }
        }
    }

    fun switchToAiChat() {
        val currentState = _viewState.value
        viewModelScope.launch {
            bottomNavManager.showMessage("Chat with AI")
        }
        if (currentState is StellarVS.Success) {
            scrollManager.updateScrolling(true)
            _viewState.value = currentState.copy(
                currentScreen = StellarVS.ScreenState.AI_CHAT
            )
        }
    }

    fun switchToWallet() {
        val currentState = _viewState.value
        if (currentState is StellarVS.Success) {
            scrollManager.updateScrolling(false)
            _viewState.value = currentState.copy(
                currentScreen = StellarVS.ScreenState.WALLET
            )
        }
    }

    fun sendTransaction(amount: String, destination: String, asset: String = "XLM") {
        viewModelScope.launch {
            try {
                // Implementation will be added later
            } catch (e: Exception) {
                _viewState.value = StellarVS.Error(e.message ?: "Failed to send transaction")
            }
        }
    }

    fun swapAssets(fromAsset: String, toAsset: String, amount: String) {
        viewModelScope.launch {
            try {
                // Implementation will be added later
            } catch (e: Exception) {
                _viewState.value = StellarVS.Error(e.message ?: "Failed to swap assets")
            }
        }
    }

    fun addAsset(assetCode: String, issuer: String) {
        viewModelScope.launch {
            try {
                // Implementation will be added later
            } catch (e: Exception) {
                _viewState.value = StellarVS.Error(e.message ?: "Failed to add asset")
            }
        }
    }

    fun refreshWallet() {
        _viewState.value = StellarVS.Loading
        loadWalletData()
    }

    fun sendMessage(content: String) {
        val currentState = _viewState.value
        if (currentState is StellarVS.Success && content.isNotBlank()) {
            // Add user message
            val userMessage = StellarVS.ChatMessage(
                content = content,
                isFromAI = false
            )
            
            val updatedMessages = currentState.chatMessages + userMessage
            _viewState.value = currentState.copy(
                chatMessages = updatedMessages
            )
            
            viewModelScope.launch {
                try {

                    val aiMessage = StellarVS.ChatMessage(
                        content = "Sorry, I couldn't generate a response.",
                        isFromAI = true
                    )
                    
                    val currentStateAfterResponse = _viewState.value
                    if (currentStateAfterResponse is StellarVS.Success) {
                        _viewState.value = currentStateAfterResponse.copy(
                            chatMessages = currentStateAfterResponse.chatMessages + aiMessage
                        )
                    }
                } catch (e: Exception) {
                    val errorMessage = StellarVS.ChatMessage(
                        content = "Sorry, I encountered an error: ${e.message}. Starting a new chat session.",
                        isFromAI = true
                    )
                    
                    val currentStateAfterError = _viewState.value
                    if (currentStateAfterError is StellarVS.Success) {
                        _viewState.value = currentStateAfterError.copy(
                            chatMessages = currentStateAfterError.chatMessages + errorMessage
                        )
                    }
                }
            }
        }
    }
}