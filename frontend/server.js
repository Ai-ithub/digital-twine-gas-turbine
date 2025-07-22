const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/sensor-data/latest", (req, res) => {
  exec("python3 ../backend/app.py", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python error:", error.message);
      return res.status(500).json({ error: "Python script failed" });
    }

    // Look for printed section
    const start = stdout.indexOf("Latest data from database:");
    if (start === -1) return res.status(404).json({ error: "No data found in output" });

    const raw = stdout.slice(start).trim().split("\n");
    const lines = raw.slice(1); // remove header line
    const headers = lines[0]?.trim().split(/\s+/); // try to detect column headers

    const data = lines.slice(1).map((line) => {
      const values = line.trim().split(/\s+/);
      return headers.reduce((obj, key, i) => {
        obj[key.toLowerCase()] = isNaN(values[i]) ? values[i] : Number(values[i]);
        return obj;
      }, {});
    });

    res.json(data);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy API running at http://localhost:${PORT}/sensor-data/latest`);
});
