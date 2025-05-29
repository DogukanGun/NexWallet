package com.dag.nexwallet.features.bnb.presentation

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.components.bottomnav.BottomNavMessageManager
import com.dag.nexwallet.base.scroll.ScrollStateManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BnbVM @Inject constructor(
    private val scrollManager: ScrollStateManager,
    private val bottomNavManager: BottomNavMessageManager
) : BaseVM<BnbVS>(BnbVS.Loading) {

    init {
        initializeWallet()
        scrollManager.updateScrolling(true)
    }

    private fun initializeWallet() {
        viewModelScope.launch {
            try {
                bottomNavManager.showMessage("BNB Wallet")
                _viewState.value = BnbVS.Success(
                    walletInfo = BnbVS.WalletInfo(
                        address = "0x1234...5678",
                        balance = "0.00",
                        fiatValue = "$0.00"
                    ),
                    transactions = emptyList(),
                    chatMessages = listOf(
                        BnbVS.ChatMessage(
                            content = "Hi! I'm your BNB AI assistant. I can help you with transactions, swaps, and staking. What would you like to do?",
                            isFromAI = true
                        )
                    )
                )
            } catch (e: Exception) {
                _viewState.value = BnbVS.Error(e.message ?: "Failed to initialize BNB Wallet")
            }
        }
    }

    fun toggleMode() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            val newMode = when (currentState.currentMode) {
                BnbVS.Mode.WALLET -> BnbVS.Mode.AI_AGENT
                BnbVS.Mode.AI_AGENT -> BnbVS.Mode.WALLET
            }
            _viewState.value = currentState.copy(
                currentMode = newMode,
                isCardsExpanded = newMode == BnbVS.Mode.WALLET
            )
        }
    }

    fun toggleCards() {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            _viewState.value = currentState.copy(
                isCardsExpanded = !currentState.isCardsExpanded
            )
        }
    }

    fun sendMessage(content: String) {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success && content.isNotBlank()) {
            val userMessage = BnbVS.ChatMessage(
                content = content,
                isFromAI = false
            )
            
            val updatedMessages = currentState.chatMessages + userMessage
            _viewState.value = currentState.copy(
                chatMessages = updatedMessages
            )
            
            processUserMessage(content)
        }
    }

    private fun processUserMessage(content: String) {
        viewModelScope.launch {
            try {
                // TODO: Implement AI processing logic
                val aiResponse = BnbVS.ChatMessage(
                    content = "I understand you want to perform an action. Let me help you with that.",
                    isFromAI = true
                )
                
                val currentState = _viewState.value
                if (currentState is BnbVS.Success) {
                    _viewState.value = currentState.copy(
                        chatMessages = currentState.chatMessages + aiResponse
                    )
                }
            } catch (e: Exception) {
                handleError("Failed to process message: ${e.message}")
            }
        }
    }

    private fun handleError(errorMessage: String) {
        val currentState = _viewState.value
        if (currentState is BnbVS.Success) {
            val errorChatMessage = BnbVS.ChatMessage(
                content = errorMessage,
                isFromAI = true,
                messageType = BnbVS.MessageType.ERROR
            )
            _viewState.value = currentState.copy(
                chatMessages = currentState.chatMessages + errorChatMessage
            )
        } else {
            _viewState.value = BnbVS.Error(errorMessage)
        }
    }

    fun refreshWallet() {
        _viewState.value = BnbVS.Loading
        initializeWallet()
    }
}