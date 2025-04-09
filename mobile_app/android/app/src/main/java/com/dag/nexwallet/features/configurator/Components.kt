package com.dag.nexwallet.features.configurator

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.dag.nexwallet.R

@Composable
fun StepIndicator(
    step: Int,
    isSelected: Boolean,
    isCompleted: Boolean,
    label: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isSelected -> Color(0xFF6366F1) // Indigo color matching accent in other screens
                        isCompleted -> Color.Green
                        else -> Color(0xFF1E293B)
                    }
                )
                .border(
                    width = if (isSelected || isCompleted) 2.dp else 0.dp,
                    color = when {
                        isSelected -> Color(0xFF818CF8) // Lighter indigo for the border
                        isCompleted -> Color.Green.copy(alpha = 0.5f)
                        else -> Color.Transparent
                    },
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isCompleted) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(26.dp)
                )
            } else {
                Text(
                    text = step.toString(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            fontSize = 14.sp,
            color = when {
                isSelected -> Color.White
                isCompleted -> Color.White.copy(alpha = 0.8f)
                else -> Color.Gray
            }
        )
    }
}

@Composable
fun ConfigSection(
    step: Int,
    title: String,
    isSelected: Boolean,
    onSelect: () -> Unit,
    content: @Composable () -> Unit
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onSelect() }
                .padding(vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF6366F1).copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = step.toString(),
                    color = Color(0xFF6366F1),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = title,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 18.sp
            )
        }
        if (isSelected) {
            content()
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
            .fillMaxWidth()
            .height(48.dp)
    ) {
        val shape = RoundedCornerShape(24.dp)
        // Main Surface for the chain
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .alpha(if (chain.disabled) 0.6f else 1f)
                .clip(shape)
                .clickable(enabled = !chain.disabled) { onSelect() },
            shape = shape,
            color = if (isSelected) Color(0xFF6366F1) else Color(0xFF2A2A2A) // Primary color matching the app's theme
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Start
            ) {
                Icon(
                    painter = painterResource(id = getChainIcon(chain.icon)),
                    contentDescription = chain.name,
                    modifier = Modifier.size(24.dp),
                    tint = when (chain.icon) {
                        "solana_icon" -> Color(0xFF9945FF) // Solana purple
                        "base_icon" -> Color(0xFF0052FF) // Base blue
                        "ethereum_icon" -> Color(0xFF627EEA) // Ethereum blue
                        "arbitrum_icon" -> Color(0xFF28A0F0) // Arbitrum blue
                        "optimism_icon" -> Color(0xFFFF0420) // Optimism red
                        "bnb_icon" -> Color(0xFFF0B90B) // BNB yellow
                        "polygon_icon" -> Color(0xFF8247E5) // Polygon purple
                        "avalanche_icon" -> Color(0xFFE84142) // Avalanche red
                        "chainlink_icon" -> Color(0xFF2A5ADA) // Chainlink blue
                        else -> Color.White // Default color
                    }
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = chain.name,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
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
            .fillMaxWidth()
            .height(48.dp)
    ) {
        val shape = RoundedCornerShape(24.dp)
        // Main Surface for the knowledge base
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .alpha(if (knowledgeBase.disabled) 0.6f else 1f)
                .clip(shape)
                .clickable(enabled = !knowledgeBase.disabled) { onSelect() },
            shape = shape,
            color = if (isSelected) Color(0xFF6366F1) else Color(0xFF2A2A2A) // Primary color matching the app's theme
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Start
            ) {
                Text(
                    text = knowledgeBase.name,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // "Soon" tag as a separate overlay
        if (knowledgeBase.disabled) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFD0BCFF), // Purple80
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = 4.dp, y = 6.dp)
                    .zIndex(2f)
            ) {
                Text(
                    text = "Soon",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                )
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
            .fillMaxWidth()
            .heightIn(min = 48.dp)
    ) {
        val shape = RoundedCornerShape(24.dp)
        // Main Surface for the provider
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .alpha(if (provider.disabled) 0.6f else 1f)
                .clip(shape)
                .clickable(enabled = !provider.disabled) { onSelect() },
            shape = shape,
            color = if (isSelected) Color(0xFF6366F1) else Color(0xFF2A2A2A) // Primary color matching the app's theme
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(
                        start = 16.dp,
                        end = 16.dp,
                        top = 8.dp,
                        bottom = 8.dp
                    ),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Start
            ) {
                Text(
                    text = provider.name,
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    maxLines = 2,
                    lineHeight = 18.sp,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // "Soon" tag as a separate overlay
        if (provider.disabled) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFD0BCFF), // Purple80
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = 4.dp, y = 6.dp)
                    .zIndex(2f)
            ) {
                Text(
                    text = "Soon",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                )
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
            .fillMaxWidth()
            .height(48.dp)
    ) {
        val shape = RoundedCornerShape(24.dp)
        // Main Surface for the agent type
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .alpha(if (agentType.disabled) 0.6f else 1f)
                .clip(shape)
                .clickable(enabled = !agentType.disabled) { onSelect() },
            shape = shape,
            color = if (isSelected) Color(0xFF6366F1) else Color(0xFF2A2A2A) // Primary color matching the app's theme
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Start
            ) {
                Text(
                    text = agentType.name,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // "Soon" tag as a separate overlay
        if (agentType.disabled) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFD0BCFF), // Purple80
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = 4.dp, y = 6.dp)
                    .zIndex(2f)
            ) {
                Text(
                    text = "Soon",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
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

fun getChainIcon(iconName: String): Int {
    // Use the actual drawable resources
    return when (iconName) {
        "solana_icon" -> R.drawable.solana
        "base_icon" -> R.drawable.base
        "ethereum_icon" -> R.drawable.ethereum
        "arbitrum_icon" -> R.drawable.arbitrum
        "optimism_icon" -> R.drawable.optimism 
        "bnb_icon" -> R.drawable.bnbchain
        "polygon_icon" -> R.drawable.polygon
        "avalanche_icon" -> R.drawable.avalanche
        "chainlink_icon" -> R.drawable.chainlink
        else -> R.drawable.ethereum // Default icon
    }
}

