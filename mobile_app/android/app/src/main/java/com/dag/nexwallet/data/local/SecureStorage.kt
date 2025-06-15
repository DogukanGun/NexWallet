package com.dag.nexwallet.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import androidx.core.content.edit

@Singleton
class SecureStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePreferences = EncryptedSharedPreferences.create(
        context,
        "nexwallet_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveString(key: String, value: String?) {
        securePreferences.edit { putString(key, value) }
    }

    fun getString(key: String, defaultValue: String? = null): String? {
        return securePreferences.getString(key, defaultValue)
    }

    fun saveInt(key: String, value: Int) {
        securePreferences.edit { putInt(key, value) }
    }

    fun getInt(key: String, defaultValue: Int = 0): Int {
        return securePreferences.getInt(key, defaultValue)
    }

    fun saveBoolean(key: String, value: Boolean) {
        securePreferences.edit { putBoolean(key, value) }
    }

    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return securePreferences.getBoolean(key, defaultValue)
    }

    fun saveLong(key: String, value: Long) {
        securePreferences.edit { putLong(key, value) }
    }

    fun getLong(key: String, defaultValue: Long = 0L): Long {
        return securePreferences.getLong(key, defaultValue)
    }

    fun saveStringList(key: String, value: List<String>){
        securePreferences.edit { putStringSet(key,value.toSet()) }
    }

    fun getStringSet(key: String): Set<String>? {
        return securePreferences.getStringSet(key,emptySet<String>())
    }

    fun clear() {
        securePreferences.edit { clear() }
    }

    companion object {
        //USER MODEL KEYS
        const val KEY_USER_ID = "user_id"
        const val KEY_USER_NAME = "user_name"
        const val KEY_USERNAME = "username"
        const val KEY_PROFILE_IMAGE_URL = "profile_image_url"
        const val KEY_BANNER_IMAGE_URL = "banner_image_url"
        const val KEY_DESCRIPTION = "description"
        const val KEY_LOCATION = "location"
        const val KEY_WEBSITE_URL = "website_url"
        const val KEY_FOLLOWERS_COUNT = "followers_count"
        const val KEY_FOLLOWING_COUNT = "following_count"
        const val KEY_IS_VERIFIED = "is_verified"
        const val KEY_CREATED_AT = "created_at"
        const val KEY_TOKEN = "token"

        //CONFIG MODEL KEYS
        const val KEY_CONFIG_LLM_PROVIDER = "config_llm_provider"
        const val KEY_CONFIG_KNOWLEDGE_BASE = "config_knowledge_base"
        const val KEY_CONFIG_CHAINS = "config_chains"

        //WALLET KEYS
        const val KEY_WALLET = "key_wallet"
    }
} 