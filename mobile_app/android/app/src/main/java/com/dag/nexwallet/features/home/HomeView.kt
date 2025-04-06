package com.dag.nexwallet.features.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.startAsTopComposable
import com.dag.nexwallet.base.navigation.Destination

@Composable
fun HomeView(
    navController: NavController,
    viewModel: HomeVM = hiltViewModel()
) {
    val state by viewModel.viewState.collectAsState()
    var missingProfileImage by remember { mutableStateOf(false) }
    val darkBackground = Color(0xFF0F172A)
    
    LaunchedEffect(state) {
        if (state is HomeVS.LoggedOut) {
            navController.startAsTopComposable(Destination.LoginScreen)
            return@LaunchedEffect
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBackground)
    ) {
        when (state) {
            null, HomeVS.Loading -> {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(48.dp)
                        .align(Alignment.Center),
                    color = Color(0xFF6366F1)
                )
            }
            
            is HomeVS.Error -> {
                Text(
                    text = (state as HomeVS.Error).message,
                    color = Color.Red,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(16.dp)
                )
            }
            
            is HomeVS.Success -> {
                val successState = state as HomeVS.Success
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Top Bar
                    item {
                        TopBar(
                            isSignedIn = successState.isSignedIn,
                            onSignOutClick = { viewModel.signOut() }
                        )
                    }

                    // Profile Card
                    item {
                        ProfileCard(
                            user = successState.user,
                            missingImage = missingProfileImage,
                            onMissingImageError = { missingProfileImage = true },
                            navController = navController
                        )
                    }

                    // Quick Actions
                    item {
                        Text(
                            text = "Quick Actions",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        QuickActionGrid(navController)
                    }

                    // AI Agents Section
                    item {
                        Text(
                            text = "AI Trading Agents",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        AIAgentsList()
                    }
                }
            }

            HomeVS.LoggedOut -> {
                // Handle in LaunchedEffect
            }
        }
    }
}


@Preview
@Composable
fun HomeViewPreview(){
    HomeView(
        navController = rememberNavController()
    )
}