import pymysql
from typing import Dict, List, Optional
import logging

class CompressorDatabase:
    """Class for managing connection and reading compressor data"""
    
    def __init__(self, 
                 host: str = "localhost",
                 user: str = "root",
                 password: str = "Amir@123456",
                 database: str = "compressor_db",
                 table: str = "compressor_data"):
        
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.table = table
        self.connection = None
        self.cursor = None
        self._data = []
        self.index = 0
        
        # Logging setup
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("CompressorDB")

    def connect(self) -> bool:
        """Establish connection to the database"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                cursorclass=pymysql.cursors.DictCursor
            )
            self.cursor = self.connection.cursor()
            self.logger.info("Successfully connected to the database")
            return True
        except pymysql.Error as e:
            self.logger.error(f"Error connecting to the database: {str(e)}")
            return False

    def load_data(self, query: str = None) -> bool:
        """Load data from the table"""
        if not self.connection:
            self.logger.error("You must connect to the database first")
            return False

        # Default query to select all records
        base_query = f"""
            SELECT * FROM {self.table}
            ORDER BY timestamp ASC LIMIT 100
        """
        
        try:
            self.cursor.execute(query or base_query)
            self._data = self.cursor.fetchall()
            self.logger.info(f"Successfully loaded {len(self._data)} records")
            return True
        except pymysql.Error as e:
            self.logger.error(f"Error reading data: {str(e)}")
            return False

    def get_next_record(self) -> Optional[Dict]:
        """Get the next record"""
        if self.index < len(self._data):
            record = self._data[self.index]
            self.index += 1
            return record
        return None

    def reset_cursor(self) -> None:
        """Reset record cursor position"""
        self.index = 0

    @property
    def total_records(self) -> int:
        """Get total number of loaded records"""
        return len(self._data)

    def close(self) -> None:
        """Close the database connection"""
        if self.connection:
            self.connection.close()
            self.logger.info("Database connection closed")
