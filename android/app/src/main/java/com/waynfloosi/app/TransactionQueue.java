package com.waynfloosi.app;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class TransactionQueue {
    private static final String PREF_QUEUE = "tx_queue";
    private static final String KEY_QUEUE = "pending";
    private final SharedPreferences prefs;

    public TransactionQueue(Context context) {
        this.prefs = context.getSharedPreferences(PREF_QUEUE, Context.MODE_PRIVATE);
    }

    public void add(JSONObject tx) {
        List<JSONObject> queue = getAll();
        if (queue.size() >= Constants.MAX_BATCH_SIZE * 3) queue.remove(0);
        queue.add(tx);
        save(queue);
    }

    public List<JSONObject> getAll() {
        List<JSONObject> result = new ArrayList<>();
        String json = prefs.getString(KEY_QUEUE, "[]");
        try {
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) result.add(arr.getJSONObject(i));
        } catch (Exception ignored) {}
        return result;
    }

    public List<JSONObject> getBatch(int size) {
        List<JSONObject> all = getAll();
        return all.subList(0, Math.min(size, all.size()));
    }

    public void removeFirst(int count) {
        List<JSONObject> all = getAll();
        if (count >= all.size()) clear();
        else save(all.subList(count, all.size()));
    }

    public void clear() { prefs.edit().remove(KEY_QUEUE).apply(); }
    public int size() { return getAll().size(); }

    private void save(List<JSONObject> list) {
        JSONArray arr = new JSONArray();
        for (JSONObject obj : list) arr.put(obj);
        prefs.edit().putString(KEY_QUEUE, arr.toString()).apply();
    }
}
