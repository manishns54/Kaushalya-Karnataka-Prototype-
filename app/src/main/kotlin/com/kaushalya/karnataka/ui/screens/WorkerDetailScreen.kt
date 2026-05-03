package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun WorkerDetailScreen(navController: NavController, workerId: String) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Worker Details: $workerId", style = MaterialTheme.typography.headlineMedium)
        
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Bio", style = MaterialTheme.typography.titleSmall)
                Text("I am a professional electrician with 5 years experience.", style = MaterialTheme.typography.bodyLarge)
            }
        }
        
        Text("Services Offered", style = MaterialTheme.typography.titleMedium)
        // Services list...
        
        Button(
            onClick = { /* Handle Hire Request */ },
            modifier = Modifier.fillMaxWidth().height(56.dp)
        ) {
            Text("Hire Now")
        }
        
        Button(
            onClick = { navController.popBackStack() },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
        ) {
            Text("Back")
        }
    }
}
