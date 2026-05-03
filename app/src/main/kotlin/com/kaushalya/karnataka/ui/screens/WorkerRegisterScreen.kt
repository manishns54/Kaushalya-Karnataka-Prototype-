package com.kaushalya.karnataka.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun WorkerRegisterScreen(navController: NavController) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var trade by remember { mutableStateOf("Electrician") }
    
    Column(modifier = Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Create Worker Account", style = MaterialTheme.typography.headlineMedium)
        
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = trade, onValueChange = { trade = it }, label = { Text("Trade (e.g. Plumber)") }, modifier = Modifier.fillMaxWidth())
        
        Button(
            onClick = { /* Handle Registration and navigate to dashboard */ },
            modifier = Modifier.fillMaxWidth().height(56.dp)
        ) {
            Text("Register")
        }
        
        TextButton(onClick = { navController.popBackStack() }) {
            Text("Back")
        }
    }
}
