package com.dag.nexwallet.features.chat.domain.model

import com.google.gson.annotations.SerializedName
import kotlinx.serialization.Serializable

@Serializable
data class ChatRequest(
    val message: String,
    val wallet: String
)

@Serializable
data class ChatResponse(
    @SerializedName("text")
    val text: String,
    @SerializedName("transaction")
    val transaction: String? = null,
    @SerializedName("audio")
    val audio: String? = null,
    @SerializedName("op")
    val operation: String? = null
) {
    fun isTransactionResponse(): Boolean {
        return !transaction.isNullOrEmpty() && operation == "solana"
    }
}

sealed class ChatResult {
    data class TextOnly(val text: String) : ChatResult()
    data class TransactionRequired(
        val text: String,
        val transaction: String,
        val operation: String
    ) : ChatResult()
}

