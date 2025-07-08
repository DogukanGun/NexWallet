package com.dag.nexwallet.base.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavBackStackEntry
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.ObserveAsEvents
import com.dag.nexwallet.features.bnb.presentation.BnbScreen
import com.dag.nexwallet.features.chat.presentation.ChatScreen
import com.dag.nexwallet.features.login.presentation.LoginView
import com.dag.nexwallet.features.splash.SplashView
import com.dag.nexwallet.features.configurator.presentation.ConfiguratorView
import com.dag.nexwallet.features.home.presentation.HomeView
import com.dag.nexwallet.features.solana.presentation.SolanaScreen
import com.dag.nexwallet.features.stellar.presentation.StellarScreen
import com.dag.nexwallet.features.voice.add.AddVoiceView
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import io.ktor.client.plugins.Sender

@Composable
fun DefaultNavigationHost(
    modifier: Modifier = Modifier,
    startDestination: Destination = Destination.Splash,
    navigator: DefaultNavigator,
    sender: ActivityResultSender,
    navBackStackEntryState: (NavBackStackEntry) -> Unit,
) {
    val navController = rememberNavController()
    ObserveAsEvents(flow = navigator.navigationActions) { action ->
        when (action) {
            is NavigationAction.Navigate -> navController.navigate(
                action.destination
            ) {
                action.navOptions(this)
            }
            NavigationAction.NavigateUp -> navController.navigateUp()
        }
    }
    ObserveAsEvents(flow = navController.currentBackStackEntryFlow){
        navBackStackEntryState(it)
    }
    Box(modifier = modifier.fillMaxSize()) {
        NavHost(
            navController = navController,
            modifier = Modifier.fillMaxSize(),
            startDestination = startDestination
        ) {
            splashComposable<Destination.Splash> {
                SplashView(
                    navController = navController
                )
            }

            composableWithAnimations<Destination.LoginScreen> {
                LoginView(
                    navController = navController
                )
            }

            composableWithAnimations<Destination.HomeScreen> {
                HomeView(
                    navController = navController
                )
            }

            composableWithAnimations<Destination.StellarChat> {
                StellarScreen()
            }

            composableWithAnimations<Destination.SolanaChat> {
                SolanaScreen(
                    sender = sender
                )
            }

            composableWithAnimations<Destination.BNBChat> {
                BnbScreen()
            }
        }
    }
}