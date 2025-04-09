package com.dag.nexwallet.features.clone_voice.data.repository

import com.dag.nexwallet.features.clone_voice.data.datasource.VoiceCloneService
import com.dag.nexwallet.features.clone_voice.domain.model.SavedVoice
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneResponse
import com.dag.nexwallet.features.clone_voice.domain.repository.IVoiceCloneService
import java.io.File

class VoiceCloneServiceImpl(private val voiceCloneService: VoiceCloneService) : IVoiceCloneService {
    
    override suspend fun cloneVoice(voiceFile: File, voiceName: String?, shareForTraining: Boolean): VoiceCloneResponse {
        return voiceCloneService.cloneVoice(voiceFile, voiceName, shareForTraining)
    }

    override suspend fun getMyVoices(): List<SavedVoice> {
        return voiceCloneService.getMyVoices()
    }

    override suspend fun getMyIpfsVoices(): List<SavedVoice> {
        return voiceCloneService.getMyIpfsVoices()
    }
} 