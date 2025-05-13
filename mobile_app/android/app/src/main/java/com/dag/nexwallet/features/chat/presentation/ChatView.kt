package com.dag.nexwallet.features.chat.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.dag.nexwallet.R
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.dag.nexwallet.ui.theme.*

// Custom theme colors
private object ChatTheme {
    val Background = Color(0xFF1A1A1A)
    val Surface = Color(0xFF2D2D2D)
    val Primary = Color(0xFFFF6B00) // Orange primary color
    val Secondary = Color(0xFF4A4A4A)
    val TextPrimary = Color.White
    val TextSecondary = Color.White.copy(alpha = 0.7f)
    val UserMessageBubble = Color(0xFF3D3D3D)
    val AssistantMessageBubble = Color(0xFF1E1E1E)
}

data class ChatMessage(
    val content: String,
    val role: String,
    val id: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Composable
fun ChatScreen(
    viewModel: ChatVM = hiltViewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val messages by viewModel.messages.collectAsStateWithLifecycle()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        when (uiState) {
            is ChatVS.Error -> {
                ErrorState(message = (uiState as ChatVS.Error).message)
            }
            else -> {
                ChatView(
                    messages = messages,
                    isLoading = uiState is ChatVS.Loading,
                    onSendMessage = viewModel::sendMessage
                )
            }
        }
    }
}

@Composable
private fun ErrorState(message: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = message,
            color = primaryText,
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { /* Add retry functionality */ },
            colors = ButtonDefaults.buttonColors(
                containerColor = activeAccentColor
            ),
            shape = RoundedCornerShape(24.dp)
        ) {
            Text(
                text = "Retry",
                color = primaryText
            )
        }
    }
}

@Composable
fun ChatView(
    messages: List<ChatMessage> = emptyList(),
    isLoading: Boolean = false,
    modifier: Modifier = Modifier,
    onSendMessage: (String) -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(mainBackground)
    ) {
        var inputText by remember { mutableStateOf(TextFieldValue()) }
        
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Chat Messages List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                reverseLayout = false
            ) {
                if (messages.isEmpty()) {
                    item {
                        EmptyChatState()
                    }
                } else {
                    items(messages) { message ->
                        ChatMessageItem(message)
                    }
                }
            }
            
            // Input Bar
            ChatInputBar(
                text = inputText,
                onTextChange = { inputText = it },
                onSendClick = {
                    if (inputText.text.isNotBlank()) {
                        onSendMessage(inputText.text)
                        inputText = TextFieldValue("")
                    }
                },
                isLoading = isLoading
            )
        }
    }
}

@Composable
private fun EmptyChatState() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 72.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(brush = iconGradient),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = R.drawable.nexarb,
                contentDescription = "AI",
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Fit
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "How can I help you today?",
            style = MaterialTheme.typography.titleLarge,
            color = primaryText
        )
        
        Text(
            text = "Ask me anything about crypto trading",
            style = MaterialTheme.typography.bodyLarge,
            color = secondaryText,
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
private fun ChatMessageItem(message: ChatMessage) {
    val isUser = message.role == "user"
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(brush = iconGradient),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = R.drawable.nexarb,
                    contentDescription = "AI Avatar",
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Card(
            shape = RoundedCornerShape(
                topStart = if (isUser) 16.dp else 4.dp,
                topEnd = if (isUser) 4.dp else 16.dp,
                bottomStart = 16.dp,
                bottomEnd = 16.dp
            ),
            colors = CardDefaults.cardColors(
                containerColor = if (isUser) activeAccentColor else cardBackgroundColor
            ),
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(12.dp),
                color = primaryText
            )
        }
        
        if (isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(activeAccentColor),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = R.drawable.baseline_person,
                    contentDescription = "User Avatar",
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
        }
    }
}

@Composable
private fun ChatInputBar(
    text: TextFieldValue,
    onTextChange: (TextFieldValue) -> Unit,
    onSendClick: () -> Unit,
    isLoading: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = cardBackgroundColor
        ),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = text,
                onValueChange = onTextChange,
                modifier = Modifier
                    .weight(1f)
                    .padding(end = 8.dp),
                placeholder = { 
                    Text(
                        "Type a message...",
                        color = secondaryText
                    ) 
                },
                colors = TextFieldDefaults.colors(
                    unfocusedContainerColor = Color(0xFF1F2937),
                    focusedContainerColor = Color(0xFF1F2937),
                    cursorColor = gradientStart,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = primaryText,
                    unfocusedTextColor = primaryText
                ),
                shape = RoundedCornerShape(24.dp),
                maxLines = 5
            )
            
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(
                        brush = if (!isLoading && text.text.isNotBlank()) 
                            iconGradient 
                        else 
                            Brush.linearGradient(listOf(inactiveAccentColor, inactiveAccentColor))
                    )
                    .clickable(
                        enabled = !isLoading && text.text.isNotBlank(),
                        onClick = onSendClick
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = primaryText,
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = primaryText,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Preview
@Composable
fun ChatViewPreview() {
    ChatView {
        // Preview callback
    }
}