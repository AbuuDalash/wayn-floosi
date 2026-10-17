package com.waynfloosi.app;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import okhttp3.*;

public class ApiClient {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient client;
    private final SecurePrefs prefs;

    public ApiClient(Context context) {
        this.prefs = new SecurePrefs(context);
        this.client = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();
    }

    public interface Callback<T> {
        void onSuccess(T result);
        void onError(String message);
    }

    public void login(String email, String password, Callback<String> callback) {
        try {
            JSONObject body = new JSONObject();
            body.put("email", email);
            body.put("password", password);
            Request req = new Request.Builder()
                .url(Constants.BASE_URL + "/api/auth/login")
                .post(RequestBody.create(body.toString(), JSON))
                .build();
            client.newCall(req).enqueue(new okhttp3.Callback() {
                @Override public void onFailure(Call call, IOException e) { callback.onError("فشل الاتصال بالخادم"); }
                @Override public void onResponse(Call call, Response response) throws IOException {
                    String rb = response.body().string();
                    try {
                        JSONObject json = new JSONObject(rb);
                        if (response.isSuccessful()) callback.onSuccess(json.optString("token"));
                        else callback.onError(json.optString("error", "خطأ في تسجيل الدخول"));
                    } catch (Exception e) { callback.onError("خطأ في معالجة الاستجابة"); }
                }
            });
        } catch (Exception e) { callback.onError("خطأ داخلي"); }
    }

    public void registerDevice(String deviceName, Callback<String> callback) {
        String token = prefs.get(Constants.KEY_AUTH_TOKEN);
        if (token == null) { callback.onError("غير مسجل الدخول"); return; }
        try {
            JSONObject body = new JSONObject();
            body.put("deviceName", deviceName);
            body.put("deviceModel", android.os.Build.MODEL);
            Request req = new Request.Builder()
                .url(Constants.BASE_URL + "/api/android/register")
                .post(RequestBody.create(body.toString(), JSON))
                .header("Authorization", "Bearer " + token)
                .build();
            client.newCall(req).enqueue(new okhttp3.Callback() {
                @Override public void onFailure(Call call, IOException e) { callback.onError("فشل تسجيل الجهاز"); }
                @Override public void onResponse(Call call, Response response) throws IOException {
                    String rb = response.body().string();
                    try {
                        JSONObject json = new JSONObject(rb);
                        if (response.isSuccessful()) callback.onSuccess(json.optString("deviceId"));
                        else callback.onError(json.optString("error", "فشل تسجيل الجهاز"));
                    } catch (Exception e) { callback.onError("خطأ في معالجة الاستجابة"); }
                }
            });
        } catch (Exception e) { callback.onError("خطأ داخلي"); }
    }

    public void syncTransactions(List<JSONObject> transactions, Callback<SyncResult> callback) {
        String token = prefs.get(Constants.KEY_AUTH_TOKEN);
        String deviceId = prefs.get(Constants.KEY_DEVICE_ID);
        if (token == null || deviceId == null) { callback.onError("غير مسجل الدخول"); return; }
        try {
            JSONArray arr = new JSONArray();
            for (JSONObject tx : transactions) arr.put(tx);
            JSONObject body = new JSONObject();
            body.put("deviceId", deviceId);
            body.put("transactions", arr);
            Request req = new Request.Builder()
                .url(Constants.BASE_URL + "/api/android/sync")
                .post(RequestBody.create(body.toString(), JSON))
                .header("Authorization", "Bearer " + token)
                .build();
            client.newCall(req).enqueue(new okhttp3.Callback() {
                @Override public void onFailure(Call call, IOException e) { callback.onError("فشل المزامنة"); }
                @Override public void onResponse(Call call, Response response) throws IOException {
                    String rb = response.body().string();
                    try {
                        JSONObject json = new JSONObject(rb);
                        if (response.isSuccessful())
                            callback.onSuccess(new SyncResult(json.optInt("imported", 0), json.optInt("skipped", 0)));
                        else callback.onError(json.optString("error", "فشل المزامنة"));
                    } catch (Exception e) { callback.onError("خطأ في معالجة الاستجابة"); }
                }
            });
        } catch (Exception e) { callback.onError("خطأ داخلي"); }
    }

    public static class SyncResult {
        public final int imported, skipped;
        public SyncResult(int imported, int skipped) { this.imported = imported; this.skipped = skipped; }
    }
}
