package com.dag.nexwallet.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Gradient Colors (unchanged as requested)
val gradientStart = Color(0xFF8EC5FC) // Gradient soft blue
val gradientEnd = Color(0xFFE0C3FC)   // Gradient soft purple

// Theme Colors - Premium Dark Theme
val mainBackground = Color(0xFF1E2A2D) // Deep midnight blue for luxury feel
val cardBackgroundColor = Color(0xFF060617) // Rich dark purple-blue for cards with subtle warmth

// Accent Colors - Refined and Professional
val activeAccentColor = Color(0xFF7C3AED) // Elegant purple matching your gradient theme
val inactiveAccentColor = Color(0xFF060617) // Sophisticated slate gray

// Icon Gradient (unchanged)
val iconGradient = Brush.linearGradient(
    colors = listOf(
        gradientStart,
        gradientEnd
    )
)

// Text Colors - Optimized for Readability
val primaryText = Color(0xFFFFFFFF) // Pure, crisp white for maximum readability
val secondaryText = Color(0xFFDCE7F1) // Warm light gray for comfortable secondary text
val disabledText = Color(0xFF64748B) // Muted slate for disabled states

// Button Colors - Professional and Accessible
val primaryButtonColor = Color(0xFF8B5CF6) // Vibrant purple matching your brand gradient
val primaryButtonText = Color(0xFFFFFFFF) // Pure white for optimal contrast
val secondaryButtonColor = Color(0xFF334155) // Refined dark slate
val secondaryButtonText = Color(0xFFE2E8F0) // Soft light gray

// Additional Professional Colors
val surfaceColor = Color(0xFF1E1E3F) // Slightly lighter than cards for layering
val dividerColor = Color(0xFF2D2D5F) // Subtle dividers that don't compete
val successColor = Color(0xFF10B981) // Professional green for success states
val warningColor = Color(0xFFF59E0B) // Warm amber for warnings
val errorColor = Color(0xFFEF4444) // Clean red for errors

// Subtle Enhancement Colors
val hoverColor = Color(0xFF2A2A4F) // For interactive hover states
val focusColor = Color(0xFF9333EA) // Purple focus ring matching theme

// Navigation Colors
val bottomNavBarColor = Color(0xFF1A1B3A) // Matches card background for consistency
val bottomNavSelectedColor = Color(0xFF8B5CF6) // Active purple accent
val bottomNavUnselectedColor = Color(0xFF64748B) // Muted slate for inactive icons