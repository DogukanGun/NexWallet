package com.dag.nexwallet.features.configurator

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ChainSelector(
    selectedChains: List<Chain>,
    availableChains: List<Chain>,
    onChainSelected: (Chain) -> Unit
) {
    Column {
        // Search/Filter field
        OutlinedTextField(
            value = "",
            onValueChange = { /* TODO: Implement filtering */ },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            placeholder = { Text("Filter Chain") },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color(0xFF1E293B),
                focusedBorderColor = Color(0xFF8B5CF6),
                unfocusedContainerColor = Color(0xFF1E293B),
                focusedContainerColor = Color(0xFF1E293B)
            )
        )

        // Grid of chains
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.height(200.dp)
        ) {
            items(availableChains) { chain ->
                ChainItem(
                    chain = chain,
                    isSelected = selectedChains.contains(chain),
                    onSelect = { onChainSelected(chain) }
                )
            }
        }
    }
}

@Composable
fun LoadingScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)), // Dark blue background matching HomeView
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = Color(0xFF6366F1), // Indigo color matching accent in other screens
            modifier = Modifier.size(56.dp),
            strokeWidth = 4.dp
        )
    }
}

@Composable
fun ErrorScreen(message: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)) // Dark blue background matching HomeView
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Error",
                color = Color.Red,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            Text(
                text = message,
                color = Color.White,
                fontSize = 16.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun KnowledgeBaseSelector(
    selectedBases: List<KnowledgeBase>,
    availableBases: List<KnowledgeBase>,
    onBaseSelected: (KnowledgeBase) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.height(120.dp)
    ) {
        items(availableBases) { base ->
            KnowledgeBaseItem(
                knowledgeBase = base,
                isSelected = selectedBases.contains(base),
                onSelect = { onBaseSelected(base) }
            )
        }
    }
}

@Composable
fun LLMProviderSelector(
    selectedProvider: LLMProvider?,
    availableProviders: List<LLMProvider>,
    onProviderSelected: (LLMProvider) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.height(200.dp)
    ) {
        items(availableProviders) { provider ->
            LLMProviderItem(
                provider = provider,
                isSelected = selectedProvider == provider,
                onSelect = { onProviderSelected(provider) }
            )
        }
    }
}

@Composable
fun AgentTypeSelector(
    selectedType: AgentType?,
    availableTypes: List<AgentType>,
    onTypeSelected: (AgentType) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.height(120.dp)
    ) {
        items(availableTypes) { type ->
            AgentTypeItem(
                agentType = type,
                isSelected = selectedType == type,
                onSelect = { onTypeSelected(type) }
            )
        }
    }
}

@Composable
fun ChainItem(
    chain: Chain,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .then(
                if (!chain.disabled) {
                    Modifier
                        .clickable(onClick = onSelect)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF1E293B),
                            shape = RoundedCornerShape(12.dp)
                        )
                } else {
                    Modifier.alpha(0.8f)
                }
            )
            .background(
                if (isSelected && !chain.disabled) Color(0xFF8B5CF6).copy(alpha = 0.1f)
                else Color(0xFF1E293B)
            )
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Chain icon would go here
                Text(
                    text = chain.name,
                    color = Color.White,
                    fontWeight = FontWeight.Medium
                )
            }

            if (chain.disabled) {
                Surface(
                    color = Color(0xFF8B5CF6).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "Coming Soon",
                        color = Color(0xFF8B5CF6),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun KnowledgeBaseItem(
    knowledgeBase: KnowledgeBase,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .then(
                if (!knowledgeBase.disabled) {
                    Modifier
                        .clickable(onClick = onSelect)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF1E293B),
                            shape = RoundedCornerShape(12.dp)
                        )
                } else {
                    Modifier.alpha(0.8f)
                }
            )
            .background(
                if (isSelected && !knowledgeBase.disabled) Color(0xFF8B5CF6).copy(alpha = 0.1f)
                else Color(0xFF1E293B)
            )
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = knowledgeBase.name,
                color = Color.White,
                fontWeight = FontWeight.Medium
            )
            if (isSelected && !knowledgeBase.disabled) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = Color(0xFF8B5CF6),
                    modifier = Modifier.size(16.dp)
                )
            }
            if (knowledgeBase.disabled) {
                Surface(
                    color = Color(0xFF8B5CF6).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "Coming Soon",
                        color = Color(0xFF8B5CF6),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun LLMProviderItem(
    provider: LLMProvider,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .then(
                if (!provider.disabled) {
                    Modifier
                        .clickable(onClick = onSelect)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF1E293B),
                            shape = RoundedCornerShape(12.dp)
                        )
                } else {
                    Modifier.alpha(0.8f)
                }
            )
            .background(
                if (isSelected && !provider.disabled) Color(0xFF8B5CF6).copy(alpha = 0.1f)
                else Color(0xFF1E293B)
            )
            .padding(12.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = provider.name,
                    color = Color.White,
                    fontWeight = FontWeight.Medium
                )
                if (provider.disabled) {
                    Surface(
                        color = Color(0xFF8B5CF6).copy(alpha = 0.15f),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.3f))
                    ) {
                        Text(
                            text = "Coming Soon",
                            color = Color(0xFF8B5CF6),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AgentTypeItem(
    agentType: AgentType,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .then(
                if (!agentType.disabled) {
                    Modifier
                        .clickable(onClick = onSelect)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color(0xFF8B5CF6) else Color(0xFF1E293B),
                            shape = RoundedCornerShape(12.dp)
                        )
                } else {
                    Modifier.alpha(0.8f)
                }
            )
            .background(
                if (isSelected && !agentType.disabled) Color(0xFF8B5CF6).copy(alpha = 0.1f)
                else Color(0xFF1E293B)
            )
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = agentType.name,
                color = Color.White,
                fontWeight = FontWeight.Medium
            )
            if (isSelected && !agentType.disabled) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = Color(0xFF8B5CF6),
                    modifier = Modifier.size(16.dp)
                )
            }
            if (agentType.disabled) {
                Surface(
                    color = Color(0xFF8B5CF6).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "Coming Soon",
                        color = Color(0xFF8B5CF6),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }
        }
    }
} 