package com.dag.nexwallet.base.scroll

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.staticCompositionLocalOf
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * A centralized manager for app-wide scroll state
 */
@Singleton
class ScrollStateManager @Inject constructor() {
    private val _scrollState = MutableStateFlow(ScrollState())
    val scrollState: StateFlow<ScrollState> = _scrollState.asStateFlow()

    fun updateScrolling(isScrolling: Boolean) {
        _scrollState.update { it.copy(isScrolling = isScrolling) }
    }

    fun updateScrollDirection(isScrollingUp: Boolean) {
        _scrollState.update { it.copy(isScrollingUp = isScrollingUp) }
    }

    fun toggle(){
        _scrollState.update { it.copy(isScrolling = !it.isScrolling) }
    }
}

data class ScrollState(
    val isScrolling: Boolean = false,
    val isScrollingUp: Boolean = true
)

// Composition Local provider for accessing ScrollStateManager
val LocalScrollStateManager = staticCompositionLocalOf<ScrollStateManager> { 
    error("No ScrollStateManager provided") 
}

/**
 * Composable helper to report scroll events to the ScrollStateManager
 */
@Composable
fun ReportScrollState(
    isScrolling: Boolean,
    isScrollingUp: Boolean
) {
    val scrollStateManager = LocalScrollStateManager.current
    val coroutineScope = rememberCoroutineScope()
    
    DisposableEffect(isScrolling, isScrollingUp) {
        coroutineScope.launch {
            scrollStateManager.updateScrolling(isScrolling)
            scrollStateManager.updateScrollDirection(isScrollingUp)
        }
        onDispose { }
    }
} 