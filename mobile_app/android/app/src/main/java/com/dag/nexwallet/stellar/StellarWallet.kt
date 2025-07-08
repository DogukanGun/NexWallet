package com.dag.nexwallet.stellar

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.stellar.sdk.*
import org.stellar.sdk.responses.AccountResponse
import org.stellar.walletsdk.asset.IssuedAssetId
import org.stellar.walletsdk.horizon.SigningKeyPair
import java.math.BigDecimal

/**
 * StellarWallet is a high-level wrapper that combines Stellar operations with secure key storage
 * and provides AI management capabilities
 */
class StellarWallet(
    private val context: Context,
    private val isTestNetwork: Boolean = true,
    private val horizonUrl: String? = null
) {
    // Stellar base operations
    private val stellarBase = StellarBase(isTestNetwork, horizonUrl)

    // Secure key storage
    private val keyStore = SecureKeyStore(context)
    
    /**
     * Generate a new account keypair
     * @param memo Optional account name/memo
     * @param saveToDevice Whether to save the generated keypair on the device
     * @return Generated keypair
     */
    fun generateAccount(memo: String? = null, saveToDevice: Boolean = true): SigningKeyPair {
        val keypair = stellarBase.account().createKeypair()
        if (saveToDevice) {
            keyStore.saveKeypair(
                keypair.publicKey,
                keypair.secretKey,
                memo
            )
        }
        
        return keypair
    }
    
    /**
     * Import an existing account using a seed (private key)
     * @param secret The account's secret key
     * @param saveToDevice Whether to save the keypair on the device
     * @return The imported keypair
     */
    fun importAccount(secret: String, memo: String? = null, saveToDevice: Boolean = true):  SigningKeyPair {
        val keypair =  SigningKeyPair.fromSecret(secret)
        
        if (saveToDevice) {
            keyStore.saveKeypair(
                keypair.publicKey,
                keypair.secretKey,
                memo
            )
        }
        
        return keypair
    }
    
    /**
     * Get currently stored keypair
     * @return The keypair or null if none stored
     */
    fun getCurrentKeypair():  SigningKeyPair? {
        val privateKey = keyStore.getPrivateKey() ?: return null
        return SigningKeyPair.fromSecret(privateKey)
    }
    
    /**
     * Get account information from the network
     * @param accountId Optional account ID (uses stored account if not provided)
     * @return Account information or null if account doesn't exist
     */
    suspend fun getAccount(accountId: String? = null): AccountResponse? = withContext(Dispatchers.IO) {
        val id = accountId ?: keyStore.getPublicKey() ?: return@withContext null
        
        return@withContext try {
            stellarBase.account().getAccount(id)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get current account balance for specific asset
     * @param assetCode The asset code (null for XLM)
     * @param assetIssuer The asset issuer (null for XLM)
     * @return The balance as a string or null if account not found
     */
    suspend fun getBalance(assetCode: String? = null, assetIssuer: String? = null): String? {
        val account = getAccount() ?: return null
        
        return account.balances.find { balance ->
            when {
                assetCode == null && balance.assetType == "native" -> true
                assetCode != null && balance.assetCode == assetCode && 
                    (assetIssuer == null || balance.assetIssuer == assetIssuer) -> true
                else -> false
            }
        }?.balance
    }
    
    /**
     * Send a payment
     * @param destinationAddress The recipient's account ID
     * @param amount The amount to send
     * @param assetCode The asset code (null for XLM)
     * @param assetIssuer The asset issuer (null for XLM)
     * @param memo Optional transaction memo
     * @return The transaction response
     */
    suspend fun sendPayment(
        destinationAddress: String,
        amount: String,
        assetCode: String? = null,
        assetIssuer: String? = null,
        memo: Memo? = null
    ) = withContext(Dispatchers.IO) {
        val sourceKeyPair = getCurrentKeypair()
            ?: throw IllegalStateException("No account keypair available")

        val asset = if (assetCode == null || assetIssuer == null) {
            AssetTypeNative()
        } else {
            Asset.createNonNativeAsset(assetCode, assetIssuer)
        }

        val txBuilder = stellarBase.getTransactionBuilder(sourceKeyPair)
        var tx = txBuilder.transfer(destinationAddress, asset, amount)
        return@withContext stellarBase.submitTransaction(tx)
    }
    
    /**
     * AI-powered asset allocation recommendation
     * @param riskTolerance Risk tolerance level 1-10 (1=conservative, 10=aggressive)
     * @return Recommended portfolio allocation
     */
    fun recommendPortfolio(riskTolerance: Int): Map<String, Double> {
        // In a real implementation, this would call an AI/ML model or service
        // For demonstration, we'll return a simple allocation based on risk tolerance
        
        val xrpPercentage = when (riskTolerance) {
            in 1..3 -> 0.10
            in 4..6 -> 0.15
            else -> 0.25
        }
        
        val btcPercentage = when (riskTolerance) {
            in 1..3 -> 0.05
            in 4..6 -> 0.15
            else -> 0.25
        }
        
        val ethPercentage = when (riskTolerance) {
            in 1..3 -> 0.05
            in 4..6 -> 0.15
            else -> 0.20
        }
        
        val xlmPercentage = 1.0 - (xrpPercentage + btcPercentage + ethPercentage)
        
        return mapOf(
            "XLM" to xlmPercentage,
            "XRP" to xrpPercentage,
            "BTC" to btcPercentage,
            "ETH" to ethPercentage
        )
    }
    
    /**
     * AI-powered transaction security check
     * @param destination The recipient address
     * @param amount The amount to send
     * @param asset The asset to send
     * @return A risk assessment analysis
     */
    fun analyzeTransactionRisk(destination: String, amount: String, asset: Asset): RiskAssessment {
        // In a real implementation, this would use AI to analyze the transaction
        // For demonstration, we'll provide a simple risk assessment
        
        // Check if the amount is unusually large
        val amountValue = amount.toBigDecimalOrNull() ?: return RiskAssessment(
            RiskLevel.UNKNOWN,
            "Invalid amount format"
        )
        
        // For demonstration - in real implementation, this would consider user history 
        // and known scam addresses
        val riskLevel = when {
            amountValue > BigDecimal(1000) -> RiskLevel.HIGH
            amountValue > BigDecimal(100) -> RiskLevel.MEDIUM
            else -> RiskLevel.LOW
        }
        
        val reason = when (riskLevel) {
            RiskLevel.HIGH -> "This is a large transaction. Verify the recipient carefully."
            RiskLevel.MEDIUM -> "This is a moderate transaction. Double-check recipient details."
            RiskLevel.LOW -> "This is a normal transaction with low risk."
            RiskLevel.UNKNOWN -> "Unable to assess transaction risk."
        }
        
        return RiskAssessment(riskLevel, reason)
    }
    
    /**
     * Add support for a new asset (create trustline)
     * @param assetCode The asset code
     * @param assetIssuer The asset issuer
     * @return The transaction response
     */
    suspend fun addAssetSupport(
        assetCode: String,
        assetIssuer: String
    ) = withContext(Dispatchers.IO) {
        val sourceKeyPair = getCurrentKeypair()
            ?: throw IllegalStateException("No account keypair available")

        val asset = IssuedAssetId(assetCode,assetIssuer)

        val txBuilder = stellarBase.getTransactionBuilder(sourceKeyPair)
        val transaction = txBuilder.addAssetSupport(asset)
        return@withContext stellarBase.submitTransaction(transaction)
    }

    /**
     * Remove support for an asset (remove trustline)
     * @param assetCode The asset code
     * @param assetIssuer The asset issuer
     * @return The transaction response
     */
    suspend fun removeAssetSupport(
        assetCode: String,
        assetIssuer: String
    ) = withContext(Dispatchers.IO) {
        val sourceKeyPair = getCurrentKeypair() 
            ?: throw IllegalStateException("No account keypair available")
        
        val asset = IssuedAssetId(assetCode, assetIssuer)
        
        val txBuilder = stellarBase.getTransactionBuilder(sourceKeyPair)
        val transaction = txBuilder.removeAssetSupport(asset)
        return@withContext stellarBase.submitTransaction(transaction)
    }
    
    /**
     * Swap one asset for another
     * @param fromAssetCode Source asset code (null for XLM)
     * @param fromAssetIssuer Source asset issuer (null for XLM)
     * @param toAssetCode Destination asset code (null for XLM)
     * @param toAssetIssuer Destination asset issuer (null for XLM)
     * @param amount Amount to swap
     * @return Transaction response
     */
    suspend fun swapAssets(
        fromAssetCode: String?,
        fromAssetIssuer: String?,
        toAssetCode: String?,
        toAssetIssuer: String?,
        amount: String
    ) = withContext(Dispatchers.IO) {
        val sourceKeyPair = getCurrentKeypair() 
            ?: throw IllegalStateException("No account keypair available")
        
        val fromAsset = if (fromAssetCode == null || fromAssetIssuer == null) {
            AssetTypeNative()
        } else {
            Asset.createNonNativeAsset(fromAssetCode, fromAssetIssuer)
        }
        
        val toAsset = if (toAssetCode == null || toAssetIssuer == null) {
            AssetTypeNative()
        } else {
            Asset.createNonNativeAsset(toAssetCode, toAssetIssuer)
        }
        
        val txBuilder = stellarBase.getTransactionBuilder(sourceKeyPair)
        val transaction = txBuilder.swap(fromAsset, toAsset, amount)
        return@withContext stellarBase.submitTransaction(transaction)
    }
    
    /**
     * Get the underlying StellarBase instance for direct access to all functionality
     */
    fun getStellarBase(): StellarBase = stellarBase
    
    /**
     * Get the underlying SecureKeyStore instance for direct access to key management
     */
    fun getKeyStore(): SecureKeyStore = keyStore
    
    /**
     * Risk levels for transaction analysis
     */
    enum class RiskLevel {
        LOW, MEDIUM, HIGH, UNKNOWN
    }
    
    /**
     * Risk assessment result
     */
    data class RiskAssessment(
        val riskLevel: RiskLevel,
        val reason: String
    )
} 