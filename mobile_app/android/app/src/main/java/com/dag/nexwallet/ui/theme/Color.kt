package com.dag.nexwallet.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Theme Colors
val mainBackground = Color(0xFF1A1F2E)
val cardBackgroundColor = Color(0xFF242937)

// Accent Colors
val activeAccentColor = Color(0xFF3B82F6)
val inactiveAccentColor = Color(0xFF64748B)

// Gradient Colors
val gradientStart = Color(0xFF00E5B3)
val gradientEnd = Color(0xFF3B82F6)

// Icon gradient
val iconGradient = Brush.linearGradient(
    colors = listOf(
        gradientStart,
        gradientEnd
    )
)

// Text Colors
val primaryText = Color.White
val secondaryText = Color.White.copy(alpha = 0.7f)
val disabledText = Color.White.copy(alpha = 0.5f)

// Button Colors
val primaryButtonColor = Color.White
val primaryButtonText = activeAccentColor
val secondaryButtonColor = cardBackgroundColor
val secondaryButtonText = Color.White