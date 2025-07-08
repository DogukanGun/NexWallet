package com.dag.nexwallet.features.login.presentation

import android.util.Log
import androidx.lifecycle.viewModelScope
import coil3.Extras
import com.dag.nexwallet.BuildConfig
import com.dag.nexwallet.base.ActivityHolder
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.Logger
import com.dag.nexwallet.data.model.User
import com.dag.nexwallet.data.repository.UserRepository
import com.dag.nexwallet.features.login.domain.model.TokenRequest
import com.dag.nexwallet.features.login.domain.usecase.GenerateTokenUseCase
import com.google.firebase.auth.OAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class LoginVM @Inject constructor(
    private val activityHolder: ActivityHolder,
    private val userRepository: UserRepository,
    private val generateTokenUseCase: GenerateTokenUseCase,
    private val logger: Logger
): BaseVM<LoginVS>() {

    companion object {
        const val LOGIN_ERROR_X = "LOGIN_ERROR_X"
        const val LOGIN_CANCELLED_X = "LOGIN_CANCELLED_X"
        const val LOGIN_COMPLETED_X = "LOGIN_COMPLETED_X"
        const val LOGIN_TOKEN = "LOGIN_TOKEN"
        const val LOGIN_SAVE_USER = "LOGIN_SAVE_USER"
    }

    fun loginWithX() {
        _viewState.value = LoginVS.Loading
        if (BuildConfig.DEBUG){
            _viewState.value = LoginVS.NavigateToHome(User(
                "dummy",
                "dummy",
                "dummy",
                "https://x.com/Dogukan_Gndgn/photo",
                bannerImageUrl = null,
                description = null,
                location = null,
                websiteUrl = null,
                followersCount = 0,
                followingCount = 0,
                isVerified = true,
                createdAt = "",
            ))
            return
        }
        val provider = OAuthProvider.newBuilder("twitter.com")
        provider.addCustomParameter("lang", "en")
        
        activityHolder.getActivity()?.let { activity ->
            Firebase.auth
                .startActivityForSignInWithProvider(
                    activity,
                    provider.build()
                )
                .addOnCanceledListener {
                    Log.i("LOGIN", "Login is cancelled")
                    logger.logError(LOGIN_CANCELLED_X,"Login is canceled")
                    _viewState.value = LoginVS.Error("Login cancelled")
                }
                .addOnFailureListener { exception ->
                    Log.e("LOGIN", "Login failed", exception)
                    logger.logError(LOGIN_ERROR_X,
                        exception.message ?: "Login error for unknown reason")
                    _viewState.value = LoginVS.Error("Login failed")
                }
                .addOnCompleteListener { result ->
                    if (result.isSuccessful) {
                        result.result.additionalUserInfo?.profile?.let { profile ->
                            try {
                                val user = User.fromTwitterProfile(profile as Map<String, Any?>)
                                logger.logSuccess<User>(LOGIN_COMPLETED_X,user)
                                registerDataAndNavigateToHome(user)
                            } catch (e: Exception) {
                                Log.e("LOGIN", "Error parsing user data", e)
                                _viewState.value = LoginVS.Error("Error parsing user data")
                            }
                        } ?: setDataNotReceivedError()
                    }
                }
        } ?: setActivityNotFoundError()
    }

    private fun getToken(userId: String){
        viewModelScope.launch {
            generateTokenUseCase.execute(TokenRequest(userId)).collect { tokenResponse ->
                logger.logSuccess(LOGIN_TOKEN,"Token is taken from the db for the user $userId")
                userRepository.saveToken(tokenResponse.token)
            }
        }
    }

    private fun registerDataAndNavigateToHome(user: User) {
        _viewState.value = LoginVS.Loading
        try {
            userRepository.saveUser(user).fold(
                onSuccess = {
                    logger.logSuccess(LOGIN_SAVE_USER,"User -${user.id}- is saved into local storage")
                    runBlocking {
                        getToken(user.id)
                    }
                    _viewState.value = LoginVS.NavigateToHome(user)
                },
                onFailure = { exception ->
                    Log.e("LOGIN", "Error saving user data", exception)
                    _viewState.value = LoginVS.Error("Failed to save user data: ${exception.message}")
                }
            )
        } catch (e: Exception) {
            Log.e("LOGIN", "Error in registration process", e)
            _viewState.value = LoginVS.Error("Registration failed: ${e.message}")
        }
    }

    private fun setActivityNotFoundError() {
        _viewState.value = LoginVS.Error("Activity not found")
    }

    private fun setDataNotReceivedError() {
        _viewState.value = LoginVS.Error("No user data received")
    }
}