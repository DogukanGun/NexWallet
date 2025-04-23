package com.dag.nexwallet.base.extensions

import com.dag.nexwallet.base.Logger
import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import io.ktor.http.HttpStatusCode

suspend inline fun <reified T> HttpResponse.getResponseData(
    logger: Logger
):T? {
    return when (this.status) {
        HttpStatusCode.OK -> this.body()
        else -> {
            // TODO save error in firebase analytics
            val errorBody = try {
                this.body<String>()
            } catch (e: Exception) {
                e.message
            }
            logger.logError("API Error","API Error: ${this.status.value} - $errorBody")
            return null
        }
    }
}