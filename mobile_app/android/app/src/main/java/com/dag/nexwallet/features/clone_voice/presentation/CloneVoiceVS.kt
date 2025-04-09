package com.dag.nexwallet.features.clone_voice.presentation

import com.dag.nexwallet.base.BaseVS


sealed class CloneVoiceVS: BaseVS {
    object Initial : CloneVoiceVS()
    object Loading : CloneVoiceVS()
    data class Success(val message: String) : CloneVoiceVS()
    data class Error(val message: String) : CloneVoiceVS()
}