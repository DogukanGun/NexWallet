package com.dag.nexwallet.features.splash

import com.dag.nexwallet.base.BaseVS

sealed class SplashVS: BaseVS {
    data object StartApp: SplashVS()
    data object CloseApp: SplashVS()
}