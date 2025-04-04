package com.dag.nexq_app.base.navigation

import kotlinx.serialization.Serializable

sealed interface Destination {
    @Serializable
    data object Splash: Destination

    @Serializable
    data object HomeGraph: Destination

    @Serializable
    data object LoginScreen: Destination

    @Serializable
    data object HomeScreen: Destination

    @Serializable
    data object Onboard: Destination

    @Serializable
    data object Add: Destination

    @Serializable
    data object Edit: Destination

    @Serializable
    data object AddWithPdf: Destination

    @Serializable
    data object ComingSoon: Destination

    @Serializable
    data object Profile: Destination

    companion object {
        val NAV_WITHOUT_BOTTOM_NAVBAR = listOf(Splash,Onboard,LoginScreen,Add,Edit,AddWithPdf)
    }
}