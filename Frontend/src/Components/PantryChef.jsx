import React, { useState, useEffect } from "react";
const PantryChef = ({ currentUserId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!currentUserId) {
      setPantryItems([]);
      setError("No user ID provided.");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3001/api/pantry/${currentUserId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch pantry items. Status: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setPantryItems(result.data);
          if (result.data.length === 0) {
            setError("No pantry items found. Please add some ingredients.");
          }
        } else {
          setPantryItems([]);
          setError("Error: Unexpected API response format.");
        }
      })
      .catch((err) => {
        console.error("Error fetching pantry items:", err);
        setPantryItems([]);
        setError("Failed to load pantry items.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUserId]);
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#181824",
        color: "#fff",
        borderRadius: 12,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>My Pantry Items</h2>
      {loading && <p style={{ textAlign: "center" }}>Loading pantry items...</p>}
      {!loading && error && (
        <p style={{ color: "#ff6868", textAlign: "center" }}>{error}</p>
      )}
      {!loading && !error && pantryItems.length > 0 && (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {pantryItems.map((item) => (
            <li
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#33353e",
                margin: "0.5rem 0",
                padding: "12px 20px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                fontSize: "1.1rem",
              }}
            >
              <span>{item.name}</span>
              <span>
                {item.quantity} {item.unit || ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && pantryItems.length === 0 && (
        <p style={{ textAlign: "center" }}>
          Your pantry is empty. Start adding ingredients!
        </p>
      )}
    </div>
  );
};
export default PantryChef;