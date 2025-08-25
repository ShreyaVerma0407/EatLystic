import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import pLimit from "p-limit";
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
import nutrientData from "../data/nutrient.json";

// -------------------- Error Boundary --------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red" }}>
          <h2>Something went wrong</h2>
          <pre>{this.state.errorMsg}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// -------------------- Constants --------------------
const CATEGORIES = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Snacks",
  "Condiments",
  "Beverages",
  "Other",
];

const BAR_COLORS = [
  "#f28b82", "#fbbc04", "#fff475", "#ccff90",
  "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb",
];

const PIE_COLORS = [
  "#FF6F61", "#6B5B95", "#88B04B", "#FFA07A",
  "#20B2AA", "#FF6347", "#9ACD32", "#4682B4",
];

const NUTRIENTS = ["protein_g", "fat_total_g", "carbohydrates_total_g", "fiber_g"];

// -------------------- API KEYS --------------------
const NINJAS_API_KEY = "LJcbyLP0Ka89agOhKykJCQ==vAqHCOEHEgTYJ61I";
const USDA_API_KEY = "CX0hGlYtG7cX9dyhSAsZnoLgJtTly9aa02hIqwpQ";

// -------------------- Fetch Functions --------------------
const fetchFromLocalJson = (query) => {
  if (!query) return null;
  const found = nutrientData.find(
    (item) => item.name && item.name.toLowerCase() === query.toLowerCase()
  );
  if (found) {
    return {
      source: "Local JSON",
      nutrients: {
        protein_g: Number(found.protein_g) || 0,
        fat_total_g: Number(found.fat_g) || 0,
        carbohydrates_total_g: Number(found.carbohydrates_g) || 0,
        fiber_g: Number(found.fiber_g) || 0,
      },
    };
  }
  return null;
};

const fetchFromNinjas = async (query) => {
  try {
    const res = await axios.get(
      `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      { headers: { "X-Api-Key": NINJAS_API_KEY } }
    );
    if (res.data && res.data.length > 0) {
      const combined = res.data.reduce((acc, item) => ({
        protein_g: (acc.protein_g || 0) + (item.protein_g || 0),
        fat_total_g: (acc.fat_total_g || 0) + (item.fat_total_g || 0),
        carbohydrates_total_g: (acc.carbohydrates_total_g || 0) + (item.carbohydrates_total_g || 0),
        fiber_g: (acc.fiber_g || 0) + (item.fiber_g || 0),
      }), {});
      return { source: "Ninjas API", nutrients: combined };
    }
    return null;
  } catch (e) {
    console.error("Ninjas API error:", e.message);
    return null;
  }
};

const fetchFromUSDA = async (query) => {
  try {
    const res = await axios.post(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}`,
      { query }
    );
    if (res.data.foods && res.data.foods.length > 0) {
      const food = res.data.foods[0];
      const nutrients = {};
      food.foodNutrients.forEach((nutrient) => {
        const name = nutrient.nutrientName.toLowerCase();
        switch (name) {
          case "protein": nutrients.protein_g = Number(nutrient.value) || 0; break;
          case "total lipid (fat)": nutrients.fat_total_g = Number(nutrient.value) || 0; break;
          case "carbohydrate, by difference": nutrients.carbohydrates_total_g = Number(nutrient.value) || 0; break;
          case "fiber, total dietary": nutrients.fiber_g = Number(nutrient.value) || 0; break;
          default: break;
        }
      });
      return { source: "USDA API", nutrients };
    }
    return null;
  } catch (e) {
    console.error("USDA API error:", e.message);
    return null;
  }
};

const fetchFromOpenFoodFacts = async (query) => {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`
    );
    if (res.data.products && res.data.products.length > 0) {
      const n = res.data.products[0].nutriments || {};
      return {
        source: "Open Food Facts",
        nutrients: {
          protein_g: Number(n["proteins_100g"] || 0),
          fat_total_g: Number(n["fat_100g"] || 0),
          carbohydrates_total_g: Number(n["carbohydrates_100g"] || 0),
          fiber_g: Number(n["fiber_100g"] || 0),
        },
      };
    }
    return null;
  } catch (e) {
    console.error("Open Food Facts API error:", e.message);
    return null;
  }
};

const fetchNutritionData = async (query) => {
  if (!query) return null;
  const localResult = fetchFromLocalJson(query);
  if (localResult) return localResult;

  let result = await fetchFromNinjas(query);
  if (result) return result;

  result = await fetchFromUSDA(query);
  if (result) return result;

  return await fetchFromOpenFoodFacts(query);
};

const formatNutrient = (val) =>
  typeof val === "number" && isFinite(val) ? Number(val).toFixed(2) : "N/A";

// -------------------- Nutrient Page Component --------------------
const NutrientPageContent = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [nutritionCache, setNutritionCache] = useState({});
  const [error, setError] = useState("");
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [searchNutrition, setSearchNutrition] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingPantryNutri, setLoadingPantryNutri] = useState(false);
  const userId = localStorage.getItem("userId");
  const lastSavedConsumed = useRef({});
  const lastSavedTotal = useRef({});
  const limit = pLimit(5);

  // Fetch pantry items
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3001/api/pantry/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const itemsWithConsumed = data.data.map(item => ({
            ...item,
            consumed: item.consumed ?? undefined,
          }));
          setPantryItems(itemsWithConsumed);
        }
      })
      .catch(() => setError("Error fetching pantry items"));
  }, [userId]);

  // Fetch nutrition for pantry items
  useEffect(() => {
    if (pantryItems.length === 0) return;

    const fetchAllNutritionLimited = async (items) => {
      setLoadingPantryNutri(true);
      const newCache = { ...nutritionCache };
      try {
        await Promise.all(items.map((item) =>
          limit(async () => {
            if (!item.name) return;
            if (newCache[item.name]) return;
            const nutrition = await fetchNutritionData(item.name);
            if (nutrition) newCache[item.name] = nutrition;
          })
        ));
        setNutritionCache(newCache);
      } catch (e) {
        console.error("Error fetching pantry nutrition:", e);
        setError("Failed to load some nutrition data");
      } finally {
        setLoadingPantryNutri(false);
      }
    };

    fetchAllNutritionLimited(pantryItems);
  }, [pantryItems]);

  // -------------------- Save Consumed & Total Nutrients --------------------
useEffect(() => {
  if (!userId || pantryItems.length === 0 || Object.keys(nutritionCache).length === 0) return;

  const consumedToSave = [];
  const totalToSave = [];

  pantryItems.forEach(item => {
    const nutrients = nutritionCache[item.name]?.nutrients || {};
    const key = `${userId}-${item.name}`; // Unique key

    // -------------------- Consumed --------------------
    const consumedQuantity = item.consumed != null ? item.consumed : 0; // default to 0
    const consumedPayload = {
      userId,
      itemName: item.name,
      consumedQuantity,
      nutrients: {
        protein_g: (nutrients.protein_g || 0) * consumedQuantity,
        fat_total_g: (nutrients.fat_total_g || 0) * consumedQuantity,
        carbohydrates_total_g: (nutrients.carbohydrates_total_g || 0) * consumedQuantity,
        fiber_g: (nutrients.fiber_g || 0) * consumedQuantity,
      }
    };

    // Save only if changed
    const prevConsumed = lastSavedConsumed.current[key];
    const currentConsumedStr = JSON.stringify(consumedPayload);
    if (currentConsumedStr !== prevConsumed) {
      consumedToSave.push(consumedPayload);
      lastSavedConsumed.current[key] = currentConsumedStr;
    }

    // -------------------- Total --------------------
    const totalPayload = {
      userId,
      itemName: item.name,
      nutrients: {
        protein_g: Number(nutrients.protein_g || 0),
        fat_total_g: Number(nutrients.fat_total_g || 0),
        carbohydrates_total_g: Number(nutrients.carbohydrates_total_g || 0),
        fiber_g: Number(nutrients.fiber_g || 0),
      }
    };

    const prevTotal = lastSavedTotal.current[key];
    const currentTotalStr = JSON.stringify(totalPayload);
    if (currentTotalStr !== prevTotal) {
      totalToSave.push(totalPayload);
      lastSavedTotal.current[key] = currentTotalStr;
    }
  });

  // -------------------- Send to Backend --------------------
  if (consumedToSave.length > 0) {
    axios.all(
      consumedToSave.map(item => axios.post("http://localhost:3001/api/consumed", item))
    )
    .then(() => console.log("Consumed nutrients saved!"))
    .catch(err => console.error("Error saving consumed:", err.response?.data || err.message));
  }

  if (totalToSave.length > 0) {
    axios.post(
      "http://localhost:3001/api/nutrients-total",
      totalToSave,
      { headers: { "Content-Type": "application/json" } }
    )
    .then(() => console.log("Total nutrients saved!"))
    .catch(err => console.error("Error saving total:", err.response?.data || err.message));
  }

}, [pantryItems, nutritionCache, userId]);

  // -------------------- Search handlers --------------------
  const handleSearchByBarcode = async () => {
    setError(""); setSearchNutrition(null);
    if (!selectedBarcode) return;
    const nutrition = await fetchNutritionData(selectedBarcode);
    if (nutrition) setSearchNutrition(nutrition);
    else setError("No nutrition data found for this barcode");
  };

  const handleSearchByName = async () => {
    setError(""); setSearchNutrition(null);
    if (!manualName) return;
    const nutrition = await fetchNutritionData(manualName);
    if (nutrition) setSearchNutrition(nutrition);
    else setError("No nutrition data found for this name");
  };

  const filteredPantry =
    selectedCategory === "All"
      ? pantryItems
      : pantryItems.filter((item) => item.category === selectedCategory);

  const pantryByCategory = CATEGORIES.reduce((grouped, category) => {
    grouped[category] = filteredPantry.filter((item) => item.category === category);
    return grouped;
  }, {});

  const filteredCategories = CATEGORIES.filter(
    (category) => category !== "All" && (pantryByCategory[category] || []).length > 0
  );

  // -------------------- Charts --------------------
  const barChartData = filteredPantry.map(item => {
    const nutrients = nutritionCache[item.name]?.nutrients || {};
    const data = { name: item.name };
    NUTRIENTS.forEach(n => data[n] = (nutrients[n] || 0) * (item.consumed || 0));
    return data;
  });

  const pieChartData = filteredCategories.map((category, idx) => {
    const items = pantryByCategory[category] || [];
    return { name: category, value: items.length };
  });

  // -------------------- High / Medium / Low Logic --------------------
  const categorizeNutrient = (val, nutrient) => {
    if (!val) return "Low";
    switch (nutrient) {
      case "protein_g": return val >= 10 ? "High" : val >= 5 ? "Medium" : "Low";
      case "fat_total_g": return val >= 20 ? "High" : val >= 10 ? "Medium" : "Low";
      case "carbohydrates_total_g": return val >= 50 ? "High" : val >= 25 ? "Medium" : "Low";
      case "fiber_g": return val >= 10 ? "High" : val >= 5 ? "Medium" : "Low";
      default: return "Low";
    }
  };

  const nutrientColor = (level) => {
    switch(level) {
      case "High": return "#FF6B6B";
      case "Medium": return "#FFA500";
      case "Low": return "#4CAF50";
      default: return "#ddd";
    }
  };


  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          padding: "120px 24px 50px",
          background: "linear-gradient(to bottom, #fff8f0, #ffe6cc)",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Wave at Top */}
        <svg viewBox="0 0 1440 120" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "120px", zIndex: 0 }}>
          <path
            fill="#FFA07A"
            fillOpacity="0.3"
            d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,80C672,75,768,53,864,48C960,43,1056,53,1152,64C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Search Section */}
          <div style={cardStyle}>
            <h2 style={headerHighlightStyle}>Search Nutrients</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Barcode..."
                value={selectedBarcode}
                onChange={(e) => setSelectedBarcode(e.target.value)}
                style={inputStyle}
              />
              <button onClick={handleSearchByBarcode} style={buttonStyle}>Search Barcode</button>
              <span style={{ alignSelf: "center", fontWeight: "bold" }}>OR</span>
              <input
                placeholder="Product name..."
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                style={inputStyle}
              />
              <button onClick={handleSearchByName} style={buttonStyle}>Search Name</button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {searchNutrition && (
              <div>
                <ul>
                  {Object.entries(searchNutrition.nutrients).map(([k, v]) => (
                    <li key={k}>{k}: {formatNutrient(v)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pantry Tables */}
          {filteredCategories.map((category) => {
            const items = pantryByCategory[category];
            if (!items || items.length === 0) return null;
            return (
              <section key={category} style={sectionStyle}>
                <h2 style={{ textAlign: "center", color: "#333", borderBottom: "2px solid #f0f0f0", paddingBottom: 8 }}>{category}</h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                    <thead style={{ backgroundColor: "#f7f7f7" }}>
                      <tr>
                        <th style={thStyle}>Picture</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Quantity</th>
                        {NUTRIENTS.map((n) => <th key={n} style={thStyle}>{n.replace("_", " ")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const nutrients = nutritionCache[item.name]?.nutrients || {};
                        return (
                          <tr key={item._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                            <td style={tdStyle}>
                              <img
                                src={item.imageUrl || `https://via.placeholder.com/50?text=${encodeURIComponent(item.name)}`}
                                alt={item.name}
                                style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                              />
                            </td>
                            <td style={tdStyle}>{item.name}</td>
                            <td style={tdStyle}>{item.quantity}</td>
                            {NUTRIENTS.map((n) => (
                              <td key={n} style={tdStyle}>{formatNutrient((nutrients[n] || 0) * (item.consumed ||0))}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

            );
          })}

          {/* Charts Row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 40 }}>
            {/* Bar Chart */}
            <div style={chartCardStyle}>
              <h3>Consumed Nutrients by Item</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {NUTRIENTS.map((n, idx) => (
                    <Bar key={n} dataKey={n} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={chartCardStyle}>
              <h3>Items by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.name} (${entry.value})`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* High / Medium / Low Summary Table */}
          <div style={{ marginTop: 40, overflowX: "auto" }}>
            <h3>High / Medium / Low Nutrient Summary</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead style={{ backgroundColor: "#f7f7f7" }}>
                <tr>
                  <th style={thStyle}>Name</th>
                  {NUTRIENTS.map((n) => <th key={n} style={thStyle}>{n.replace("_", " ")}</th>)}
                </tr>
              </thead>
              <tbody>
                {pantryItems.map((item) => {
                  const nutrients = nutritionCache[item.name]?.nutrients || {};
                  return (
                    <tr key={item._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={tdStyle}>{item.name}</td>
                      {NUTRIENTS.map((n) => {
                        const level = categorizeNutrient(nutrients[n], n);
                        return (
                          <td key={n} style={{ ...tdStyle, fontWeight: "bold", color: nutrientColor(level) }}>
                            {level}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
};

// -------------------- Styles --------------------
const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
  marginBottom: 20,
};

const inputStyle = {
  padding: 8,
  borderRadius: 4,
  border: "1px solid #ccc",
  flex: 1,
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#FFA07A",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const thStyle = {
  padding: 8,
  textAlign: "center",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: 8,
  textAlign: "center",
};

const sectionStyle = {
  marginTop: 40,
};

const chartCardStyle = {
  flex: 1,
  minWidth: 320,
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: 8,
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
};

const headerHighlightStyle = {
  color: "#FF6347",
};

export default function NutrientPage() {
  return (
    <ErrorBoundary>
      <NutrientPageContent />
    </ErrorBoundary>
  );
}
