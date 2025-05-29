package com.dag.nexwallet.features.solana.presentation

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.components.bottomnav.BottomNavMessageManager
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.base.scroll.ScrollStateManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SolanaVM @Inject constructor(
    private val scrollManager: ScrollStateManager,
    private val bottomNavManager: BottomNavMessageManager
) : BaseVM<SolanaVS>(SolanaVS.Loading) {

    init {
        scrollManager.updateScrolling(true)
        initializeAgent()
    }

    private fun initializeAgent() {
        viewModelScope.launch {
            try {
                bottomNavManager.showMessage("Solana AI Agent")
                _viewState.value = SolanaVS.Success(
                    currentContext = SolanaVS.AgentContext(
                        connectedWallet = "",
                        solBalance = "0",
                        recentTokens = emptyList(),
                        recentDapps = emptyList()
                    ),
                    chatMessages = listOf(
                        SolanaVS.ChatMessage(
                            content = "Hi! I'm your Solana AI Agent. I can help you with transactions, token swaps, and connecting to dApps. What would you like to do?",
                            isFromAI = true
                        )
                    ),
                    suggestedActions = emptyList()
                )
            } catch (e: Exception) {
                _viewState.value = SolanaVS.Error(e.message ?: "Failed to initialize Solana Agent")
            }
        }
    }

    fun toggleHeader() {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(
                isHeaderExpanded = !currentState.isHeaderExpanded
            )
        }
    }

    fun sendMessage(content: String) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success && content.isNotBlank()) {
            val userMessage = SolanaVS.ChatMessage(
                content = content,
                isFromAI = false
            )
            
            val updatedMessages = currentState.chatMessages + userMessage
            _viewState.value = currentState.copy(
                chatMessages = updatedMessages,
                isHeaderExpanded = false
            )
            
            processUserMessage(content)
        }
    }

    private fun processUserMessage(content: String) {
        viewModelScope.launch {
            try {
                // TODO: Implement AI processing logic
                val aiResponse = SolanaVS.ChatMessage(
                    content = "I understand you want to perform an action. Let me help you with that.",
                    isFromAI = true
                )
                
                val currentState = _viewState.value
                if (currentState is SolanaVS.Success) {
                    _viewState.value = currentState.copy(
                        chatMessages = currentState.chatMessages + aiResponse
                    )
                }
            } catch (e: Exception) {
                handleError("Failed to process message: ${e.message}")
            }
        }
    }

    fun executeAction(action: SolanaVS.SuggestedAction) {
        viewModelScope.launch {
            try {
                when (action.type) {
                    SolanaVS.ActionType.SWAP -> handleSwapAction(action)
                    SolanaVS.ActionType.SEND -> handleSendAction(action)
                    SolanaVS.ActionType.CONNECT_DAPP -> handleConnectDappAction(action)
                    SolanaVS.ActionType.VIEW_TOKEN -> handleViewTokenAction(action)
                    else -> {} // Navigation is handled by the parent composable
                }
            } catch (e: Exception) {
                handleError("Failed to execute action: ${e.message}")
            }
        }
    }

    private fun handleSwapAction(action: SolanaVS.SuggestedAction) {
        // TODO: Implement swap action
    }

    private fun handleSendAction(action: SolanaVS.SuggestedAction) {
        // TODO: Implement send action
    }

    private fun handleConnectDappAction(action: SolanaVS.SuggestedAction) {
        // TODO: Implement connect dapp action
    }

    private fun handleViewTokenAction(action: SolanaVS.SuggestedAction) {
        // TODO: Implement view token action
    }

    private fun handleError(errorMessage: String) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            val errorChatMessage = SolanaVS.ChatMessage(
                content = errorMessage,
                isFromAI = true,
                messageType = SolanaVS.MessageType.ERROR
            )
            _viewState.value = currentState.copy(
                chatMessages = currentState.chatMessages + errorChatMessage
            )
        } else {
            _viewState.value = SolanaVS.Error(errorMessage)
        }
    }

    fun refreshAgent() {
        _viewState.value = SolanaVS.Loading
        initializeAgent()
    }
}
