package com.dag.nexwallet.features.solana.presentation

import android.util.Base64
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.components.bottomnav.BottomNavMessageManager
import com.dag.nexwallet.base.scroll.ScrollStateManager
import com.dag.nexwallet.data.repository.WalletRepository
import com.dag.nexwallet.features.solana.domain.model.StakeRequest
import com.dag.nexwallet.features.solana.domain.model.SwapRequest
import com.dag.nexwallet.features.solana.domain.usecase.StakeTokensUseCase
import com.dag.nexwallet.features.solana.domain.usecase.SwapTokensUseCase
import com.funkatronics.encoders.Base58
import com.solana.mobilewalletadapter.clientlib.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject
import androidx.core.net.toUri
import com.solana.transaction.Transaction
import com.dag.nexwallet.features.solana.domain.usecase.SendMessageUseCase

@HiltViewModel
class SolanaVM @Inject constructor(
    private val scrollManager: ScrollStateManager,
    private val bottomNavManager: BottomNavMessageManager,
    private val swapTokensUseCase: SwapTokensUseCase,
    private val stakeTokensUseCase: StakeTokensUseCase,
    private val sendMessageUseCase: SendMessageUseCase,
    private val walletRepository: WalletRepository
) : BaseVM<SolanaVS>(SolanaVS.Loading) {

    private var walletAdapter: MobileWalletAdapter? = null

    init {
        scrollManager.updateScrolling(true)
        initializeAgent()
        initializeWalletAdapter()
    }

    private fun initializeWalletAdapter() {
        if (walletAdapter == null) {
            val solanaUri = "https://nexwallet.com".toUri()
            val iconUri = "favicon.ico".toUri()
            val identityName = "NexWallet"

            walletAdapter = MobileWalletAdapter(
                ConnectionIdentity(
                    identityUri = solanaUri,
                    iconUri = iconUri,
                    identityName = identityName
                )
            )
            walletAdapter?.blockchain = Solana.Mainnet
        }
    }

    private fun checkWalletConnection() {
        viewModelScope.launch {
            val walletAddress = walletRepository.getAddress().getOrNull()
            val currentState = _viewState.value
            if (currentState is SolanaVS.Success) {
                _viewState.value = currentState.copy(
                    isWalletConnected = !walletAddress.isNullOrEmpty(),
                    showWalletConnectionDialog = walletAddress.isNullOrEmpty()
                )
            }
        }
    }

    fun connectWallet(sender: ActivityResultSender) {
        viewModelScope.launch {
            try {
                initializeWalletAdapter()
                
                walletAdapter?.let { adapter ->
                    when (val result = adapter.connect(sender)) {
                        is TransactionResult.Success -> {
                            val address = result.authResult.accounts.firstOrNull()?.publicKey?.let {
                                Base58.encodeToString(it)
                            }
                            
                            if (address != null) {
                                walletRepository.saveAddress(address)
                                val currentState = _viewState.value
                                if (currentState is SolanaVS.Success) {
                                    _viewState.value = currentState.copy(
                                        isWalletConnected = true,
                                        showWalletConnectionDialog = false
                                    )
                                }
                            }
                        }
                        is TransactionResult.NoWalletFound -> {
                            handleError("No compatible wallet found")
                        }
                        is TransactionResult.Failure -> {
                            handleError("Failed to connect wallet: ${result.e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                handleError("Failed to connect wallet: ${e.message}")
            }
        }
    }

    fun dismissWalletConnectionDialog() {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(showWalletConnectionDialog = false)
        }
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
                // Show loading state
                val loadingMessage = SolanaVS.ChatMessage(
                    content = "Thinking...",
                    isFromAI = true,
                    messageType = SolanaVS.MessageType.TEXT
                )
                updateChatMessages(loadingMessage)

                // Send message to agent
                sendMessageUseCase.execute(content).collect { response ->
                    response?.let { agentResponse ->
                        // Remove loading message
                        val currentState = _viewState.value
                        if (currentState is SolanaVS.Success) {
                            _viewState.value = currentState.copy(
                                chatMessages = currentState.chatMessages.filterNot { it == loadingMessage }
                            )
                        }

                        // Handle response
                        if (agentResponse.success) {
                            // Add AI response
                            val aiMessage = SolanaVS.ChatMessage(
                                content = agentResponse.text,
                                isFromAI = true
                            )
                            updateChatMessages(aiMessage)

                            // Handle transaction if present
                            agentResponse.transaction?.let { encodedTx ->
                                // Store transaction for later execution
                                val currentState = _viewState.value
                                if (currentState is SolanaVS.Success) {
                                    _viewState.value = currentState.copy(
                                        pendingTransaction = SolanaVS.PendingTransaction(
                                            type = SolanaVS.TransactionType.APPROVE,
                                            params = mapOf("transaction" to encodedTx),
                                            status = SolanaVS.TransactionStatus.PENDING
                                        )
                                    )
                                }
                            }
                        } else {
                            handleError(agentResponse.error ?: "Unknown error occurred")
                        }
                    } ?: run {
                        handleError("Failed to get response from agent")
                    }
                }
            } catch (e: Exception) {
                handleError("Failed to process message: ${e.message}")
            }
        }
    }

    fun executeAction(action: SolanaVS.SuggestedAction) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            if (!currentState.isWalletConnected) {
                _viewState.value = currentState.copy(showWalletConnectionDialog = true)
                return
            }

            viewModelScope.launch {
                try {
                    when (action.type) {
                        SolanaVS.ActionType.SWAP -> handleSwapAction(action)
                        SolanaVS.ActionType.SEND -> handleSendAction(action)
                        SolanaVS.ActionType.STAKE -> handleStakeAction(action)
                        SolanaVS.ActionType.VIEW_TOKEN -> handleViewTokenAction(action)
                        else -> {} // Navigation is handled by the parent composable
                    }
                } catch (e: Exception) {
                    handleError("Failed to execute action: ${e.message}")
                }
            }
        }
    }

    private fun handleSwapAction(action: SolanaVS.SuggestedAction) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(showSwapDialog = true)
        }
    }

    private fun handleStakeAction(action: SolanaVS.SuggestedAction) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(showStakeDialog = true)
        }
    }

    fun dismissSwapDialog() {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(showSwapDialog = false)
        }
    }

    fun dismissStakeDialog() {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(showStakeDialog = false)
        }
    }

    fun executeSwap(request: SwapRequest, sender: ActivityResultSender) {
        viewModelScope.launch {
            try {
                val currentState = _viewState.value
                if (currentState is SolanaVS.Success) {
                    swapTokensUseCase.execute(request).collect { response ->
                        response?.swapTransaction?.let { encodedTx ->
                            executeTransaction(encodedTx, sender)
                        } ?: run {
                            handleError("Failed to get swap transaction")
                        }
                    }
                }
            } catch (e: Exception) {
                handleError("Failed to process swap: ${e.message}")
            }
        }
    }

    fun executeStake(request: StakeRequest, sender: ActivityResultSender) {
        viewModelScope.launch {
            try {
                stakeTokensUseCase.execute(request).collect { response ->
                    response?.transaction?.let { encodedTx ->
                        executeTransaction(encodedTx, sender)
                    } ?: run {
                        handleError("Failed to get stake transaction")
                    }
                }
            } catch (e: Exception) {
                handleError("Failed to process staking: ${e.message}")
            }
        }
    }

    private suspend fun executeTransaction(
        encodedTx: String,
        sender: ActivityResultSender,
    ) {
        try {
            // Convert base64 transaction to ByteArray
            val swapTransactionBuf = Base64.decode(encodedTx, Base64.DEFAULT)
            
            // Create transaction object
            val transaction = Transaction.from(swapTransactionBuf)
            
            val res = walletAdapter?.transact(sender) { authResult ->
                signAndSendTransactions(arrayOf(transaction.serialize()))
            }
            
            when (res) {
                is TransactionResult.Success -> {
                    val txSignature = res.successPayload?.signatures?.firstOrNull()?.let {
                        Base58.encodeToString(it)
                    }
                    
                    if (txSignature != null) {
                        // Add success message
                        val successMessage = SolanaVS.ChatMessage(
                            content = "Transaction successful: $txSignature",
                            isFromAI = true,
                            messageType = SolanaVS.MessageType.SUCCESS
                        )
                        updateChatMessages(successMessage)
                    }
                }
                is TransactionResult.NoWalletFound -> {
                    handleError("No compatible wallet found. Please install a Solana wallet.")
                }
                is TransactionResult.Failure -> {
                    handleError("Transaction failed: ${res.e.message}")
                }
                null -> {
                    handleError("Failed to process transaction")
                }
            }
        } catch (e: Exception) {
            handleError("Failed to process transaction: ${e.message}")
        }
    }

    private fun updateTransactionStatus(
        status: SolanaVS.TransactionStatus,
        additionalParams: Map<String, String> = emptyMap()
    ) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            currentState.pendingTransaction?.let { pendingTx ->
                _viewState.value = currentState.copy(
                    pendingTransaction = pendingTx.copy(
                        status = status,
                        params = pendingTx.params + additionalParams
                    )
                )
            }
        }
    }

    private fun updateChatMessages(newMessage: SolanaVS.ChatMessage) {
        val currentState = _viewState.value
        if (currentState is SolanaVS.Success) {
            _viewState.value = currentState.copy(
                chatMessages = currentState.chatMessages + newMessage
            )
        }
    }

    private fun handleSendAction(action: SolanaVS.SuggestedAction) {
        // TODO: Implement send action
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
}
