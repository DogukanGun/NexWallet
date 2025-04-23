package com.dag.nexwallet.features.configurator.domain.model


data class AgentConfig(
    var llmProvider: String,
    var chains: List<String>,
    var knowledgeBase: List<String>,
)