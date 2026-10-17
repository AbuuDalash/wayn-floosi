package com.waynfloosi.app;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {
    private EditText emailField, passwordField;
    private Button loginBtn;
    private TextView errorText;
    private ProgressBar progressBar;
    private ApiClient apiClient;
    private SecurePrefs prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        apiClient = new ApiClient(this);
        prefs = new SecurePrefs(this);
        emailField = findViewById(R.id.emailField);
        passwordField = findViewById(R.id.passwordField);
        loginBtn = findViewById(R.id.loginBtn);
        errorText = findViewById(R.id.errorText);
        progressBar = findViewById(R.id.progressBar);
        loginBtn.setOnClickListener(v -> attemptLogin());
    }

    private void attemptLogin() {
        String email = emailField.getText().toString().trim();
        String password = passwordField.getText().toString();
        if (email.isEmpty() || password.isEmpty()) { showError("أدخل البريد الإلكتروني وكلمة المرور"); return; }
        setLoading(true);
        apiClient.login(email, password, new ApiClient.Callback<String>() {
            @Override public void onSuccess(String token) {
                prefs.put(Constants.KEY_AUTH_TOKEN, token);
                prefs.put(Constants.KEY_USER_EMAIL, email);
                String deviceName = android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL;
                apiClient.registerDevice(deviceName, new ApiClient.Callback<String>() {
                    @Override public void onSuccess(String deviceId) {
                        prefs.put(Constants.KEY_DEVICE_ID, deviceId);
                        runOnUiThread(() -> goToMain());
                    }
                    @Override public void onError(String message) { runOnUiThread(() -> goToMain()); }
                });
            }
            @Override public void onError(String message) {
                new Handler(Looper.getMainLooper()).post(() -> { setLoading(false); showError(message); });
            }
        });
    }

    private void goToMain() { SyncWorker.schedule(this); startActivity(new Intent(this, MainActivity.class)); finish(); }
    private void showError(String msg) { errorText.setText(msg); errorText.setVisibility(View.VISIBLE); }
    private void setLoading(boolean loading) { loginBtn.setEnabled(!loading); progressBar.setVisibility(loading ? View.VISIBLE : View.GONE); }
}
