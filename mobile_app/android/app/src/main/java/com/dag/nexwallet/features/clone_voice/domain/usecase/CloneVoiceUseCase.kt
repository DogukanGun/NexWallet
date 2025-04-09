package com.dag.nexwallet.features.clone_voice.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneRequest
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneResponse
import com.dag.nexwallet.features.clone_voice.domain.repository.IVoiceCloneService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class CloneVoiceUseCase @Inject constructor(private val voiceCloneService: IVoiceCloneService) : 
    BaseUseCase<VoiceCloneRequest, VoiceCloneResponse> {
    
    override fun execute(params: VoiceCloneRequest?): Flow<VoiceCloneResponse> = flow {
        requireNotNull(params) { "Voice clone request parameters cannot be null" }
        
        val result = voiceCloneService.cloneVoice(
            voiceFile = params.voiceFile,
            voiceName = params.voiceName,
            shareForTraining = params.shareForTraining
        )
        
        emit(result)
    }
} 