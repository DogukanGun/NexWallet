package com.dag.nexwallet.features.home.presentation

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.startAsTopComposable
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.base.scroll.LocalScrollStateManager
import com.dag.nexwallet.base.scroll.ReportScrollState
import com.dag.nexwallet.R
import com.dag.nexwallet.ui.theme.*
import kotlinx.coroutines.flow.distinctUntilChanged
import android.content.Intent
import android.net.Uri

// Updated card colors for better contrast
val cardBackgroundColor = Color(0xFF242937)
val activeAccentColor = Color(0xFF3B82F6)
val inactiveAccentColor = Color(0xFF64748B)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeView(
    navController: NavController,
    viewModel: HomeVM = hiltViewModel()
) {
    val state by viewModel.viewState.collectAsState()
    val context = LocalContext.current
    val packageManager = context.packageManager

    // Animation properties
    val animatedProgress = remember { Animatable(0f) }
    LaunchedEffect(true) {
        animatedProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(800, easing = FastOutSlowInEasing)
        )
    }

    LaunchedEffect(state) {
        if (state is HomeVS.LoggedOut) {
            navController.startAsTopComposable(Destination.LoginScreen)
            return@LaunchedEffect
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        when (state) {
            null, HomeVS.Loading -> {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(64.dp)
                        .align(Alignment.Center),
                    color = gradientStart,
                    strokeWidth = 4.dp
                )
            }
            
            is HomeVS.Error -> {
                HomeErrorView(state, viewModel)
            }
            
            is HomeVS.Success -> {
                val scrollState = rememberLazyListState()
                
                // Monitor scroll state for bottom navigation bar
                val isScrolling = scrollState.isScrollInProgress
                var previousFirstVisibleIndex by remember { mutableStateOf(0) }
                var previousScrollOffset by remember { mutableStateOf(0) }
                
                val isScrollingUp = remember(scrollState.firstVisibleItemIndex, scrollState.firstVisibleItemScrollOffset) {
                    val isUp = when {
                        scrollState.firstVisibleItemIndex < previousFirstVisibleIndex -> true
                        scrollState.firstVisibleItemIndex > previousFirstVisibleIndex -> false
                        scrollState.firstVisibleItemScrollOffset < previousScrollOffset -> true
                        else -> false
                    }
                    
                    previousFirstVisibleIndex = scrollState.firstVisibleItemIndex
                    previousScrollOffset = scrollState.firstVisibleItemScrollOffset
                    isUp
                }
                
                // Report scroll state to the central manager
                ReportScrollState(isScrolling = isScrolling, isScrollingUp = isScrollingUp)
                
                LazyColumn(
                    state = scrollState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                        .alpha(animatedProgress.value),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Profile section
                    item {
                        HomeProfileSection{
                            viewModel.navigateToX(
                                packageManager
                            ){ intent->
                                context.startActivity(intent)
                            }
                        }
                    }

                    // AI Agents section
                    item {
                        Text(
                            text = "AI Trading Agents",
                            fontSize = 24.sp,
                            color = primaryText,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 24.dp, bottom = 16.dp)
                        )
                    }
                    
                    // Solana Agent card
                    item {
                        AgentCard(
                            title = "Solana AI Bot",
                            subtitle = "Powered by SENDAI",
                            description = "Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode.",
                            isActive = true,
                            iconRes = R.drawable.solana,
                            onClick = { 
                                navController.navigate(Destination.SolanaChat)
                            }
                        )
                    }
                    
                    // Stellar Agent card
                    item {
                        AgentCard(
                            title = "Stellar AI Bot",
                            subtitle = "Powered by SENDAI",
                            description = "Manage your Stellar assets, execute trades, and monitor market activities with AI assistance.",
                            isActive = true,
                            iconRes = R.drawable.stellar_logo,
                            onClick = { 
                                navController.navigate(Destination.StellarChat)
                            }
                        )
                    }

                    // Stellar Agent card
                    item {
                        AgentCard(
                            title = "BNB AI Bot",
                            subtitle = "Powered by Nexarb",
                            description = "Manage your Stellar assets, execute trades, and monitor market activities with AI assistance.",
                            isActive = true,
                            iconRes = R.drawable.bnb_logo,
                            onClick = {
                                navController.navigate(Destination.BNBChat)
                            }
                        )
                    }

                    // HR Automation Tool card
                    item {
                        Text(
                            text = "Other Products",
                            fontSize = 24.sp,
                            color = primaryText,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 24.dp, bottom = 16.dp)
                        )
                    }

                    item {
                        AgentCard(
                            title = "HR Automation",
                            subtitle = "by NexArb",
                            description = "Streamline your HR processes with our intelligent automation platform. Enhance productivity and employee experience.",
                            isActive = true,
                            iconRes = R.drawable.nexarb,
                            onClick = { 
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://hr.nexarb.com"))
                                context.startActivity(intent)
                            }
                        )
                    }

                    item {
                        Spacer(modifier = Modifier.height(80.dp))
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
fun HomeViewPreview() {
    HomeView(
        navController = rememberNavController()
    )
}