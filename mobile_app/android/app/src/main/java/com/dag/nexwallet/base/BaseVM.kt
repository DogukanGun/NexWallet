package com.dag.nexq_app.base

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

open class BaseVM<T: BaseVS>(initialValue: T) : ViewModel() {

    protected val _viewState = MutableStateFlow(initialValue)
    val viewState: StateFlow<T> get() = _viewState

}