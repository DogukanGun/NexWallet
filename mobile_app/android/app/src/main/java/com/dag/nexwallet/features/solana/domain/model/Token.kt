package com.dag.nexwallet.features.solana.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Token(
    val symbol: String,
    val name: String,
    val mintAddress: String,
    val decimals: Int
) {
    companion object {
        val solToken = Token("SOL", "Solana", "So11111111111111111111111111111111111111112", 9)
        val jSOL = Token("jSOL", "JITO SOL", "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", 5)

        val PREDEFINED_TOKENS = listOf(
            solToken,
            Token("USDC", "USD Coin", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 6),
            Token("USDT", "Tether USD", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", 6),
            Token("USDS", "USDS", "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA", 6),
            jSOL,
            Token("bSOL", "bSOL", "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1", 6),
            Token("mSOL", "mSOL", "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", 6),
            Token("BONK", "BONK", "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", 6)
        )
    }
} 