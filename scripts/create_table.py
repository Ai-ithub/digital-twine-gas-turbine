import sqlite3

# وصل شدن به دیتابیس (اگر فایل logs.db نباشه، خودش می‌سازه)
conn = sqlite3.connect("logs.db")
cursor = conn.cursor()

# ساخت جدول (فقط اگر وجود نداشته باشه)
cursor.execute("""
CREATE TABLE IF NOT EXISTS prediction_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- شناسه خودکار
    input TEXT NOT NULL, -- ورودی مدل (متن یا داده)
    output TEXT NOT NULL, -- خروجی مدل
    model_version TEXT NOT NULL, -- نسخه مدل مثل "v1.0"
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- زمان خودکار
    latency REAL -- زمان پاسخ‌دهی (عدد)
)
""")

conn.commit()  # ذخیره تغییرات
conn.close()  # بستن اتصال
print("جدول ساخته شد!")