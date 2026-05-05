package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kaushalya.karnataka.data.model.UserRole

@Composable
fun OnboardingScreen(onRoleSelected: (UserRole) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to",
            color = Color.Gray,
            fontSize = 18.sp
        )
        Text(
            text = "Kaushalya Karnataka",
            color = Color.White,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(48.dp))

        RoleButton("I am a Customer", "Find skilled professionals") {
            onRoleSelected(UserRole.CUSTOMER)
        }

        Spacer(modifier = Modifier.height(16.dp))

        RoleButton("I am a Worker", "Showcase your skills") {
            onRoleSelected(UserRole.WORKER)
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        RoleButton("Admin Login", "Management access", isOutline = true) {
            onRoleSelected(UserRole.ADMIN)
        }
    }
}

@Composable
fun RoleButton(
    title: String,
    subtitle: String,
    isOutline: Boolean = false,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(
                color = if (isOutline) Color.Transparent else Color(0xFF2A2A2A),
                shape = RoundedCornerShape(16.dp)
            )
            .border(
                width = 2.dp,
                color = if (isOutline) Color.Gray else Color.Transparent,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable { onClick() }
            .padding(20.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Column {
            Text(
                text = title,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = subtitle,
                color = Color.Gray,
                fontSize = 14.sp
            )
        }
    }
}
