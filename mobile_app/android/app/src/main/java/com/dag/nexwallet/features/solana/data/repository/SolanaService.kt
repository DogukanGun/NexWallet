package com.dag.nexwallet.features.solana.data.repository

import com.dag.nexwallet.data.repository.WalletRepository
import com.dag.nexwallet.features.solana.domain.model.*
import com.dag.nexwallet.features.solana.domain.model.Token.Companion.jSOL
import com.dag.nexwallet.features.solana.domain.model.Token.Companion.solToken
import com.dag.nexwallet.features.solana.domain.repository.ISolanaService
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.json.*
import javax.inject.Inject
import javax.inject.Named
import kotlin.math.pow

class SolanaService @Inject constructor(
    @Named("JupiterStakeKtor") private val stakeClient: HttpClient,
    @Named("JupiterSwapKtor") private val swapClient: HttpClient,
    @Named("AuthorizedFrontendKtor") private val agentClient: HttpClient,
    private val walletRepository: WalletRepository
) : ISolanaService {
    
    override suspend fun swap(request: SwapRequest): SwapResponse {
        // Calculate amount with proper decimals
        var decimal = 6.0
        if (request.fromToken == solToken.mintAddress) {
            decimal = 9.0
        } else if (request.fromToken == jSOL.mintAddress) {
            decimal = 5.0
        }
        val calculatedAmount = request.amount.toInt() * 10.0.pow(decimal)
        
        // Get quote
        val quoteUrl = buildString {
            append("/quote?")
            append("inputMint=${request.fromToken}")
            append("&outputMint=${request.toToken}")
            append("&amount=${calculatedAmount.toInt()}")
            append("&dynamicSlippage=true")
            append("&minimizeSlippage=false")
            append("&onlyDirectRoutes=false")
            append("&maxAccounts=64")
            append("&swapMode=ExactIn")
        }
        
        // Get the quote response as JsonElement
        val quoteResponse = swapClient.get(quoteUrl).body<JsonElement>()
        
        // Get user's wallet address
        val walletAddress = walletRepository.getAddress().getOrNull()
            ?: throw IllegalStateException("Wallet address not found")
        
        // Build swap request body
        val swapBody = SwapBody(
            quoteResponse = quoteResponse,
            userPublicKey = walletAddress,
            wrapAndUnwrapSol = true,
            dynamicComputeUnitLimit = true,
            dynamicSlippage = true,
            prioritizationFeeLamports = PrioritizationFeeLamports(
                PriorityLevelWithMaxLamports(
                    maxLamports = 10000000,
                    global = false,
                    priorityLevel = "medium"
                )
            )
        )
        
        // Get swap transaction
        return swapClient.post("/swap") {
            contentType(ContentType.Application.Json)
            setBody(swapBody)
        }.body()
    }

    override suspend fun stake(request: StakeRequest): StakeResponse {
        // Get user's wallet address
        val walletAddress = walletRepository.getAddress().getOrNull()
            ?: throw IllegalStateException("Wallet address not found")

        // Create stake request body
        val stakeBody = StakeBody(
            account = walletAddress
        )

        // Get stake transaction
        return stakeClient.post("${request.amount}") {
            contentType(ContentType.Application.Json)
            setBody(stakeBody)
        }.body()
    }

    override suspend fun sendMessage(message: String): AgentResponse {
        // Get user's wallet address
        val walletAddress = walletRepository.getAddress().getOrNull()
            ?: throw IllegalStateException("Wallet address not found")

        // Create agent request
        val request = AgentRequest(
            message = message,
            wallet = walletAddress
        )

        // Send request to agent
        return agentClient.post("/api/mobile-solana") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()
    }
} 