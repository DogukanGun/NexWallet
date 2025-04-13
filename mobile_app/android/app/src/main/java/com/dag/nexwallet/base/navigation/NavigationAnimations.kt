package com.dag.nexwallet.base.navigation

import androidx.compose.animation.AnimatedContentScope
import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

// Animation duration constant
private const val ANIMATION_DURATION = 300

// Fade animations
val fadeInTransition: EnterTransition = fadeIn(animationSpec = tween(ANIMATION_DURATION))
val fadeOutTransition: ExitTransition = fadeOut(animationSpec = tween(ANIMATION_DURATION))

// Slide animations
val slideInLeftTransition: AnimatedContentTransitionScope<NavBackStackEntry>.() -> EnterTransition = {
    slideIntoContainer(
        towards = AnimatedContentTransitionScope.SlideDirection.Left,
        animationSpec = tween(ANIMATION_DURATION)
    )
}

val slideOutLeftTransition: AnimatedContentTransitionScope<NavBackStackEntry>.() -> ExitTransition = {
    slideOutOfContainer(
        towards = AnimatedContentTransitionScope.SlideDirection.Left,
        animationSpec = tween(ANIMATION_DURATION)
    )
}

val slideInRightTransition: AnimatedContentTransitionScope<NavBackStackEntry>.() -> EnterTransition = {
    slideIntoContainer(
        towards = AnimatedContentTransitionScope.SlideDirection.Right,
        animationSpec = tween(ANIMATION_DURATION)
    )
}

val slideOutRightTransition: AnimatedContentTransitionScope<NavBackStackEntry>.() -> ExitTransition = {
    slideOutOfContainer(
        towards = AnimatedContentTransitionScope.SlideDirection.Right,
        animationSpec = tween(ANIMATION_DURATION)
    )
}

// Extension function for standard page transitions
inline fun <reified T : Destination> NavGraphBuilder.composableWithAnimations(
    noinline content: @Composable AnimatedContentScope.(NavBackStackEntry) -> Unit
) {
    composable<T>(
        enterTransition = slideInLeftTransition,
        exitTransition = slideOutLeftTransition,
        popEnterTransition = slideInRightTransition,
        popExitTransition = slideOutRightTransition,
        content = content
    )
}

// Extension function for splash screen transitions
inline fun <reified T : Destination> NavGraphBuilder.splashComposable(
    noinline content: @Composable AnimatedContentScope.(NavBackStackEntry) -> Unit
) {
    composable<T>(
        enterTransition = { fadeInTransition },
        exitTransition = { fadeOutTransition },
        content = content
    )
} 