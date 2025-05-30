package com.dag.nexwallet.features.configurator.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.dag.nexwallet.features.configurator.presentation.ConfiguratorVM
import com.dag.nexwallet.features.configurator.presentation.ConfiguratorVS
import com.dag.nexwallet.features.configurator.presentation.LLMProvider

@Composable
fun LLMProviderSelectorDialog(
    viewModel: ConfiguratorVM,
    showDialog: MutableState<Boolean>
) {
    val providers = viewModel.getAvailableLLMProviders()
    val selectedProvider = (viewModel.viewState.collectAsState().value as? ConfiguratorVS.Content)?.selectedLLMProvider
    
    Dialog(onDismissRequest = { showDialog.value = false }) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF1E293B)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Select Language Model",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    
                    IconButton(onClick = { showDialog.value = false }) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // List of providers
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 300.dp)
                ) {
                    items(providers) { provider ->
                        val isSelected = selectedProvider == provider
                        val isDisabled = provider.disabled
                        
                        LLMProviderItem(
                            provider = provider,
                            isSelected = isSelected,
                            isDisabled = isDisabled,
                            onClick = {
                                if (!isDisabled) {
                                    viewModel.selectLLMProvider(provider)
                                }
                            }
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(
                        onClick = { showDialog.value = false },
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = Color.White
                        )
                    ) {
                        Text("Cancel")
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Button(
                        onClick = { showDialog.value = false },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF3B82F6)
                        )
                    ) {
                        Text("Done")
                    }
                }
            }
        }
    }
}

@Composable
fun LLMProviderItem(
    provider: LLMProvider,
    isSelected: Boolean,
    isDisabled: Boolean,
    onClick: () -> Unit
) {
    val cardGradient = Brush.linearGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.13f),
            Color.White.copy(alpha = 0.07f)
        )
    )
    
    val borderGradient = Brush.linearGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.3f),
            Color.White.copy(alpha = 0.1f)
        )
    )
    
    val selectedGradient = Brush.linearGradient(
        colors = listOf(
            Color(0xFFEC4899).copy(alpha = 0.5f), 
            Color(0xFF8B5CF6).copy(alpha = 0.3f)
        )
    )
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                brush = if (isSelected) selectedGradient else cardGradient
            )
            .border(
                width = 1.dp,
                brush = borderGradient,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(enabled = !isDisabled) { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = provider.name,
                color = if (isDisabled) Color.Gray else Color.White,
                modifier = Modifier.weight(1f),
                fontWeight = FontWeight.Medium
            )
            
            if (isDisabled) {
                Text(
                    text = "Coming Soon",
                    color = Color.Gray,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(end = 8.dp)
                )
            }
            
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Selected",
                    tint = Color.White
                )
            }
        }
    }
} 