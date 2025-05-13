package com.dag.nexwallet.features.login.presentation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dag.nexwallet.R
import com.dag.nexwallet.ui.theme.iconGradient

@Composable
fun LoginContent(
    onLoginClick: () -> Unit,
    onInfoClick: () -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {


    Box(
        modifier = modifier
            .fillMaxSize()
            .background(brush = iconGradient)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.35f))
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            LogoSection()
            FeaturesSection()
            LoginSection(
                onLoginClick = onLoginClick,
                onInfoClick = onInfoClick
            )
        }

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(48.dp),
                    color = Color(0xFF5FFBF1)
                )
            }
        }
    }
}

@Composable
fun LogoSection(
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.padding(top = 60.dp)
    ) {
        Box(
            modifier = Modifier
                .size(200.dp)
                .background(
                    color = Color(0xFF1A1A1A).copy(alpha = 0.7f),
                    shape = CircleShape
                )
                .padding(16.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.nexarbbg),
                contentDescription = "NexArb Logo",
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize()
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Your AI-Powered Crypto Assistant",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A1A1A),
            textAlign = TextAlign.Center,
            letterSpacing = (-0.5).sp,
            modifier = Modifier.padding(horizontal = 24.dp)
        )
    }
}

@Composable
fun FeaturesSection(
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.Start,
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 40.dp, vertical = 48.dp)
    ) {
        FeatureItem("Advanced AI Trading Bots")
        FeatureItem("Multi-Chain Support")
        FeatureItem("Real-time Market Analysis")
        FeatureItem("Personalized Trading Strategies")
    }
}

@Composable
fun LoginSection(
    onLoginClick: () -> Unit,
    onInfoClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.padding(bottom = 32.dp, start = 24.dp, end = 24.dp)
    ) {
        Button(
            onClick = onLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF1A1A1A)
            ),
            shape = RoundedCornerShape(28.dp),
            elevation = ButtonDefaults.buttonElevation(
                defaultElevation = 4.dp,
                pressedElevation = 8.dp
            )
        ) {
            Image(
                painter = painterResource(id = R.drawable.x),
                contentDescription = "X Logo",
                contentScale = ContentScale.Fit,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Continue with X",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 0.sp
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        TextButton(
            onClick = onInfoClick,
            colors = ButtonDefaults.textButtonColors(
                contentColor = Color(0xFF1A1A1A)
            )
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "Info Icon",
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Why do I need to login?",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.sp,
                color = Color(0xFF1A1A1A).copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
fun ErrorDialog(
    errorMessage: String,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(
                modifier = Modifier
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFFFF1F1),
                                Color(0xFFFFE4E4)
                            )
                        )
                    )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Error Icon",
                        tint = Color(0xFFE53935),
                        modifier = Modifier.size(48.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Login Error",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color(0xFFE53935),
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF1A1A1A).copy(alpha = 0.8f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFE53935)
                        ),
                        shape = RoundedCornerShape(28.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text(
                            text = "Dismiss",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InfoDialog(
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(
                modifier = Modifier
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFF8F9FA),
                                Color(0xFFE9ECEF)
                            )
                        )
                    )
            ) {
                Column(
                    modifier = Modifier
                        .padding(horizontal = 24.dp, vertical = 20.dp)
                ) {
                    Box(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Why Login is Required",
                            style = MaterialTheme.typography.titleLarge,
                            color = Color(0xFF1A1A1A),
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(end = 40.dp, top = 8.dp)
                        )
                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .size(32.dp)
                                .align(Alignment.TopEnd)
                                .background(
                                    color = Color(0xFF1A1A1A).copy(alpha = 0.1f),
                                    shape = CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close Dialog",
                                tint = Color(0xFF1A1A1A),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "NexArb is a premium service that provides advanced AI-powered trading features. " +
                              "Login is required to:",
                        color = Color(0xFF1A1A1A).copy(alpha = 0.7f),
                        style = MaterialTheme.typography.bodyLarge,
                        lineHeight = 24.sp
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Column(
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                    ) {
                        BulletPoint("Verify your subscription status")
                        BulletPoint("Secure your trading activities")
                        BulletPoint("Provide personalized AI recommendations")
                        BulletPoint("Save your preferences and settings")
                        BulletPoint("Enable cross-device synchronization")
                    }
                }
            }
        }
    }
}

@Composable
fun FeatureItem(text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(Color(0xFF5FFBF1))
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = text,
            color = Color(0xFF1A1A1A),
            fontSize = 17.sp,
            fontWeight = FontWeight.Medium,
            letterSpacing = 0.sp,
            lineHeight = 24.sp
        )
    }
}

@Composable
fun BulletPoint(text: String) {
    Row(
        verticalAlignment = Alignment.Top,
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(Color(0xFF86A8E7))
                .align(Alignment.CenterVertically)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = text,
            color = Color(0xFF1A1A1A).copy(alpha = 0.8f),
            style = MaterialTheme.typography.bodyLarge,
            lineHeight = 20.sp
        )
    }
}

@Preview
@Composable
fun LoginContentPreview() {
    LoginContent(
        onLoginClick = {},
        onInfoClick = {},
        isLoading = false
    )
}
