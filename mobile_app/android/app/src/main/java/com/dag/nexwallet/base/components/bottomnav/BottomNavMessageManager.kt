package com.dag.nexwallet.base.components.bottomnav

import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BottomNavMessageManager @Inject constructor() {
    private val messageChannel = Channel<String>()
    val messages = messageChannel.receiveAsFlow()

    private val _showMessage = MutableStateFlow(false)
    val showMessage: StateFlow<Boolean> = _showMessage.asStateFlow()

    private val _currentMessage = MutableStateFlow("")
    val currentMessage: StateFlow<String> = _currentMessage.asStateFlow()

    private val _shouldDelayScroll = MutableStateFlow(false)
    val shouldDelayScroll: StateFlow<Boolean> = _shouldDelayScroll.asStateFlow()

    suspend fun showMessage(message: String) {
        _shouldDelayScroll.value = true
        messageChannel.send(message)
    }

    fun updateMessageState(show: Boolean, message: String = "") {
        _showMessage.value = show
        _currentMessage.value = message
        if (!show) {
            _shouldDelayScroll.value = false
        }
    }
} 