package com.dag.nexwallet.features.login.data.datasource

import com.dag.nexwallet.features.login.domain.model.TokenRequest
import com.dag.nexwallet.features.login.domain.model.TokenResponse
import com.dag.nexwallet.features.login.domain.repository.ITokenService
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.HttpStatusCode
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class TokenService @Inject constructor(@Named("UnauthorizedKtor") val ktor: HttpClient): ITokenService {
    override suspend fun requestToken(body: TokenRequest): TokenResponse {
        val res = ktor.post("/auth/token") {
            setBody(body)
        }
        
        return when (res.status) {
            HttpStatusCode.OK -> res.body()
            else -> {
                // TODO save error in firebase analytics
                val errorBody = try {
                    res.body<String>()
                } catch (e: Exception) {
                    "Unknown error"
                }
                throw Exception("API Error: ${res.status.value} - $errorBody")
            }
        }
    }
}