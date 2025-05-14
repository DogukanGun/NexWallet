package com.dag.nexwallet.features.chat.presentation

import com.dag.nexwallet.base.BaseVS

sealed class ChatVS: BaseVS {
    data object Initial : ChatVS()
    data object Loading : ChatVS()
    data class Success(val messages: List<String>) : ChatVS()
    data class TransactionRequired(
        val messages: List<String>,
        val transaction: String
    ) : ChatVS()
    data class Error(val message: String) : ChatVS()
}