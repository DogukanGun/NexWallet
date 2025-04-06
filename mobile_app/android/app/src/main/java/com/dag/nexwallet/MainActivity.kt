package com.dag.nexwallet

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.lifecycle.lifecycleScope
import com.dag.nexwallet.base.ActivityHolder
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.components.CustomAlertDialog
import com.dag.nexwallet.base.navigation.DefaultNavigationHost
import com.dag.nexwallet.base.navigation.DefaultNavigator
import com.dag.nexwallet.data.AlertDialogModel
import com.dag.nexwallet.domain.DataPreferencesStore
import com.dag.nexwallet.ui.theme.NexWalletTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val currentRoute = mutableStateOf<String?>(null)
    private val mainVM: MainVM by viewModels()

    @Inject
    lateinit var alertDialogManager: AlertDialogManager

    @Inject
    lateinit var defaultNavigator: DefaultNavigator

    @Inject
    lateinit var preferencesStore: DataPreferencesStore

    @Inject
    lateinit var activityHolder: ActivityHolder

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        activityHolder.setActivity(this)
        val showAlert = mutableStateOf(false)
        val alertDialogModel = mutableStateOf<AlertDialogModel?>(null)
        
        // Initialize the lifecycle scope coroutine only after alertDialogManager is available
        if (::alertDialogManager.isInitialized && lifecycleScope.isActive) {
            lifecycleScope.launch {
                alertDialogManager.alertFlow.collect { model ->
                    alertDialogModel.value = model
                    showAlert.value = true
                }
            }
        }
        setContent {
            NexWalletTheme {
                Box(
                    modifier = Modifier.fillMaxSize()
                ) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        Column(
                            verticalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxSize(),
                        ) {
                            DefaultNavigationHost(
                                navigator = defaultNavigator,
                                modifier = Modifier.weight(1f),
                            ) {
                                currentRoute.value = it.destination.route
                                    ?.split(".")?.last()
                            }
                            if (mainVM.isBottomNavActive(currentRoute.value)) {

                            }
                        }
                    }
                    AnimatedVisibility(showAlert.value && alertDialogModel.value != null) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.5f))
                                .blur(16.dp)
                                .zIndex(10f)
                        ) {
                            CustomAlertDialog(
                                alertDialogModel = alertDialogModel.value!!,
                                showAlert = showAlert,
                                defaultNavigator = defaultNavigator
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        activityHolder.clearActivity()
    }
}