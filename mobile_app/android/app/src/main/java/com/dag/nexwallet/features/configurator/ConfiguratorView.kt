package com.dag.nexwallet.features.configurator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
@Preview
fun ConfiguratorView(
    viewModel: ConfiguratorVM = hiltViewModel()
) {
    var selectedStep by remember { mutableIntStateOf(1) }
    val scrollState = rememberScrollState()
    val state by viewModel.viewState.collectAsState()

    // Define the gradient background matching LoginView
    val gradientBackground = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF0F172A),  // Dark blue color from HomeView
            Color(0xFF1E293B)   // Slightly lighter blue as in HomeView cards
        )
    )

    when (state) {
        null -> {
            LoadingScreen()
        }
        is ConfiguratorVS.Loading -> {
            LoadingScreen()
        }
        is ConfiguratorVS.Error -> {
            ErrorScreen((state as ConfiguratorVS.Error).message)
        }
        is ConfiguratorVS.Content -> {
            val content = state as ConfiguratorVS.Content
            
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(brush = gradientBackground)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(scrollState)
                        .padding(20.dp)
                ) {
                    // Header Section with gradient text
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Welcome to NexAI Configurator",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .padding(bottom = 8.dp)
                        )
                        Text(
                            text = "Create your personalized AI assistant in just a few steps",
                            fontSize = 16.sp,
                            color = Color.White.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 24.dp)
                        )
                    }

                    // Progress Indicator with improved visuals
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp)
                    ) {
                        // Connector line between steps
                        Spacer(
                            modifier = Modifier
                                .height(2.dp)
                                .fillMaxWidth()
                                .background(Color(0xFF333333))
                                .align(Alignment.Center)
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            (1..4).forEach { step ->
                                StepIndicator(
                                    step = step,
                                    isSelected = step == selectedStep,
                                    isCompleted = viewModel.isStepValid(step),
                                    label = when (step) {
                                        1 -> "Chains"
                                        2 -> "Knowledge"
                                        3 -> "LLM"
                                        else -> "Agent Type"
                                    }
                                )
                            }
                        }
                    }

                    // Configuration Sections with improved card design
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFF1E293B)  // Matching the card color from HomeView
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            // Chain Selection Section
                            ConfigSection(
                                step = 1,
                                title = "Select Chains",
                                isSelected = selectedStep == 1,
                                onSelect = { selectedStep = 1 }
                            ) {
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(2),
                                    modifier = Modifier
                                        .height(200.dp)
                                        .padding(top = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    items(viewModel.getAvailableChains()) { chain ->
                                        ChainItem(
                                            chain = chain,
                                            isSelected = content.selectedChains.contains(chain),
                                            onSelect = { viewModel.toggleChain(chain) }
                                        )
                                    }
                                }
                            }

                            Divider(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                color = Color(0xFF333333),
                                thickness = 1.dp
                            )

                            // Knowledge Base Section
                            ConfigSection(
                                step = 2,
                                title = "Knowledge Bases",
                                isSelected = selectedStep == 2,
                                onSelect = { selectedStep = 2 }
                            ) {
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(2),
                                    modifier = Modifier
                                        .height(120.dp)
                                        .padding(top = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    items(viewModel.getAvailableKnowledgeBases()) { kb ->
                                        KnowledgeBaseItem(
                                            knowledgeBase = kb,
                                            isSelected = content.selectedKnowledgeBases.contains(kb),
                                            onSelect = { viewModel.toggleKnowledgeBase(kb) }
                                        )
                                    }
                                }
                            }

                            Divider(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                color = Color(0xFF333333),
                                thickness = 1.dp
                            )

                            // LLM Provider Section
                            ConfigSection(
                                step = 3,
                                title = "Select LLM Provider",
                                isSelected = selectedStep == 3,
                                onSelect = { selectedStep = 3 }
                            ) {
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(2),
                                    modifier = Modifier
                                        .heightIn(min = 200.dp, max = 250.dp)
                                        .padding(top = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    items(viewModel.getAvailableLLMProviders()) { provider ->
                                        LLMProviderItem(
                                            provider = provider,
                                            isSelected = content.selectedLLMProvider == provider,
                                            onSelect = { viewModel.selectLLMProvider(provider) }
                                        )
                                    }
                                }
                            }

                            Divider(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                color = Color(0xFF333333),
                                thickness = 1.dp
                            )

                            // Agent Type Section
                            ConfigSection(
                                step = 4,
                                title = "Select Agent Type",
                                isSelected = selectedStep == 4,
                                onSelect = { selectedStep = 4 }
                            ) {
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(2),
                                    modifier = Modifier
                                        .height(80.dp)
                                        .padding(top = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    items(viewModel.getAvailableAgentTypes()) { type ->
                                        AgentTypeItem(
                                            agentType = type,
                                            isSelected = content.selectedAgentType == type,
                                            onSelect = { viewModel.selectAgentType(type) }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Bottom Action Buttons with styles matching HomeView and LoginView
                    Spacer(modifier = Modifier.height(24.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 24.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { /* Handle saved agents click */ },
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp),
                            shape = RoundedCornerShape(28.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF1E293B)
                            ),
                            elevation = ButtonDefaults.buttonElevation(
                                defaultElevation = 4.dp,
                                pressedElevation = 8.dp
                            )
                        ) {
                            Text(
                                text = "Saved Agents",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                        }
                        
                        Button(
                            onClick = { /* Handle start agent click */ },
                            enabled = viewModel.isStepValid(1) && viewModel.isStepValid(3) && viewModel.isStepValid(4),
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp),
                            shape = RoundedCornerShape(28.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF6366F1), // Indigo color matching the LoginView accent color
                                disabledContainerColor = Color.Gray.copy(alpha = 0.3f)
                            ),
                            elevation = ButtonDefaults.buttonElevation(
                                defaultElevation = 4.dp,
                                pressedElevation = 8.dp
                            )
                        ) {
                            Text(
                                text = "Start Agent",
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
}
