package com.dag.nexwallet.base

import android.util.Log
import com.dag.nexwallet.BuildConfig
import com.dag.nexwallet.firebase.logError
import com.dag.nexwallet.firebase.logSuccess
import com.google.firebase.analytics.FirebaseAnalytics
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class Logger @Inject constructor(
    val firebaseAnalytics: FirebaseAnalytics
){
    fun logError(key: String,message: String){
        if (BuildConfig.DEBUG){
            Log.e(key,message)
        }else{
            firebaseAnalytics.logError(key,message)
        }
    }

    inline fun <reified T> logSuccess(key: String, obj: T){
        if (BuildConfig.DEBUG){
            Log.i(key,obj.toString())
        }else{
            val serializer = kotlinx.serialization.serializer<T>()
            firebaseAnalytics.logSuccess<T>(key, obj,serializer)
        }
    }
}