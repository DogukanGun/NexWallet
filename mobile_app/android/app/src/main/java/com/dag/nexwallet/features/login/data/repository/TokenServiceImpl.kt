package com.dag.nexwallet.features.login.data.repository

import com.dag.nexwallet.features.login.data.datasource.TokenService
import com.dag.nexwallet.features.login.domain.repository.ITokenService
import com.dag.nexwallet.features.login.domain.model.TokenRequest
import com.dag.nexwallet.features.login.domain.model.TokenResponse

class TokenServiceImpl(val tokenService: TokenService): ITokenService {
    override suspend fun requestToken(body: TokenRequest): TokenResponse? {
        return tokenService.requestToken(body)
    }
}