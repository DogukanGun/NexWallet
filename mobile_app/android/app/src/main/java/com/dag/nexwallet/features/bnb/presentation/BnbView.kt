package com.dag.nexwallet.features.bnb.presentation

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import com.dag.nexwallet.features.bnb.presentation.BnbVS.EscrowRequest
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
            is BnbVS.Success -> AutoPayerView(
                state = state as BnbVS.Success,
                onModeToggle = { viewModel.toggleMode() },
                onSwitchToMode = { mode -> viewModel.switchToMode(mode) },
                onCreateRequest = { viewModel.createEscrowRequest(it) },
                onAcceptRequest = { viewModel.acceptEscrowRequest(it) },
                onSubmitReceipt = { requestId, receipt -> viewModel.submitReceipt(requestId, receipt) },
                onRaiseDispute = { viewModel.raiseDispute(it) },
                onRefresh = { viewModel.refreshData() },
                onShowCreateDialog = { viewModel.showCreateDialog() },
                onHideCreateDialog = { viewModel.hideCreateDialog() },
                onShowPayDialog = { viewModel.showPayDialog() },
                onHidePayDialog = { viewModel.hidePayDialog() },
                onProcessPayment = { contractAddress, proof -> viewModel.processPayment(contractAddress, proof) },
                onShareRequest = { requestId -> viewModel.shareRequest(requestId) }
            )
            is BnbVS.Error -> ErrorView(message = (state as BnbVS.Error).message)
            null -> TODO()
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
private fun AutoPayerView(
    state: BnbVS.Success,
    onModeToggle: () -> Unit,
    onSwitchToMode: (BnbVS.Mode) -> Unit,
    onCreateRequest: (BnbVS.CreateEscrowRequest) -> Unit,
    onAcceptRequest: (String) -> Unit,
    onSubmitReceipt: (String, String) -> Unit,
    onRaiseDispute: (String) -> Unit,
    onRefresh: () -> Unit,
    onShowCreateDialog: () -> Unit,
    onHideCreateDialog: () -> Unit,
    onShowPayDialog: () -> Unit,
    onHidePayDialog: () -> Unit,
    onProcessPayment: (String, Uri?) -> Unit,
    onShareRequest: (String) -> Unit
) {
    var swipeProgress by remember { mutableStateOf(0f) }
    var showToast by remember { mutableStateOf(false) }
    val swipeThreshold = with(LocalDensity.current) { 80.dp.toPx() }
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    
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
                                if (swipeProgress > 0) {
                                    // Swipe right - go to next mode
                                    onModeToggle()
                                } else {
                                    // Swipe left - go to previous mode  
                                    onModeToggle()
                                }
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
            // Header Card with Balance, Mode Toggle, and Pay Button
            AutoPayerHeaderCard(
                walletInfo = state.walletInfo,
                currentMode = state.currentMode,
                onModeToggle = onModeToggle,
                onSwitchToMode = onSwitchToMode,
                onShowPayDialog = onShowPayDialog,
                swipeProgress = swipeProgress,
                screenWidth = screenWidth.value
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Content Area based on current mode
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                AnimatedContent(
                    targetState = state.currentMode,
                    transitionSpec = {
                        val direction = when {
                            targetState.ordinal > initialState.ordinal -> 1 // Forward
                            targetState.ordinal < initialState.ordinal -> -1 // Backward
                            else -> 1
                        }
                        slideInHorizontally { width -> width * direction } + fadeIn() with
                        slideOutHorizontally { width -> -width * direction } + fadeOut()
                    }
                ) { mode ->
                    when (mode) {
                        BnbVS.Mode.MY_REQUESTS -> MyRequestsContent(
                            myRequests = state.myRequests,
                            onCreateRequest = onShowCreateDialog,
                            onRaiseDispute = onRaiseDispute,
                            onShareRequest = onShareRequest
                        )
                        BnbVS.Mode.BROWSE_REQUESTS -> BrowseRequestsContent(
                            availableRequests = state.availableRequests,
                            onAcceptRequest = onAcceptRequest,
                            onRefresh = onRefresh
                        )
                        BnbVS.Mode.MY_PAYMENTS -> MyPaymentsContent(
                            myPayments = state.myPayments,
                            onSubmitReceipt = onSubmitReceipt,
                            onRaiseDispute = onRaiseDispute
                        )
                    }
                }
            }
        }

        // Create Escrow Request Dialog
        if (state.showCreateDialog) {
            CreateEscrowRequestDialog(
                onDismiss = onHideCreateDialog,
                onCreateRequest = { request ->
                    onCreateRequest(request)
                    onHideCreateDialog()
                }
            )
        }

        // Payment Dialog
        if (state.showPayDialog) {
            PaymentDialog(
                onDismiss = onHidePayDialog,
                onProcessPayment = { contractAddress, fileUri ->
                    onProcessPayment(contractAddress, fileUri)
                    onHidePayDialog()
                }
            )
        }

        // Toast for swipe instructions
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
                        painter = painterResource(R.drawable.baseline_search_24),
                        contentDescription = "Swipe",
                        tint = primaryText,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = when (state.currentMode) {
                            BnbVS.Mode.MY_REQUESTS -> "Swipe to browse available requests"
                            BnbVS.Mode.BROWSE_REQUESTS -> "Swipe to view your payments"
                            BnbVS.Mode.MY_PAYMENTS -> "Swipe to view your requests"
                        },
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
private fun AutoPayerHeaderCard(
    walletInfo: BnbVS.WalletInfo,
    currentMode: BnbVS.Mode,
    onModeToggle: () -> Unit,
    onSwitchToMode: (BnbVS.Mode) -> Unit,
    onShowPayDialog: () -> Unit,
    swipeProgress: Float,
    screenWidth: Float
) {
    val cardRotation = (swipeProgress / screenWidth) * 15f
    
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
                        text = "AutoPayer",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryText
                    )
                    Text(
                        text = walletInfo.balance + " BNB Available",
                        fontSize = 14.sp,
                        color = secondaryText
                    )
                }
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Pay Button
                    Button(
                        onClick = onShowPayDialog,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        ),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.height(40.dp)
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.baseline_send_24),
                            contentDescription = "Pay",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Pay",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    
                    // Mode Toggle Button
                    IconButton(
                        onClick = onModeToggle,
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color(0xFF2D2D3F))
                    ) {
                        Icon(
                            painter = painterResource(
                                when (currentMode) {
                                    BnbVS.Mode.MY_REQUESTS -> R.drawable.baseline_list_24
                                    BnbVS.Mode.BROWSE_REQUESTS -> R.drawable.baseline_search_24
                                    BnbVS.Mode.MY_PAYMENTS -> R.drawable.baseline_payment_24
                                }
                            ),
                            contentDescription = "Toggle Mode",
                            tint = primaryText
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Mode indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                ModeIndicator(
                    title = "My Requests",
                    isActive = currentMode == BnbVS.Mode.MY_REQUESTS,
                    onClick = { onSwitchToMode(BnbVS.Mode.MY_REQUESTS) }
                )
                ModeIndicator(
                    title = "Browse",
                    isActive = currentMode == BnbVS.Mode.BROWSE_REQUESTS,
                    onClick = { onSwitchToMode(BnbVS.Mode.BROWSE_REQUESTS) }
                )
                ModeIndicator(
                    title = "My Payments",
                    isActive = currentMode == BnbVS.Mode.MY_PAYMENTS,
                    onClick = { onSwitchToMode(BnbVS.Mode.MY_PAYMENTS) }
                )
            }
        }
    }
}

@Composable
private fun ModeIndicator(
    title: String,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = title,
            fontSize = 12.sp,
            color = if (isActive) primaryText else secondaryText,
            fontWeight = if (isActive) FontWeight.Medium else FontWeight.Normal
        )
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Box(
            modifier = Modifier
                .width(60.dp)
                .height(2.dp)
                .background(
                    if (isActive) Color(0xFF4CAF50) else Color.Transparent,
                    RoundedCornerShape(1.dp)
                )
        )
    }
}

@Composable
private fun MyRequestsContent(
    myRequests: List<EscrowRequest>,
    onCreateRequest: () -> Unit,
    onRaiseDispute: (String) -> Unit,
    onShareRequest: (String) -> Unit
) {
    Column {
        // Create New Request Button
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onCreateRequest() },
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF2D4F2F))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    painter = painterResource(R.drawable.baseline_send_24),
                    contentDescription = "Create Request",
                    tint = Color(0xFF4CAF50),
                    modifier = Modifier.size(24.dp)
                )
                
                Column {
                    Text(
                        text = "Create New Escrow Request",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = primaryText
                    )
                    Text(
                        text = "Lock crypto, receive fiat payment",
                        fontSize = 12.sp,
                        color = secondaryText
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "My Requests (${myRequests.size})",
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium,
            color = primaryText
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (myRequests.isEmpty()) {
            EmptyStateCard(
                title = "No Requests Created",
                description = "Create your first escrow request to receive fiat payments"
            )
        } else {
            LazyColumn {
                items(myRequests) { request ->
                    EscrowRequestCard(
                        request = request,
                        isMyRequest = true,
                        onAction = { action ->
                            when (action) {
                                "dispute" -> onRaiseDispute(request.id)
                                "share" -> onShareRequest(request.id)
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun BrowseRequestsContent(
    availableRequests: List<EscrowRequest>,
    onAcceptRequest: (String) -> Unit,
    onRefresh: () -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Available Requests (${availableRequests.size})",
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                color = primaryText
            )
            
            IconButton(onClick = onRefresh) {
                Icon(
                    painter = painterResource(R.drawable.baseline_send_24),
                    contentDescription = "Refresh",
                    tint = primaryText
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (availableRequests.isEmpty()) {
            EmptyStateCard(
                title = "No Available Requests",
                description = "Check back later for new escrow opportunities"
            )
        } else {
            LazyColumn {
                items(availableRequests) { request ->
                    EscrowRequestCard(
                        request = request,
                        isMyRequest = false,
                        onAction = { action ->
                            when (action) {
                                "accept" -> onAcceptRequest(request.id)
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun MyPaymentsContent(
    myPayments: List<EscrowRequest>,
    onSubmitReceipt: (String, String) -> Unit,
    onRaiseDispute: (String) -> Unit
) {
    Column {
        Text(
            text = "My Payments (${myPayments.size})",
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium,
            color = primaryText
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (myPayments.isEmpty()) {
            EmptyStateCard(
                title = "No Payments Made",
                description = "Accept escrow requests to start making payments"
            )
        } else {
            LazyColumn {
                items(myPayments) { request ->
                    EscrowRequestCard(
                        request = request,
                        isMyRequest = false,
                        isMyPayment = true,
                        onAction = { action ->
                            when (action) {
                                "submit_receipt" -> {
                                    // Open receipt submission dialog
                                    onSubmitReceipt(request.id, "dummy_receipt_hash")
                                }
                                "dispute" -> onRaiseDispute(request.id)
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun EscrowRequestCard(
    request: EscrowRequest,
    isMyRequest: Boolean,
    isMyPayment: Boolean = false,
    onAction: (String) -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2D2D3F))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header with status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ID: ${request.id}",
                    fontSize = 14.sp,
                    color = secondaryText
                )
                
                StatusChip(status = request.status)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Amount details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "${request.fiatAmount} ${request.fiatCurrency}",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = primaryText
                    )
                    Text(
                        text = "Fiat Amount",
                        fontSize = 12.sp,
                        color = secondaryText
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "${request.tokenAmount} ${request.tokenSymbol}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = primaryText
                    )
                    Text(
                        text = "Crypto Amount",
                        fontSize = 12.sp,
                        color = secondaryText
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Description
            if (request.description.isNotBlank()) {
                Text(
                    text = request.description,
                    fontSize = 14.sp,
                    color = secondaryText,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Receipt Requirements (if available)
            if (request.receiptRequirements.isNotBlank()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp)
                    ) {
                        Text(
                            text = "Receipt Requirements:",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = primaryText
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = request.receiptRequirements,
                            fontSize = 11.sp,
                            color = secondaryText,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            // Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                when {
                    isMyRequest && request.status == BnbVS.EscrowStatus.OPEN -> {
                        Button(
                            onClick = { onAction("share") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3)),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Share", color = Color.White)
                        }
                    }
                    
                    !isMyRequest && !isMyPayment && request.status == BnbVS.EscrowStatus.OPEN -> {
                        Button(
                            onClick = { onAction("accept") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Accept", color = Color.White)
                        }
                    }
                    
                    isMyPayment && request.status == BnbVS.EscrowStatus.ACCEPTED -> {
                        Button(
                            onClick = { onAction("submit_receipt") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2196F3)),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Submit Receipt", color = Color.White)
                        }
                    }
                    
                    (isMyRequest || isMyPayment) && 
                    (request.status == BnbVS.EscrowStatus.ACCEPTED || request.status == BnbVS.EscrowStatus.RECEIPT_SUBMITTED) -> {
                        OutlinedButton(
                            onClick = { onAction("dispute") },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Raise Dispute", color = primaryText)
                        }
                    }
                }
            }
            
            // Timestamp
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Created: ${SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()).format(Date(request.createdAt))}",
                fontSize = 12.sp,
                color = secondaryText
            )
        }
    }
}

@Composable
private fun StatusChip(status: BnbVS.EscrowStatus) {
    val (color, text) = when (status) {
        BnbVS.EscrowStatus.OPEN -> Color(0xFF4CAF50) to "Open"
        BnbVS.EscrowStatus.ACCEPTED -> Color(0xFF2196F3) to "Accepted"
        BnbVS.EscrowStatus.RECEIPT_SUBMITTED -> Color(0xFFFFC107) to "Receipt Submitted"
        BnbVS.EscrowStatus.COMPLETED -> Color(0xFF4CAF50) to "Completed"
        BnbVS.EscrowStatus.CANCELLED -> Color(0xFF9E9E9E) to "Cancelled"
        BnbVS.EscrowStatus.DISPUTED -> Color(0xFFFF5722) to "Disputed"
        BnbVS.EscrowStatus.REFUNDED -> Color(0xFF9E9E9E) to "Refunded"
    }
    
    Card(
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.2f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            color = color,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun EmptyStateCard(
    title: String,
    description: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E2E))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                painter = painterResource(R.drawable.baseline_send_24),
                contentDescription = null,
                tint = secondaryText,
                modifier = Modifier.size(48.dp)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = primaryText,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = description,
                fontSize = 14.sp,
                color = secondaryText,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun CreateEscrowRequestDialog(
    onDismiss: () -> Unit,
    onCreateRequest: (BnbVS.CreateEscrowRequest) -> Unit
) {
    var tokenAmount by remember { mutableStateOf("") }
    var fiatAmount by remember { mutableStateOf("") }
    var fiatCurrency by remember { mutableStateOf("EUR") }
    var bankDetails by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var receiptRequirements by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF1E1E2E),
        title = {
            Text(
                text = "Create Escrow Request",
                color = primaryText,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    OutlinedTextField(
                        value = tokenAmount,
                        onValueChange = { tokenAmount = it },
                        label = { Text("Token Amount (USDT)", color = secondaryText) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF2D2D3F),
                            unfocusedContainerColor = Color(0xFF2D2D3F),
                            focusedTextColor = primaryText,
                            unfocusedTextColor = primaryText
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                item {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = fiatAmount,
                            onValueChange = { fiatAmount = it },
                            label = { Text("Fiat Amount", color = secondaryText) },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF2D2D3F),
                                unfocusedContainerColor = Color(0xFF2D2D3F),
                                focusedTextColor = primaryText,
                                unfocusedTextColor = primaryText
                            ),
                            modifier = Modifier.weight(2f)
                        )
                        
                        OutlinedTextField(
                            value = fiatCurrency,
                            onValueChange = { fiatCurrency = it },
                            label = { Text("Currency", color = secondaryText) },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF2D2D3F),
                                unfocusedContainerColor = Color(0xFF2D2D3F),
                                focusedTextColor = primaryText,
                                unfocusedTextColor = primaryText
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                
                item {
                    OutlinedTextField(
                        value = bankDetails,
                        onValueChange = { bankDetails = it },
                        label = { Text("Bank Details (IBAN/Account)", color = secondaryText) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF2D2D3F),
                            unfocusedContainerColor = Color(0xFF2D2D3F),
                            focusedTextColor = primaryText,
                            unfocusedTextColor = primaryText
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                item {
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description", color = secondaryText) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF2D2D3F),
                            unfocusedContainerColor = Color(0xFF2D2D3F),
                            focusedTextColor = primaryText,
                            unfocusedTextColor = primaryText
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2
                    )
                }
                
                item {
                    OutlinedTextField(
                        value = receiptRequirements,
                        onValueChange = { receiptRequirements = it },
                        label = { Text("Receipt Requirements for AI", color = secondaryText) },
                        placeholder = { Text("e.g., Bank transfer screenshot showing amount, IBAN, date", color = secondaryText.copy(alpha = 0.7f)) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF2D2D3F),
                            unfocusedContainerColor = Color(0xFF2D2D3F),
                            focusedTextColor = primaryText,
                            unfocusedTextColor = primaryText
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onCreateRequest(
                        BnbVS.CreateEscrowRequest(
                            tokenAddress = "0x55d398326f99059fF775485246999027B3197955", // USDT BSC
                            tokenAmount = tokenAmount,
                            fiatAmount = fiatAmount,
                            fiatCurrency = fiatCurrency,
                            bankDetails = bankDetails,
                            description = description,
                            receiptRequirements = receiptRequirements
                        )
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                enabled = tokenAmount.isNotBlank() && fiatAmount.isNotBlank() && bankDetails.isNotBlank()
            ) {
                Text("Create Request", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = secondaryText)
            }
        }
    )
}

@Composable
private fun PaymentDialog(
    onDismiss: () -> Unit,
    onProcessPayment: (String, Uri?) -> Unit
) {
    var contractAddress by remember { mutableStateOf("") }
    var selectedFileUri by remember { mutableStateOf<Uri?>(null) }
    var fileName by remember { mutableStateOf("") }

    // File picker launcher
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedFileUri = uri
        fileName = uri?.lastPathSegment ?: "Selected file"
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF1E1E2E),
        title = {
            Text(
                text = "Make Payment",
                color = primaryText,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = contractAddress,
                    onValueChange = { contractAddress = it },
                    label = { Text("Smart Contract Address", color = secondaryText) },
                    placeholder = { Text("0x...", color = secondaryText.copy(alpha = 0.7f)) },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF2D2D3F),
                        unfocusedContainerColor = Color(0xFF2D2D3F),
                        focusedTextColor = primaryText,
                        unfocusedTextColor = primaryText
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
                
                // File Upload Section
                Column {
                    Text(
                        text = "Upload Payment Proof",
                        fontSize = 14.sp,
                        color = primaryText,
                        fontWeight = FontWeight.Medium
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { filePickerLauncher.launch("*/*") }
                            .border(
                                width = 1.dp,
                                color = if (selectedFileUri != null) Color(0xFF4CAF50) else secondaryText.copy(alpha = 0.3f),
                                shape = RoundedCornerShape(8.dp)
                            ),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFF2D2D3F)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                painter = painterResource(
                                    if (selectedFileUri != null) R.drawable.baseline_check_circle_24 
                                    else R.drawable.baseline_cloud_upload_24
                                ),
                                contentDescription = "Upload",
                                tint = if (selectedFileUri != null) Color(0xFF4CAF50) else secondaryText,
                                modifier = Modifier.size(24.dp)
                            )
                            
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = if (selectedFileUri != null) "File Selected" else "Select Receipt File",
                                    fontSize = 14.sp,
                                    color = primaryText,
                                    fontWeight = FontWeight.Medium
                                )
                                
                                Text(
                                    text = if (selectedFileUri != null) fileName else "Screenshot, PDF, or photo of bank transfer",
                                    fontSize = 12.sp,
                                    color = secondaryText,
                                    maxLines = 1
                                )
                            }
                            
                            if (selectedFileUri != null) {
                                IconButton(
                                    onClick = { 
                                        selectedFileUri = null
                                        fileName = ""
                                    }
                                ) {
                                    Icon(
                                        painter = painterResource(R.drawable.baseline_close_24),
                                        contentDescription = "Remove",
                                        tint = secondaryText,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
                
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2D4F2F).copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.baseline_info_24),
                            contentDescription = "Info",
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "AI will analyze your uploaded proof against the contract requirements",
                            fontSize = 12.sp,
                            color = secondaryText
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onProcessPayment(contractAddress, selectedFileUri)
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                enabled = contractAddress.isNotBlank() && selectedFileUri != null
            ) {
                Text("Submit Payment", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = secondaryText)
            }
        }
    )
}

