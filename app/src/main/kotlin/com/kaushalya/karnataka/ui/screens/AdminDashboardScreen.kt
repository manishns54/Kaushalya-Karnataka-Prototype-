package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Admin Console") },
                navigationIcon = { Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.padding(8.dp)) }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Worker Moderation", style = MaterialTheme.typography.titleLarge)
            // List of workers with block/unblock toggles
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text("Flagged Reviews", style = MaterialTheme.typography.titleLarge)
            // List of flagged reviews
        }
    }
}
