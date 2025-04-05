package com.dag.nexwallet.base.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.dag.nexwallet.R
import com.dag.nexwallet.base.navigation.DefaultNavigator
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.data.AlertDialogButton
import com.dag.nexwallet.data.AlertDialogButtonType
import com.dag.nexwallet.data.AlertDialogModel
import kotlinx.coroutines.launch

@Composable
fun CustomAlertDialog(
    alertDialogModel: AlertDialogModel,
    showAlert: MutableState<Boolean>,
    defaultNavigator: DefaultNavigator
) {
    Dialog(
        onDismissRequest = { showAlert.value = false },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        CustomAlert(
            alertDialogModel = alertDialogModel,
            showAlert = showAlert,
            defaultNavigator = defaultNavigator
        )
    }
}

@Composable
fun CustomAlert(
    alertDialogModel: AlertDialogModel,
    showAlert: MutableState<Boolean>,
    defaultNavigator: DefaultNavigator
) {
    val coroutineScope = rememberCoroutineScope()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) { showAlert.value = false },
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            modifier = Modifier
                .padding(8.dp)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { /* Do nothing to stop propagation */ },
            shape = RoundedCornerShape(35.dp)
        ) {
            Column(
                modifier = Modifier
                    .background(MaterialTheme.colorScheme.background)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    alertDialogModel.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    )
                )
                if (alertDialogModel.textInput){
                    CustomTextField(
                        label =
                        alertDialogModel.message.ifBlank {
                            stringResource(id = R.string.alert_dialog_user_input )
                                                         },
                        onTextChange = { textInput ->
                            alertDialogModel.onTextChange?.let { it -> it(textInput) }
                        }
                    )
                }else{
                    Text(
                        alertDialogModel.message,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Visibility(case = alertDialogModel.negativeButton != null) {
                        CustomButton(
                            backgroundColor = Color.Gray,
                            text = alertDialogModel.negativeButton!!.text
                        ) {
                            buttonOnClick(
                                alertDialogModel.negativeButton.type,
                                showAlert,
                                alertDialogModel.negativeButton.onClick,
                                alertDialogModel.onClose
                            ){
                                alertDialogModel.negativeButton.navigate?.let{
                                    coroutineScope.launch {
                                        defaultNavigator.navigate(it)
                                    }
                                }
                            }
                        }
                    }
                    CustomButton(
                        backgroundColor = Color.Red,
                        text = alertDialogModel.positiveButton.text
                    ) {
                        buttonOnClick(
                            alertDialogModel.positiveButton.type,
                            showAlert,
                            alertDialogModel.positiveButton.onClick,
                            alertDialogModel.onClose
                        ){
                            alertDialogModel.positiveButton.navigate?.let{
                                coroutineScope.launch {
                                    defaultNavigator.navigate(it)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

fun buttonOnClick(
    buttonType: AlertDialogButtonType,
    showAlert: MutableState<Boolean>,
    onCustomButtonClick: (() -> Unit)? = null,
    onClose: (() -> Unit)? = null,
    onNavigationButtonClick: (() -> Unit)? = null,
) {
    when (buttonType) {
        AlertDialogButtonType.REFRESH -> {
            //TODO Implement later
        }
        AlertDialogButtonType.CLOSE -> {
        }
        AlertDialogButtonType.NAVIGATE -> {
            if (onNavigationButtonClick != null) {
                onNavigationButtonClick()
            }
        }
        AlertDialogButtonType.CUSTOM -> {
            if (onCustomButtonClick != null) {
                onCustomButtonClick()
            }
        }
    }
    showAlert.value = false
    if (onClose != null) {
        onClose()
    }
}


@Composable
@Preview
fun CustomAlertDialogPreview() {
    CustomAlertDialog(
        alertDialogModel = AlertDialogModel(
            title = "Test",
            message = "This is a test",
            positiveButton = AlertDialogButton(
                "positive button",
                {

                },
                null,
                AlertDialogButtonType.CLOSE
            ),
            negativeButton = AlertDialogButton(
                "negative button",
                {

                },
                null,
                AlertDialogButtonType.CLOSE
            )
        ),
        showAlert = remember { mutableStateOf(false) },
        defaultNavigator = DefaultNavigator(Destination.LoginScreen)
    )
}


@Composable
@Preview
fun CustomAlertDialogWithoutNegativeButtonPreview() {
    CustomAlertDialog(
        alertDialogModel = AlertDialogModel(
            title = "Test",
            message = "This is a test",
            positiveButton = AlertDialogButton(
                "positive button",
                {

                },
                null,
                AlertDialogButtonType.CLOSE
            ),
        ),
        showAlert = remember { mutableStateOf(false) },
        defaultNavigator = DefaultNavigator(Destination.LoginScreen)
    )
}

@Composable
@Preview
fun CustomAlertDialogWithTextField(){
    CustomAlertDialog(
        alertDialogModel = AlertDialogModel(
            title = "Test",
            message = "This is a test",
            textInput = true,
            positiveButton = AlertDialogButton(
                "positive button",
                {

                },
                null,
                AlertDialogButtonType.CLOSE
            ),
        ),
        showAlert = remember { mutableStateOf(false) },
        defaultNavigator = DefaultNavigator(Destination.LoginScreen)
    )
}