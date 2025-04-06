package com.dag.nexwallet.features.splash

import android.content.pm.PackageManager
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.ActivityHolder
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.data.AlertDialogButton
import com.dag.nexwallet.data.AlertDialogButtonType
import com.dag.nexwallet.data.AlertDialogModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import javax.inject.Inject

@HiltViewModel
class SplashVM @Inject constructor(
    private val packageManager: PackageManager,
    private val alertDialogManager: AlertDialogManager,
    private val activityHolder: ActivityHolder
): BaseVM<SplashVS>(){

    init {
        checkWallets()
    }

    companion object {
        private const val PHANTOM_PACKAGE_NAME = "app.phantom"
        private const val SOLFLARE_PACKAGE_NAME = "com.solflare.mobile"
        private const val SPLASH_DELAY = 3000L // 3 seconds delay
    }

    private fun checkWallets(){
        if (!isPhantomWalletInstalled() && !isSolflareWalletInstalled()){
            viewModelScope.launch {
                alertDialogManager.showAlert(
                    AlertDialogModel(
                        title = "Wallet Required",
                        message = "To use NexWallet, you need either Phantom or Solflare wallet installed on your device. Please install one of these wallets from your app store to continue.",
                        textInput = false,
                        positiveButton = AlertDialogButton(
                            text = "Got it",
                            onClick = {
                                _viewState.value = SplashVS.CloseApp
                            },
                            type = AlertDialogButtonType.CUSTOM
                        )
                    )
                )
            }
        }else{
            viewModelScope.launch {
                delay(SPLASH_DELAY) // Wait for 3 seconds
                _viewState.value = SplashVS.StartApp
            }
        }
    }

    fun closeApp() {
        activityHolder.getActivity()?.finish()
    }

    private fun isPhantomWalletInstalled(): Boolean {
        return isPackageInstalled(PHANTOM_PACKAGE_NAME)
    }

    private fun isSolflareWalletInstalled(): Boolean {
        return isPackageInstalled(SOLFLARE_PACKAGE_NAME)
    }

    private fun isPackageInstalled(packageName: String): Boolean {
        return try {
            packageManager.getPackageInfo(packageName, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }
}