package com.dag.nexwallet.features.clone_voice.presentation

import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneRequest
import com.dag.nexwallet.features.clone_voice.domain.usecase.CloneVoiceUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class CloneVoiceVM @Inject constructor(
    private val cloneVoiceUseCase: CloneVoiceUseCase
) : BaseVM<CloneVoiceVS>() {


    fun uploadVoiceSample(file: File, voiceName: String?, shareForTraining: Boolean) {
        viewModelScope.launch {
            _viewState.value = CloneVoiceVS.Loading

            val request = VoiceCloneRequest(
                voiceFile = file,
                voiceName = voiceName,
                shareForTraining = shareForTraining
            )

            cloneVoiceUseCase.execute(request)
                .catch { e ->
                    _viewState.value = CloneVoiceVS.Error(e.message ?: "An error occurred")
                }
                .collect { response ->
                    _viewState.value = CloneVoiceVS.Success(response.message)
                }
        }
    }

    fun resetState() {
        _viewState.value = CloneVoiceVS.Initial
    }
}
