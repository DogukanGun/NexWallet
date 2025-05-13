package com.dag.nexwallet.features.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.R
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.ui.theme.iconGradient

@Composable
fun SplashView(
    viewModel: SplashVM = hiltViewModel(),
    navController: NavController
) {
    // Animation properties
    val infiniteTransition = rememberInfiniteTransition(label = "splash")

    // Collect state properly
    val viewState by viewModel.viewState.collectAsState()

    // Handle navigation effects
    LaunchedEffect(viewState) {
        when(viewState) {
            SplashVS.StartApp -> {
                try {
                    navController.navigate(Destination.LoginScreen) {
                        launchSingleTop = true
                        popUpTo(0) { inclusive = true }
                    }
                } catch (e: Exception) {
                    // Handle navigation error if needed
                }
            }
            SplashVS.CloseApp -> {
                viewModel.closeApp()
            }
            else -> { /* do nothing */ }
        }
    }

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

    // Alpha animation
    val alpha by animateFloatAsState(
        targetValue = 1f,
        animationSpec = tween(1000),
        label = "alpha",
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .fillMaxSize()
            .background(brush = iconGradient)
    ) {
        Image(
            painter = painterResource(R.drawable.nexarbbg),
            contentDescription = "Nexarb Logo",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .size(600.dp)
                .scale(scale)
                .alpha(alpha)
        )
    }
}

@Composable
@Preview
fun SplashViewPreview(){
    SplashView(
        navController = rememberNavController()
    )
}