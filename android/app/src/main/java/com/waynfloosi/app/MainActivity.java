package com.waynfloosi.app;

import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private SecurePrefs prefs;
    private TextView statusText, queueText, emailText;
    private Switch syncSwitch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        prefs = new SecurePrefs(this);

        statusText = findViewById(R.id.statusText);
        queueText = findViewById(R.id.queueText);
        emailText = findViewById(R.id.emailText);
        syncSwitch = findViewById(R.id.syncSwitch);
        Button syncNowBtn = findViewById(R.id.syncNowBtn);
        Button logoutBtn = findViewById(R.id.logoutBtn);
        Button enableNotifBtn = findViewById(R.id.enableNotifBtn);

        if (!prefs.has(Constants.KEY_AUTH_TOKEN)) {
            startActivity(new Intent(this, LoginActivity.class)); finish(); return;
        }

        emailText.setText(prefs.get(Constants.KEY_USER_EMAIL));
        syncNowBtn.setOnClickListener(v -> {
            TransactionQueue queue = new TransactionQueue(this);
            Toast.makeText(this, queue.size() == 0 ? "لا توجد عمليات معلقة" : "جاري المزامنة...", Toast.LENGTH_SHORT).show();
        });
        enableNotifBtn.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)));
        logoutBtn.setOnClickListener(v -> {
            prefs.remove(Constants.KEY_AUTH_TOKEN);
            prefs.remove(Constants.KEY_DEVICE_ID);
            prefs.remove(Constants.KEY_USER_EMAIL);
            startActivity(new Intent(this, LoginActivity.class)); finish();
        });
        updateStatus();
    }

    @Override protected void onResume() { super.onResume(); updateStatus(); }

    private void updateStatus() {
        boolean enabled = isNotificationListenerEnabled();
        statusText.setText(enabled ? "✓ مفعّل — يراقب الإشعارات" : "⚠ يتطلب تفعيل صلاحية الإشعارات");
        queueText.setText("عمليات معلقة: " + new TransactionQueue(this).size());
    }

    private boolean isNotificationListenerEnabled() {
        String flat = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
        return flat != null && flat.contains(getPackageName());
    }
}
