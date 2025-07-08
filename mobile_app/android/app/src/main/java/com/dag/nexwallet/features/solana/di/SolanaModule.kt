package com.dag.nexwallet.features.solana.di

import com.dag.nexwallet.features.solana.data.repository.SolanaService
import com.dag.nexwallet.features.solana.domain.repository.ISolanaService
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class SolanaModule {
    
    @Binds
    @Singleton
    abstract fun bindSolanaService(
        solanaService: SolanaService
    ): ISolanaService
} 