package com.dag.nexwallet.features.configurator

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dag.nexwallet.features.home.presentation.cardBackgroundColor

@Composable
fun ConfigOption(
    title: String,
    iconContent: @Composable () -> Unit,
    iconGradient: Brush,
    borderGradient: Brush,
    isCompleted: Boolean,
    isComingSoon: Boolean = false,
    selectedCount: Int,
    totalCount: Int,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(20.dp)
            )
            .clickable(enabled = !isComingSoon) { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = cardBackgroundColor
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(cardBackgroundColor)
                .border(
                    width = 1.dp,
                    brush = borderGradient,
                    shape = RoundedCornerShape(20.dp)
                )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .background(cardBackgroundColor),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon circle with unique gradient for each option
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(
                            brush = if (isCompleted) {
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF00E5B3), Color(0xFF3B82F6))
                                )
                            } else {
                                iconGradient
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isCompleted) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    } else {
                        iconContent()
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = title,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 18.sp
                    )

                    if (isComingSoon) {
                        Text(
                            text = "Coming Soon",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    } else {
                        Text(
                            text = "$selectedCount of $totalCount selected",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                if (!isComingSoon) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowRight,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ConfigLoadingScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00E5B3),
                        Color(0xFF3B82F6),
                        Color(0xFF8B5CF6)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(64.dp),
            color = Color.White,
            strokeWidth = 4.dp
        )
    }
}

@Composable
fun ConfigErrorScreen(message: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF00E5B3),
                        Color(0xFF3B82F6),
                        Color(0xFF8B5CF6)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .padding(16.dp)
                .shadow(
                    elevation = 8.dp,
                    shape = RoundedCornerShape(16.dp)
                ),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White.copy(alpha = 0.9f)
            )
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = Color.Red,
                    modifier = Modifier.size(48.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Error",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = Color.Black
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = message,
                    textAlign = TextAlign.Center,
                    color = Color.Black.copy(alpha = 0.7f)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { /* Handle retry */ },
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF3B82F6)
                    )
                ) {
                    Text(
                        text = "Retry",
                        color = Color.White,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

