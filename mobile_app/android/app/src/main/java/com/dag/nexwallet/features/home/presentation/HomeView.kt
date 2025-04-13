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
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Lock
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
import com.dag.nexwallet.ui.theme.gradientBackground

val cardBackgroundColor = Color(0xFF162240).copy(alpha = 0.85f)


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
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.2f))
        ) {
            when (state) {
                null, HomeVS.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier
                            .size(64.dp)
                            .align(Alignment.Center),
                        color = Color.White,
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
                            containerColor = Color.White.copy(alpha = 0.9f)
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
                                color = Color.Black.copy(alpha = 0.7f)
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Button(
                                onClick = { viewModel.retry() },
                                shape = RoundedCornerShape(24.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF3B82F6)
                                )
                            ) {
                                Text(
                                    text = "Retry",
                                    color = Color.White,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
                
                is HomeVS.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(top = 32.dp, start = 16.dp, end = 16.dp)
                            .alpha(animatedProgress.value)
                    ) {
                        // Main content
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            // Profile section with welcome and user info
                            item {
                                Text(
                                    text = "Welcome",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                                )
                                
                                Text(
                                    text = "Your digital asset companion",
                                    fontSize = 16.sp,
                                    color = Color.White.copy(alpha = 0.9f),
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                                
                                // User profile card
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(16.dp))
                                        .shadow(8.dp, RoundedCornerShape(16.dp)),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = cardBackgroundColor
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(cardBackgroundColor)
                                            .padding(16.dp)
                                            .clip(RoundedCornerShape(16.dp)),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        // Profile picture
                                        Box(
                                            modifier = Modifier
                                                .size(48.dp)
                                                .clip(CircleShape)
                                                .background(Color(0xFF3B82F6))
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.nexarb),
                                                contentDescription = "Profile Picture",
                                                contentScale = ContentScale.Crop,
                                                modifier = Modifier.fillMaxSize()
                                            )
                                        }
                                        
                                        Spacer(modifier = Modifier.width(16.dp))
                                        
                                        // Account info
                                        Column(
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text(
                                                text = "NexArb",
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 18.sp
                                            )
                                            
                                            Text(
                                                text = "@NexArb_",
                                                color = Color.White.copy(alpha = 0.7f),
                                                fontSize = 14.sp
                                            )
                                        }
                                        
                                        // Twitter/X logo
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(Color.Transparent)
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
                            
                            // AI Agents section - matched to screenshot style
                            item {
                                Text(
                                    text = "AI Trading Agents",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontSize = 24.sp,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(top = 16.dp, bottom = 12.dp)
                                )
                                
                                // Solana AI Bot Card - Active
                                AgentCard(
                                    title = "Solana AI Bot",
                                    subtitle = "Powered by Senator",
                                    description = "Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode.",
                                    isActive = true,
                                    iconRes = R.drawable.solana,
                                    onClick = { /* Navigate to Solana Bot */ }
                                )
                                
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                // Voice AI Bot Card - Coming Soon
                                AgentCard(
                                    title = "Voice AI Bot",
                                    subtitle = "Coming Soon",
                                    description = "Interact with your AI agents through voice commands. Natural language processing for seamless voice interactions.",
                                    isActive = false,
                                    iconRes = null, // Use default star icon
                                    onClick = { /* Disabled */ }
                                )
                                
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                // Base AI Bot Card - Coming Soon
                                AgentCard(
                                    title = "Base AI Bot",
                                    subtitle = "Coming Soon",
                                    description = "Navigate Base network, handle transactions, and access DeFi protocols.",
                                    isActive = false,
                                    iconRes = R.drawable.base,
                                    onClick = { /* Disabled */ }
                                )
                                
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                // Ethereum AI Bot Card - Coming Soon
                                AgentCard(
                                    title = "Ethereum AI Bot",
                                    subtitle = "Coming Soon",
                                    description = "Manage Ethereum assets, interact with smart contracts, and explore the ecosystem.",
                                    isActive = false,
                                    iconRes = R.drawable.ethereum,
                                    onClick = { /* Disabled */ }
                                )
                                
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                // Arbitrum AI Bot Card - Coming Soon
                                AgentCard(
                                    title = "Arbitrum AI Bot",
                                    subtitle = "Coming Soon",
                                    description = "Interact with Arbitrum network, manage transactions, and access Layer 2 solutions.",
                                    isActive = false,
                                    iconRes = R.drawable.arbitrum,
                                    onClick = { /* Disabled */ }
                                )
                            }
                            
                            // Spacer at the bottom (for bottom nav bar)
                            item {
                                Spacer(modifier = Modifier.height(72.dp))
                            }
                        }
                    }
                }

                HomeVS.LoggedOut -> {
                    // Handle in LaunchedEffect
                }
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
    // Card background with dark semi-transparent overlay

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .shadow(8.dp, RoundedCornerShape(16.dp))
            .clickable(enabled = isActive) { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = cardBackgroundColor
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(cardBackgroundColor)
                .padding(16.dp)
                .clip(RoundedCornerShape(16.dp)),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left column with icon and titles
            Column(
                modifier = Modifier.weight(1f).background(Color.Transparent)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    // Icon
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(
                                if (isActive) Color(0xFF00E5B3)
                                else Color(0xFF3B82F6).copy(alpha = 0.7f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (iconRes != null) {
                            Icon(
                                painter = painterResource(id = iconRes),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    // Title and subtitle
                    Column {
                        Text(
                            text = title,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        
                        Text(
                            text = subtitle,
                            color = if (isActive) Color(0xFF00E5B3) else Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )
                    }
                }
                
                // Description
                Text(
                    text = description,
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier.padding(start = 4.dp, top = 4.dp)
                )
            }
            
            // Right icon
            if (isActive) {
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = "Open",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Locked",
                    tint = Color.White.copy(alpha = 0.5f),
                    modifier = Modifier.size(24.dp)
                )
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