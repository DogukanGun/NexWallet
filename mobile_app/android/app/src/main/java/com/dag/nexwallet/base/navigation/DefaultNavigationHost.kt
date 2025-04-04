package com.dag.nexwallet.base.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavBackStackEntry
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.dag.nexq_app.base.extensions.ObserveAsEvents

@Composable
fun DefaultNavigationHost(
    startDestination: Destination = Destination.Splash,
    navigator: DefaultNavigator,
    modifier: Modifier = Modifier,
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
        composable<Destination.Splash> {
            val viewModel = hiltViewModel<SplashVM>()
            Splash(
                splashVM = viewModel
            )
        }
        composable<Destination.Onboard> {
            val viewModel = hiltViewModel<OnboardVM>()
            Onboard(
                onboardVM = viewModel,
            )
        }
        composable<Destination.LoginScreen> {
            val viewModel = hiltViewModel<LoginVM>()
            Login(
                loginVM = viewModel
            )
        }
        navigation<Destination.HomeGraph>(
            startDestination = Destination.HomeScreen
        ) {
            composable<Destination.HomeScreen> {
                Home()
            }
            composable<Destination.Add> {
                val viewModel = hiltViewModel<QuizAddVM>()
                QuizAdd(
                    addVM = viewModel,
                    navController = navController
                )
            }
            composable<Destination.Edit> {
                val viewModel = hiltViewModel<CreateQuizVM>()
                CreateQuiz(
                    createQuizVM = viewModel,
                )
            }
            composable<Destination.Profile> {
                val viewModel = hiltViewModel<MyQuizzesVM>()
                MyQuizzes(
                    myQuizzesVM = viewModel
                )
            }
            composable<Destination.AddWithPdf> {
                val viewModel = hiltViewModel<CreateQuizWithPDFVM>()
                CreateQuizWithPDF(
                    createQuizWithPDFVM = viewModel
                )
            }
        }
    }
}