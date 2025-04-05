package com.dag.nexwallet.base.components

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomTextField(
    label:String,
    isPassword:Boolean = false,
    onTextChange:(String)->Unit
) {
    val text = remember { mutableStateOf("") }
    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    TextField(
        value = text.value,
        singleLine = false,
        visualTransformation = if (passwordVisible || !isPassword) VisualTransformation.None else PasswordVisualTransformation(),
        label = {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge
            )
        },
        colors = TextFieldDefaults.textFieldColors(
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            disabledIndicatorColor = Color.Transparent
        ),
        trailingIcon = {
            val image = if (passwordVisible)
                Icons.Filled.CheckCircle
            else Icons.Filled.Clear

            // Please provide localized description for accessibility services
            val description = if (passwordVisible) "Hide password" else "Show password"

            if (isPassword)
                IconButton(onClick = {passwordVisible = !passwordVisible}){
                    Icon(imageVector  = image, description)
                }
        },
        modifier = Modifier.border(
            1.dp,
            Color.Gray,RoundedCornerShape(16.dp)
        ).fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        onValueChange = {
            text.value = it
            onTextChange(it)
        }
    )
}


@Composable
@Preview
fun CustomTextFieldPreview() {
    CustomTextField(
        label = "Username"
    ){}
}

@Composable
@Preview
fun CustomTextFieldPasswordPreview() {
    CustomTextField(
        label = "Password",
        isPassword = true
    ){}
}