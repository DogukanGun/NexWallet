package com.dag.nexwallet.features.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil3.compose.AsyncImage
import com.dag.nexwallet.R
import com.dag.nexwallet.data.model.User

sealed class QuickActionIcon {
    data class VectorIcon(val imageVector: ImageVector) : QuickActionIcon()
    data class DrawableIcon(val painter: Painter) : QuickActionIcon()
}

private data class AgentInfo(
    val name: String,
    val poweredBy: String,
    val color: Color,
    val isEnabled: Boolean,
    val description: String
)

@Composable
fun TopBar(
    isSignedIn: Boolean,
    onSignOutClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "NexArb",
            style = MaterialTheme.typography.headlineMedium,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            IconButton(
                onClick = { /* TODO: Notifications */ },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFF1E293B))
            ) {
                Icon(
                    Icons.Default.Notifications,
                    contentDescription = "Notifications",
                    tint = Color.White
                )
            }
            
            if (isSignedIn) {
                IconButton(
                    onClick = onSignOutClick,
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color(0xFF1E293B))
                ) {
                    Icon(
                        Icons.Default.ExitToApp,
                        contentDescription = "Sign Out",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ProfileCard(
    user: User?,
    missingImage: Boolean,
    onMissingImageError: () -> Unit,
    navController: NavController
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(enabled = user == null) {
                navController.navigate("login") {
                    popUpTo(navController.graph.id) {
                        inclusive = true
                    }
                }
            },
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2A2A2A)),
                        contentAlignment = Alignment.Center
                    ) {
                        user?.profileImageUrl?.let {
                            if (!missingImage) {
                                AsyncImage(
                                    model = user.profileImageUrl,
                                    contentDescription = "Profile Picture",
                                    modifier = Modifier.fillMaxSize(),
                                    onError = {
                                        onMissingImageError()
                                    }
                                )
                            } else {
                                DefaultProfileIcon()
                            }
                        }
                    }
                    Column {
                        Text(
                            text = user?.name ?: "Connect with Twitter",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        if (user != null) {
                            Text(
                                text = "@${user.username}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
                if (user?.isVerified == true) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = "Verified",
                        tint = Color(0xFF60A5FA),
                        modifier = Modifier.size(20.dp)
                    )
                } else if (user == null) {
                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = "Login",
                        tint = Color.White.copy(alpha = 0.7f),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            if (user != null) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    StatItem("Followers", "${user.followersCount}", Color.White)
                    StatItem("Following", "${user.followingCount}", Color.White)
                }
            }
        }
    }
}

@Composable
fun DefaultProfileIcon() {
    Icon(
        Icons.Default.Person,
        contentDescription = "Profile",
        tint = Color.White,
        modifier = Modifier.size(32.dp)
    )
}

@Composable
fun StatItem(label: String, value: String, valueColor: Color) {
    Column(
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.5f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = valueColor,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun QuickActionGrid(navController: NavController) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        QuickActionItem(
            text = "Create Agent",
            icon = QuickActionIcon.VectorIcon(Icons.Default.Add)
        ) { 
            navController.navigate("create_bot") 
        }
        QuickActionItem(
            text = "Upload Voice",
            icon = QuickActionIcon.DrawableIcon(painterResource(R.drawable.baseline_keyboard_voice))
        ) { 
            navController.navigate("upload_voice") 
        }
    }
}

@Composable
fun QuickActionItem(
    text: String,
    icon: QuickActionIcon,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1E293B))
            .clickable(onClick = onClick)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        when (icon) {
            is QuickActionIcon.VectorIcon -> {
                Icon(
                    imageVector = icon.imageVector,
                    contentDescription = text,
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(24.dp)
                )
            }
            is QuickActionIcon.DrawableIcon -> {
                Icon(
                    painter = icon.painter,
                    contentDescription = text,
                    tint = Color(0xFF6366F1),
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun AIAgentsList() {
    val agents = listOf(
        AgentInfo(
            "Solana AI Bot",
            "SendAI",
            Color(0xFF14F195),
            true,
            "Interact with Solana blockchain, manage tokens, and get real-time information. Works in text and voice mode."
        ),
        AgentInfo(
            "Base AI Bot",
            "Coinbase Agent Kit",
            Color(0xFF0052FF).copy(alpha = 0.5f),
            false,
            "Navigate Base network, handle transactions, and access DeFi protocols."
        ),
        AgentInfo(
            "Ethereum AI Bot",
            "Coinbase Agent Kit",
            Color(0xFF627EEA).copy(alpha = 0.5f),
            false,
            "Manage Ethereum assets, interact with smart contracts, and explore the ecosystem."
        ),
        AgentInfo(
            "Arbitrum AI Bot",
            "Coinbase Agent Kit",
            Color(0xFF28A0F0).copy(alpha = 0.5f),
            false,
            "Interact with Arbitrum network, manage transactions, and access Layer 2 solutions."
        )
    )

    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        agents.forEach { agent ->
            AIAgentCard(agent)
        }
    }
}

@Composable
private fun AIAgentCard(agent: AgentInfo) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .then(if (agent.isEnabled) {
                Modifier.clickable { }
            } else {
                Modifier.alpha(0.7f)
            }),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(agent.color.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Star,
                            contentDescription = null,
                            tint = agent.color,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Column {
                        Text(
                            text = agent.name,
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White
                        )
                        Text(
                            text = if (agent.isEnabled) "Powered by ${agent.poweredBy}" else "Coming Soon",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (agent.isEnabled) agent.color else Color.Gray
                        )
                    }
                }

                if (agent.isEnabled) {
                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = "Open",
                        tint = Color.White.copy(alpha = 0.5f)
                    )
                } else {
                    Icon(
                        Icons.Default.Lock,
                        contentDescription = "Coming Soon",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = agent.description,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.7f)
            )
        }
    }
}

