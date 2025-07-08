package com.dag.nexwallet.di

import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import com.chuckerteam.chucker.api.ChuckerCollector
import com.chuckerteam.chucker.api.ChuckerInterceptor
import com.chuckerteam.chucker.api.RetentionManager
import com.dag.nexwallet.BuildConfig
import com.dag.nexwallet.base.network.HttpLogger
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.navigation.DefaultNavigator
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.base.scroll.ScrollStateManager
import com.dag.nexwallet.data.repository.UserRepository
import com.dag.nexwallet.domain.DataPreferencesStore
import com.dag.nexwallet.stellar.StellarWallet
import com.google.firebase.Firebase
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.analytics
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.cio.CIO
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.header
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class ObjectModules {
    @Provides
    @Singleton
    fun provideDataPreferencesStore(
        @ApplicationContext context: Context
    ): DataPreferencesStore {
        return DataPreferencesStore(context)
    }

    @Provides
    @Singleton
    fun provideDefaultNavigator(): DefaultNavigator {
        return DefaultNavigator(startDestination = Destination.Splash)
    }

    @Provides
    @Singleton
    fun provideFirebaseAnalytics(): FirebaseAnalytics {
        val firebaseAnalytics =  Firebase.analytics
        val parameters = Bundle().apply {
            this.putString("build_version", BuildConfig.VERSION_NAME)
        }
        firebaseAnalytics.setDefaultEventParameters(parameters)
        return firebaseAnalytics
    }

    @Provides
    @Singleton
    fun provideAlertDialogManager(): AlertDialogManager {
        return AlertDialogManager()
    }

    @Provides
    @Singleton
    fun provideScrollStateManager(): ScrollStateManager {
        return ScrollStateManager()
    }

    @Provides
    @Singleton
    fun provideHttpClient(
        httpLogger: HttpLogger,
        @ApplicationContext context: Context
    ): OkHttpClient {

        val chuckerCollector = ChuckerCollector(
            context = context,
            showNotification = true,
            retentionPeriod = RetentionManager.Period.ONE_HOUR
        )

        val chucker =  ChuckerInterceptor.Builder(context)
            .collector(chuckerCollector)
            .maxContentLength(250000L)
            .redactHeaders(emptySet())
            .alwaysReadResponseBody(true)
            .createShortcut(true)
            .build()
        return OkHttpClient()
            .newBuilder()
            .addInterceptor(chucker)
            .addInterceptor(
                HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC)
            )
            .addInterceptor(httpLogger)
            .connectTimeout(10000L, TimeUnit.MILLISECONDS)
            .readTimeout(10000L, TimeUnit.MILLISECONDS).writeTimeout(10000L, TimeUnit.MILLISECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun providePackageManager(
        @ApplicationContext context: Context
    ): PackageManager {
        return context.packageManager
    }

    @Provides
    @Singleton
    @Named("UnauthorizedKtor")
    fun provideUnauthorizedKtor(
        okHttpClient: OkHttpClient,
    ): HttpClient {
        return HttpClient(OkHttp) {
            engine {
                preconfigured = okHttpClient
            }
            install(Logging) {
                level = if (BuildConfig.DEBUG) {
                    LogLevel.ALL
                } else {
                    LogLevel.NONE
                }
            }
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                    encodeDefaults = true
                })
            }

            defaultRequest {
                url(BuildConfig.BASE_URL)
                header("Content-Type", "application/json")
            }
        }
    }

    @Provides
    @Singleton
    @Named("AuthorizedKtor")
    fun provideAuthorizedKtor(
        userRepository: UserRepository
    ): HttpClient {
        return HttpClient(CIO) {
            install(Logging) {
                level = if (BuildConfig.DEBUG) {
                    LogLevel.ALL
                } else {
                    LogLevel.NONE
                }
            }
            install(HttpTimeout) {
                requestTimeoutMillis = 10000L
                connectTimeoutMillis = 10000L
                socketTimeoutMillis = 10000L
            }
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                    encodeDefaults = true
                })
            }
            install(Auth) {
                bearer {
                    loadTokens {
                        userRepository.getToken()
                            .getOrNull()
                            ?.let { token -> BearerTokens(token, token) }
                    }
                }
            }
            defaultRequest {
                url(BuildConfig.BASE_URL)
                header("Content-Type", "application/json")
            }
        }
    }

    @Provides
    @Singleton
    @Named("JupiterSwapKtor")
    fun provideJupiterSwapKtorHttpClient():HttpClient {
        return HttpClient(CIO) {
            install(Logging) {
                level = if (BuildConfig.DEBUG) {
                    LogLevel.ALL
                } else {
                    LogLevel.NONE
                }
            }
            install(HttpTimeout) {
                requestTimeoutMillis = 10000L
                connectTimeoutMillis = 10000L
                socketTimeoutMillis = 10000L
            }
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                    encodeDefaults = true
                    prettyPrint = true
                })
            }
            defaultRequest {
                url("https://quote-api.jup.ag/v6")
                header("Content-Type", "application/json")
            }
        }
    }

    @Provides
    @Singleton
    @Named("JupiterStakeKtor")
    fun provideJupiterStakeKtorHttpClient():HttpClient {
        val test= HttpClient()
        return HttpClient(CIO) {
            install(Logging) {
                level = if (BuildConfig.DEBUG) {
                    LogLevel.ALL
                } else {
                    LogLevel.NONE
                }
            }
            install(HttpTimeout) {
                requestTimeoutMillis = 10000L
                connectTimeoutMillis = 10000L
                socketTimeoutMillis = 10000L
            }
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                    encodeDefaults = true
                })
            }
            defaultRequest {
                url("https://worker.jup.ag/blinks/swap/So11111111111111111111111111111111111111112/jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v/")
                header("Content-Type", "application/json")
            }
        }
    }

    @Provides
    @Singleton
    @Named("AuthorizedFrontendKtor")
    fun provideAuthorizedFrontendKtor(
        userRepository: UserRepository
    ): HttpClient {
        return HttpClient(CIO) {
            install(Logging) {
                level = if (BuildConfig.DEBUG) {
                    LogLevel.ALL
                } else {
                    LogLevel.NONE
                }
            }
            install(HttpTimeout) {
                requestTimeoutMillis = 10000L
                connectTimeoutMillis = 10000L
                socketTimeoutMillis = 10000L
            }
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    isLenient = true
                    encodeDefaults = true
                })
            }
            install(Auth) {
                bearer {
                    loadTokens {
                        userRepository.getToken()
                            .getOrNull()
                            ?.let { token -> BearerTokens(token, token) }
                    }
                }
            }
            defaultRequest {
                url(BuildConfig.BASE_FRONTEND_URL)
                header("Content-Type", "application/json")
            }
        }
    }

    @Provides
    @Singleton
    fun provideStellarWallet(
        @ApplicationContext context: Context
    ): StellarWallet {
        return StellarWallet(context, isTestNetwork = BuildConfig.DEBUG)
    }

    @Provides
    @Singleton
    fun provideJson(): Json {
        return Json {
            ignoreUnknownKeys = true
            isLenient = true
            encodeDefaults = true
            prettyPrint = true
        }
    }

}