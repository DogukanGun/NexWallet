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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.lifecycle.lifecycleScope
import com.dag.nexwallet.base.ActivityHolder
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.components.CustomAlertDialog
import com.dag.nexwallet.base.components.bottomnav.BottomNavigationBar
import com.dag.nexwallet.base.navigation.DefaultNavigationHost
import com.dag.nexwallet.base.navigation.DefaultNavigator
import com.dag.nexwallet.data.AlertDialogModel
import com.dag.nexwallet.domain.DataPreferencesStore
import com.dag.nexwallet.features.home.presentation.cardBackgroundColor
import com.dag.nexwallet.ui.theme.NexWalletTheme
import com.dag.nexwallet.ui.theme.mainBackground
import com.google.firebase.analytics.FirebaseAnalytics
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
    lateinit var firebaseAnalytics: FirebaseAnalytics

    @Inject
    lateinit var defaultNavigator: DefaultNavigator

    @Inject
    lateinit var preferencesStore: DataPreferencesStore

    @Inject
    lateinit var activityHolder: ActivityHolder

    @OptIn(ExperimentalMaterial3Api::class)
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
                    modifier = Modifier
                        .fillMaxSize()
                        .background(mainBackground)
                ) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = Color.Transparent,
                    ) {
                        Column(
                            verticalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier
                                .fillMaxSize()
                                .background(mainBackground),
                        ) {
                            if (mainVM.isBottomNavActive(currentRoute.value)) {
                                TopAppBar(
                                    modifier = Modifier
                                        .fillMaxWidth(),
                                    colors = TopAppBarDefaults.topAppBarColors(
                                        containerColor = cardBackgroundColor
                                    ),
                                    title = {
                                        Text(
                                            text = "NexWallet",
                                            fontSize = 22.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    },
                                    actions = {
                                        // Notification icon
                                        IconButton(
                                            onClick = { /* Handle notifications */ }
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Notifications,
                                                contentDescription = "Notifications",
                                                tint = Color.White,
                                                modifier = Modifier.size(24.dp)
                                            )
                                        }
                                        IconButton(
                                            onClick = { mainVM.signOut() }
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.ExitToApp,
                                                contentDescription = "Sign Out",
                                                tint = Color.White,
                                                modifier = Modifier.size(24.dp)
                                            )
                                        }

                                    }
                                )
                            }
                            DefaultNavigationHost(
                                navigator = defaultNavigator,
                                modifier = Modifier.weight(1f),
                            ) {
                                currentRoute.value = it.destination.route
                                    ?.split(".")?.last()
                            }
                            if (mainVM.isBottomNavActive(currentRoute.value)) {
                                BottomNavigationBar {
                                    lifecycleScope.launch {
                                        defaultNavigator.navigate(it) {
                                            launchSingleTop = true
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                }
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