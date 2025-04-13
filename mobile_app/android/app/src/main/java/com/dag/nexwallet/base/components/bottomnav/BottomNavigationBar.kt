package com.dag.nexwallet.base.components.bottomnav

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.dag.nexwallet.base.navigation.Destination


@Composable
fun BottomNavigationBar(
    currentRoute: String? = null,
    onItemSelected: (item: Destination)-> Unit
){
    var selectedItemDefault = remember(currentRoute) {
        // Default to Home
        var navIcon = BottomNavIcon.Home
        
        // Find the matching BottomNavIcon for the current route/destination
        BottomNavIcon.entries.forEach { icon ->
            if (currentRoute?.contains(icon.destination.toString()) == true) {
                navIcon = icon
            }
        }
        
        mutableStateOf(navIcon)
    }
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF162240).copy(alpha = 0.85f)),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceAround
    ) {
        BottomNavIcon.entries.forEach {
            ButtonNavigationBarIcon(
                icon = it,
                isSelected = it == selectedItemDefault.value
            ) {
                selectedItemDefault.value = it
                onItemSelected(it.destination)
            }
        }
    }
}

@Composable
fun ButtonNavigationBarIcon(
    icon: BottomNavIcon,
    isSelected: Boolean = false,
    onClick: ()-> Unit
){
    val iconTint = if (isSelected) Color(0xFF00E5B3) else Color.White.copy(alpha = 0.7f)
    
    Card(
        modifier = Modifier
            .padding(8.dp)
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = isSelected.not(),onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Icon(
            painter = painterResource(icon.icon),
            contentDescription = icon.name,
            tint = iconTint,
            modifier = Modifier.padding(8.dp)
        )
    }
}

@Preview
@Composable
fun ButtonNavigationBarIconPreview(){
    ButtonNavigationBarIcon(BottomNavIcon.Configurator) {}
}

@Preview
@Composable
fun BottomNavigationBarPreview(){
    BottomNavigationBar(
        onItemSelected = {}
    )
}


