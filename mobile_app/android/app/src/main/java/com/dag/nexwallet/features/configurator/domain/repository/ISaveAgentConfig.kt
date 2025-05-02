package com.dag.nexwallet.features.configurator.domain.repository

import com.dag.nexwallet.features.configurator.domain.model.AgentConfig

interface ISaveAgentConfig {
    suspend fun saveAgent(saveAgentConfig: AgentConfig)
}