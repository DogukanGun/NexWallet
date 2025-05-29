package com.dag.nexwallet.base.components.bottomnav

import androidx.annotation.DrawableRes
import com.dag.nexwallet.R
import com.dag.nexwallet.base.navigation.Destination

enum class BottomNavIcon(
    @DrawableRes var icon: Int,
    var destination: Destination
) {
    Home(R.drawable.baseline_home, Destination.HomeScreen),
    Solana(R.drawable.solana, Destination.SolanaChat),
    Stellar(R.drawable.stellar_logo, Destination.StellarChat),
    BNB(R.drawable.bnbchain, Destination.ConfigurationScreen)
}