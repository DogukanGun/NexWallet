package com.dag.nexwallet.di

import android.content.Context
import android.content.pm.PackageManager
import com.dag.nexwallet.BuildConfig
import com.dag.nexwallet.base.network.HttpLogger
import com.dag.nexwallet.base.AlertDialogManager
import com.dag.nexwallet.base.navigation.DefaultNavigator
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.data.repository.UserRepository
import com.dag.nexwallet.domain.DataPreferencesStore
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
import io.ktor.client.engine.cio.CIO
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
    fun provideAlertDialogManager(): AlertDialogManager {
        return AlertDialogManager()
    }

    @Provides
    @Singleton
    fun provideHttpClient(
        httpLogger: HttpLogger
    ): OkHttpClient {
        return OkHttpClient().newBuilder().addInterceptor(
            HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC)
        ).addInterceptor(httpLogger).connectTimeout(10000L, TimeUnit.MILLISECONDS)
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
    fun provideUnauthorizedKtor(): HttpClient {
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

}