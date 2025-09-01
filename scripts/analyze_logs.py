import sqlite3
import pandas as pd

conn = sqlite3.connect("logs.db")
query = "SELECT * FROM prediction_logs"
df = pd.read_sql_query(query, conn)

if not df.empty:
    avg_latency = df["latency"].mean()
    print(f"Average latency: {avg_latency:.2f} seconds")
    output_dist = df["output"].value_counts(normalize=True)
    print("Output distribution:")
    print(output_dist)
    if output_dist.max() > 0.8:
        print("Warning: Model might be biased!")
else:
    print("No logs found!")

conn.close()