package com.dag.nexwallet.stellar

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import java.util.Base64

/**
 * SecureKeyStore handles the secure storage of Stellar private keys
 * using Android's security features like Keystore and EncryptedSharedPreferences
 */
class SecureKeyStore(private val context: Context) {
    
    companion object {
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val MASTER_KEY_ALIAS = "stellar_master_key"
        private const val ENCRYPTED_PREFS_FILE = "stellar_secure_prefs"
        private const val KEY_ENCRYPTION_ALGORITHM = KeyProperties.KEY_ALGORITHM_AES
        private const val KEY_BLOCK_MODE = KeyProperties.BLOCK_MODE_GCM
        private const val KEY_PADDING = KeyProperties.ENCRYPTION_PADDING_NONE
        private const val KEY_SIZE = 256
        
        // Keys for SharedPreferences
        private const val PREF_PRIVATE_KEY = "stellar_private_key"
        private const val PREF_PUBLIC_KEY = "stellar_public_key"
        private const val PREF_ACCOUNT_MEMO = "stellar_account_memo"
    }
    
    // Create or get the master key from Android Keystore
    private val masterKey: MasterKey by lazy {
        MasterKey.Builder(context, MASTER_KEY_ALIAS)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }
    
    // Create encrypted SharedPreferences using the master key
    private val encryptedPrefs by lazy {
        EncryptedSharedPreferences.create(
            context,
            ENCRYPTED_PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    /**
     * Save a Stellar keypair securely
     * @param publicKey The public key (account ID)
     * @param privateKey The private key (seed)
     * @param memo Optional account memo or name
     */
    fun saveKeypair(publicKey: ByteArray, privateKey: String, memo: String? = null) {
        encryptedPrefs.edit().apply {
            putString(PREF_PUBLIC_KEY, publicKey.toString())
            putString(PREF_PRIVATE_KEY, privateKey)
            memo?.let { putString(PREF_ACCOUNT_MEMO, it) }
        }.apply()
    }
    
    /**
     * Retrieve the saved private key if available
     * @return The private key or null if not found
     */
    fun getPrivateKey(): String? {
        return encryptedPrefs.getString(PREF_PRIVATE_KEY, null)
    }
    
    /**
     * Retrieve the saved public key if available
     * @return The public key or null if not found
     */
    fun getPublicKey(): String? {
        return encryptedPrefs.getString(PREF_PUBLIC_KEY, null)
    }
    
    /**
     * Retrieve the saved account memo if available
     * @return The account memo or null if not found
     */
    fun getAccountMemo(): String? {
        return encryptedPrefs.getString(PREF_ACCOUNT_MEMO, null)
    }
    
    /**
     * Delete the stored keypair
     */
    fun deleteKeypair() {
        encryptedPrefs.edit().apply {
            remove(PREF_PRIVATE_KEY)
            remove(PREF_PUBLIC_KEY)
            remove(PREF_ACCOUNT_MEMO)
        }.apply()
    }
    
    /**
     * Check if a keypair is stored
     * @return True if keypair exists
     */
    fun hasKeypair(): Boolean {
        return getPrivateKey() != null && getPublicKey() != null
    }
    
    /**
     * Store multiple keypairs for a multi-account wallet
     * @param accountId Unique identifier for this account
     * @param publicKey The public key
     * @param privateKey The private key
     * @param memo Optional account memo or name
     */
    fun saveKeyPairForAccount(accountId: String, publicKey: String, privateKey: String, memo: String? = null) {
        encryptedPrefs.edit().apply {
            putString("${PREF_PUBLIC_KEY}_$accountId", publicKey)
            putString("${PREF_PRIVATE_KEY}_$accountId", privateKey)
            memo?.let { putString("${PREF_ACCOUNT_MEMO}_$accountId", it) }
        }.apply()
    }
    
    /**
     * Retrieve private key for a specific account
     * @param accountId Unique identifier for this account
     * @return The private key or null if not found
     */
    fun getPrivateKeyForAccount(accountId: String): String? {
        return encryptedPrefs.getString("${PREF_PRIVATE_KEY}_$accountId", null)
    }
    
    /**
     * Retrieve public key for a specific account
     * @param accountId Unique identifier for this account
     * @return The public key or null if not found
     */
    fun getPublicKeyForAccount(accountId: String): String? {
        return encryptedPrefs.getString("${PREF_PUBLIC_KEY}_$accountId", null)
    }
    
    /**
     * Get list of all stored account IDs
     * @return List of account IDs
     */
    fun getAllAccountIds(): List<String> {
        val result = mutableListOf<String>()
        val allKeys = encryptedPrefs.all.keys
        
        val regex = "^${PREF_PUBLIC_KEY}_(\\w+)$".toRegex()
        
        for (key in allKeys) {
            val match = regex.find(key)
            if (match != null) {
                val accountId = match.groupValues[1]
                result.add(accountId)
            }
        }
        
        return result
    }
    
    /**
     * For additional security on devices with fingerprint/biometric capabilities
     * This requires additional setup with BiometricPrompt
     */
    fun requireBiometricAuth(): Boolean {
        // Check if device supports biometric authentication
        // Implementation would depend on your biometric auth setup
        return false
    }
} 