package com.dag.nexwallet.features.login.presentation

import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.startAsTopComposable
import com.dag.nexwallet.base.navigation.Destination
@Composable
fun LoginView(
    viewModel: LoginVM = hiltViewModel(),
    navController: NavController
) {
    var showInfoDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    
    val state = viewModel.viewState.collectAsState()
    LaunchedEffect(state.value) {
        when(state.value){
            is LoginVS.Error -> {
                isLoading = false
                errorMessage = (state.value as LoginVS.Error).message
            }
            is LoginVS.NavigateToHome -> {
                isLoading = false
                errorMessage = null
                navController.startAsTopComposable(Destination.HomeScreen)
            }
            is LoginVS.Loading -> {
                isLoading = true
                errorMessage = null
            }
            else -> {
                isLoading = false
            }
        }
    }

    LoginContent(
        onLoginClick = { viewModel.loginWithX() },
        onInfoClick = { showInfoDialog = true },
        isLoading = isLoading
    )

    if (showInfoDialog) {
        InfoDialog(onDismiss = { showInfoDialog = false })
    }

    if (errorMessage != null) {
        ErrorDialog(
            errorMessage = errorMessage!!,
            onDismiss = { errorMessage = null }
        )
    }
}

@Preview
@Composable
fun LoginViewPreview() {
    LoginView(
        navController = rememberNavController()
    )
}