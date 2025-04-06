package com.dag.nexwallet.features.configurator

import com.dag.nexwallet.base.BaseVS

data class Chain(
    val id: String,
    val name: String,
    val isEmbedded: Boolean,
    val disabled: Boolean,
    val icon: String
)

data class KnowledgeBase(
    val id: String,
    val name: String,
    val disabled: Boolean
)

data class LLMProvider(
    val id: String,
    val name: String,
    val disabled: Boolean
)

data class AgentType(
    val id: String,
    val name: String,
    val disabled: Boolean
)

sealed class ConfiguratorVS : BaseVS {
    data class Content(
        val selectedChains: List<Chain> = emptyList(),
        val selectedKnowledgeBases: List<KnowledgeBase> = emptyList(),
        val selectedLLMProvider: LLMProvider? = null,
        val selectedAgentType: AgentType? = null,
        val isLoading: Boolean = false,
        val error: String? = null
    ) : ConfiguratorVS()

    data class Error(val message: String) : ConfiguratorVS()
    object Loading : ConfiguratorVS()
}