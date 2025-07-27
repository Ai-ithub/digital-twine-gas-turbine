import pandas as pd
from sqlalchemy import create_engine
import pymysql
from urllib.parse import quote_plus # <-- ایمپورت جدید

# --- لطفاً این بخش را ویرایش کنید ---
DB_CONFIG = {
    'user': 'root',
    'password': 'Ali23880rez@',  # <- رمز عبور root خود را اینجا وارد کنید
    'host': '127.0.0.1', # استفاده از 127.0.0.1 امن‌تر است
    'database': 'compressor_db'
}
# --- پایان بخش ویرایش ---

CSV_FILE_PATH = "datasets/MASTER_DATASET.csv"
TABLE_NAME = "compressor_data"

def load_data_to_db():
    try:
        print(f"در حال خواندن داده از '{CSV_FILE_PATH}'...")
        df = pd.read_csv(CSV_FILE_PATH)
        if 'Timestamp' in df.columns:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        print(f"تعداد {len(df)} ردیف و {len(df.columns)} ستون با موفقیت خوانده شد.")

        # --- بخش تغییر یافته ---
        # رمز عبور را برای استفاده امن در URL انکود می‌کنیم
        encoded_password = quote_plus(DB_CONFIG['password'])
        connection_str = (
            f"mysql+pymysql://{DB_CONFIG['user']}:{encoded_password}"
            f"@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
        )
        engine = create_engine(connection_str)
        # --- پایان بخش تغییر یافته ---
        
        print(f"در حال بارگذاری داده در جدول '{TABLE_NAME}'... ممکن است کمی زمان ببرد.")
        df.to_sql(TABLE_NAME, con=engine, if_exists='replace', index=False)
        
        print("\n✅ داده‌ها با موفقیت در پایگاه داده بارگذاری شد!")

    except FileNotFoundError:
        print(f"❌ خطا: فایل '{CSV_FILE_PATH}' پیدا نشد.")
    except Exception as e:
        print(f"❌ خطایی رخ داد: {e}")

if __name__ == "__main__":
    load_data_to_db()