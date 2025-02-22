from flask import Flask, jsonify
from database import DatabaseReader  # Import the class from database.py

# Initialize database reader
db_reader = DatabaseReader(
    host='localhost', 
    user='root', 
    password='f1309D1309', 
    database='compressor', 
    table='CompressorData'
)

# Initialize Flask app
app = Flask(__name__)

@app.route('/get_data', methods=['GET'])
def get_data():
    data = db_reader.get_next()
    if data:
        return jsonify(data)
    else:
        return jsonify({"message": "No more data"}), 404

if __name__ == '__main__':
    app.run(debug=True)
