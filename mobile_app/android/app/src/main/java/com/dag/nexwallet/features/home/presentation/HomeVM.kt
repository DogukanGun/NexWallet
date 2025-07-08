package com.dag.nexwallet.features.home.presentation

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.lifecycle.viewModelScope
import com.dag.nexwallet.base.BaseVM
import com.dag.nexwallet.base.Logger
import com.dag.nexwallet.data.repository.UserRepository
import com.dag.nexwallet.features.home.domain.usecase.GetMyAgentsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject
import androidx.core.net.toUri

@HiltViewModel
class HomeVM @Inject constructor(
    private val userRepository: UserRepository,
    private val logger: Logger,
    private val getMyAgentsUseCase: GetMyAgentsUseCase
) : BaseVM<HomeVS>(initialValue = HomeVS.initial()) {

    companion object{
        const val HOME_GET_USER = "HOME_GET_USER"
    }

    init {
        getUser()
        getMyAgents()
    }

    fun navigateToX(
        packageManager: PackageManager,
        startActivity:(intent:Intent)-> Unit
    ){
        val twitterUsername = "NexArb_"
        val uri = "twitter://user?screen_name=$twitterUsername".toUri()
        val intent = Intent(Intent.ACTION_VIEW, uri)

        val packageManager = packageManager
        val launchIntent = packageManager.getLaunchIntentForPackage("com.twitter.android")

        if (launchIntent != null) {
            // Twitter app is installed
            intent.setPackage("com.twitter.android")
            startActivity(intent)
        } else {
            // Fallback to browser
            val browserIntent = Intent(Intent.ACTION_VIEW,
                "https://twitter.com/$twitterUsername".toUri())
            startActivity(browserIntent)
        }
    }

    private fun getUser() {
        viewModelScope.launch {
            _viewState.value = HomeVS.Loading
            try {
                userRepository.getUser()
                    .onSuccess { user ->
                        logger.logSuccess(HOME_GET_USER,"User -${user?.id}- info is taken from local db")
                        if (_viewState.value is HomeVS.Success){
                            _viewState.value = (_viewState.value as HomeVS.Success).copy(
                                user = user,
                                isSignedIn = user != null
                            )
                        }else{
                            _viewState.value = HomeVS.Success(
                                user = user,
                                isSignedIn = user != null
                            )
                        }

                    }
                    .onFailure { exception ->
                        _viewState.value = HomeVS.Error(
                            message = exception.message ?: "Unknown error occurred"
                        )
                    }
            } catch (e: Exception) {
                _viewState.value = HomeVS.Error(
                    message = e.message ?: "Unknown error occurred"
                )
            }
        }
    }

    private fun getMyAgents(){
        viewModelScope.launch {
            getMyAgentsUseCase.execute().collect {
                if(_viewState.value is HomeVS.Success){
                    _viewState.value = (_viewState.value as HomeVS.Success).copy(
                        myAgents = it
                    )
                }else{
                    _viewState.value = HomeVS.Success(
                        myAgents = it,
                        user = null,
                        isSignedIn = false
                    )
                }
            }
        }
    }

    fun retry() {
        getUser()
    }

}