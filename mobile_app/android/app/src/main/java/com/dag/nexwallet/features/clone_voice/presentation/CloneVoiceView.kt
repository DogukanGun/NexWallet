package com.dag.nexwallet.features.clone_voice.presentation

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import java.io.File
import java.io.FileOutputStream

@Composable
fun CloneVoiceView(
    viewModel: CloneVoiceVM = hiltViewModel()
) {
    val context = LocalContext.current
    val viewState by viewModel.viewState.collectAsState()
    var selectedStorageOption by remember { mutableStateOf(StorageOption.DECENTRALIZED) }
    var isFeatureCardExpanded by remember { mutableStateOf(true) }
    var voiceModelName by remember { mutableStateOf("") }
    var selectedFile by remember { mutableStateOf<File?>(null) }
    val scrollState = rememberScrollState()
    
    // Handle file selection result
    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            // Convert Uri to File
            val file = createFileFromUri(context, it)
            selectedFile = file
        }
    }

    // Determine if the button should be enabled based on the selected storage option
    val isUploadButtonEnabled = when (selectedStorageOption) {
        StorageOption.BASIC -> selectedFile != null
        StorageOption.DECENTRALIZED -> selectedFile != null && voiceModelName.isNotBlank()
    }
    
    // Handle UI state based on viewModel state
    LaunchedEffect(viewState) {
        when (viewState) {
            is CloneVoiceVS.Success -> {
                // Reset state after handling
                selectedFile = null
                voiceModelName = ""
            }
            else -> {} // Handle other states if needed
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Voice Customization",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Text(
                text = "Personalize your AI agent with your own voice. Create a more authentic and engaging interaction experience.",
                fontSize = 16.sp,
                color = Color.White.copy(alpha = 0.7f),
                modifier = Modifier.padding(top = 8.dp, start = 24.dp, end = 24.dp)
            )
        }

        // Next-Gen Voice AI Technology Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .clickable { isFeatureCardExpanded = !isFeatureCardExpanded },
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF1E293B)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Next-Gen Voice AI Technology",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = { isFeatureCardExpanded = !isFeatureCardExpanded }) {
                        Icon(
                            imageVector = if (isFeatureCardExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                            contentDescription = if (isFeatureCardExpanded) "Collapse" else "Expand",
                            tint = Color.White
                        )
                    }
                }
                
                if (isFeatureCardExpanded) {
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Basic Features
                    Column {
                        FeatureItem(text = "Create your personal AI voice model")
                        FeatureItem(text = "Secure local storage")
                        FeatureItem(text = "Basic voice customization")
                        FeatureItem(text = "Standard encryption")
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Advanced Features Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Advanced Decentralized Features",
                            color = Color(0xFF8B5CF6),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        
                        Badge(
                            containerColor = Color(0xFF8B5CF6).copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "Optional",
                                color = Color(0xFF8B5CF6),
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Advanced Features List
                    Column {
                        FeatureItem(text = "Decentralized storage on Filecoin IPFS")
                        FeatureItem(text = "Contribute to federated learning")
                        FeatureItem(text = "Enhanced voice model quality")
                        FeatureItem(text = "Double-layer encryption protection")
                    }
                }
            }
        }

        // Upload Voice Sample Section
        Text(
            text = "Upload Voice Sample",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 24.dp, bottom = 16.dp)
        )

        // Upload Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .border(
                    width = 1.dp,
                    color = if (selectedFile != null) Color(0xFF4ADE80) else Color(0xFF6366F1).copy(alpha = 0.3f),
                    shape = RoundedCornerShape(16.dp)
                )
                .clickable { 
                    filePicker.launch("audio/*")
                }
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = if (selectedFile != null) Icons.Default.Check else Icons.Outlined.Add,
                    contentDescription = "Upload Voice",
                    tint = if (selectedFile != null) Color(0xFF4ADE80) else Color(0xFF6366F1),
                    modifier = Modifier.size(48.dp)
                )
                
                Text(
                    text = if (selectedFile != null) selectedFile?.name ?: "File selected" else "Click to upload or drag and drop",
                    color = if (selectedFile != null) Color(0xFF4ADE80) else Color(0xFF8B5CF6),
                    fontSize = 16.sp,
                    modifier = Modifier.padding(top = 16.dp)
                )
                
                Text(
                    text = "WAV or MP3 up to 10MB",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        // Voice Model Name Input - Only show when Decentralized Storage is selected
        if (selectedStorageOption == StorageOption.DECENTRALIZED) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp)
            ) {
                Text(
                    text = "Give your voice model a name",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
                
                OutlinedTextField(
                    value = voiceModelName,
                    onValueChange = { voiceModelName = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    shape = RoundedCornerShape(8.dp),
                    placeholder = {
                        Text(
                            "Enter a name for your voice model",
                            color = Color.White.copy(alpha = 0.5f)
                        )
                    },
                    textStyle = androidx.compose.ui.text.TextStyle(
                        color = Color.White
                    ),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color(0xFF1E293B),
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedContainerColor = Color(0xFF1E293B),
                        focusedContainerColor = Color(0xFF1E293B),
                        cursorColor = Color(0xFF6366F1)
                    )
                )
                
                Text(
                    text = "✨ Pro tip: Give your voice model a memorable name to easily identify it when using multiple voices.",
                    color = Color(0xFF8B5CF6),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        // Storage Options
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Basic Storage Option
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { selectedStorageOption = StorageOption.BASIC },
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(
                    width = 1.dp,
                    color = if (selectedStorageOption == StorageOption.BASIC) 
                        Color(0xFF6366F1) else Color(0xFF1E293B)
                ),
                color = Color(0xFF1E293B)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedStorageOption == StorageOption.BASIC,
                        onClick = { selectedStorageOption = StorageOption.BASIC },
                        colors = RadioButtonDefaults.colors(
                            selectedColor = Color(0xFF6366F1),
                            unselectedColor = Color.Gray
                        )
                    )
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 16.dp)
                    ) {
                        Text(
                            text = "Basic Storage",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Standard encrypted local storage with basic voice customization",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // Decentralized Storage Option
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { selectedStorageOption = StorageOption.DECENTRALIZED },
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(
                    width = 1.dp,
                    color = if (selectedStorageOption == StorageOption.DECENTRALIZED) 
                        Color(0xFF6366F1) else Color(0xFF1E293B)
                ),
                color = Color(0xFF1E293B)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedStorageOption == StorageOption.DECENTRALIZED,
                        onClick = { selectedStorageOption = StorageOption.DECENTRALIZED },
                        colors = RadioButtonDefaults.colors(
                            selectedColor = Color(0xFF6366F1),
                            unselectedColor = Color.Gray
                        )
                    )
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Decentralized Storage",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.weight(1f)
                            )
                            Surface(
                                color = Color(0xFF8B5CF6).copy(alpha = 0.2f),
                                shape = RoundedCornerShape(4.dp),
                                modifier = Modifier.padding(start = 8.dp)
                            ) {
                                Text(
                                    text = "Recommended",
                                    color = Color(0xFF8B5CF6),
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                        Text(
                            text = "Enhanced security with IPFS storage and federated learning",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
        }

        // Upload Button
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp, bottom = 16.dp),
            shape = RoundedCornerShape(28.dp),
            color = if (isUploadButtonEnabled) Color(0xFF6366F1) else Color(0xFF6366F1).copy(alpha = 0.5f)
        ) {
            Button(
                onClick = { 
                    selectedFile?.let { file ->
                        viewModel.uploadVoiceSample(
                            file = file,
                            voiceName = if (selectedStorageOption == StorageOption.DECENTRALIZED) voiceModelName else null,
                            shareForTraining = selectedStorageOption == StorageOption.DECENTRALIZED
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(28.dp),
                contentPadding = PaddingValues(0.dp),
                enabled = isUploadButtonEnabled
            ) {
                if (viewState is CloneVoiceVS.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Processing...",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                } else {
                    Text(
                        text = "Upload Voice Sample",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isUploadButtonEnabled) Color.White else Color.White.copy(alpha = 0.7f)
                    )
                }
            }
        }
        
        // Error message
        if (viewState is CloneVoiceVS.Error) {
            Text(
                text = (viewState as CloneVoiceVS.Error).message,
                color = Color.Red,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
        
        // Success message
        if (viewState is CloneVoiceVS.Success) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF10B981).copy(alpha = 0.2f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Success",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = (viewState as CloneVoiceVS.Success).message,
                        color = Color(0xFF10B981),
                        fontSize = 14.sp,
                        modifier = Modifier.padding(start = 8.dp)
                    )
                }
            }
        }
    }
}

/**
 * Helper function to convert a content URI to a File
 */
private fun createFileFromUri(context: Context, uri: Uri): File {
    val fileName = getFileNameFromUri(context, uri) ?: "voice_recording_${System.currentTimeMillis()}.wav"
    val cacheFile = File(context.cacheDir, fileName)
    context.contentResolver.openInputStream(uri)?.use { input ->
        FileOutputStream(cacheFile).use { output ->
            input.copyTo(output)
        }
    }
    return cacheFile
}

/**
 * Helper function to get the filename from a URI
 */
private fun getFileNameFromUri(context: Context, uri: Uri): String? {
    var fileName: String? = null
    context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) {
            val displayNameIndex = cursor.getColumnIndex("_display_name")
            if (displayNameIndex != -1) {
                fileName = cursor.getString(displayNameIndex)
            }
        }
    }
    return fileName
}

@Composable
private fun FeatureItem(text: String) {
    Row(
        modifier = Modifier.padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Default.Info,
            contentDescription = null,
            tint = Color.White.copy(alpha = 0.7f),
            modifier = Modifier.size(16.dp)
        )
        
        Text(
            text = text,
            color = Color.White.copy(alpha = 0.7f),
            fontSize = 14.sp,
            modifier = Modifier.padding(start = 8.dp)
        )
    }
}

private enum class StorageOption {
    BASIC,
    DECENTRALIZED
}