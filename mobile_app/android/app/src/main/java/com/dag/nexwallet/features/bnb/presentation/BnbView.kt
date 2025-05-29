package com.dag.nexwallet.features.bnb.presentation

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.*
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.hilt.navigation.compose.hiltViewModel
import com.dag.nexwallet.R
import com.dag.nexwallet.features.bnb.presentation.BnbVS.Transaction
import com.dag.nexwallet.features.stellar.presentation.ErrorView
import com.dag.nexwallet.features.stellar.presentation.LoadingView
import com.dag.nexwallet.ui.theme.*
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.absoluteValue

@Composable
fun BnbScreen(
    viewModel: BnbVM = hiltViewModel()
) {
    val state by viewModel.viewState.collectAsState()
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        when (state) {
            is BnbVS.Loading -> LoadingView()
            is BnbVS.Success -> BnbWalletView(
                state = state as BnbVS.Success,
                onModeToggle = { viewModel.toggleMode() },
                onCardsToggle = { viewModel.toggleCards() },
                onMessageSend = { viewModel.sendMessage(it) }
            )
            is BnbVS.Error -> ErrorView(message = (state as BnbVS.Error).message)
            null -> TODO()
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
private fun BnbWalletView(
    state: BnbVS.Success,
    onModeToggle: () -> Unit,
    onCardsToggle: () -> Unit,
    onMessageSend: (String) -> Unit
) {
    var swipeProgress by remember { mutableStateOf(0f) }
    var showToast by remember { mutableStateOf(false) }
    val swipeThreshold = with(LocalDensity.current) { 100.dp.toPx() }
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    val density = LocalDensity.current
    
    // Swipe indicator animation
    val swipeIndicatorAlpha by animateFloatAsState(
        targetValue = if (state.currentMode == BnbVS.Mode.WALLET) 1f else 0f,
        label = "swipeIndicator"
    )

    LaunchedEffect(showToast) {
        if (showToast) {
            delay(3000)
            showToast = false
        }
    }
    
    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onDragStart = { showToast = true },
                        onDragEnd = {
                            if (swipeProgress.absoluteValue > swipeThreshold) {
                                onModeToggle()
                            }
                            swipeProgress = 0f
                        },
                        onDragCancel = {
                            swipeProgress = 0f
                        },
                        onHorizontalDrag = { change, dragAmount ->
                            change.consume()
                            swipeProgress = (swipeProgress + dragAmount).coerceIn(-screenWidth.toPx(), screenWidth.toPx())
                        }
                    )
                }
        ) {
            // Wallet Info Card with Swipe Indicator
            Box {
                WalletInfoCard(
                    walletInfo = state.walletInfo,
                    onModeToggle = onModeToggle,
                    currentMode = state.currentMode,
                    swipeProgress = swipeProgress,
                    screenWidth = screenWidth.value
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Action Cards Section
            AnimatedVisibility(
                visible = state.isCardsExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                ActionCards(onCardsToggle = onCardsToggle)
            }
            
            // Content Area
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                AnimatedContent(
                    targetState = state.currentMode,
                    transitionSpec = {
                        val direction = if (swipeProgress >= 0) 1 else -1
                        slideInHorizontally { width -> width * direction } + fadeIn() with
                        slideOutHorizontally { width -> -width * direction } + fadeOut()
                    }
                ) { mode ->
                    when (mode) {
                        BnbVS.Mode.WALLET -> WalletContent(
                            transactions = state.transactions,
                            isCardsExpanded = state.isCardsExpanded,
                            onExpandCards = onCardsToggle
                        )
                        BnbVS.Mode.AI_AGENT -> ChatContent(
                            messages = state.chatMessages,
                            onMessageSend = onMessageSend,
                            isCardsExpanded = state.isCardsExpanded,
                            onExpandCards = onCardsToggle
                        )
                    }
                }
            }
        }

        // Custom Toast Message
        AnimatedVisibility(
            visible = showToast,
            enter = fadeIn() + slideInVertically { it / 2 },
            exit = fadeOut() + slideOutVertically { it / 2 },
            modifier = Modifier
                .align(Alignment.Center)
                .zIndex(Float.MAX_VALUE)
        ) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF2D2D3F).copy(alpha = 0.9f)
                ),
                modifier = Modifier.padding(32.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        painter = painterResource(R.drawable.baseline_send_24),
                        contentDescription = "Swipe",
                        tint = primaryText,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = if (state.currentMode == BnbVS.Mode.WALLET) 
                              "Swipe right to chat with AI" 
                              else "Swipe left to return to wallet",
                        color = primaryText,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
private fun WalletInfoCard(
    walletInfo: BnbVS.WalletInfo,
    currentMode: BnbVS.Mode,
    onModeToggle: () -> Unit,
    swipeProgress: Float,
    screenWidth: Float
) {
    val cardRotation = (swipeProgress / screenWidth) * 15f // Max 15 degrees rotation
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                rotationY = cardRotation
            },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E))
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = walletInfo.balance + " BNB",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryText
                    )
                    Text(
                        text = walletInfo.fiatValue,
                        fontSize = 16.sp,
                        color = secondaryText
                    )
                }
                
                IconButton(
                    onClick = onModeToggle,
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color(0xFF2D2D3F))
                ) {
                    Icon(
                        painter = painterResource(
                            if (currentMode == BnbVS.Mode.WALLET) R.drawable.baseline_chat
                            else R.drawable.baseline_code
                        ),
                        contentDescription = "Toggle Mode",
                        tint = primaryText
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = walletInfo.address,
                fontSize = 14.sp,
                color = secondaryText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun ActionCards(
    onCardsToggle: () -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            ActionCard(
                title = "Transfer",
                icon = R.drawable.baseline_send_24,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(8.dp))
            ActionCard(
                title = "Swap",
                icon = R.drawable.baseline_send_24,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(8.dp))
            ActionCard(
                title = "Stake",
                icon = R.drawable.baseline_send_24,
                modifier = Modifier.weight(1f)
            )
        }
        
        TextButton(
            onClick = onCardsToggle,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text(
                text = "Hide",
                color = secondaryText
            )
        }
    }
}

@Composable
private fun ActionCard(
    title: String,
    icon: Int,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2D2D3F))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                painter = painterResource(icon),
                contentDescription = title,
                tint = primaryText,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = title,
                fontSize = 14.sp,
                color = primaryText,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun WalletContent(
    transactions: List<Transaction>,
    isCardsExpanded: Boolean,
    onExpandCards: () -> Unit
) {
    Column {
        if (!isCardsExpanded) {
            TextButton(
                onClick = onExpandCards,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            ) {
                Text(
                    text = "Show Actions",
                    color = secondaryText
                )
            }
        }
        
        Text(
            text = "Recent Transactions",
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium,
            color = primaryText,
            modifier = Modifier.padding(vertical = 16.dp)
        )
        
        if (transactions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No transactions yet",
                    color = secondaryText,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn {
                items(transactions) { transaction ->
                    TransactionItem(transaction = transaction)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun ChatContent(
    messages: List<BnbVS.ChatMessage>,
    onMessageSend: (String) -> Unit,
    isCardsExpanded: Boolean,
    onExpandCards: () -> Unit
) {
    Column {
        if (!isCardsExpanded) {
            TextButton(
                onClick = onExpandCards,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            ) {
                Text(
                    text = "Show Actions",
                    color = secondaryText
                )
            }
        }
        
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            reverseLayout = true
        ) {
            items(messages.reversed()) { message ->
                ChatMessageItem(message = message)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
        
        MessageInput(onMessageSend = onMessageSend)
    }
}

@Composable
private fun TransactionItem(transaction: BnbVS.Transaction) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2D2D3F))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Transaction icon based on type
            Icon(
                painter = painterResource(
                    when (transaction.type) {
                        BnbVS.TransactionType.SEND -> R.drawable.baseline_send_24
                        BnbVS.TransactionType.RECEIVE -> R.drawable.baseline_send_24
                        BnbVS.TransactionType.SWAP -> R.drawable.baseline_send_24
                        BnbVS.TransactionType.STAKE -> R.drawable.baseline_send_24
                        BnbVS.TransactionType.UNSTAKE -> R.drawable.baseline_send_24
                        BnbVS.TransactionType.REWARD -> R.drawable.baseline_send_24
                    }
                ),
                contentDescription = transaction.type.name,
                tint = primaryText,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = transaction.type.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = primaryText
                )
                
                Text(
                    text = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
                        .format(Date(transaction.timestamp)),
                    fontSize = 12.sp,
                    color = secondaryText
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${transaction.amount} ${transaction.token}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = primaryText
                )
                
                Text(
                    text = transaction.status.name,
                    fontSize = 12.sp,
                    color = when (transaction.status) {
                        BnbVS.TransactionStatus.COMPLETED -> Color.Green
                        BnbVS.TransactionStatus.FAILED -> Color.Red
                        BnbVS.TransactionStatus.PENDING -> Color.Yellow
                    }
                )
            }
        }
    }
}

@Composable
private fun ChatMessageItem(message: BnbVS.ChatMessage) {
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
            Text(
                text = message.content,
                fontSize = 14.sp,
                color = primaryText,
                modifier = Modifier.padding(12.dp)
            )
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
                        text = "Ask anything about BNB...",
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

