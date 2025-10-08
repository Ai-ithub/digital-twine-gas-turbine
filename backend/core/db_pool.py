"""
Database Connection Pool Manager
Provides connection pooling for MySQL and InfluxDB connections.
"""

import os
import logging
from typing import Optional, Dict, Any
from contextlib import contextmanager
import threading
import time

# Database imports
import mysql.connector
from mysql.connector import pooling
from dbutils.pooled_db import PooledDB
import pymysql

# InfluxDB imports
try:
    from influxdb_client import InfluxDBClient
    from influxdb_client.client.write_api import SYNCHRONOUS
    INFLUX_AVAILABLE = True
except ImportError:
    INFLUX_AVAILABLE = False

logger = logging.getLogger(__name__)

class MySQLConnectionPool:
    """MySQL connection pool manager using mysql-connector-python."""
    
    def __init__(self):
        """Initialize MySQL connection pool."""
        self.pool_name = "digital_twin_pool"
        self.pool_size = int(os.getenv('MYSQL_POOL_SIZE', 10))
        self.max_overflow = int(os.getenv('MYSQL_MAX_OVERFLOW', 20))
        
        # Database configuration
        self.config = {
            'host': os.getenv('MYSQL_HOST', 'localhost'),
            'port': int(os.getenv('MYSQL_PORT', 3306)),
            'user': os.getenv('MYSQL_USER', 'root'),
            'password': os.getenv('MYSQL_PASSWORD', ''),
            'database': os.getenv('MYSQL_DATABASE', 'digital_twin'),
            'charset': 'utf8mb4',
            'autocommit': True,
            'time_zone': '+00:00',
            'sql_mode': 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO',
            'raise_on_warnings': True,
            'use_pure': True
        }
        
        self._create_pool()
    
    def _create_pool(self):
        """Create MySQL connection pool."""
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name=self.pool_name,
                pool_size=self.pool_size,
                pool_reset_session=True,
                **self.config
            )
            logger.info(f"✅ MySQL connection pool created with {self.pool_size} connections")
        except Exception as e:
            logger.error(f"❌ Failed to create MySQL connection pool: {e}")
            self.pool = None
    
    @contextmanager
    def get_connection(self):
        """Get connection from pool with context manager."""
        connection = None
        try:
            if self.pool:
                connection = self.pool.get_connection()
                yield connection
            else:
                # Fallback to direct connection
                connection = mysql.connector.connect(**self.config)
                yield connection
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            if connection:
                connection.rollback()
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    def execute_query(self, query: str, params: Optional[tuple] = None, fetch: bool = True):
        """Execute query using pooled connection."""
        with self.get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                cursor.execute(query, params)
                if fetch:
                    return cursor.fetchall()
                else:
                    conn.commit()
                    return cursor.rowcount
            finally:
                cursor.close()
    
    def execute_many(self, query: str, params_list: list):
        """Execute multiple queries using pooled connection."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.executemany(query, params_list)
                conn.commit()
                return cursor.rowcount
            finally:
                cursor.close()

class PyMySQLConnectionPool:
    """Alternative MySQL connection pool using PyMySQL and DBUtils."""
    
    def __init__(self):
        """Initialize PyMySQL connection pool."""
        self.pool_size = int(os.getenv('PYMYSQL_POOL_SIZE', 10))
        self.max_connections = int(os.getenv('PYMYSQL_MAX_CONNECTIONS', 20))
        
        # Database configuration
        self.config = {
            'host': os.getenv('MYSQL_HOST', 'localhost'),
            'port': int(os.getenv('MYSQL_PORT', 3306)),
            'user': os.getenv('MYSQL_USER', 'root'),
            'password': os.getenv('MYSQL_PASSWORD', ''),
            'database': os.getenv('MYSQL_DATABASE', 'digital_twin'),
            'charset': 'utf8mb4',
            'autocommit': True,
            'cursorclass': pymysql.cursors.DictCursor
        }
        
        self._create_pool()
    
    def _create_pool(self):
        """Create PyMySQL connection pool using DBUtils."""
        try:
            self.pool = PooledDB(
                creator=pymysql,
                maxconnections=self.max_connections,
                mincached=self.pool_size,
                maxcached=self.pool_size,
                maxshared=3,
                blocking=True,
                maxusage=None,
                setsession=[],
                ping=0,
                **self.config
            )
            logger.info(f"✅ PyMySQL connection pool created with {self.pool_size} connections")
        except Exception as e:
            logger.error(f"❌ Failed to create PyMySQL connection pool: {e}")
            self.pool = None
    
    @contextmanager
    def get_connection(self):
        """Get connection from pool with context manager."""
        connection = None
        try:
            if self.pool:
                connection = self.pool.connection()
                yield connection
            else:
                # Fallback to direct connection
                connection = pymysql.connect(**self.config)
                yield connection
        except Exception as e:
            logger.error(f"PyMySQL connection error: {e}")
            if connection:
                connection.rollback()
            raise
        finally:
            if connection:
                connection.close()

class InfluxDBConnectionPool:
    """InfluxDB connection pool manager."""
    
    def __init__(self):
        """Initialize InfluxDB connection pool."""
        if not INFLUX_AVAILABLE:
            logger.warning("InfluxDB client not available")
            self.client = None
            return
        
        self.url = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
        self.token = os.getenv('INFLUXDB_TOKEN', '')
        self.org = os.getenv('INFLUXDB_ORG', 'digital_twin')
        self.bucket = os.getenv('INFLUXDB_BUCKET', 'sensor_data')
        
        # Connection pool settings
        self.pool_size = int(os.getenv('INFLUXDB_POOL_SIZE', 5))
        self.timeout = int(os.getenv('INFLUXDB_TIMEOUT', 10000))
        
        self._create_client()
    
    def _create_client(self):
        """Create InfluxDB client."""
        try:
            self.client = InfluxDBClient(
                url=self.url,
                token=self.token,
                org=self.org,
                timeout=self.timeout,
                enable_gzip=True
            )
            
            # Test connection
            self.client.ping()
            logger.info(f"✅ InfluxDB client connected to {self.url}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to InfluxDB: {e}")
            self.client = None
    
    def get_query_api(self):
        """Get query API."""
        if self.client:
            return self.client.query_api()
        return None
    
    def get_write_api(self, write_option=SYNCHRONOUS):
        """Get write API."""
        if self.client:
            return self.client.write_api(write_option=write_option)
        return None
    
    def query(self, flux_query: str):
        """Execute Flux query."""
        query_api = self.get_query_api()
        if query_api:
            try:
                return query_api.query(flux_query, org=self.org)
            except Exception as e:
                logger.error(f"InfluxDB query error: {e}")
                return None
        return None
    
    def write_points(self, points, bucket: Optional[str] = None):
        """Write points to InfluxDB."""
        write_api = self.get_write_api()
        if write_api:
            try:
                write_api.write(bucket=bucket or self.bucket, org=self.org, record=points)
                return True
            except Exception as e:
                logger.error(f"InfluxDB write error: {e}")
                return False
        return False
    
    def close(self):
        """Close InfluxDB client."""
        if self.client:
            self.client.close()

class DatabaseManager:
    """Unified database manager for all database connections."""
    
    def __init__(self):
        """Initialize all database connection pools."""
        self.mysql_pool = MySQLConnectionPool()
        self.pymysql_pool = PyMySQLConnectionPool()
        self.influx_pool = InfluxDBConnectionPool()
        
        # Health check settings
        self.health_check_interval = int(os.getenv('DB_HEALTH_CHECK_INTERVAL', 300))  # 5 minutes
        self.last_health_check = 0
        self._lock = threading.Lock()
    
    def get_mysql_connection(self):
        """Get MySQL connection from primary pool."""
        return self.mysql_pool.get_connection()
    
    def get_pymysql_connection(self):
        """Get PyMySQL connection from alternative pool."""
        return self.pymysql_pool.get_connection()
    
    def get_influx_client(self):
        """Get InfluxDB client."""
        return self.influx_pool.client
    
    def execute_mysql_query(self, query: str, params: Optional[tuple] = None, fetch: bool = True):
        """Execute MySQL query using connection pool."""
        return self.mysql_pool.execute_query(query, params, fetch)
    
    def health_check(self) -> Dict[str, bool]:
        """Perform health check on all database connections."""
        current_time = time.time()
        
        with self._lock:
            if current_time - self.last_health_check < self.health_check_interval:
                return self._last_health_status
            
            health_status = {
                'mysql': False,
                'influxdb': False
            }
            
            # Check MySQL
            try:
                with self.mysql_pool.get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                    cursor.close()
                    health_status['mysql'] = True
            except Exception as e:
                logger.error(f"MySQL health check failed: {e}")
            
            # Check InfluxDB
            try:
                if self.influx_pool.client:
                    self.influx_pool.client.ping()
                    health_status['influxdb'] = True
            except Exception as e:
                logger.error(f"InfluxDB health check failed: {e}")
            
            self._last_health_status = health_status
            self.last_health_check = current_time
            
            return health_status
    
    def close_all(self):
        """Close all database connections."""
        try:
            self.influx_pool.close()
            logger.info("All database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {e}")

# Global database manager instance
db_manager = DatabaseManager()