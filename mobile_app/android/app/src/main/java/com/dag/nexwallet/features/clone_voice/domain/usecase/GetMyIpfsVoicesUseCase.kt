package com.dag.nexwallet.features.clone_voice.domain.usecase

import com.dag.nexwallet.base.BaseUseCase
import com.dag.nexwallet.features.clone_voice.domain.model.SavedVoice
import com.dag.nexwallet.features.clone_voice.domain.repository.IVoiceCloneService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class GetMyIpfsVoicesUseCase @Inject constructor(private val voiceCloneService: IVoiceCloneService) : 
    BaseUseCase<Unit, List<SavedVoice>> {
    
    override fun execute(params: Unit?): Flow<List<SavedVoice>> = flow {
        emit(voiceCloneService.getMyIpfsVoices())
    }
} 