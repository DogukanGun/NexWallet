package com.dag.nexwallet.features.solana.presentation

import android.app.Activity
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dag.nexwallet.R
import com.dag.nexwallet.features.solana.presentation.composable.StakeDialog
import com.dag.nexwallet.features.solana.presentation.composable.SwapDialog
import com.dag.nexwallet.features.solana.presentation.composable.WalletConnectionDialog
import com.dag.nexwallet.features.stellar.presentation.ErrorView
import com.dag.nexwallet.features.stellar.presentation.LoadingView
import com.dag.nexwallet.ui.theme.*
import com.solana.mobilewalletadapter.clientlib.ActivityResultSender

@Composable
fun SolanaScreen(
    viewModel: SolanaVM = hiltViewModel(),
    sender: ActivityResultSender
) {
    val state by viewModel.viewState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        when (state) {
            is SolanaVS.Loading -> LoadingView()
            is SolanaVS.Success -> {
                val successState = state as SolanaVS.Success
                
                SolanaAgentView(
                    state = successState,
                    onMessageSend = { viewModel.sendMessage(it) },
                    onActionExecute = { viewModel.executeAction(it) },
                    onHeaderClick = { viewModel.toggleHeader() }
                )
                
                // Show Wallet Connection Dialog
                if (successState.showWalletConnectionDialog) {
                    WalletConnectionDialog(
                        onDismiss = { viewModel.dismissWalletConnectionDialog() },
                        onConnect = { viewModel.connectWallet(sender) }
                    )
                }
                
                // Show Swap Dialog
                if (successState.showSwapDialog) {
                    SwapDialog(
                        onDismiss = { viewModel.dismissSwapDialog() },
                        onConfirm = { viewModel.executeSwap(it,sender) }
                    )
                }
                
                // Show Stake Dialog
                if (successState.showStakeDialog) {
                    StakeDialog(
                        onDismiss = { viewModel.dismissStakeDialog() },
                        onConfirm = { viewModel.executeStake(it, sender) }
                    )
                }
            }
            is SolanaVS.Error -> ErrorView(message = (state as SolanaVS.Error).message)
            null -> TODO()
        }
    }
}

@Composable
private fun SolanaAgentView(
    state: SolanaVS.Success,
    onMessageSend: (String) -> Unit,
    onActionExecute: (SolanaVS.SuggestedAction) -> Unit,
    onHeaderClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Animated Header
        AnimatedHeader(
            state = state,
            onHeaderClick = onHeaderClick,
            onActionExecute = onActionExecute
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Chat and Actions Area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            Column {
                // Chat Messages
                ChatMessages(
                    messages = state.chatMessages,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                )
                
                // Suggested Actions
                if (state.suggestedActions.isNotEmpty() && !state.isHeaderExpanded) {
                    SuggestedActions(
                        actions = state.suggestedActions,
                        onActionClick = onActionExecute
                    )
                }
                
                // Message Input
                if (!state.isHeaderExpanded) {
                    MessageInput(onMessageSend = onMessageSend)
                }
            }
            
            // Pending Transaction Overlay
            state.pendingTransaction?.let { transaction ->
                TransactionOverlay(transaction = transaction)
            }
        }
    }
}

@Composable
private fun AnimatedHeader(
    state: SolanaVS.Success,
    onHeaderClick: () -> Unit,
    onActionExecute: (SolanaVS.SuggestedAction) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
            .clickable { onHeaderClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Solana AI Agent",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryText
                )
                
                Image(
                    painter = painterResource(R.drawable.solana),
                    contentDescription = "Solana Logo",
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Fit
                )
            }
            
            AnimatedVisibility(
                visible = state.isHeaderExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp)
                ) {
                    Text(
                        text = "Quick Actions with Jupiter",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = primaryText,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        QuickActionButton(
                            title = "Stake SOL",
                            onClick = {
                                onActionExecute(
                                    SolanaVS.SuggestedAction(
                                        title = "Stake SOL",
                                        description = "Stake your SOLs",
                                        type = SolanaVS.ActionType.STAKE
                                    )
                                )
                            }
                        )
                        
                        QuickActionButton(
                            title = "Swap Tokens",
                            onClick = {
                                onActionExecute(
                                    SolanaVS.SuggestedAction(
                                        title = "Swap Tokens",
                                        description = "Swap your tokens",
                                        type = SolanaVS.ActionType.SWAP
                                    )
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickActionButton(
    title: String,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF2D2D3F)
        ),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier
    ) {
        Text(
            text = title,
            color = primaryText,
            fontSize = 14.sp
        )
    }
}

@Composable
private fun ChatMessages(
    messages: List<SolanaVS.ChatMessage>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        reverseLayout = true
    ) {
        items(messages.reversed()) { message ->
            ChatMessageItem(message = message)
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
private fun ChatMessageItem(
    message: SolanaVS.ChatMessage
) {
    val backgroundColor = when {
        message.isFromAI -> Color(0xFF1E1E2E)
        else -> Color(0xFF2D2D3F)
    }
    
    val alignment = when {
        message.isFromAI -> Alignment.CenterStart
        else -> Alignment.CenterEnd
    }
    
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = alignment
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = backgroundColor),
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                when (message.messageType) {
                    SolanaVS.MessageType.TRANSACTION_PREVIEW -> {
                        Text(
                            text = "Transaction Preview",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryText
                        )
                    }
                    SolanaVS.MessageType.ERROR -> {
                        Text(
                            text = message.content,
                            fontSize = 14.sp,
                            color = Color.Red
                        )
                    }
                    else -> {
                        Text(
                            text = message.content,
                            fontSize = 14.sp,
                            color = primaryText
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SuggestedActions(
    actions: List<SolanaVS.SuggestedAction>,
    onActionClick: (SolanaVS.SuggestedAction) -> Unit
) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(actions) { action ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2D2D3F)),
                modifier = Modifier.clickable { onActionClick(action) }
            ) {
                Column(
                    modifier = Modifier
                        .padding(12.dp)
                        .width(120.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = action.title,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = primaryText,
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = action.description,
                        fontSize = 12.sp,
                        color = secondaryText,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun MessageInput(
    onMessageSend: (String) -> Unit
) {
    var message by remember { mutableStateOf("") }
    
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E)),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = message,
                onValueChange = { message = it },
                placeholder = {
                    Text(
                        text = "Ask anything about Solana...",
                        color = secondaryText
                    )
                },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                modifier = Modifier.weight(1f)
            )
            
            IconButton(
                onClick = {
                    if (message.isNotBlank()) {
                        onMessageSend(message)
                        message = ""
                    }
                }
            ) {
                Icon(
                    painter = painterResource(R.drawable.baseline_send_24),
                    contentDescription = "Send",
                    tint = primaryText
                )
            }
        }
    }
}

@Composable
private fun TransactionOverlay(
    transaction: SolanaVS.PendingTransaction
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E)),
            modifier = Modifier
                .padding(32.dp)
                .fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = when (transaction.status) {
                        SolanaVS.TransactionStatus.PENDING -> "Preparing Transaction..."
                        SolanaVS.TransactionStatus.CONFIRMED -> "Transaction Confirmed!"
                        SolanaVS.TransactionStatus.FAILED -> "Transaction Failed"
                    },
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryText
                )
                
                // Transaction details can be added here
            }
        }
    }
}
