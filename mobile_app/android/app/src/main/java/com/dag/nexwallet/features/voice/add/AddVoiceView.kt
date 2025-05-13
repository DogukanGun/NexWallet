package com.dag.nexwallet.features.voice.add

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dag.nexwallet.R
import com.dag.nexwallet.ui.theme.*
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun AddVoiceView(
    navController: NavController,
) {
    val scrollState = rememberScrollState()
    
    // Animation properties
    val animatedProgress = remember { Animatable(0f) }
    LaunchedEffect(true) {
        animatedProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(800, easing = FastOutSlowInEasing)
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Semi-transparent overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.2f))
                    .padding(top = 32.dp, start = 16.dp, end = 16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .alpha(animatedProgress.value)
                ) {
                    // Main Content
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                    ) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            // Header Section
                            Text(
                                text = "Personalize Your Assistant",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                color = primaryText,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )

                            Text(
                                text = "Create a more authentic and engaging interaction experience with your own voice.",
                                fontSize = 16.sp,
                                color = secondaryText,
                                modifier = Modifier.padding(bottom = 24.dp)
                            )

                            // Coming Soon Card
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                shape = RoundedCornerShape(32.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = cardBackgroundColor
                                )
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Spacer(modifier = Modifier.height(32.dp))
                                    
                                    // Coming Soon Icon
                                    Box(
                                        modifier = Modifier
                                            .size(80.dp)
                                            .clip(RoundedCornerShape(40.dp))
                                            .background(brush = iconGradient),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            painter = painterResource(R.drawable.baseline_mic),
                                            contentDescription = "Voice",
                                            tint = primaryText,
                                            modifier = Modifier.size(40.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(24.dp))

                                    Text(
                                        text = "COMING SOON",
                                        color = gradientStart,
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.Bold,
                                        textAlign = TextAlign.Center
                                    )

                                    Spacer(modifier = Modifier.height(16.dp))

                                    Text(
                                        text = "Voice customization feature is under development and will be available in a future update.",
                                        color = secondaryText,
                                        fontSize = 16.sp,
                                        textAlign = TextAlign.Center,
                                        lineHeight = 24.sp
                                    )

                                    Spacer(modifier = Modifier.height(32.dp))

                                    // Feature Preview
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth(),
                                        shape = RoundedCornerShape(16.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = Color(0xFF1F2937)
                                        )
                                    ) {
                                        Column(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(24.dp)
                                        ) {
                                            FeaturePreviewItem(
                                                title = "Voice Model Creation",
                                                description = "Create your personal AI voice model with advanced customization options"
                                            )
                                            
                                            FeaturePreviewItem(
                                                title = "Secure Storage",
                                                description = "Choose between local storage or decentralized IPFS storage for your voice data"
                                            )
                                            
                                            FeaturePreviewItem(
                                                title = "Enhanced Privacy",
                                                description = "Your voice remains private with double-layer encryption protection"
                                            )
                                        }
                                    }
                                    
                                    Spacer(modifier = Modifier.height(32.dp))
                                }
                            }

                            // Bottom space for navigation bar
                            Spacer(modifier = Modifier.height(72.dp))
                        }
                    }
                }
            }

            Button(
                onClick = { /* action */ },
                colors = ButtonDefaults.buttonColors(
                    containerColor = activeAccentColor
                )
            ) {
                Text(
                    text = "Start Recording",
                    color = primaryText
                )
            }
        }
    }
}

@Composable
private fun FeaturePreviewItem(
    title: String,
    description: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 4.dp)
        ) {
            Icon(
                painter = painterResource(R.drawable.baseline_mic),
                contentDescription = null,
                tint = gradientStart,
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = title,
                color = primaryText,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        
        Text(
            text = description,
            color = secondaryText,
            fontSize = 14.sp,
            lineHeight = 20.sp,
            modifier = Modifier.padding(start = 32.dp)
        )
    }
}

