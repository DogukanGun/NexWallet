package com.dag.nexwallet.features.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.material3.LocalTextStyle
import androidx.compose.ui.text.TextStyle

@Composable
@Preview
fun HomeView() {
    var isSignedIn by remember { mutableStateOf(false) }
    
    val gradientBackground = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFF8F9FA),  // Light gray background
            Color(0xFFE9ECEF)   // Slightly darker gray
        )
    )

    val titleGradient = Brush.horizontalGradient(
        colors = listOf(
            Color(0xFF00E5B3), // Turquoise/Green
            Color(0xFF3B82F6), // Blue
            Color(0xFF8B5CF6)  // Purple
        )
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(brush = gradientBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header with Profile
        item {
            Header(isSignedIn,titleGradient)
        }

        // Profile Section
        item {
            ProfileSection(
                isSignedIn = isSignedIn,
                onSignInClick = { isSignedIn = true },
                onSignOutClick = { isSignedIn = false }
            )
        }

        // Quick Actions
        item {
            BasicText(
                text = "Quick Actions",
                style = LocalTextStyle.current.merge(
                    TextStyle(
                        brush = titleGradient,
                        fontSize = MaterialTheme.typography.titleLarge.fontSize,
                        fontWeight = FontWeight.Bold
                    )
                ),
                modifier = Modifier.padding(vertical = 8.dp)
            )
            QuickActions()
        }

        // Predefined Agents
        item {
            BasicText(
                text = "AI Agents",
                style = LocalTextStyle.current.merge(
                    TextStyle(
                        brush = titleGradient,
                        fontSize = MaterialTheme.typography.titleLarge.fontSize,
                        fontWeight = FontWeight.Bold
                    )
                ),
                modifier = Modifier.padding(vertical = 8.dp)
            )
            PredefinedAgents()
        }

        // Saved Agents
        item {
            BasicText(
                text = "Saved Agents",
                style = LocalTextStyle.current.merge(
                    TextStyle(
                        brush = titleGradient,
                        fontSize = MaterialTheme.typography.titleLarge.fontSize,
                        fontWeight = FontWeight.Bold
                    )
                ),
                modifier = Modifier.padding(vertical = 8.dp)
            )
            SavedAgents()
        }
    }
}

@Composable
private fun Header(isSignedIn: Boolean,titleGradient: Brush) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        BasicText(
            text = "NexArb",
            style = LocalTextStyle.current.merge(
                TextStyle(
                    brush = titleGradient,
                    fontSize = MaterialTheme.typography.headlineLarge.fontSize,
                    fontWeight = FontWeight.Bold
                )
            )
        )
        if (isSignedIn) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1E1E1E))
            ) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = "Profile",
                    tint = Color.White,
                    modifier = Modifier
                        .size(24.dp)
                        .align(Alignment.Center)
                )
            }
        }
    }
}

@Composable
private fun ProfileSection(
    isSignedIn: Boolean,
    onSignInClick: () -> Unit,
    onSignOutClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E1E1E)
        )
    ) {
        if (isSignedIn) {
            Column(
                modifier = Modifier.padding(16.dp)
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
                                .background(Color(0xFF2A2A2A))
                        ) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = "Profile Picture",
                                tint = Color.White,
                                modifier = Modifier
                                    .size(32.dp)
                                    .align(Alignment.Center)
                            )
                        }
                        Column {
                            Text(
                                text = "@username",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White
                            )
                            Text(
                                text = "Connected with Twitter",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.Gray
                            )
                        }
                    }
                    IconButton(onClick = onSignOutClick) {
                        Icon(
                            Icons.Default.ExitToApp,
                            contentDescription = "Sign Out",
                            tint = Color.White
                        )
                    }
                }
            }
        } else {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onSignInClick)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = "Sign In",
                        tint = Color.White
                    )
                    Text(
                        text = "Sign in with Twitter",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White
                    )
                }
                Icon(
                    Icons.Default.ArrowForward,
                    contentDescription = "Sign In",
                    tint = Color.White
                )
            }
        }
    }
}

@Composable
private fun QuickActions() {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.padding(vertical = 8.dp)
    ) {
        items(listOf("Create Agent", "My Agents", "Settings")) { action ->
            ActionCard(action)
        }
    }
}

@Composable
private fun ActionCard(action: String) {
    Card(
        modifier = Modifier
            .width(110.dp)
            .height(100.dp)
            .clickable { /* TODO: Implement action */ },
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = when (action) {
                    "Create Agent" -> Icons.Default.Add
                    "My Agents" -> Icons.Default.Person
                    else -> Icons.Default.Settings
                },
                contentDescription = action,
                tint = Color(0xFF3B82F6),
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = action,
                color = Color(0xFF2C3E50),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun PredefinedAgents() {
    val agents = listOf(
        "Solana AI Bot" to "SendAI",
        "Base AI Bot" to "Coinbase Agent Kit",
        "Ethereum AI Bot" to "Coinbase Agent Kit",
        "Arbitrum AI Bot" to "Coinbase Agent Kit"
    )

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        agents.forEach { (name, poweredBy) ->
            AgentCard(name, poweredBy)
        }
    }
}

@Composable
private fun AgentCard(name: String, poweredBy: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Implement agent selection */ },
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF2A2A2A)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = name,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White
            )
            Text(
                text = "Powered by $poweredBy",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
        }
    }
}

@Composable
private fun SavedAgents() {
    // Placeholder for saved agents
    Text(
        text = "No saved agents yet",
        color = Color.Gray,
        modifier = Modifier.padding(vertical = 8.dp)
    )
}