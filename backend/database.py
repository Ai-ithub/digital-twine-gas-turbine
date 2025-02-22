import mysql.connector
from flask import Flask, jsonify

# Database Connection Class
class DatabaseReader:
    def __init__(self, host, user, password, database, table):
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor(dictionary=True)
        self.table = table
        self.cursor.execute(f"SELECT * FROM {self.table}")
        self.data = self.cursor.fetchall()
        self.index = 0
    
    def get_next(self):
        if self.index < len(self.data):
            record = self.data[self.index]
            self.index += 1
            return record
        else:
            return None