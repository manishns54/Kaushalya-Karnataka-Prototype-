package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

@Composable
fun OnboardingScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.4f)
                .background(Color(0xFF003366)),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("KK", fontSize = 64.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFF6600))
                Text("Kaushalya-Karnataka", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Your Skill, Your Business", color = Color.LightGray, fontStyle = FontStyle.Italic)
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.6f)
                .background(Color(0xFF1A1A1A))
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("Who are you?", color = Color.Gray, fontSize = 18.sp, modifier = Modifier.padding(bottom = 32.dp))

            Button(
                onClick = { navController.navigate("worker_register") },
                modifier = Modifier.fillMaxWidth().height(80.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2A2A2A))
            ) {
                Text("I am a Worker", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { navController.navigate("customer_market") },
                modifier = Modifier.fillMaxWidth().height(80.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2A2A2A))
            ) {
                Text("I am a Customer", fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }

            TextButton(
                onClick = { navController.navigate("admin_dash") },
                modifier = Modifier.padding(top = 16.dp)
            ) {
                Text("Admin login →", color = Color.Gray)
            }
        }
    }
}
