package com.dag.nexwallet.domain

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.map
import javax.inject.Inject

class DataPreferencesStore @Inject constructor(
    @ApplicationContext var context: Context,
) {
    companion object {
        val TOKEN = stringPreferencesKey("token")
        val PRIVATE_KEY = stringPreferencesKey("private_key")
        val PUBLIC_KEY = stringPreferencesKey("public_key")
    }

    private var loggedInScope: CoroutineScope = CoroutineScope(Dispatchers.IO)
    private val USER_PREFERENCES_NAME = "nexq_store"
    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(
        name = USER_PREFERENCES_NAME,
        scope = loggedInScope
    )

    suspend fun removeAll(){
        context.dataStore.edit {
            it.clear()
        }
    }

    fun <T> read(key: Preferences.Key<T>) = context.dataStore.data.map { preferences ->
        preferences[key]
    }

    suspend fun <T> write(key: Preferences.Key<T>, value: T) {
        context.dataStore.edit { preferences ->
            preferences[key] = value
        }
    }
}