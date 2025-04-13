package com.dag.nexwallet

import com.dag.nexwallet.base.BaseVS

sealed class MainVS: BaseVS {
    data object LoggedOut: MainVS()
}