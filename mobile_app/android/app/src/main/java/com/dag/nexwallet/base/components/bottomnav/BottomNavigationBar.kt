package com.dag.nexwallet.base.components.bottomnav

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import com.dag.nexwallet.base.navigation.Destination
import com.dag.nexwallet.ui.theme.*
import androidx.compose.animation.core.*
import androidx.compose.animation.*
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun BottomNavigationBar(
    currentRoute: String? = null,
    isScrolled: Boolean = false,
    messageManager: BottomNavMessageManager,
    onItemSelected: (item: Destination) -> Unit,
    onExpandClick: () -> Unit = {}
) {
    val showMessage by messageManager.showMessage.collectAsState()
    val currentMessage by messageManager.currentMessage.collectAsState()
    val shouldDelayScroll by messageManager.shouldDelayScroll.collectAsState()
    
    val effectiveScrollState = if (shouldDelayScroll) false else isScrolled
    
    LaunchedEffect(Unit) {
        messageManager.messages.collect { message ->
            messageManager.updateMessageState(true, message)
            delay(3000)
            messageManager.updateMessageState(false)
        }
    }

    var selectedItemDefault = remember(currentRoute) {
        var navIcon = BottomNavIcon.Home
        BottomNavIcon.entries.forEach { icon ->
            if (currentRoute?.contains(icon.destination.toString()) == true) {
                navIcon = icon
            }
        }
        mutableStateOf(navIcon)
    }

    val transition = updateTransition(
        targetState = Triple(effectiveScrollState, showMessage, currentMessage),
        label = "BottomNavTransition"
    )

    val width by transition.animateDp(
        label = "width",
        transitionSpec = { 
            if (showMessage) {
                spring(stiffness = Spring.StiffnessLow)
            } else {
                spring(
                    dampingRatio = Spring.DampingRatioMediumBouncy,
                    stiffness = Spring.StiffnessLow
                )
            }
        }
    ) { (scrolled, _, _) ->
        if (scrolled) 64.dp else LocalConfiguration.current.screenWidthDp.dp - 32.dp
    }

    val cornerRadius by transition.animateDp(
        label = "corner",
        transitionSpec = { 
            if (showMessage) {
                spring(stiffness = Spring.StiffnessLow)
            } else {
                spring(
                    dampingRatio = Spring.DampingRatioMediumBouncy,
                    stiffness = Spring.StiffnessLow
                )
            }
        }
    ) { (scrolled, _, _) ->
        if (scrolled) 32.dp else 24.dp
    }

    val elevation by transition.animateDp(
        label = "elevation",
        transitionSpec = { spring(stiffness = Spring.StiffnessLow) }
    ) { (scrolled, _, _) ->
        if (scrolled) 12.dp else 8.dp
    }
    
    val iconSize by transition.animateDp(
        label = "iconSize",
        transitionSpec = { spring(stiffness = Spring.StiffnessLow) }
    ) { (scrolled, _, _) ->
        if (scrolled) 28.dp else 24.dp
    }
    
    val scale by transition.animateFloat(
        label = "scale",
        transitionSpec = { 
            if (showMessage) {
                spring(stiffness = Spring.StiffnessLow)
            } else {
                spring(
                    dampingRatio = Spring.DampingRatioMediumBouncy,
                    stiffness = Spring.StiffnessLow
                )
            }
        }
    ) { (scrolled, _, _) ->
        if (scrolled) 1.1f else 1f
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            modifier = Modifier
                .width(width)
                .height(64.dp)
                .graphicsLayer {
                    scaleX = scale
                    scaleY = scale
                }
                .shadow(elevation = elevation, shape = RoundedCornerShape(cornerRadius)),
            shape = RoundedCornerShape(cornerRadius),
            color = bottomNavBarColor
        ) {
            AnimatedContent(
                targetState = showMessage,
                transitionSpec = {
                    fadeIn(animationSpec = tween(300)) + slideInVertically(
                        initialOffsetY = { it },
                        animationSpec = tween(300)
                    ) with fadeOut(animationSpec = tween(300)) + slideOutVertically(
                        targetOffsetY = { -it },
                        animationSpec = tween(300)
                    )
                }
            ) { isShowingMessage ->
                if (isShowingMessage) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = currentMessage,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            textAlign = TextAlign.Center,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface,
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = if (effectiveScrollState) Arrangement.Center else Arrangement.SpaceAround
                    ) {
                        if (effectiveScrollState) {
                            AnimatedBottomNavIcon(
                                icon = selectedItemDefault.value,
                                isSelected = true,
                                iconSize = iconSize,
                                onClick = {
                                    onExpandClick()
                                }
                            )
                        } else {
                            BottomNavIcon.entries.forEach {
                                AnimatedBottomNavIcon(
                                    icon = it,
                                    isSelected = it == selectedItemDefault.value,
                                    iconSize = iconSize
                                ) {
                                    if (selectedItemDefault.value != it){
                                        selectedItemDefault.value = it
                                        onItemSelected(it.destination)
                                    }else{
                                        onExpandClick()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AnimatedBottomNavIcon(
    icon: BottomNavIcon,
    isSelected: Boolean = false,
    iconSize: Dp = 24.dp,
    onClick: () -> Unit
) {
    val iconTint = if (isSelected) bottomNavSelectedColor else bottomNavUnselectedColor
    val scale = if (isSelected) 1.1f else 1f
    var isExpanded by remember { mutableStateOf(false) }
    Box(
        modifier = Modifier
            .size(56.dp)
            .padding(8.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(CircleShape)
            .clickable(onClick = {
                isExpanded = !isExpanded
                onClick()
            })
            .background(if (isSelected || isExpanded) hoverColor.copy(alpha = 0.2f) else Color.Transparent),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            painter = painterResource(icon.icon),
            contentDescription = icon.name,
            tint = iconTint,
            modifier = Modifier.size(iconSize)
        )
    }
}

@Preview
@Composable
fun BottomNavigationBarPreview() {
    val messageManager = remember { BottomNavMessageManager() }
    val scope = rememberCoroutineScope()
    var isScrolled by remember { mutableStateOf(false) }

    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.padding(16.dp)
    ) {
        Button(
            onClick = {
                scope.launch {
                    messageManager.showMessage("This is a test message!")
                }
            }
        ) {
            Text("Show Message")
        }
        
        Button(
            onClick = { isScrolled = !isScrolled }
        ) {
            Text(if (isScrolled) "Expand" else "Collapse")
        }
        
        BottomNavigationBar(
            onItemSelected = {},
            isScrolled = isScrolled,
            messageManager = messageManager,
            onExpandClick = { isScrolled = false }
        )
    }
}


