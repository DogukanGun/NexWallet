package com.dag.nexwallet.base.components

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith

val standardAnimation = (fadeIn(animationSpec = tween(500))
    .togetherWith(fadeOut(animationSpec = tween(500))))