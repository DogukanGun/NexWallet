package com.dag.nexwallet.data.repository

import com.dag.nexwallet.data.local.SecureStorage
import com.dag.nexwallet.data.model.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WalletRepository @Inject constructor(
    private val secureStorage: SecureStorage
){
    fun saveAddress(walletAddress: String): Result<Unit> {
        return try {
            with(secureStorage) {
                saveString(SecureStorage.KEY_WALLET, walletAddress)
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getAddress(): Result<String?> {
        return try {
            with(secureStorage) {
                val wallet = getString(SecureStorage.KEY_WALLET)
                if (wallet != null) {
                    Result.success(wallet)
                } else {
                    Result.success(null)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}