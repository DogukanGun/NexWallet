package com.dag.nexwallet.features.chat.presentation

import android.net.Uri
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.features.chat.domain.model.ChatRequest
import com.dag.nexwallet.features.chat.domain.model.ChatResponse
import com.dag.nexwallet.features.chat.domain.usecase.ChatWithAIUseCase
import com.google.firebase.Firebase
import com.google.firebase.vertexai.vertexAI
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import com.solana.mobilewalletadapter.clientlib.Blockchain
import com.solana.mobilewalletadapter.clientlib.ConnectionIdentity
import com.solana.mobilewalletadapter.clientlib.MobileWalletAdapter
import com.solana.mobilewalletadapter.clientlib.RpcCluster
import com.solana.mobilewalletadapter.clientlib.Solana
import com.solana.mobilewalletadapter.clientlib.TransactionResult
import dagger.hilt.android.lifecycle.HiltViewModel
import io.ktor.client.plugins.Sender
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatVM @Inject constructor(
    private val chatWithAIUseCase: ChatWithAIUseCase
) : BaseVM<ChatVS>(ChatVS.Initial) {
    private val _uiState = MutableStateFlow<ChatVS>(ChatVS.Initial)
    val uiState: StateFlow<ChatVS> = _uiState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isWalletConnected = MutableStateFlow(false)
    val isWalletConnected: StateFlow<Boolean> = _isWalletConnected.asStateFlow()

    private val _pendingTransaction = MutableStateFlow<String?>(null)
    val pendingTransaction: StateFlow<String?> = _pendingTransaction.asStateFlow()

    val solanaUri = Uri.parse("https://ai.nexarb.com")
    val iconUri = Uri.parse("favicon.ico")
    val identityName = "Solana Kotlin dApp"
    private var walletPublicKey: ByteArray? = null
    private var walletAuthToken: ByteArray? = null

    private fun getSolanaMobileAdapter():MobileWalletAdapter{
        val walletAdapter = MobileWalletAdapter(connectionIdentity = ConnectionIdentity(
            identityUri = solanaUri,
            iconUri = iconUri,
            identityName = identityName
        ))
        walletAdapter.blockchain = Solana.Mainnet
        return walletAdapter
    }

    fun connectWallet(sender: ActivityResultSender) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val walletAdapter = getSolanaMobileAdapter()
                val result = walletAdapter.connect(sender)
                
                when (result) {
                    is TransactionResult.Success -> {
                        // Store wallet information
                        val authRes = result.authResult
                        walletPublicKey = authRes.accounts.first().publicKey
                        walletAuthToken = authRes.authToken.toByteArray()
                        
                        // Update connection state
                        _isWalletConnected.value = true
                        
                        // Add welcome message
                        val welcomeMessage = ChatMessage(
                            content = "Welcome! Your wallet is now connected. How can I help you today?",
                            role = "assistant"
                        )
                        _messages.value = listOf(welcomeMessage)
                        
                        // Update UI state
                        _uiState.value = ChatVS.Success(messages = _messages.value.map { it.content })
                    }
                    is TransactionResult.Failure -> {
                        _uiState.value = ChatVS.Error("Failed to connect wallet: ${result.e.message}")
                    }
                    else -> {
                        _uiState.value = ChatVS.Error("Unexpected error during wallet connection")
                    }
                }
            } catch (e: Exception) {
                _uiState.value = ChatVS.Error(e.localizedMessage ?: "Failed to connect wallet")
            }
        }
    }

    fun sendMessage(sender: ActivityResultSender, content: String) {
        if (!isWalletConnected.value) {
            _uiState.value = ChatVS.Error("Please connect your wallet first")
            return
        }

        // Add user message immediately
        val userMessage = ChatMessage(
            content = content,
            role = "user"
        )
        _messages.value = _messages.value + userMessage

        // Clear any pending transaction
        _pendingTransaction.value = null

        viewModelScope.launch(Dispatchers.IO) {
            try {
                _uiState.value = ChatVS.Loading

                val walletAddress = walletPublicKey?.let { String(it) } ?: return@launch
                
                val chatRequest = ChatRequest(
                    message = content,
                    wallet = walletAddress
                )

                chatWithAIUseCase.execute(chatRequest)
                    .catch { e ->
                        _uiState.value = ChatVS.Error(e.message ?: "An error occurred")
                    }
                    .collect { response ->
                        response?.let { handleAIResponse(sender,it) }
                    }
            } catch (e: Exception) {
                _uiState.value = ChatVS.Error(e.localizedMessage ?: "An error occurred")
            }
        }
    }

    private fun handleAIResponse(sender: ActivityResultSender,response: ChatResponse) {
        // Add assistant response to messages
        val assistantMessage = ChatMessage(
            content = response.text,
            role = "assistant"
        )
        _messages.value = _messages.value + assistantMessage

        if (response.isTransactionResponse()) {
            // If there's a transaction, store it and update UI state to indicate transaction needed
            _pendingTransaction.value = response.transaction
            executeTransaction(sender)
        } else {
            // For text-only responses, just update UI with success
            _uiState.value = ChatVS.Success(messages = _messages.value.map { it.content })
        }
    }

    fun executeTransaction(sender: ActivityResultSender) {
        val transaction = _pendingTransaction.value ?: return

        val mobileAdapter = getSolanaMobileAdapter()

        viewModelScope.launch {
            try {
                mobileAdapter.transact(sender) {
                    signAndSendTransactions(arrayOf(transaction.toByteArray()));
                }
            } catch (e: Exception) {
                _uiState.value = ChatVS.Error(e.localizedMessage ?: "Failed to execute transaction")
            }
        }
    }
}