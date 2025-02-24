import pymysql
from typing import Dict, List, Optional
import logging

class CompressorDatabase:
    """کلاس مدیریت اتصال و خواندن داده‌های کمپرسور"""
    
    def __init__(self, 
                 host: str = "localhost",
                 user: str = "root",
                 password: str = "f1309D1309",
                 database: str = "compressor",
                 table: str = "CompressorData"):
        
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.table = table
        self.connection = None
        self.cursor = None
        self._data = []
        self.index = 0
        
        # لاگ‌گیری
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("CompressorDB")

    def connect(self) -> bool:
        """برقراری اتصال به پایگاه داده"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
            self.cursor = self.connection.cursor()
            self.logger.info("اتصال به دیتابیس با موفقیت برقرار شد")
            return True
        except pymysql.Error as e:
            self.logger.error(f"خطا در اتصال به دیتابیس: {str(e)}")
            return False

    def load_data(self, query: str = None) -> bool:
        """بارگیری داده‌ها از جدول"""
        if not self.connection:
            self.logger.error("اول باید به دیتابیس متصل شوید")
            return False

        base_query = f"""
            SELECT 
                TimeData,  -- Changed from 'timestamp' to 'TimeData'
                Pressure_In,
                Temperature_In,
                Flow_Rate,
                Pressure_Out,
                Temperature_Out,
                Efficiency
            FROM {self.table}
            ORDER BY TimeData ASC
        """
        
        try:
            self.cursor.execute(query or base_query)
            self._data = self.cursor.fetchall()
            self.logger.info(f"{len(self._data)} رکورد با موفقیت بارگیری شد")
            return True
        except pymysql.Error as e:
            self.logger.error(f"خطا در خواندن داده‌ها: {str(e)}")
            return False

    def get_next_record(self) -> Optional[Dict]:
        """دریافت رکورد بعدی"""
        if self.index < len(self._data):
            record = self._data[self.index]
            self.index += 1
            return record
        return None

    def reset_cursor(self) -> None:
        """بازنشانی موقعیت رکوردها"""
        self.index = 0

    @property
    def total_records(self) -> int:
        """تعداد کل رکوردهای بارگیری شده"""
        return len(self._data)

    def close(self) -> None:
        """بستن اتصال به دیتابیس"""
        if self.connection:
            self.connection.close()
            self.logger.info("اتصال به دیتابیس بسته شد")
