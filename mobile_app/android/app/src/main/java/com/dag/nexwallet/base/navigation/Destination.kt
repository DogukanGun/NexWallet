package com.dag.nexwallet.base.navigation

import kotlinx.serialization.Serializable

sealed interface Destination {
    @Serializable
    data object Splash: Destination

    @Serializable
    data object LoginScreen: Destination

    @Serializable
    data object HomeScreen: Destination

    @Serializable
    data object ConfigurationScreen: Destination

    @Serializable
    data object AddVoiceScreen: Destination

    @Serializable
    data object ChatScreen: Destination

    @Serializable
    data object StellarChat: Destination

    @Serializable
    data object SolanaChat: Destination

    companion object {
        val NAV_WITHOUT_BOTTOM_NAVBAR = listOf(Splash, LoginScreen)
    }
}