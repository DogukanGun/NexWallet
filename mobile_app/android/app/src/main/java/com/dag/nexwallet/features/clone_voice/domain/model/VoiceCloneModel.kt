package com.dag.nexwallet.features.clone_voice.domain.model

import com.google.gson.annotations.SerializedName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import java.io.File

data class VoiceCloneRequest(
    @Transient
    val voiceFile: File,
    val voiceName: String?,
    val shareForTraining: Boolean
)

@Serializable
data class VoiceCloneResponse(
    @SerializedName("message")
    val message: String
)

@Serializable
data class SavedVoice(
    @SerializedName("voice_id")
    val voiceId: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("ipfs_hash")
    val ipfsHash: String,
    @SerializedName("share_for_training")
    val shareForTraining: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("voice_bytes")
    val voiceBytes: String? = null
) 