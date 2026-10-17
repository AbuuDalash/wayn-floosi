package com.waynfloosi.app;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class NotificationService extends NotificationListenerService {
    private static final String TAG = "WaynFloosi";
    private TransactionQueue queue;
    private ApiClient apiClient;
    private SecurePrefs prefs;

    @Override
    public void onCreate() {
        super.onCreate();
        queue = new TransactionQueue(this);
        apiClient = new ApiClient(this);
        prefs = new SecurePrefs(this);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;
        String pkg = sbn.getPackageName();
        if (!NotificationParser.BANK_PACKAGES.contains(pkg)) return;
        if (!prefs.has(Constants.KEY_AUTH_TOKEN)) return;

        android.app.Notification notification = sbn.getNotification();
        if (notification == null) return;
        android.os.Bundle extras = notification.extras;
        if (extras == null) return;

        String title = extras.getString(android.app.Notification.EXTRA_TITLE, "");
        CharSequence bodyCS = extras.getCharSequence(android.app.Notification.EXTRA_TEXT);
        String body = bodyCS != null ? bodyCS.toString() : "";

        if (NotificationParser.isOtp(title + " " + body)) {
            Log.d(TAG, "Filtered OTP notification from " + pkg);
            return;
        }

        NotificationParser.ParseResult result = NotificationParser.parse(pkg, title, body);
        if (!result.valid || result.amount == null) return;

        try {
            JSONObject tx = new JSONObject();
            tx.put("amount", result.amount.toString());
            tx.put("currency", result.currency);
            tx.put("type", result.type);
            tx.put("merchant", result.merchant != null ? result.merchant : "");
            tx.put("description", result.description != null ? result.description : body);
            tx.put("rawText", title + " " + body);
            tx.put("date", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(new Date()));
            tx.put("source", "ANDROID_NOTIFICATION");
            queue.add(tx);
            Log.d(TAG, "Queued transaction: " + result.amount + " " + result.type);
            if (queue.size() >= 10) syncNow();
        } catch (Exception e) {
            Log.e(TAG, "Error queuing transaction", e);
        }
    }

    public void syncNow() {
        List<JSONObject> batch = queue.getBatch(Constants.MAX_BATCH_SIZE);
        if (batch.isEmpty()) return;
        apiClient.syncTransactions(batch, new ApiClient.Callback<ApiClient.SyncResult>() {
            @Override public void onSuccess(ApiClient.SyncResult result) {
                queue.removeFirst(batch.size());
                Log.d(TAG, "Synced: imported=" + result.imported + " skipped=" + result.skipped);
            }
            @Override public void onError(String message) {
                Log.w(TAG, "Sync failed: " + message + " — will retry");
            }
        });
    }
}
