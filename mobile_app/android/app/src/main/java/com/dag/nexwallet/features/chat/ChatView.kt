package com.dag.nexwallet.features.chat

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

    Surface(
        modifier = modifier.fillMaxSize(),
        color = ChatTheme.Background
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
            color = ChatTheme.TextPrimary,
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { /* Add retry functionality */ },
            colors = ButtonDefaults.buttonColors(
                containerColor = ChatTheme.Primary
            )
        ) {
            Text("Retry")
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
    Surface(
        modifier = modifier.fillMaxSize(),
        color = ChatTheme.Background
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
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        AsyncImage(
            model = R.drawable.nexarb,
            contentDescription = "AI",
            modifier = Modifier
                .size(200.dp)
                .clip(CircleShape),
            contentScale = ContentScale.Fit
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "How can I help you today?",
            style = MaterialTheme.typography.bodyLarge,
            color = ChatTheme.TextSecondary
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
            Card(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                colors = CardDefaults.cardColors(containerColor = ChatTheme.Surface)
            ) {
                AsyncImage(
                    model = R.drawable.nexarb,
                    contentDescription = "AI Avatar",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = if (isUser) ChatTheme.UserMessageBubble else ChatTheme.AssistantMessageBubble,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = message.content,
                modifier = Modifier.padding(12.dp),
                color = ChatTheme.TextPrimary
            )
        }
        
        if (isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            Card(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                colors = CardDefaults.cardColors(containerColor = ChatTheme.Surface)
            ) {
                AsyncImage(
                    model = R.drawable.baseline_person,
                    contentDescription = "User Avatar",
                    modifier = Modifier.fillMaxSize(),
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
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = ChatTheme.Surface,
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 12.dp)
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
                        color = ChatTheme.TextSecondary
                    ) 
                },
                colors = TextFieldDefaults.colors(
                    unfocusedContainerColor = ChatTheme.Secondary,
                    focusedContainerColor = ChatTheme.Secondary,
                    cursorColor = ChatTheme.Primary,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = ChatTheme.TextPrimary,
                    unfocusedTextColor = ChatTheme.TextPrimary
                ),
                shape = RoundedCornerShape(24.dp),
                maxLines = 5
            )
            
            FilledIconButton(
                onClick = onSendClick,
                enabled = !isLoading && text.text.isNotBlank(),
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = ChatTheme.Primary,
                    disabledContainerColor = ChatTheme.Secondary
                ),
                modifier = Modifier.size(48.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = ChatTheme.TextPrimary
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = ChatTheme.TextPrimary
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