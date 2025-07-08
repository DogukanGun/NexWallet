package com.dag.nexwallet.features.solana.presentation.composable

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.dag.nexwallet.features.solana.domain.model.SwapRequest
import com.dag.nexwallet.features.solana.domain.model.Token

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwapDialog(
    onDismiss: () -> Unit,
    onConfirm: (SwapRequest) -> Unit
) {
    var selectedFromToken by remember { mutableStateOf(Token.PREDEFINED_TOKENS.first()) }
    var selectedToToken by remember { mutableStateOf(Token.PREDEFINED_TOKENS[1]) }
    var amount by remember { mutableStateOf("") }
    var slippage by remember { mutableStateOf("0.5") }
    var fromTokenExpanded by remember { mutableStateOf(false) }
    var toTokenExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Swap Tokens",
                    style = MaterialTheme.typography.headlineSmall
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // From Token Dropdown
                ExposedDropdownMenuBox(
                    expanded = fromTokenExpanded,
                    onExpandedChange = { fromTokenExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedFromToken.symbol,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("From Token") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = fromTokenExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    
                    ExposedDropdownMenu(
                        expanded = fromTokenExpanded,
                        onDismissRequest = { fromTokenExpanded = false }
                    ) {
                        Token.PREDEFINED_TOKENS.forEach { token ->
                            DropdownMenuItem(
                                text = { Text("${token.symbol} - ${token.name}") },
                                onClick = {
                                    selectedFromToken = token
                                    fromTokenExpanded = false
                                }
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // To Token Dropdown
                ExposedDropdownMenuBox(
                    expanded = toTokenExpanded,
                    onExpandedChange = { toTokenExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedToToken.symbol,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("To Token") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = toTokenExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    
                    ExposedDropdownMenu(
                        expanded = toTokenExpanded,
                        onDismissRequest = { toTokenExpanded = false }
                    ) {
                        Token.PREDEFINED_TOKENS.forEach { token ->
                            DropdownMenuItem(
                                text = { Text("${token.symbol} - ${token.name}") },
                                onClick = {
                                    selectedToToken = token
                                    toTokenExpanded = false
                                }
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Amount") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = slippage,
                    onValueChange = { slippage = it },
                    label = { Text("Slippage (%)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Button(
                        onClick = {
                            onConfirm(
                                SwapRequest(
                                    fromToken = selectedFromToken.mintAddress,
                                    toToken = selectedToToken.mintAddress,
                                    amount = amount,
                                    slippage = slippage.toDoubleOrNull() ?: 0.5
                                )
                            )
                        },
                        enabled = amount.isNotBlank() && 
                                selectedFromToken != selectedToToken
                    ) {
                        Text("Swap")
                    }
                }
            }
        }
    }
} 