package com.dag.nexwallet.firebase

import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json

fun FirebaseAnalytics.logError(key:String,errorMessage: String){
    val params = Bundle().apply {
        putString("Message",errorMessage)
    }
    this.logEvent(key,params)
}

fun <T> FirebaseAnalytics.logSuccess(key: String, obj: T, serializer: KSerializer<T>) {
    val jsonString = Json.encodeToString(serializer, obj)
    val params = Bundle().apply {
        putString(key, jsonString)
    }
    this.logEvent(key, params)
}
