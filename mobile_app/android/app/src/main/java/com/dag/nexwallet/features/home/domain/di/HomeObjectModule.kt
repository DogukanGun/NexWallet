package com.dag.nexwallet.features.home.domain.di

import com.dag.nexwallet.features.home.data.datasource.MyAgentsService
import com.dag.nexwallet.features.home.data.repository.MyAgentsServiceImpl
import com.dag.nexwallet.features.home.domain.repository.IMyAgentsService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class HomeObjectModules {

    @Provides
    @Singleton
    fun provideMyAgentService(myAgentsService: MyAgentsService): IMyAgentsService =
        MyAgentsServiceImpl(myAgentsService)
}