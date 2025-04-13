package com.dag.nexwallet.features.login.domain.di

import com.dag.nexwallet.features.login.data.datasource.TokenService
import com.dag.nexwallet.features.login.data.repository.TokenServiceImpl
import com.dag.nexwallet.features.login.domain.repository.ITokenService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class LoginObjectModules {

    @Provides
    @Singleton
    fun provideTokenService(tokenService: TokenService): ITokenService = TokenServiceImpl(tokenService)

}