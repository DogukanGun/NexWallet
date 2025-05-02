package com.dag.nexwallet.features.login.data.datasource

import com.dag.nexwallet.base.Logger
import com.dag.nexwallet.base.extensions.getResponseData
import com.dag.nexwallet.features.login.domain.model.TokenRequest
import com.dag.nexwallet.features.login.domain.model.TokenResponse
import com.dag.nexwallet.features.login.domain.repository.ITokenService
import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class TokenService @Inject constructor(
    @Named("UnauthorizedKtor") val ktor: HttpClient,
    private val logger: Logger
): ITokenService {
    override suspend fun requestToken(body: TokenRequest): TokenResponse? {
        val res = ktor.post("/auth/token") {
            setBody(body)
        }
        
        return res.getResponseData(logger)
    }
}