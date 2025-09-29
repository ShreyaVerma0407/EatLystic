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
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import Quagga from "@ericblade/quagga2";
import "../styles/NutrientPage.css";
import Footer from "../Components/Footer";

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
 "#FF6F61", "#6B5B95", "#88B04B", "#FFA07A",
  "#20B2AA", "#FF6347", "#9ACD32", "#4682B4",
];

const PIE_COLORS = [
  "#FF6F61", "#6B5B95", "#88B04B", "#FFA07A",
  "#20B2AA", "#FF6347", "#9ACD32", "#4682B4",
];

const NUTRIENTS = ["protein_g", "fat_total_g", "carbohydrates_total_g", "fiber_g"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// -------------------- API KEYS --------------------
const NINJAS_API_KEY = import.meta.env.VITE_NINJAS_API_KEY;
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
 // -------------------- YOLO Barcode Scanner --------------------
// -------------------- Barcode Scanner --------------------
const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || !scannerRef.current) {
      Quagga.stop();
      return;
    }
  let timeoutId = setTimeout(() => {
      alert("Barcode not detected. Please enter manually.");
      setIsActive(false);
    }, 35000); // 5 seconds

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: { width: 600, height: 420, facingMode: "environment" },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
          ],
        },
        locate: true,
      },
      (err) => {
        if (err) console.error("Quagga init error:", err);
        else Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      if (result?.codeResult?.code) {
            clearTimeout(timeoutId); // cancel timeout if detected
        onDetected(result.codeResult.code);
        setIsActive(false); // auto-stop after detection
      }
    });

    return () => {
           clearTimeout(timeoutId);
      Quagga.stop();
      Quagga.offDetected();
    };
  }, [isActive, onDetected]);

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <button
        onClick={() => setIsActive((prev) => !prev)}
         style={{
          marginBottom: 10,
          padding: "6px 12px",
          backgroundColor: "#FFA07A",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          zIndex: 20, // make sure button is above camera
          position: "relative",
        }}
      >
        {isActive ? "Stop Camera" : "Start Camera"}
      </button>

      <div
        ref={scannerRef}
       style={{
      width: 320,
      height: 200,
      border: "2px solid #FFA07A",
      borderRadius: 15,
      position: "absolute", // float above content
      top: 0,
      left: "20%",           // center horizontally
      transform: "translateX(-40%)", // adjust center
      display: isActive ? "block" : "none",
      zIndex: 10,
      backgroundColor: "#00000020", // optional slight overlay
    }}
      />
    </div>
  );
};




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

const fetchCustomProducts = async () => {
  try {
    const res = await fetch("/data/customProductsWithNutrients.json"); // public/dat/ folder
    if (!res.ok) throw new Error("Failed to load custom products JSON");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return {};
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
    fetch(`${API_BASE_URL}/pantry/${userId}`)
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
      consumedToSave.map(item => axios.post(`${API_BASE_URL}/consumed`, item))
    )
    .then(() => console.log("Consumed nutrients saved!"))
    .catch(err => console.error("Error saving consumed:", err.response?.data || err.message));
  }

  if (totalToSave.length > 0) {
    axios.post(
  `${API_BASE_URL}/nutrients-total`,
  totalToSave,
  { headers: { "Content-Type": "application/json" } }
)

    .then(() => console.log("Total nutrients saved!"))
    .catch(err => console.error("Error saving total:", err.response?.data || err.message));
  }

}, [pantryItems, nutritionCache, userId]);

  // -------------------- Search handlers --------------------
  const handleSearchByBarcode = async () => {
  setError("");
  setSearchNutrition(null);

  if (!selectedBarcode) return;
    if (selectedBarcode.length < 13) {
    setError("Barcode must be 13 digits long");
    return;
  }

  // 1️⃣ Check Open Food Facts
  let nutrition = await fetchFromOpenFoodFacts(selectedBarcode);
  let productName = selectedBarcode;

  // 2️⃣ If not found, check USDA
  if (!nutrition) nutrition = await fetchFromUSDA(selectedBarcode);

  // 3️⃣ If still not found, check your JSON in public
  if (!nutrition) {
    const customProducts = await fetchCustomProducts();
    if (customProducts[selectedBarcode]) {
      const p = customProducts[selectedBarcode];
      productName = p.name; // set product name from JSON
      nutrition = {
        source: "Custom JSON",
        nutrients: {
          protein_g: p.protein || 0,
          fat_total_g: p.fat || 0,
          carbohydrates_total_g: p.carbs || 0,
          fiber_g: p.fiber || 0, // optional, if you added
        },
      };
    }
  }

  if (nutrition) {
    setSearchNutrition({ ...nutrition, name: productName });
  } else {
    setError("No nutrition data found for this barcode");
  }
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
const barChartData = filteredPantry
  .filter(item => item.consumed && item.consumed > 0) // <-- filter only consumed items
  .map(item => {
    const nutrients = nutritionCache[item.name]?.nutrients || {};
    const data = { name: item.name };
    NUTRIENTS.forEach(n => data[n] = (nutrients[n] || 0) * (item.consumed || 0));
    return data;
  });

 const pieChartData = filteredCategories.map((category) => {
  const items = pantryByCategory[category] || [];
  const consumedItems = items.filter(item => item.consumed && item.consumed > 0);

  // sum consumed nutrients
  const totalNutrients = consumedItems.reduce((acc, item) => {
    const nutrients = nutritionCache[item.name]?.nutrients || {};
    NUTRIENTS.forEach(n => {
      acc[n] = (acc[n] || 0) + (nutrients[n] || 0) * item.consumed;
    });
    return acc;
  }, {});

  return {
    name: category,
    value: consumedItems.length, // slice size
    nutrients: totalNutrients,   // store total nutrients
  };
}).filter(entry => entry.value > 0); // remove empty categories

// toolpit for pie chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: "#fff", padding: 10, border: "1px solid #ccc" }}>
        <strong>{data.name}</strong>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {NUTRIENTS.map(n => (
            <li key={n}>
              {n.replace("_", " ")}: {data.nutrients[n] ? data.nutrients[n].toFixed(2) : 0} g
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

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
      <Navbar style={{ backgroundColor: "transparent" }} />

      <div
       style={{
    minHeight: "100vh",
    margin: 0,
    padding: "120px 24px 50px",
    background: "linear-gradient(to bottom, #fff8f0, #ffe6cc)",
    position: "relative",
    zIndex: 0,
    overflowX: "hidden",
    color: "black",
  }}

      >
        {/* Wave at Top */}
        <svg
  viewBox="0 0 1440 120"
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "120px",
    zIndex: 0,
  }}
>
          <path
            fill="#FFA07A"
            fillOpacity="0.3"
            d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,80C672,75,768,53,864,48C960,43,1056,53,1152,64C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>

     <div style={{ position: "relative", zIndex: 1 }}>
  <h1 style={{ textAlign: "center", color: "#FF6347", marginBottom: "30px" }}>
    Consumed Nutrients
  </h1>
<p style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 20 }}>
  All nutrient values are in grams (g) per 100g of the product.
</p>

</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Search Section */}
    <div
  style={{
    ...cardStyle,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 16,
    maxWidth: 500,
    margin: "0 auto",

  }}
>
  <h2 style={headerHighlightStyle}>Search Nutrients</h2>

  {/* Camera Preview + Start Button */}
  <div style={{ width: "100%", position: "relative", textAlign: "center" }}>
    <BarcodeScanner onDetected={setSelectedBarcode} />
  </div>

  {/* Barcode Input + Button */}
  <div style={{ display: "flex", gap: 6, width: "100%" }}>
    <input
      placeholder="Enter barcode manually..."
      value={selectedBarcode}
      onChange={(e) => setSelectedBarcode(e.target.value)}
      style={{ ...inputStyle, flex: 1 }}
        minLength={13}      // minimum 13 characters
  maxLength={13}
    />
    <button onClick={handleSearchByBarcode} style={buttonStyle}>
      Search
    </button>
  </div>

  {/* OR Separator */}
  <div style={{ textAlign: "center", fontWeight: "bold", margin: "4px 0" }}>OR</div>

  {/* Product Name Input + Button */}
  <div style={{ display: "flex", gap: 6, width: "100%" }}>
    <input
      placeholder="Product name..."
      value={manualName}
      onChange={(e) => setManualName(e.target.value)}
      style={{ ...inputStyle, flex: 1 }}
    />
    <button onClick={handleSearchByName} style={buttonStyle}>
      Search
    </button>
  </div>
</div>

            {error && <p style={{ color: "red" }}>{error}</p>}
           {searchNutrition && (
  <div>
    <h3 style={{ color: "#FF6347" }}>{searchNutrition.name}</h3> {/* show name */}
    <ul>
      {Object.entries(searchNutrition.nutrients).map(([k, v]) => (
        <li key={k}>{k}: {formatNutrient(v)}</li>
      ))}
    </ul>

  </div>
)}

          </div>

        {/* -------------------- Pantry Tables (Responsive Fixed) -------------------- */}
{filteredCategories.map((category, index) => {
  const items = pantryByCategory[category];
  if (!items || items.length === 0) return null;

  return (
    <section key={category} style={{ marginTop: index === 0 ? 20 : 40 }}>
      {/* Category Header */}
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: 8,
          marginBottom: 16,
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        {category}
      </h2>

      {/* Table Container */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 700, // ensures table doesn't shrink too much
            borderCollapse: "collapse",
            tableLayout: "fixed", // keeps columns fixed width
            color: "black",
            boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
            borderRadius: 12,
            backgroundColor: "#fff",
            border: "2px solid #FF6347",
          }}
        >
          <thead style={{ color: "#FF6347", backgroundColor: "#f7f7f7" }}>
            <tr>
              <th style={{ minWidth: 60, textAlign: "center" }}>Picture</th>
              <th style={{ minWidth: 120, textAlign: "center" }}>Name</th>
              <th style={{ minWidth: 80, textAlign: "center" }}>Quantity</th>
              {NUTRIENTS.map((n) => (
                <th
                  key={n}
                  style={{
                    minWidth: 80,
                    textAlign: "center",
                    wordBreak: "break-word", // prevents overlap
                    whiteSpace: "normal",
                  }}
                >
                  {n.replace("_", " ")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const nutrients = nutritionCache[item.name]?.nutrients || {};
              return (
                <tr key={item._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ textAlign: "center" }} data-label="Picture">
                    <img
                      src={
                        item.imageUrl ||
                        `https://via.placeholder.com/50?text=${encodeURIComponent(
                          item.name
                        )}`
                      }
                      alt={item.name}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }} data-label="Name">{item.name}</td>
                  <td style={{ textAlign: "center" }} data-label="Quantity">{item.quantity}</td>
                  {NUTRIENTS.map((n) => (
                    <td
                      key={n}
                      style={{ textAlign: "center", wordBreak: "break-word" }}
                      data-label={n.replace("_", " ")}
                    >
                      {formatNutrient((nutrients[n] || 0) * (item.consumed || 0))}
                    </td>
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
  <div style={chartCardStyle} className="chart-card-highlight">
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
  <div style={chartCardStyle} className="chart-card-highlight">
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
        <Tooltip content={<CustomPieTooltip />} />

      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

       {/* High / Medium / Low Summary Table with Pictures */}
<div style={{ marginTop: 40, overflowX: "auto" }}>
  <h3 style={{ textAlign: "center", color: "black", marginBottom: 16 }}>
    Consumed Nutrients Summary
  </h3>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 800,
      boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
      borderRadius: 12,
      backgroundColor: "#fff",
      border: "2px solid #FF6347",
    }}
  >
    <thead style={{ backgroundColor: "#f7f7f7", color: "#FF6347" }}>
      <tr>
        <th style={thStyle}>Picture</th>
        <th style={thStyle}>Name</th>
        {NUTRIENTS.map((n) => (
          <th key={n} style={thStyle}>
            {n.replace("_", " ")}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {pantryItems.map((item) => {
        const nutrients = nutritionCache[item.name]?.nutrients || {};
        return (
          <tr key={item._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
            {/* Picture */}
            <td style={tdStyle} data-label="Picture">
              <img
                src={
                  item.imageUrl ||
                  `https://via.placeholder.com/50?text=${encodeURIComponent(
                    item.name
                  )}`
                }
                alt={item.name}
                style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
              />
            </td>

            {/* Name */}
            <td style={tdStyle} data-label="Name">{item.name}</td>

            {/* Nutrients */}
            {NUTRIENTS.map((n) => {
              const level = categorizeNutrient(nutrients[n], n);
              return (
                <td
                  key={n}
                  style={{
                    ...tdStyle,
                    fontWeight: "bold",
                    color: nutrientColor(level),
                    textAlign: "center",
                  }}
                  data-label={n.replace("_", " ")}
                >
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
</>


  );
};

// -------------------- Styles --------------------
const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const headerHighlightStyle = {
  color: "#FF6347",
  textAlign: "center",
  marginBottom: 12,
};

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: 4,
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#FF6347",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const sectionStyle = {
  marginTop: 30,
  marginBottom: 30,
};

const thStyle = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "2px solid #ddd",
  wordBreak: "break-word",
  whiteSpace: "normal", // allow wrapping
};


const tdStyle = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  wordBreak: "break-word", // responsive for long text
};

const chartCardStyle = {
  ...cardStyle,
  flex: 1,
  minWidth: 300,

};

export default function NutrientPage() {
  return (
    <ErrorBoundary>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #fff8f0, #ffe6cc)",
        }}
      >
        <div style={{ flex: 1 }}>
          <NutrientPageContent />
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
