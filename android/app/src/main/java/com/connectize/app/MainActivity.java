package com.connectize.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge - content goes behind system bars
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Make system bars transparent so content shows through
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(0x00000000); // Transparent
            getWindow().setNavigationBarColor(0x00000000); // Transparent
        }
        
        // Make status bar icons dark (for light content behind)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | 
                View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            );
        }
        
        // Handle window insets for edge-to-edge
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            // Let the WebView handle the insets via CSS
            return insets;
        });
    }
}
