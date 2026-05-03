package com.kaushalya.karnataka

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.kaushalya.karnataka.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MarketplaceApp()
        }
    }
}

@Composable
fun MarketplaceApp() {
    val navController = rememberNavController()
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        NavHost(navController = navController, startDestination = "splash") {
            composable("splash") { SplashScreen(navController) }
            composable("onboarding") { OnboardingScreen(navController) }
            composable("worker_register") { WorkerRegisterScreen(navController) }
            composable("customer_market") { CustomerMarketScreen(navController) }
            composable("worker_dash") { WorkerDashboardScreen(navController) }
            composable("admin_dash") { AdminDashboardScreen(navController) }
            composable("profile_setup") { ProfileSetupScreen(navController) }
            composable("portfolio") { PortfolioScreen(navController) }
            composable("worker_detail/{workerId}") { backStackEntry ->
                val workerId = backStackEntry.arguments?.getString("workerId") ?: ""
                WorkerDetailScreen(navController, workerId)
            }
            composable("review/{requestId}/{workerId}") { backStackEntry ->
                val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
                val workerId = backStackEntry.arguments?.getString("workerId") ?: ""
                ReviewScreen(navController, requestId, workerId)
            }
        }
    }
}
