package com.dag.nexwallet.features.bnb.presentation

import com.dag.nexwallet.base.BaseVS
import java.util.*

sealed class BnbVS: BaseVS {
    object Loading : BnbVS()
    
    data class Success(
        val walletInfo: WalletInfo = WalletInfo(),
        val currentMode: Mode = Mode.WALLET,
        val isCardsExpanded: Boolean = true,
        val transactions: List<Transaction> = emptyList(),
        val chatMessages: List<ChatMessage> = emptyList()
    ) : BnbVS()
    
    data class Error(val message: String) : BnbVS()
    
    data class WalletInfo(
        val address: String = "",
        val balance: String = "0",
        val fiatValue: String = "$0.00"
    )
    
    enum class Mode {
        WALLET,
        AI_AGENT
    }
    
    data class Transaction(
        val id: String = UUID.randomUUID().toString(),
        val type: TransactionType,
        val amount: String,
        val token: String,
        val timestamp: Long = System.currentTimeMillis(),
        val status: TransactionStatus = TransactionStatus.PENDING,
        val toAddress: String = "",
        val fromAddress: String = ""
    )
    
    enum class TransactionType {
        SEND,
        RECEIVE,
        SWAP,
        STAKE,
        UNSTAKE,
        REWARD
    }
    
    enum class TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
    
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
    
    data class ActionCard(
        val title: String,
        val description: String,
        val icon: Int,
        val type: ActionType
    )
    
    enum class ActionType {
        TRANSFER,
        SWAP,
        STAKE
    }
}

