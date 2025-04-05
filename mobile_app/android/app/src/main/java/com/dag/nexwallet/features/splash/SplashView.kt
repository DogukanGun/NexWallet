package com.dag.nexwallet.features.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.dag.nexwallet.R

@Composable
@Preview
fun SplashView() {
    // Animation properties
    val infiniteTransition = rememberInfiniteTransition(label = "splash")
    
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
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00E5B3), // Turquoise/Green
                        Color(0xFF3B82F6), // Blue
                        Color(0xFF8B5CF6)  // Purple
                    )
                )
            )
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