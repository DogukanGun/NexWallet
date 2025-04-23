package com.dag.nexwallet.data.repository

import com.dag.nexwallet.data.local.SecureStorage
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ConfigRepository @Inject constructor(
    private val secureStorage: SecureStorage
){

}