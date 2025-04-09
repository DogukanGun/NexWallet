package com.dag.nexwallet.features.clone_voice.domain.di

import com.dag.nexwallet.features.clone_voice.data.datasource.VoiceCloneService
import com.dag.nexwallet.features.clone_voice.data.repository.VoiceCloneServiceImpl
import com.dag.nexwallet.features.clone_voice.domain.repository.IVoiceCloneService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class VoiceCloneModule {

    @Provides
    @Singleton
    fun provideVoiceCloneService(voiceCloneService: VoiceCloneService): IVoiceCloneService =
        VoiceCloneServiceImpl(voiceCloneService)
} 