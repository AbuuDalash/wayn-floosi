package com.waynfloosi.app;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NotificationParser {

    private static final List<String> OTP_PATTERNS = Arrays.asList(
        "رمز التحقق", "رمز OTP", "كود التحقق", "verification code",
        "one-time", "OTP", "رمز مؤقت", "لا تشاركه", "do not share",
        "رمز الدخول", "تسجيل الدخول برمز", "لمرة واحدة"
    );

    public static final List<String> BANK_PACKAGES = Arrays.asList(
        "com.samba.mobile",
        "com.alinma.mobile",
        "com.riyad.bank",
        "com.bsf.mobile",
        "sa.gov.stc.pay",
        "com.alrajhibank.mobile",
        "com.NCB.QuickPay",
        "com.arabbank.mobile",
        "com.alahli.mobilecorp",
        "sa.com.lazurde.app",
        "com.payfort.app"
    );

    private static final Pattern AMOUNT_ARABIC = Pattern.compile(
        "([\\u0660-\\u06690-9,]+\\.?[\\u0660-\\u06690-9]*)\\s*(?:ريال|SAR|ر\\.س|SR|رس)"
    );
    private static final Pattern AMOUNT_ENGLISH = Pattern.compile(
        "(?:SAR|SR|ريال|ر\\.س)\\s*([0-9,]+\\.?[0-9]*)"
    );

    private static final List<String> DEBIT_KEYWORDS = Arrays.asList(
        "سحب", "مدفوع", "خصم", "تحويل من", "شراء", "عملية شراء",
        "debit", "purchase", "withdrawal", "payment"
    );
    private static final List<String> CREDIT_KEYWORDS = Arrays.asList(
        "إيداع", "راتب", "تحويل إلى", "استلمت", "رصيد محول",
        "credit", "salary", "deposit", "received"
    );

    public static class ParseResult {
        public BigDecimal amount;
        public String currency = "SAR";
        public String type;
        public String merchant;
        public String description;
        public boolean valid;
    }

    public static boolean isOtp(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        for (String pattern : OTP_PATTERNS) {
            if (lower.contains(pattern.toLowerCase())) return true;
        }
        return Pattern.compile("\\b\\d{4,8}\\b").matcher(text).find()
            && (lower.contains("code") || lower.contains("رمز") || lower.contains("كود"));
    }

    public static ParseResult parse(String packageName, String title, String body) {
        ParseResult result = new ParseResult();
        String fullText = (title == null ? "" : title + " ") + (body == null ? "" : body);

        if (isOtp(fullText)) { result.valid = false; return result; }

        boolean knownBank = packageName != null && BANK_PACKAGES.contains(packageName);

        BigDecimal amount = extractAmount(fullText);
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            result.valid = false; return result;
        }

        result.amount = amount;
        result.type = detectType(fullText);
        result.merchant = extractMerchant(fullText);
        result.description = body != null && body.length() > 5 ? body : title;
        result.valid = knownBank || amount != null;
        return result;
    }

    private static BigDecimal extractAmount(String text) {
        Matcher m = AMOUNT_ARABIC.matcher(text);
        if (m.find()) {
            try {
                String num = m.group(1).replace(",", "")
                    .replace("٠","0").replace("١","1").replace("٢","2")
                    .replace("٣","3").replace("٤","4").replace("٥","5")
                    .replace("٦","6").replace("٧","7").replace("٨","8").replace("٩","9");
                return new BigDecimal(num);
            } catch (NumberFormatException ignored) {}
        }
        Matcher m2 = AMOUNT_ENGLISH.matcher(text);
        if (m2.find()) {
            try { return new BigDecimal(m2.group(1).replace(",", "")); }
            catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private static String detectType(String text) {
        String lower = text.toLowerCase();
        for (String kw : CREDIT_KEYWORDS) { if (lower.contains(kw.toLowerCase())) return "INCOME"; }
        for (String kw : DEBIT_KEYWORDS) { if (lower.contains(kw.toLowerCase())) return "EXPENSE"; }
        return "EXPENSE";
    }

    private static String extractMerchant(String text) {
        Pattern p = Pattern.compile("(?:at|في|لدى|من)\\s+([\\u0600-\\u06FFa-zA-Z\\s]{2,30})", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) return m.group(1).trim();
        Pattern eng = Pattern.compile("([A-Z][A-Z\\s]{2,20}[A-Z])");
        Matcher me = eng.matcher(text);
        if (me.find()) return me.group(1).trim();
        return null;
    }
}
