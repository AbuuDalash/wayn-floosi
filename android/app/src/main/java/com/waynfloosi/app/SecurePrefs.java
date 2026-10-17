package com.waynfloosi.app;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;
import java.io.IOException;
import java.security.GeneralSecurityException;

public class SecurePrefs {
    private final SharedPreferences prefs;

    public SecurePrefs(Context context) {
        SharedPreferences p;
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build();
            p = EncryptedSharedPreferences.create(
                context, Constants.PREF_NAME, masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            p = context.getSharedPreferences(Constants.PREF_NAME, Context.MODE_PRIVATE);
        }
        this.prefs = p;
    }

    public void put(String key, String value) { prefs.edit().putString(key, value).apply(); }
    public String get(String key) { return prefs.getString(key, null); }
    public void remove(String key) { prefs.edit().remove(key).apply(); }
    public boolean has(String key) { return prefs.contains(key) && get(key) != null; }
}
