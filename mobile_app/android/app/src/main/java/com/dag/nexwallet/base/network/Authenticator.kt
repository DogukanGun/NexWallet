package com.dag.nexq_app.base.network

import com.dag.nexq_app.domain.DataPreferencesStore
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class Authenticator @Inject constructor(
    private val dataPreferencesStore: DataPreferencesStore
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = runBlocking {
            dataPreferencesStore.read(DataPreferencesStore.TOKEN).firstOrNull()
        }

        val authenticatedRequest = token?.let {
            request.newBuilder()
                .header("Authorization", "Bearer $it")
                .build()
        } ?: request // if token is null, proceed without adding it

        return chain.proceed(authenticatedRequest)
    }
}