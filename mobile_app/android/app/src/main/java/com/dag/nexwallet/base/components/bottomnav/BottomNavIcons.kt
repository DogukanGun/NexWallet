package com.dag.nexwallet.base.components.bottomnav

import androidx.annotation.DrawableRes
import com.dag.nexwallet.R
import com.dag.nexwallet.base.navigation.Destination

enum class BottomNavIcon(
    @DrawableRes var icon: Int,
    var destination: Destination
) {
    Home(R.drawable.baseline_home, Destination.HomeScreen),
    AddVoice(R.drawable.baseline_mic, Destination.AddVoiceScreen),
    Configurator(R.drawable.baseline_chat, Destination.ConfigurationScreen)
}