package com.dag.nexwallet.features.home.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.dag.nexwallet.base.extensions.startAsTopComposable
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse

@Composable
fun HomeView(
    navController: NavController,
    viewModel: HomeVM = hiltViewModel()
) {
    val state by viewModel.viewState.collectAsState()
    var missingProfileImage by remember { mutableStateOf(false) }
    val darkBackground = Color(0xFF0F172A)
    
    LaunchedEffect(state) {
        if (state is HomeVS.LoggedOut) {
            navController.startAsTopComposable(Destination.LoginScreen)
            return@LaunchedEffect
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(darkBackground)
    ) {
        when (state) {
            null, HomeVS.Loading -> {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(48.dp)
                        .align(Alignment.Center),
                    color = Color(0xFF6366F1)
                )
            }
            
            is HomeVS.Error -> {
                Text(
                    text = (state as HomeVS.Error).message,
                    color = Color.Red,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(16.dp)
                )
            }
            
            is HomeVS.Success -> {
                val successState = state as HomeVS.Success
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Top Bar
                    item {
                        TopBar(
                            isSignedIn = successState.isSignedIn,
                            onSignOutClick = { viewModel.signOut() }
                        )
                    }

                    // Profile Card
                    item {
                        ProfileCard(
                            user = successState.user,
                            missingImage = missingProfileImage,
                            onMissingImageError = { missingProfileImage = true },
                            navController = navController
                        )
                    }

                    // Quick Actions
                    item {
                        Text(
                            text = "Quick Actions",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        QuickActionGrid(navController)
                    }

                    // My Agents Section
                    item {
                        Text(
                            text = "My Agents",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        
                        if (successState.myAgents.isEmpty()) {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFF1E293B)
                                )
                            ) {
                                Text(
                                    text = "You don't have any agents yet",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color.White.copy(alpha = 0.7f),
                                    modifier = Modifier.padding(16.dp)
                                )
                            }
                        } else {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                successState.myAgents.forEach { agent ->
                                    MyAgentCard(agent = agent)
                                }
                            }
                        }
                    }

                    // AI Agents Section
                    item {
                        Text(
                            text = "AI Trading Agents",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                        AIAgentsList()
                    }
                }
            }

            HomeVS.LoggedOut -> {
                // Handle in LaunchedEffect
            }
        }
    }
}

@Composable
private fun MyAgentCard(agent: GetMyAgentsResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = agent.name,
                style = MaterialTheme.typography.titleSmall,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = agent.description,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(8.dp))

            // LLM Providers Section
            if (agent.llmProviders.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LLM: ",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                    
                    agent.llmProviders.take(3).forEachIndexed { index, provider ->
                        if (index > 0) {
                            Text(
                                text = ", ",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                        }
                        Text(
                            text = provider.name,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                    
                    if (agent.llmProviders.size > 3) {
                        Text(
                            text = " +${agent.llmProviders.size - 3} more",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.5f)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(4.dp))
            }
            
            // Chains Section
            if (agent.chains.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Chains: ",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                    
                    agent.chains.take(3).forEachIndexed { index, chain ->
                        if (index > 0) {
                            Text(
                                text = ", ",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                        }
                        Text(
                            text = chain.name,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                    
                    if (agent.chains.size > 3) {
                        Text(
                            text = " +${agent.chains.size - 3} more",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White.copy(alpha = 0.5f)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Badge(
                    containerColor = if (agent.isOnPointSystem) Color(0xFF10B981) else Color(0xFFF43F5E),
                    contentColor = Color.White
                ) {
                    Text(
                        text = if (agent.isOnPointSystem) "Point System" else "Standard",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
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