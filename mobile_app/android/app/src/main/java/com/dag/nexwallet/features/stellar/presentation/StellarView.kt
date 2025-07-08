package com.dag.nexwallet.features.stellar.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dag.nexwallet.ui.theme.*
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.ui.draw.scale
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.dag.nexwallet.R
import com.dag.nexwallet.ui.theme.iconGradient
import kotlinx.coroutines.delay

@Composable
fun StellarScreen(
    viewModel: StellarVM = hiltViewModel(),
) {
    val state by viewModel.viewState.collectAsState()
    var showIntro by remember { mutableStateOf(true) }
    
    LaunchedEffect(showIntro) {
        if (showIntro) {
            delay(3000)
            showIntro = false
        }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        // Main content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(mainBackground)
                .padding(16.dp)
        ) {
            when (state) {
                is StellarVS.Loading -> LoadingView()
                is StellarVS.Success -> {
                    val successState = state as StellarVS.Success
                    
                    AnimatedContent(
                        targetState = successState.currentScreen,
                        transitionSpec = {
                            when (targetState) {
                                StellarVS.ScreenState.AI_CHAT -> {
                                    (slideInHorizontally { fullWidth -> fullWidth } + fadeIn()).togetherWith(
                                        slideOutHorizontally { fullWidth -> -fullWidth } + fadeOut()
                                    ).using(
                                        SizeTransform(clip = false)
                                    )
                                }
                                StellarVS.ScreenState.WALLET -> {
                                    (slideInHorizontally { fullWidth -> -fullWidth } + fadeIn()).togetherWith(
                                        slideOutHorizontally { fullWidth -> fullWidth } + fadeOut()
                                    ).using(
                                        SizeTransform(clip = false)
                                    )
                                }
                            }
                        },
                        label = "screen_transition"
                    ) { targetScreen ->
                        when (targetScreen) {
                            StellarVS.ScreenState.WALLET -> WalletView(
                                state = successState,
                                onAiChatClick = { viewModel.switchToAiChat() }
                            )
                            StellarVS.ScreenState.AI_CHAT -> AIChatView(
                                viewModel = viewModel,
                                onBackClick = { viewModel.switchToWallet() }
                            )
                        }
                    }
                }
                is StellarVS.Error -> ErrorView(message = (state as StellarVS.Error).message)
                else -> {}
            }
        }
        
        // Intro overlay
        AnimatedVisibility(
            visible = showIntro,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier.fillMaxSize()
        ) {
            StellarIntro()
        }
    }
}

@Composable
private fun StellarIntro() {
    val infiniteTransition = rememberInfiniteTransition(label = "stellar_intro")
    
    // Scale animation
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .fillMaxSize()
            .background(brush = iconGradient)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            Image(
                painter = painterResource(R.drawable.stellar_logo),
                contentDescription = "Stellar Logo",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .size(200.dp)
                    .scale(scale)
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "Stellar Wallet",
                color = primaryText,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = "by Nexarb",
                color = primaryText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}
