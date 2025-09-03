import React, { useState, useEffect } from "react";

const Try = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data/recipe.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load JSON: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error loading JSON");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, whiteSpace: "pre-wrap", backgroundColor: "#f5f5f5" }}>
      <h2>Recipe JSON Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Try;
