package com.waynfloosi.app;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.*;
import java.util.concurrent.TimeUnit;

public class SyncWorker extends Worker {
    public SyncWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        android.content.Intent intent = new android.content.Intent(getApplicationContext(), NotificationService.class);
        intent.setAction("com.waynfloosi.SYNC");
        getApplicationContext().startService(intent);
        return Result.success();
    }

    public static void schedule(Context context) {
        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
            SyncWorker.class, Constants.SYNC_INTERVAL_MINUTES, TimeUnit.MINUTES)
            .setConstraints(new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build();
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "wayn_floosi_sync", ExistingPeriodicWorkPolicy.KEEP, request);
    }
}
