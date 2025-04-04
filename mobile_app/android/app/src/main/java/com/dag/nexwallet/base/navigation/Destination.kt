package com.dag.nexwallet.base.navigation

sealed interface Destination {
    @Serializable
    data object Splash: Destination

    companion object {
        val NAV_WITHOUT_BOTTOM_NAVBAR = listOf(Splash,Onboard,LoginScreen,Add,Edit,AddWithPdf)
    }
}