package com.dag.nexwallet.features.configurator

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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog

@Composable
fun ChainSelectorDialog(
    viewModel: ConfiguratorVM,
    showDialog: MutableState<Boolean>
) {
    val chains = viewModel.getAvailableChains()
    val selectedChains = (viewModel.viewState.collectAsState().value as? ConfiguratorVS.Content)?.selectedChains ?: emptyList()
    
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
                        text = "Select Blockchain Networks",
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
                
                // List of chains
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 300.dp)
                ) {
                    items(chains) { chain ->
                        val isSelected = selectedChains.contains(chain)
                        val isDisabled = chain.disabled
                        
                        ChainItem(
                            chain = chain,
                            isSelected = isSelected,
                            isDisabled = isDisabled,
                            onClick = {
                                if (!isDisabled) {
                                    viewModel.toggleChain(chain)
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
fun ChainItem(
    chain: Chain,
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
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(
                brush = if (isSelected) {
                    Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF3B82F6).copy(alpha = 0.5f),
                            Color(0xFF00E5B3).copy(alpha = 0.3f)
                        )
                    )
                } else {
                    cardGradient
                }
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
            // You could add an icon here using the chain.icon
            
            Text(
                text = chain.name,
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