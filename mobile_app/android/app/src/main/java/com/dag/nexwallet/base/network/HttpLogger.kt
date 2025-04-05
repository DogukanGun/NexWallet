package com.dag.nexwallet.base.network

import android.util.Log
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.extensions.tryCatch
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.Response
import okio.Buffer
import java.nio.charset.Charset
import javax.inject.Inject

class HttpLogger @Inject constructor(
    private val alertDialogManager: AlertDialogManager
) : Interceptor {
    private val requestUrlList = mutableListOf<String>()

    companion object {
        private const val LOG_TAG = "NEXQ_NETWORK"
        private const val REQUEST_URL = "REQUEST_URL"
        private const val REQUEST_HEADERS = "REQUEST_HEADERS"
        private const val REQUEST_BODY = "REQUEST_BODY"
        private const val RESPONSE_BODY = "RESPONSE_BODY"
        private const val REQUEST_FAILED = "REQUEST_FAILED"
        private const val END_OF_REQUEST = "END_OF_REQUEST"
        private const val LOG_DIVIDER = " - - - "

        private val UTF8 = Charset.forName("UTF-8")
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val requestBody = request.body
        setRequestUrlList(request.url)
        log(REQUEST_URL, "${request.method} ${request.url}", getRequestNumber(request.url))
        log(REQUEST_HEADERS, "${request.headers}", getRequestNumber(request.url))
        val requestBuffer = Buffer()
        requestBody?.writeTo(requestBuffer)

        val requestCharset = requestBody?.contentType()?.run {
            charset(UTF8)
        } ?: UTF8
        if (isPlaintext(requestBuffer) == true) {
            // Logs request Body
            log(
                REQUEST_BODY,
                requestBuffer.readString(requestCharset),
                getRequestNumber(request.url)
            )
        }
        val response = tryCatch({
            chain.proceed(request)
        }, {
            log(REQUEST_FAILED, it.toString())
            log("RESPONSE_CODE", "HTTP Code: Failed - ${it.message}", getRequestNumber(request.url))
            alertDialogManager.generateServerErrorMessage()
        })
        val responseBody = response?.body

        val source = responseBody?.source()
        source?.request(Long.MAX_VALUE)

        val responseCharset = responseBody?.contentType()?.run {
            charset(UTF8.toString())
        } ?: UTF8

        if (responseBody?.contentLength() != 0L) {
            // Logs response body
            log(
                RESPONSE_BODY,
                source?.buffer?.clone()?.readString(responseCharset),
                getRequestNumber(response?.request?.url)
            )
        }

        // End of request
        log(END_OF_REQUEST, LOG_DIVIDER, getRequestNumber(response?.request?.url))

        return response!!
    }


    /**
     * Logs as info type
     */
    private fun log(
        detailedTag: String? = null,
        message: String? = null,
        requestNumber: Int? = -1
    ) {
        val tag =
            if (detailedTag != null) "${LOG_TAG}_${requestNumber}_$detailedTag" else "${LOG_TAG}_${requestNumber}"
        message?.let { Log.i(tag, it) }
    }

    private fun setRequestUrlList(url: HttpUrl?) = url?.run {
        requestUrlList.add(toString())
    }

    /**
     * @returns the requestNumber of given [url]
     */
    private fun getRequestNumber(url: HttpUrl?) = url?.run {
        requestUrlList.lastIndexOf(toString())
    }


    private fun isPlaintext(buffer: Buffer?) = tryCatch({
        val prefix = Buffer()
        val byteCount = if ((buffer?.size ?: 0) < 64) buffer?.size ?: 0 else 64
        buffer?.copyTo(prefix, 0, byteCount)
        for (i in 0..15) {
            if (prefix.exhausted()) {
                break
            }
            val codePoint = prefix.readUtf8CodePoint()
            if (Character.isISOControl(codePoint) && !Character.isWhitespace(codePoint)) {
                return false
            }
        }
        true
    },
        {
            false
        }
    )

}