package com.dag.nexwallet.base.components

import androidx.compose.runtime.Composable

@Composable
fun Visibility(
    case: Boolean,
    content: @Composable () -> Unit
) {
    if (case) {
        content()
    }
}

@Composable
fun Visibility(
    case: Boolean,
    contentTrue: @Composable () -> Unit,
    contentFalse: @Composable () -> Unit
) {
    if (case) {
        contentTrue()
    } else {
        contentFalse()
    }
}