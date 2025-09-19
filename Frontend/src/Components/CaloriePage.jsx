import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Snacks",
  "Condiments",
  "Beverages",
  "Other",
];

// Bright colors for bar chart bars to make it colorful
const BAR_COLORS = [
  "#f28b82",
  "#fbbc04",
  "#fff475",
  "#ccff90",
  "#a7ffeb",
  "#cbf0f8",
  "#aecbfa",
  "#d7aefb",
];

// Bright colors for pie chart
const PIE_COLORS = [
  "#FF6F61",
  "#6B5B95",
  "#88B04B",
  "#FFA07A",
  "#20B2AA",
  "#FF6347",
  "#9ACD32",
  "#4682B4",
];

const CaloriePage = ({ currentUserId }) => {
  const [pantry, setPantry] = useState([]);
  const [caloriesMap, setCaloriesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCalories, setSearchCalories] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Fetch pantry items for the current user
  useEffect(() => {
    if (!currentUserId) return;
    axios.get(`${API_BASE_URL}/pantry/${currentUserId}`)
      .then((res) => {
        if (res.data.status === "success") setPantry(res.data.data);
        else alert("Failed to fetch pantry");
      })
      .catch(() => alert("Error fetching pantry"));
  }, [currentUserId]);

  // Fetch calories per pantry item
  useEffect(() => {
    if (pantry.length === 0) return;

    async function fetchCalories() {
      const newMap = {};
      for (const item of pantry) {
        try {
          const res = await axios.get(`${API_BASE_URL}/calorie`, { params: { item: item.name } });

          newMap[item._id] = res.data.calories || 0;
        } catch {
          newMap[item._id] = 0;
        }
      }
      setCaloriesMap(newMap);
    }
    fetchCalories();
  }, [pantry]);

  // Automatically save consumed calories to consumptionlog DB
  useEffect(() => {
    if (!currentUserId || pantry.length === 0) return;

    async function saveConsumptionLogs() {
      for (const item of pantry) {
        if (item.consumed > 0) {
          try {
            const caloriesPerItem = caloriesMap[item._id] || 0;
            const caloriesConsumed = caloriesPerItem * item.consumed;

            await axios.post(`${API_BASE_URL}/consumption/log`, {
  userId: currentUserId,
  pantryItemId: item._id,
  quantityConsumed: item.consumed,
  caloriesConsumed,
});

          } catch (error) {
            console.error(`Failed to save consumption log for ${item.name}`, error);
          }
        }
      }
    }

    saveConsumptionLogs();
  }, [pantry, caloriesMap, currentUserId]);

  // Group pantry items by category
  const pantryByCategory = CATEGORIES.reduce((grouped, category) => {
    grouped[category] = pantry.filter((item) => item.category === category);
    return grouped;
  }, {});

  // Filter categories with items
  const categoriesWithItems = CATEGORIES.filter(
    (category) => (pantryByCategory[category] || []).length > 0
  );

  // Split categories into rows of 2 for display
  const rowsOfCategories = [];
  for (let i = 0; i < categoriesWithItems.length; i += 2) {
    rowsOfCategories.push(categoriesWithItems.slice(i, i + 2));
  }

  // Data for consumed items bar chart
  const barChartData = pantry
    .filter((item) => item.consumed > 0)
    .map((item) => ({
      name: item.name,
      calories: (caloriesMap[item._id] || 0) * item.consumed,
      consumedQuantity: item.consumed,
      caloriesPerItem: caloriesMap[item._id] || 0,
    }));

  // Data for calories by category pie chart
  const pieChartData = categoriesWithItems
    .map((category) => {
      const items = pantryByCategory[category];
      const totalCalories = items.reduce((sum, item) => {
        const cals = caloriesMap[item._id] || 0;
        return sum + cals * item.quantity;
      }, 0);
      return {
        name: category,
        calories: totalCalories,
      };
    })
    .filter((entry) => entry.calories > 0);

  // Search calories for any item from API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/calorie`, {
  params: { item: searchTerm },
});

      setSearchCalories(res.data.calories || 0);
    } catch {
      alert("Failed to fetch calorie info");
      setSearchCalories(null);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Calculate total calories in pantry
  const totalPantryCalories = pantry.reduce((accumulator, item) => {
    const cals = caloriesMap[item._id] || 0;
    return accumulator + cals * item.quantity;
  }, 0);

  return (
    <>
      <Navbar
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          margin: 0,
          padding: 0,
          zIndex: 1000,
        }}
      />
      <div
        style={{
          padding: "100px 24px 40px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 64,
          backgroundColor: "#fff3e0",
          borderRadius: 12,
          minHeight: "100vh",
        }}
      >
        {/* Search Calories Feature */}
        <div style={cardStyle}>
          <h2 style={headerHighlightStyle}>Search Calories for Any Item</h2>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: 8, marginBottom: 8 }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter ingredient name..."
              style={inputStyle}
            />
            <button type="submit" disabled={loadingSearch} style={buttonStyle}>
              {loadingSearch ? "Searching..." : "Search"}
            </button>
          </form>
          {searchCalories !== null && (
            <p style={{ fontWeight: "bold", fontSize: 16 }}>
              Calories in{" "}
              <span style={{ color: "#fc8019" }}>{searchTerm}</span>:{" "}
              {searchCalories} kcal
            </p>
          )}
        </div>

        {/* Pantry Calorie Count Title */}
        <h1 style={orangeTitleWhiteBgStyle}>Pantry Calorie Count</h1>

        {/* Pantry Categories Display */}
        {rowsOfCategories.map((row, idx) => (
          <div key={idx} style={{ display: "flex", gap: 24 }}>
            {row.map((category) => {
              const items = pantryByCategory[category];
              if (!items || items.length === 0) return null;

              const categoryCalories = items.reduce((sum, item) => {
                const cals = caloriesMap[item._id] || 0;
                return sum + cals * item.quantity;
              }, 0);

              return (
                <section
                  key={category}
                  style={{ ...sectionStyle, borderColor: "#fc8019" }}
                  className="category-table"
                >
                  <h2 style={categoryTitleStyle}>{category}</h2>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 8,
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f0f0f0",color: "black"  }}>
                        <th style={thStyle}>Picture</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Quantity</th>
                        <th style={thStyle}>Calories Per Item</th>
                        <th style={thStyle}>Total Calories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id} style={{ borderBottom: "1px solid #ddd" ,color: "black" }}>
                          <td style={tdStyle}>
                            <img
                              src={
                                item.imageUrl ||
                                `https://via.placeholder.com/50?text=${encodeURIComponent(
                                  item.name
                                )}`
                              }
                              alt={item.name}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          </td>
                          <td style={tdStyle}>{item.name}</td>
                          <td style={tdStyle}>{item.quantity}</td>
                          <td style={tdStyle}>
                            {(caloriesMap[item._id] ?? "Loading...") + " kcal"}
                          </td>
                          <td style={tdStyle}>
                            {(((caloriesMap[item._id] || 0) * item.quantity).toFixed(0)) +
                              " kcal"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div
                    style={{ textAlign: "right", fontWeight: "bold", padding: "0 16px 16px" }}
                  >
                    Total Calories in {category}: {categoryCalories.toFixed(0)} kcal
                  </div>
                </section>
              );
            })}
          </div>
        ))}

        {/* Total calories present in pantry */}
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18,
            color: "#fc8019",
            marginBottom: 8,
          }}
        >
          Total calories present in your pantry are {totalPantryCalories.toFixed(0)} kcal
        </p>

        {/* Visualise Your Calories Title */}
        <h1 style={orangeTitleWhiteBgStyle}>Visualise Your Calories</h1>

        {/* Charts Row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Bar Chart */}
          <div style={{ ...chartCardStyle, flex: "1 1 580px", minWidth: 300 }}>
            <h3 style={{ marginBottom: 16, fontWeight: "bold", fontSize: 20 }}>
              Calories Consumed So Far
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barChartData} margin={{ bottom: 100 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#064420" }}
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={90}
                  tickLine={false}
                  axisLine={{ stroke: "#064420" }}
                  label={null}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#064420" }}
                  tickLine={false}
                  axisLine={{ stroke: "#064420" }}
                  label={null}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                <Legend
                  verticalAlign="bottom"
                  align="right"
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: "#064420", fontWeight: "bold" }}>{value}</span>
                  )}
                />
                <Bar dataKey="calories" name="Total Calories">
                  {barChartData.map((entry, index) => (
                    <Cell key={`calorie-cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
                <Bar
                  dataKey="consumedQuantity"
                  name="Items Consumed"
                  maxBarSize={20}
                  fill="#0B6623"
                >
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`qty-cell-${index}`}
                      fill={BAR_COLORS[(index + 3) % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{ ...chartCardStyle, flex: "1 1 380px", minWidth: 300 }}>
            <h3 style={{ marginBottom: 16, fontWeight: "bold", fontSize: 20 }}>
              Calories by Category
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="calories"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelStyle={{ fontWeight: "bold" }}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(0)} kcal`}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumed Calories Section */}
        <h1 style={orangeTitleWhiteBgStyle}>Consumed Calories</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
              borderRadius: 12,
              backgroundColor: "#fff",
              border: "2px solid #fc8019",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" , color: "black" }}>
                <th style={thStyle}>Picture</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Quantity Consumed</th>
                <th style={thStyle}>Calories Per Item</th>
                <th style={thStyle}>Total Calories</th>
                <th style={thStyle}>Calorie Zone</th>
              </tr>
            </thead>
            <tbody>
              {pantry
                .filter((item) => item.consumed > 0)
                .map((item) => {
                  const caloriesPerItem = caloriesMap[item._id] || 0;
                  const totalCalories = caloriesPerItem * item.consumed;

                  let zoneLabel = "";
                  let zoneColor = "";
                  if (caloriesPerItem < 100) {
                    zoneLabel = "Low Calorie (Green Zone)";
                    zoneColor = "#d0f0c0"; // light green
                  } else if (caloriesPerItem >= 100 && caloriesPerItem <= 200) {
                    zoneLabel = "Borderline/Moderate Calorie (Yellow Zone)";
                    zoneColor = "#fff9c4"; // light yellow
                  } else {
                    zoneLabel = "High Calorie (Red Zone)";
                    zoneColor = "#ffcccb"; // light red
                  }

                  return (
                    <tr key={item._id} style={{ borderBottom: "1px solid #ddd",color: "black"  }}>
                      <td style={tdStyle}>
                        <img
                          src={
                            item.imageUrl ||
                            `https://via.placeholder.com/50?text=${encodeURIComponent(item.name)}`
                          }
                          alt={item.name}
                          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                        />
                      </td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>{item.consumed}</td>
                      <td style={tdStyle}>{caloriesPerItem + " kcal"}</td>
                      <td style={tdStyle}>{totalCalories.toFixed(0) + " kcal"}</td>
                      <td style={{ ...tdStyle, backgroundColor: zoneColor, fontWeight: "bold" }}>
                        {zoneLabel}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "20px 0",
          borderTop: "1px solid #ddd",
          color: "#666",
          fontSize: 16,
          fontWeight: "bold",
          backgroundColor: "#fff4e5",
          marginTop: 40,
          boxShadow: "0 -3px 10px rgb(0 0 0 / 0.1)",
        }}
      >
        Track "Know your calories, control your goals!"
      </footer>

      <style>{`
        .category-table {
          box-shadow: 0 3px 8px rgb(0 0 0 / 0.1);
          border-radius: 8px;
          border: 2px solid #fc8019;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          background-color: #fff;
        }
        .category-table:hover {
          border-color: #ea6c00 !important;
          box-shadow: 0 0 12px rgba(234, 108, 0, 0.7);
        }
        div[style*="padding: 100px"] > div {
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          background-color: #fff;
          padding: 24px;
          margin-bottom: 20px;
          border: 2px solid #fc8019;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        div[style*="padding: 100px"] > div:hover {
          border-color: #ea6c00 !important;
          box-shadow: 0 0 15px rgba(234, 108, 0, 0.7);
        }
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: Arial, sans-serif;
          background: #fff3e0;
        }
        div > div > div > div > div > div[style*="chartCardStyle"] {
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 16px;
          background-color: #fff;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          border: 2px solid #fc8019;
        }
        div > div > div > div > div > div[style*="chartCardStyle"]:hover {
          border-color: #ea6c00 !important;
          box-shadow: 0 0 15px rgba(234, 108, 0, 0.7);
        }
      `}</style>
    </>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          fontSize: 14,
        }}
      >
        <p>
          <strong>{data.name}</strong>
        </p>
        <p>Calories per Item: {data.caloriesPerItem} kcal</p>
        <p>Items Consumed: {data.consumedQuantity}</p>
        <p>Total Calories: {data.calories.toFixed(0)} kcal</p>
      </div>
    );
  }
  return null;
};

const cardStyle = {
  maxWidth: 600,
  margin: "0 auto 40px",
  padding: 20,
  boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
  borderRadius: 12,
  backgroundColor: "#fff",
};

const orangeTitleWhiteBgStyle = {
  color: "#fc8019",
  textShadow: "1px 1px 5px #cc6200",
  padding: 15,
  backgroundColor: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(252, 128, 25, 0.6)",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "2.2rem",
  userSelect: "none",
};

const sectionStyle = {
  flex: 1,
  padding: 16,
  boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: 8,
  backgroundColor: "#fff",
  border: "2px solid #fc8019",
  transition: "border-color 0.3s ease, box-shadow 0.3s ease",
};

const categoryTitleStyle = {
  paddingBottom: 8,
  color: "#fc8019",
  fontWeight: "bold",
  textShadow: "1px 1px 3px #cc6200",
  borderBottom: "2px solid #eee",
};

const thStyle = {
  padding: "12px 8px",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px 8px",
  textAlign: "left",
  verticalAlign: "middle",
};

const inputStyle = {
  flexGrow: 1,
  padding: 8,
  fontSize: 16,
  borderRadius: 4,
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "8px 16px",
  cursor: "pointer",
};

const headerHighlightStyle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#fc8019",
  textShadow: "1px 1px 3px #cc6200",
};

const chartCardStyle = {
  flex: "1 1 100%",
  maxWidth: 960,
  boxShadow: "0 4px 15px rgba(0, 68, 32, 0.12)",
  borderRadius: 14,
  backgroundColor: "#fcfcfc",
  padding: 28,
  transition: "box-shadow 0.3s ease",
  border: "2px solid #fc8019",
  marginBottom: 32,
  color:"black",
};

export default CaloriePage;
