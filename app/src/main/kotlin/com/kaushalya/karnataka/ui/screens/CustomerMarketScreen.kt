package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.kaushalya.karnataka.data.models.User

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerMarketScreen(navController: NavController) {
    var searchQuery by remember { mutableStateOf("") }
    val workers = remember { mutableStateListOf<User>() } // Placeholder for actual data

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Find Workers") })
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Search by trade or name") },
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(workers) { worker ->
                    WorkerCard(worker) {
                        navController.navigate("worker_detail/${worker.uid}")
                    }
                }
            }
        }
    }
}

@Composable
fun WorkerCard(worker: User, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(worker.name, style = MaterialTheme.typography.titleMedium)
            Text(worker.tradeCategory, style = MaterialTheme.typography.bodyMedium)
            Text("Rating: ${worker.avgRating} (${worker.totalReviewCount} reviews)", color = MaterialTheme.colorScheme.primary)
        }
    }
}
