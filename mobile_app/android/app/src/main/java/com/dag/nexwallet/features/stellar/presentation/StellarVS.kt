package com.dag.nexwallet.features.stellar.presentation

import com.dag.nexwallet.base.BaseVS
import org.stellar.sdk.responses.AccountResponse
import java.util.*

sealed class StellarVS: BaseVS {
    object Loading : StellarVS()
    
    data class Success(
        val balance: String,
        val accountId: String,
        val isTestnet: Boolean,
        val aiSuggestions: List<AISuggestion>,
        val recentTransactions: List<Transaction>,
        val currentScreen: ScreenState = ScreenState.WALLET,
        val chatMessages: List<ChatMessage> = emptyList()
    ) : StellarVS()
    
    data class Error(val message: String) : StellarVS()
    
    enum class ScreenState {
        WALLET,
        AI_CHAT
    }
    
    data class Transaction(
        val type: TransactionType,
        val amount: String,
        val asset: String,
        val destination: String,
        val timestamp: Long
    )
    
    enum class TransactionType {
        SENT,
        RECEIVED,
        SWAPPED
    }
    
    data class AISuggestion(
        val title: String,
        val description: String,
        val action: () -> Unit
    )
    
    data class ChatMessage(
        val id: String = UUID.randomUUID().toString(),
        val content: String,
        val isFromAI: Boolean,
        val timestamp: Long = System.currentTimeMillis()
    )
    
    sealed class StellarAction {
        data class Send(val amount: String, val destination: String) : StellarAction()
        data class Swap(val fromAsset: String, val toAsset: String, val amount: String) : StellarAction()
        data class AddAsset(val assetCode: String, val issuer: String) : StellarAction()
        data object ViewPortfolio : StellarAction()
    }
}