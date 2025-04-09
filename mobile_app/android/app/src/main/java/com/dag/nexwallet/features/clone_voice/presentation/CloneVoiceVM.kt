package com.dag.nexwallet.features.clone_voice

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneRequest
import com.dag.nexwallet.features.clone_voice.domain.usecase.CloneVoiceUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class CloneVoiceVM @Inject constructor(
    private val cloneVoiceUseCase: CloneVoiceUseCase
) : ViewModel() {

    private val _viewState = MutableStateFlow<CloneVoiceViewState>(CloneVoiceViewState.Initial)
    val viewState: StateFlow<CloneVoiceViewState> = _viewState

    fun uploadVoiceSample(file: File, voiceName: String?, shareForTraining: Boolean) {
        viewModelScope.launch {
            _viewState.value = CloneVoiceViewState.Loading

            val request = VoiceCloneRequest(
                voiceFile = file,
                voiceName = voiceName,
                shareForTraining = shareForTraining
            )

            cloneVoiceUseCase.execute(request)
                .catch { e ->
                    _viewState.value = CloneVoiceViewState.Error(e.message ?: "An error occurred")
                }
                .collect { response ->
                    _viewState.value = CloneVoiceViewState.Success(response.message)
                }
        }
    }

    fun resetState() {
        _viewState.value = CloneVoiceViewState.Initial
    }
}

sealed class CloneVoiceViewState {
    object Initial : CloneVoiceViewState()
    object Loading : CloneVoiceViewState()
    data class Success(val message: String) : CloneVoiceViewState()
    data class Error(val message: String) : CloneVoiceViewState()
}