package com.dag.nexwallet.features.configurator

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(1),
                            selectedCount = content.selectedChains.size,
                            totalCount = viewModel.getAvailableChains().size,
                            onClick = {
                                scope.launch {
                                    viewModel.showChainSelector()
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
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(2),
                            selectedCount = content.selectedKnowledgeBases.size,
                            totalCount = viewModel.getAvailableKnowledgeBases().size,
                            onClick = {
                                scope.launch {
                                    viewModel.showKnowledgeBaseSelector()
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
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(3),
                            selectedCount = if (content.selectedLLMProvider != null) 1 else 0,
                            totalCount = viewModel.getAvailableLLMProviders().size,
                            onClick = {
                                scope.launch {
                                    viewModel.showLLMProviderSelector()
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
                            borderGradient = borderGradient,
                            isCompleted = viewModel.isStepValid(4),
                            selectedCount = if (content.selectedAgentType != null) 1 else 0,
                            totalCount = viewModel.getAvailableAgentTypes().size,
                            onClick = {
                                scope.launch {
                                    viewModel.showAgentTypeSelector()
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
                            onClick = { viewModel.startAgent() },
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
                            onClick = { viewModel.showSavedAgents() },
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
                    
                    // Show dialogs when needed
                    if (content.showChainSelector) {
                        val showDialog = remember { mutableStateOf(true) }
                        ChainSelectorDialog(
                            viewModel = viewModel,
                            showDialog = showDialog
                        )
                        
                        // Hide dialog when dismissed
                        LaunchedEffect(showDialog.value) {
                            if (!showDialog.value) {
                                viewModel.hideChainSelector()
                            }
                        }
                    }
                    
                    if (content.showKnowledgeBaseSelector) {
                        val showDialog = remember { mutableStateOf(true) }
                        KnowledgeBaseSelectorDialog(
                            viewModel = viewModel,
                            showDialog = showDialog
                        )
                        
                        // Hide dialog when dismissed
                        LaunchedEffect(showDialog.value) {
                            if (!showDialog.value) {
                                viewModel.hideKnowledgeBaseSelector()
                            }
                        }
                    }
                    
                    if (content.showLLMProviderSelector) {
                        val showDialog = remember { mutableStateOf(true) }
                        LLMProviderSelectorDialog(
                            viewModel = viewModel,
                            showDialog = showDialog
                        )
                        
                        // Hide dialog when dismissed
                        LaunchedEffect(showDialog.value) {
                            if (!showDialog.value) {
                                viewModel.hideLLMProviderSelector()
                            }
                        }
                    }
                    
                    if (content.showAgentTypeSelector) {
                        val showDialog = remember { mutableStateOf(true) }
                        AgentTypeSelectorDialog(
                            viewModel = viewModel,
                            showDialog = showDialog
                        )
                        
                        // Hide dialog when dismissed
                        LaunchedEffect(showDialog.value) {
                            if (!showDialog.value) {
                                viewModel.hideAgentTypeSelector()
                            }
                        }
                    }
                }
            }
        }
    }
}
