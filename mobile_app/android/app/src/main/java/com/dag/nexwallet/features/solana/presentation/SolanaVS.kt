package com.dag.nexwallet.features.solana.presentation

import com.dag.nexwallet.base.BaseVS
import java.util.*

sealed class SolanaVS: BaseVS {
    object Loading : SolanaVS()
    
    data class Success(
        val currentContext: AgentContext = AgentContext(),
        val chatMessages: List<ChatMessage> = emptyList(),
        val suggestedActions: List<SuggestedAction> = emptyList(),
        val pendingTransaction: PendingTransaction? = null,
        val isHeaderExpanded: Boolean = false,
        val showSwapDialog: Boolean = false,
        val showStakeDialog: Boolean = false,
        val showWalletConnectionDialog: Boolean = false,
        val isWalletConnected: Boolean = false
    ) : SolanaVS()
    
    data class Error(val message: String) : SolanaVS()
    
    data class AgentContext(
        val connectedWallet: String = "",
        val solBalance: String = "0",
        val recentTokens: List<TokenInfo> = emptyList(),
        val recentDapps: List<DappInfo> = emptyList()
    )
    
    data class ChatMessage(
        val id: String = UUID.randomUUID().toString(),
        val content: String,
        val isFromAI: Boolean,
        val timestamp: Long = System.currentTimeMillis(),
        val messageType: MessageType = MessageType.TEXT
    )
    
    enum class MessageType {
        TEXT,
        TRANSACTION_PREVIEW,
        ERROR,
        SUCCESS
    }
    
    data class SuggestedAction(
        val id: String = UUID.randomUUID().toString(),
        val title: String,
        val description: String,
        val type: ActionType,
        val params: Map<String, String> = emptyMap()
    )
    
    enum class ActionType {
        SWAP,
        SEND,
        STAKE,
        VIEW_TOKEN
    }
    
    data class TokenInfo(
        val symbol: String,
        val balance: String,
        val usdValue: String,
        val mintAddress: String
    )
    
    data class DappInfo(
        val name: String,
        val url: String,
        val icon: String
    )
    
    data class PendingTransaction(
        val id: String = UUID.randomUUID().toString(),
        val type: TransactionType,
        val params: Map<String, String>,
        val status: TransactionStatus = TransactionStatus.PENDING
    )
    
    enum class TransactionType {
        SWAP,
        SEND,
        APPROVE
    }
    
    enum class TransactionStatus {
        PENDING,
        CONFIRMED,
        FAILED
    }
}
