package com.dag.nexwallet.base.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

@Composable
fun BackNavigationBar(
    backButtonClick: ()->Unit,
    content: @Composable ()->Unit
){
    Column {
        IconButton(onClick = backButtonClick) {
            Icon(
                Icons.Filled.ArrowBack,
                "Back"
            )
        }
        content()
    }
}