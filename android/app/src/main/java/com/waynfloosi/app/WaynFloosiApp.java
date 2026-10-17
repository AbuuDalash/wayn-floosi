package com.waynfloosi.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class WaynFloosiApp extends Application {
    public static final String CHANNEL_ID = "wayn_floosi_service";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "وين فلوسي — خدمة التتبع",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("تعمل في الخلفية لاستيراد إشعارات البنك تلقائيًا");
            NotificationManager nm = getSystemService(NotificationManager.class);
            nm.createNotificationChannel(channel);
        }
    }
}
