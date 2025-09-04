// src/components/FoodList.jsx
import React, { useEffect, useState } from "react";

const FoodList = () => {
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    fetch("/data/food.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch food data");
        }
        return response.json();
      })
      .then((data) => {
        // Convert object to array with names
        const itemsArray = Object.entries(data).map(([name, details]) => ({
          name,
          ...details,
        }));
        setFoodItems(itemsArray);
      })
      .catch((error) => console.error(error));
  }, []);

  // Helper function to render values
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul>
          {value.map((v, i) => (
            <li key={i}>{typeof v === "object" ? JSON.stringify(v) : v}</li>
          ))}
        </ul>
      );
    } else if (typeof value === "object" && value !== null) {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    } else {
      return value;
    }
  };

  return (
    <div>
      <h2>Food Items</h2>
      {foodItems.length > 0 ? (
        <ul>
          {foodItems.map((item, index) => (
            <li key={index} style={{ marginBottom: "30px" }}>
              <h3>{item.name}</h3>
              {Object.keys(item).map(
                (key) =>
                  key !== "name" && (
                    <div key={key}>
                      <strong>{key}:</strong> {renderValue(item[key])}
                    </div>
                  )
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading food items...</p>
      )}
    </div>
  );
};

export default FoodList;
