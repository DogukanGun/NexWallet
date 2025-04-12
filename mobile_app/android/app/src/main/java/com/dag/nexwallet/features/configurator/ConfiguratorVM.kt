package com.dag.nexwallet.features.configurator

import com.dag.nexwallet.base.BaseVM
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class ConfiguratorVM @Inject constructor() : BaseVM<ConfiguratorVS>(ConfiguratorVS.Content()) {
    
    private val chains = listOf(
        Chain(
            id = "solana",
            name = "Solana",
            isEmbedded = false,
            disabled = false,
            icon = "solana_icon"
        ),
        Chain(
            id = "base",
            name = "Base",
            isEmbedded = true,
            disabled = true,
            icon = "base_icon"
        ),
        Chain(
            id = "ethereum",
            name = "Ethereum",
            isEmbedded = true,
            disabled = true,
            icon = "ethereum_icon"
        ),
        Chain(
            id = "arbitrum",
            name = "Arbitrum",
            isEmbedded = true,
            disabled = true,
            icon = "arbitrum_icon"
        )
    )

    private val knowledgeBases = listOf(
        KnowledgeBase(
            id = "cookieDao",
            name = "Cookie Dao",
            disabled = false
        ),
        KnowledgeBase(
            id = "messari",
            name = "Messari",
            disabled = false
        )
    )

    private val llmProviders = listOf(
        LLMProvider(
            id = "openai",
            name = "OpenAI",
            disabled = false
        ),
        LLMProvider(
            id = "llama_onchain",
            name = "Llama 3.1 Onchain - Powered by Lilypad",
            disabled = false
        ),
        LLMProvider(
            id = "deepseek_onchain",
            name = "DeepSeek Onchain - Powered by Lilypad",
            disabled = false
        ),
        LLMProvider(
            id = "claude",
            name = "Claude",
            disabled = true
        )
    )

    private val agentTypes = listOf(
        AgentType(
            id = "voice",
            name = "Voice Agent",
            disabled = false
        ),
        AgentType(
            id = "text",
            name = "Text Agent",
            disabled = false
        )
    )

    fun getAvailableChains() = chains
    fun getAvailableKnowledgeBases() = knowledgeBases
    fun getAvailableLLMProviders() = llmProviders
    fun getAvailableAgentTypes() = agentTypes

    fun toggleChain(chain: Chain) {
        val currentState = (_viewState.value as? ConfiguratorVS.Content) ?: return
        val selectedChains = currentState.selectedChains.toMutableList()
        
        if (selectedChains.contains(chain)) {
            selectedChains.remove(chain)
        } else {
            selectedChains.add(chain)
        }

        updateState(currentState.copy(selectedChains = selectedChains))
    }

    fun toggleKnowledgeBase(kb: KnowledgeBase) {
        val currentState = (_viewState.value as? ConfiguratorVS.Content) ?: return
        val selectedKBs = currentState.selectedKnowledgeBases.toMutableList()
        
        if (selectedKBs.contains(kb)) {
            selectedKBs.remove(kb)
        } else {
            selectedKBs.add(kb)
        }

        updateState(currentState.copy(selectedKnowledgeBases = selectedKBs))
    }

    fun selectLLMProvider(provider: LLMProvider) {
        val currentState = (_viewState.value as? ConfiguratorVS.Content) ?: return
        val newSelection = if (currentState.selectedLLMProvider == provider) null else provider
        updateState(currentState.copy(selectedLLMProvider = newSelection))
    }

    fun selectAgentType(type: AgentType) {
        val currentState = (_viewState.value as? ConfiguratorVS.Content) ?: return
        val newSelection = if (currentState.selectedAgentType == type) null else type
        updateState(currentState.copy(selectedAgentType = newSelection))
    }

    fun isStepValid(step: Int): Boolean {
        val currentState = (_viewState.value as? ConfiguratorVS.Content) ?: return false
        return when (step) {
            1 -> currentState.selectedChains.isNotEmpty()
            2 -> true // Knowledge base selection is optional
            3 -> currentState.selectedLLMProvider != null
            4 -> currentState.selectedAgentType != null
            else -> false
        }
    }

    fun getCompletedSteps(): Set<Int> {
        val completedSteps = mutableSetOf<Int>()
        (1..4).forEach { step ->
            if (isStepValid(step)) {
                completedSteps.add(step)
            }
        }
        return completedSteps
    }

    fun canStartAgent(): Boolean {
        return isStepValid(1) && isStepValid(3) && isStepValid(4)
    }

    private fun updateState(newState: ConfiguratorVS.Content) {
        _viewState.value = newState
    }
}