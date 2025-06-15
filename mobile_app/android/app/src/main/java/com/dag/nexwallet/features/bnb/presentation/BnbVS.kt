package com.dag.nexwallet.features.bnb.presentation

import android.net.Uri
import com.dag.nexwallet.base.BaseVS
import java.util.*

sealed class BnbVS: BaseVS {
    object Loading : BnbVS()
    
    data class Success(
        val walletInfo: WalletInfo = WalletInfo(),
        val currentMode: Mode = Mode.MY_REQUESTS,
        val myRequests: List<EscrowRequest> = emptyList(),
        val availableRequests: List<EscrowRequest> = emptyList(),
        val myPayments: List<EscrowRequest> = emptyList(),
        val showCreateDialog: Boolean = false,
        val showPayDialog: Boolean = false,
        val demoModeOn: Boolean = false
    ) : BnbVS()
    
    data class Error(val message: String) : BnbVS()
    
    data class WalletInfo(
        val address: String = "",
        val balance: String = "0"
    )
    
    enum class Mode {
        MY_REQUESTS,    // Alice's view - create/manage escrow requests
        BROWSE_REQUESTS, // Bob's view - browse available requests
        MY_PAYMENTS     // Bob's view - manage accepted payments
    }
    
    data class EscrowRequest(
        val id: String = UUID.randomUUID().toString(),
        val requesterAddress: String = "",
        val payerAddress: String = "",
        val tokenAddress: String = "",
        val tokenAmount: String = "",
        val tokenSymbol: String = "USDT",
        val fiatAmount: String = "",
        val fiatCurrency: String = "EUR",
        val bankDetails: String = "",
        val description: String = "",
        val receiptRequirements: String = "",
        val status: EscrowStatus = EscrowStatus.OPEN,
        val createdAt: Long = System.currentTimeMillis(),
        val expiresAt: Long = System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000), // 7 days
        val paidAt: Long = 0,
        val receiptHash: String = "",
        val receiptFileUrl: String = "", // URL/path to the uploaded receipt file
        val isDisputed: Boolean = false
    )
    
    enum class EscrowStatus {
        OPEN,               // Request created, waiting for payer
        ACCEPTED,           // Payer accepted, waiting for bank transfer
        RECEIPT_SUBMITTED,  // Receipt submitted, waiting for verification
        COMPLETED,          // Verified and funds released
        CANCELLED,          // Cancelled by requester
        REFUNDED,           // Dispute resolved - refunded to requester
        DISPUTED            // Under dispute resolution
    }
    
    data class CreateEscrowRequest(
        val tokenAddress: String,
        val tokenAmount: String,
        val fiatAmount: String,
        val fiatCurrency: String,
        val bankDetails: String,
        val description: String,
        val receiptRequirements: String
    )
    
    data class PaymentProof(
        val contractAddress: String,
        val fileUri: Uri,
        val fileName: String,
        val fileSize: Long = 0,
        val mimeType: String = ""
    )
    
    data class SubmitReceipt(
        val requestId: String,
        val receiptHash: String,
        val receiptFileUri: Uri? = null,
        val receiptFileUrl: String = ""
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            
            other as SubmitReceipt
            
            if (requestId != other.requestId) return false
            if (receiptHash != other.receiptHash) return false
            if (receiptFileUri != other.receiptFileUri) return false
            if (receiptFileUrl != other.receiptFileUrl) return false
            
            return true
        }
        
        override fun hashCode(): Int {
            var result = requestId.hashCode()
            result = 31 * result + receiptHash.hashCode()
            result = 31 * result + (receiptFileUri?.hashCode() ?: 0)
            result = 31 * result + receiptFileUrl.hashCode()
            return result
        }
    }
}

