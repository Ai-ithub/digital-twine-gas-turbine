import { useEffect, useState } from "react";

const DataInserter = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_all_data");
        if (!response.ok) {
          throw new Error("❌ مشکل در دریافت داده");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError("❌ خطا در دریافت داده");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>📊 لیست داده‌ها</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {data.length > 0 ? (
          data.map((item, index) => <li key={index}>{JSON.stringify(item)}</li>)
        ) : (
          <p>⏳ در حال دریافت داده...</p>
        )}
      </ul>
    </div>
  );
};

export default DataInserter;
