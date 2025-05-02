package com.dag.nexwallet.data.repository

<<<<<<< HEAD
import com.dag.nexwallet.base.extensions.safeLet
import com.dag.nexwallet.data.local.SecureStorage
import com.dag.nexwallet.features.configurator.domain.model.AgentConfig
=======
import com.dag.nexwallet.data.local.SecureStorage
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ConfigRepository @Inject constructor(
    private val secureStorage: SecureStorage
){
<<<<<<< HEAD
    fun saveConfig(config:AgentConfig){
        secureStorage.saveStringList(SecureStorage.KEY_CONFIG_CHAINS,config.chains)
        secureStorage.saveString(SecureStorage.KEY_CONFIG_LLM_PROVIDER,config.llmProvider)
        secureStorage.saveStringList(SecureStorage.KEY_CONFIG_KNOWLEDGE_BASE,config.knowledgeBase)
    }

    fun getConfig(): AgentConfig {
        val chains = secureStorage.getStringSet(SecureStorage.KEY_CONFIG_CHAINS)
        val knowledgeBases = secureStorage.getStringSet(SecureStorage.KEY_CONFIG_KNOWLEDGE_BASE)
        val llmProvider = secureStorage.getString(SecureStorage.KEY_CONFIG_LLM_PROVIDER,"")
        safeLet(chains,llmProvider,knowledgeBases) { p1, p2, p3 ->
            return AgentConfig(
                chains = p1.toList(),
                llmProvider = p2,
                knowledgeBase = p3.toList()
            )
        }
        throw Exception("Config cannot be found")
    }
=======

>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f
}