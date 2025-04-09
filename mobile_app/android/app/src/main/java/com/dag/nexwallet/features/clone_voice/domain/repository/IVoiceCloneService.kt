package com.dag.nexwallet.features.clone_voice.domain.repository

import com.dag.nexwallet.features.clone_voice.domain.model.SavedVoice
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneResponse
import java.io.File

interface IVoiceCloneService {
    suspend fun cloneVoice(voiceFile: File, voiceName: String?, shareForTraining: Boolean): VoiceCloneResponse
    suspend fun getMyVoices(): List<SavedVoice>
    suspend fun getMyIpfsVoices(): List<SavedVoice>
} 