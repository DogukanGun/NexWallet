package com.dag.nexwallet.base.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavBackStackEntry
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.ObserveAsEvents
import com.dag.nexwallet.features.login.presentation.LoginView
import com.dag.nexwallet.features.splash.SplashView
import com.dag.nexwallet.features.configurator.presentation.ConfiguratorView
import com.dag.nexwallet.features.home.presentation.HomeView
import com.dag.nexwallet.features.voice.add.AddVoiceView

@Composable
fun DefaultNavigationHost(
    modifier: Modifier = Modifier,
    startDestination: Destination = Destination.Splash,
    navigator: DefaultNavigator,
    navBackStackEntryState: (NavBackStackEntry) -> Unit
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
    NavHost(
        navController = navController,
        modifier = modifier,
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

        composableWithAnimations<Destination.ConfigurationScreen> {
            ConfiguratorView()
        }

        composableWithAnimations<Destination.AddVoiceScreen> {
            AddVoiceView()
        }
    }
}