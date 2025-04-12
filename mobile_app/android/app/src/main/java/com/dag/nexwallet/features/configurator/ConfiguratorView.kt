package com.dag.nexwallet.features.configurator

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.launch
import com.dag.nexwallet.R

@Composable
@Preview
fun ConfiguratorView(
    viewModel: ConfiguratorVM = hiltViewModel()
) {
    val scrollState = rememberScrollState()
    val state by viewModel.viewState.collectAsState()
    val scope = rememberCoroutineScope()
    
    // Animation properties
    val animatedProgress = remember { Animatable(0f) }
    LaunchedEffect(true) {
        animatedProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(800, easing = FastOutSlowInEasing)
        )
    }

    // Beautiful gradient background like in SplashView
    val gradientBackground = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF00E5B3), // Turquoise/Green
            Color(0xFF3B82F6), // Blue
            Color(0xFF8B5CF6)  // Purple
        )
    )
    
    // Elegant card background
    val cardGradient = Brush.linearGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.13f),
            Color.White.copy(alpha = 0.07f)
        )
    )
    
    // Circle background gradient
    val circleGradient = Brush.linearGradient(
        colors = listOf(
            Color(0xFF3B82F6).copy(alpha = 0.5f),
            Color(0xFF00E5B3).copy(alpha = 0.3f)
        )
    )
    
    // Border gradient
    val borderGradient = Brush.linearGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.3f),
            Color.White.copy(alpha = 0.1f)
        )
    )

    when (state) {
        null -> ConfigLoadingScreen()
        is ConfiguratorVS.Loading -> ConfigLoadingScreen()
        is ConfiguratorVS.Error -> ConfigErrorScreen((state as ConfiguratorVS.Error).message)
        is ConfiguratorVS.Content -> {
            val content = state as ConfiguratorVS.Content
            
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(brush = gradientBackground)
            ) {
                // Semi-transparent overlay to make content more readable
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.2f))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                            .padding(20.dp)
                            .alpha(animatedProgress.value)
                    ) {
                        // Animated Header
                        Text(
                            text = "Create Your Assistant",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 40.dp, bottom = 8.dp)
                        )
                        
                        Text(
                            text = "Customize your AI experience",
                            fontSize = 16.sp,
                            color = Color.White.copy(alpha = 0.9f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 40.dp)
                        )
                        
                        // Configuration Options in a simpler format with better cards
                        ConfigOption(
                            title = "Blockchain Networks",
                            iconContent = {
                                Icon(
                                    painterResource(R.drawable.baseline_code),
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            },
                            iconGradient = Brush.linearGradient(
                                colors = listOf(Color(0xFF3B82F6), Color(0xFF00E5B3))
                            ),
                            cardGradient = cardGradient,
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(1),
                            selectedCount = content.selectedChains.size,
                            totalCount = viewModel.getAvailableChains().size,
                            onClick = {
                                scope.launch {
                                    // Implementation would go here
                                }
                            }
                        )
                        
                        ConfigOption(
                            title = "Knowledge Bases",
                            iconContent = {
                                Icon(
                                    painterResource(R.drawable.baseline_bookmarks),
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            },
                            iconGradient = Brush.linearGradient(
                                colors = listOf(Color(0xFF8B5CF6), Color(0xFF3B82F6))
                            ),
                            cardGradient = cardGradient,
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(2),
                            selectedCount = content.selectedKnowledgeBases.size,
                            totalCount = viewModel.getAvailableKnowledgeBases().size,
                            onClick = {
                                scope.launch {
                                    // Implementation would go here
                                }
                            }
                        )
                        
                        ConfigOption(
                            title = "Language Model",
                            iconContent = {
                                Icon(
                                    imageVector = Icons.Outlined.Settings,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            },
                            iconGradient = Brush.linearGradient(
                                colors = listOf(Color(0xFFEC4899), Color(0xFF8B5CF6))
                            ),
                            cardGradient = cardGradient,
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(3),
                            selectedCount = if (content.selectedLLMProvider != null) 1 else 0,
                            totalCount = viewModel.getAvailableLLMProviders().size,
                            onClick = {
                                scope.launch {
                                    // Implementation would go here
                                }
                            }
                        )
                        
                        ConfigOption(
                            title = "Interaction Type",
                            iconContent = {
                                Icon(
                                    painterResource(R.drawable.baseline_chat),
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            },
                            iconGradient = Brush.linearGradient(
                                colors = listOf(Color(0xFF00E5B3), Color(0xFF10B981))
                            ),
                            cardGradient = cardGradient,
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(4),
                            selectedCount = if (content.selectedAgentType != null) 1 else 0,
                            totalCount = viewModel.getAvailableAgentTypes().size,
                            onClick = {
                                scope.launch {
                                    // Implementation would go here
                                }
                            }
                        )
                        
                        ConfigOption(
                            title = "Voice & Personality",
                            iconContent = {
                                Icon(
                                    painterResource(R.drawable.baseline_mic),
                                    contentDescription = null,
                                    tint = Color.White
                                )
                            },
                            iconGradient = Brush.linearGradient(
                                colors = listOf(Color(0xFFF59E0B), Color(0xFFEF4444))
                            ),
                            cardGradient = cardGradient,
                            borderGradient = borderGradient,
                            isCompleted = false,
                            isComingSoon = true,
                            selectedCount = 0,
                            totalCount = 0,
                            onClick = { }
                        )
                        
                        Spacer(modifier = Modifier.height(40.dp))
                        
                        // Action buttons with improved design
                        Button(
                            onClick = { /* Handle start agent */ },
                            enabled = viewModel.canStartAgent(),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .shadow(
                                    elevation = 8.dp,
                                    shape = RoundedCornerShape(28.dp)
                                ),
                            shape = RoundedCornerShape(28.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.White,
                                disabledContainerColor = Color.White.copy(alpha = 0.6f)
                            )
                        ) {
                            Text(
                                text = "Launch Assistant",
                                color = Color(0xFF3B82F6),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                        
                        OutlinedButton(
                            onClick = { /* Handle saved agents */ },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .padding(top = 16.dp),
                            shape = RoundedCornerShape(28.dp),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = Brush.horizontalGradient(
                                    listOf(Color.White, Color.White)
                                )
                            ),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.White
                            )
                        ) {
                            Text(
                                text = "Saved Assistants",
                                fontWeight = FontWeight.Medium,
                                fontSize = 16.sp
                            )
                        }
                        
                        // Add space for bottom navigation
                        Spacer(modifier = Modifier.height(72.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ConfigLoadingScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00E5B3),
                        Color(0xFF3B82F6),
                        Color(0xFF8B5CF6)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(64.dp),
            color = Color.White,
            strokeWidth = 4.dp
        )
    }
}

@Composable
private fun ConfigErrorScreen(message: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00E5B3),
                        Color(0xFF3B82F6),
                        Color(0xFF8B5CF6)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .padding(16.dp)
                .shadow(
                    elevation = 8.dp,
                    shape = RoundedCornerShape(16.dp)
                ),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White.copy(alpha = 0.9f)
            )
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = Color.Red,
                    modifier = Modifier.size(48.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Error",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = message,
                    textAlign = TextAlign.Center,
                    color = Color.Black.copy(alpha = 0.7f)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = { /* Handle retry */ },
                    shape = RoundedCornerShape(20.dp),
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
}

@Composable
private fun ConfigOption(
    title: String,
    iconContent: @Composable () -> Unit,
    iconGradient: Brush,
    cardGradient: Brush,
    borderGradient: Brush,
    isCompleted: Boolean,
    isComingSoon: Boolean = false,
    selectedCount: Int,
    totalCount: Int,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(20.dp)
            )
            .clickable(enabled = !isComingSoon) { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(cardGradient)
                .border(
                    width = 1.dp,
                    brush = borderGradient,
                    shape = RoundedCornerShape(20.dp)
                )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon circle with unique gradient for each option
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(
                            brush = if (isCompleted) {
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF00E5B3), Color(0xFF3B82F6))
                                )
                            } else {
                                iconGradient
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isCompleted) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    } else {
                        iconContent()
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = title,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 18.sp
                    )
                    
                    if (isComingSoon) {
                        Text(
                            text = "Coming Soon",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    } else {
                        Text(
                            text = "$selectedCount of $totalCount selected",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
                
                if (!isComingSoon) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowRight,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

// The selector composables (ChainSelector, KnowledgeBaseSelector, etc.) would be implemented separately
// for a dialog or separate screens
