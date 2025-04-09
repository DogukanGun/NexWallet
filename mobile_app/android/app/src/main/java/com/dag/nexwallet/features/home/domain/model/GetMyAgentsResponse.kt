package com.dag.nexwallet.features.home.domain.model

import com.google.gson.annotations.SerializedName

data class LlmProviderModel(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String
)

data class ChainModel(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String
)

data class GetMyAgentsResponse(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String,
    @SerializedName("is_on_point_system")
    val isOnPointSystem: Boolean,
    @SerializedName("llm_providers")
    val llmProviders: List<LlmProviderModel>,
    @SerializedName("chains")
    val chains: List<ChainModel>
)
