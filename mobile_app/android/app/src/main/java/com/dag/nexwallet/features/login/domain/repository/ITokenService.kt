package com.dag.nexwallet.features.login.domain.repository

import com.dag.nexwallet.features.login.domain.model.TokenRequest
import com.dag.nexwallet.features.login.domain.model.TokenResponse

interface ITokenService {
    suspend fun requestToken(body: TokenRequest): TokenResponse?
}