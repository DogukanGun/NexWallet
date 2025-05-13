package com.dag.nexwallet.features.home.presentation

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.startAsTopComposable
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.R
import com.dag.nexwallet.ui.theme.*

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
                Card(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(24.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp)),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = cardBackgroundColor
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error",
                            color = Color.Red,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = (state as HomeVS.Error).message,
                            color = secondaryText
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Button(
                            onClick = { viewModel.retry() },
                            shape = RoundedCornerShape(24.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = activeAccentColor
                            )
                        ) {
                            Text(
                                text = "Retry",
                                color = primaryText,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
            
            is HomeVS.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                        .alpha(animatedProgress.value),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Profile section
                    item {
                        Text(
                            text = "Welcome",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryText,
                            modifier = Modifier.padding(top = 16.dp, bottom = 4.dp)
                        )
                        
                        Text(
                            text = "Your digital asset companion",
                            fontSize = 16.sp,
                            color = secondaryText,
                            modifier = Modifier.padding(bottom = 24.dp)
                        )
                        
                        // User profile card
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .shadow(elevation = 8.dp, shape = RoundedCornerShape(16.dp))
                                .clip(RoundedCornerShape(16.dp)),
                            colors = CardDefaults.cardColors(
                                containerColor = cardBackgroundColor
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Profile picture with gradient background
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .clip(CircleShape)
                                        .background(brush = iconGradient)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.nexarb),
                                        contentDescription = "Profile Picture",
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                
                                Spacer(modifier = Modifier.width(16.dp))
                                
                                Column(
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = "NexArb",
                                        color = primaryText,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 18.sp
                                    )
                                    
                                    Text(
                                        text = "@NexArb_",
                                        color = secondaryText,
                                        fontSize = 14.sp
                                    )
                                }
                                
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.x),
                                        contentDescription = "Twitter/X",
                                        contentScale = ContentScale.Fit,
                                        modifier = Modifier
                                            .size(24.dp)
                                            .align(Alignment.Center)
                                    )
                                }
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
                    
                    // Agent cards
                    item {
                        AgentCard(
                            title = "Solana AI Bot",
                            subtitle = "Powered by Senator",
                            description = "Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode.",
                            isActive = true,
                            iconRes = R.drawable.solana,
                            onClick = { /* Navigate to Solana Bot */ }
                        )
                    }
                    
                    item {
                        AgentCard(
                            title = "Voice AI Bot",
                            subtitle = "Coming Soon",
                            description = "Interact with your AI agents through voice commands. Natural language processing for seamless voice interactions.",
                            isActive = false,
                            iconRes = null,
                            onClick = { /* Disabled */ }
                        )
                    }
                    
                    item {
                        AgentCard(
                            title = "Base AI Bot",
                            subtitle = "Coming Soon",
                            description = "Navigate Base network, handle transactions, and access DeFi protocols.",
                            isActive = false,
                            iconRes = R.drawable.base,
                            onClick = { /* Disabled */ }
                        )
                    }
                    
                    item {
                        AgentCard(
                            title = "Ethereum AI Bot",
                            subtitle = "Coming Soon",
                            description = "Manage Ethereum assets, interact with smart contracts, and explore the ecosystem.",
                            isActive = false,
                            iconRes = R.drawable.ethereum,
                            onClick = { /* Disabled */ }
                        )
                    }
                    
                    item {
                        AgentCard(
                            title = "Arbitrum AI Bot",
                            subtitle = "Coming Soon",
                            description = "Interact with Arbitrum network, manage transactions, and access Layer 2 solutions.",
                            isActive = false,
                            iconRes = R.drawable.arbitrum,
                            onClick = { /* Disabled */ }
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

@Composable
fun AgentCard(
    title: String,
    subtitle: String,
    description: String,
    isActive: Boolean,
    iconRes: Int?,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(elevation = 8.dp, shape = RoundedCornerShape(16.dp))
            .clip(RoundedCornerShape(16.dp))
            .clickable(enabled = isActive) { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = cardBackgroundColor
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    // Icon with gradient background for active items
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(
                                brush = if (isActive) iconGradient
                                else Brush.linearGradient(
                                    colors = listOf(
                                        inactiveAccentColor,
                                        inactiveAccentColor
                                    )
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (iconRes != null) {
                            Icon(
                                painter = painterResource(id = iconRes),
                                contentDescription = null,
                                tint = primaryText,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = primaryText,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Column {
                        Text(
                            text = title,
                            color = primaryText,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        
                        Text(
                            text = subtitle,
                            color = if (isActive) gradientStart else disabledText,
                            fontSize = 14.sp
                        )
                    }
                }
                
                Text(
                    text = description,
                    color = secondaryText,
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(start = 44.dp, top = 4.dp)
                )
            }
            
            if (isActive) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Open",
                    tint = gradientStart,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Locked",
                    tint = inactiveAccentColor,
                    modifier = Modifier.size(24.dp)
                )
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