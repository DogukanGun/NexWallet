package com.dag.nexwallet.base.extensions

import android.util.Log
import com.dag.nexwallet.BuildConfig

const val L_TRY_CATCH = "TRY_CATCH_"

inline fun <reified C, reified T> C.tryCatch(
    tryBlock: () -> T?,
    catchBlock: (Throwable) -> Any? = { null },
    finallyBlock: () -> Unit = {}
) = try {
    tryBlock()?.run {
        takeUnless { it is Unit }
    }
} catch (e: Exception) {
    if (BuildConfig.DEBUG) {
        Log.e(L_TRY_CATCH + C::class.simpleName, "$e")
    }
    catchBlock(e)?.run {
        takeIf { it is T } as? T?
    }
} finally {
    finallyBlock()
}