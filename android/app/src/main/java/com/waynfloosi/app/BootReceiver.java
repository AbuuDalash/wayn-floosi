package com.waynfloosi.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            SecurePrefs prefs = new SecurePrefs(context);
            if (prefs.has(Constants.KEY_AUTH_TOKEN)) SyncWorker.schedule(context);
        }
    }
}
