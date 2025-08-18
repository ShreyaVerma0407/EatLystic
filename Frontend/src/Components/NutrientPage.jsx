import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import pLimit from "p-limit";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// import nutrientData from "../data/nutrient.json"; // Adjust path as needed

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --------------------
// Error Boundary
// --------------------
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

// --------------------
// Constants
// --------------------
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

const NINJAS_API_KEY = "LJcbyLP0Ka89agOhKykJCQ==vAqHCOEHEgTYJ61I";
const USDA_API_KEY = "CX0hGlYtG7cX9dyhSAsZnoLgJtTly9aa02hIqwpQ";

// --------------------
// Helpers
// --------------------
const normalizeName = (name) =>
  name.toLowerCase().replace(/[^a-z\s]/gi, "").trim();

const formatNutrient = (val) => {
  const num = Number(val);
  return !isNaN(num) && isFinite(num) ? num.toFixed(2) : "N/A";
};

// --------------------
// Fetch from local JSON
// --------------------
function fetchFromLocalJson(query) {
  if (!query) return null;
  const lowerQuery = query.toLowerCase();
  const found = nutrientData.find(
    (item) =>
      item.name &&
      typeof item.name === "string" &&
      item.name.toLowerCase().includes(lowerQuery)
  );
  if (found) {
    return {
      source: "Local JSON",
      nutrients: {
        calories: found.calories || 0,
        protein_g: found.protein_g || 0,
        fat_total_g: found.fat_g || 0,
        carbohydrates_total_g: found.carbohydrates_g || 0,
        fiber_g: found.fiber_g || 0,
        sugar_g: found.sugar_g || 0,
      },
    };
  }
  return null;
}

// --------------------
// Fetch from APIs
// --------------------
async function fetchFromNinjas(query) {
  try {
    const res = await axios.get(
      `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(
        query
      )}`,
      { headers: { "X-Api-Key": NINJAS_API_KEY } }
    );
    if (res.data && res.data.length > 0) {
      const combined = res.data.reduce(
        (acc, item) => ({
          calories: (acc.calories || 0) + item.calories,
          protein_g: (acc.protein_g || 0) + item.protein_g,
          fat_total_g: (acc.fat_total_g || 0) + item.fat_total_g,
          carbohydrates_total_g:
            (acc.carbohydrates_total_g || 0) + item.carbohydrates_total_g,
          fiber_g: (acc.fiber_g || 0) + item.fiber_g,
          sugar_g: (acc.sugar_g || 0) + item.sugar_g,
        }),
        {}
      );
      return { source: "Ninjas API", nutrients: combined };
    }
    return null;
  } catch (e) {
    console.error("Ninjas API error:", e.message);
    return null;
  }
}

async function fetchFromUSDA(query) {
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
          case "energy":
          case "energy (kilocalories)":
            nutrients.calories = nutrient.value;
            break;
          case "protein":
            nutrients.protein_g = nutrient.value;
            break;
          case "total lipid (fat)":
            nutrients.fat_total_g = nutrient.value;
            break;
          case "carbohydrate, by difference":
            nutrients.carbohydrates_total_g = nutrient.value;
            break;
          case "fiber, total dietary":
            nutrients.fiber_g = nutrient.value;
            break;
          case "sugars, total including nlea":
          case "sugars, total":
            nutrients.sugar_g = nutrient.value;
            break;
          default:
        }
      });
      return { source: "USDA API", nutrients };
    }
    return null;
  } catch (e) {
    console.error("USDA API error:", e.message);
    return null;
  }
}

async function fetchFromOpenFoodFacts(query) {
  try {
    const encoded = encodeURIComponent(query);
    const res = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=5`
    );
    if (res.data.products && res.data.products.length > 0) {
      const product = res.data.products[0];
      const n = product.nutriments || {};
      const nutrients = {
        calories: n["energy-kcal_100g"] || n["energy_100g"] || 0,
        protein_g: n["proteins_100g"] || 0,
        fat_total_g: n["fat_100g"] || 0,
        carbohydrates_total_g: n["carbohydrates_100g"] || 0,
        fiber_g: n["fiber_100g"] || 0,
        sugar_g: n["sugars_100g"] || 0,
      };
      return { source: "Open Food Facts", nutrients };
    }
    return null;
  } catch (e) {
    console.error("Open Food Facts API error:", e.message);
    return null;
  }
}

// Combined fetcher
async function fetchNutritionData(query) {
  if (!query) return null;
  const localResult = fetchFromLocalJson(query);
  if (localResult) return localResult;

  let result = await fetchFromNinjas(query);
  if (result) return result;

  result = await fetchFromUSDA(query);
  if (result) return result;

  result = await fetchFromOpenFoodFacts(query);
  return result;
}

// --------------------
// Nutrition Chart
// --------------------
const NutritionChart = ({ nutrients }) => {
  const data = {
    labels: ["Calories", "Protein", "Fat", "Carbs", "Fiber", "Sugar"],
    datasets: [
      {
        label: "Total Nutrients",
        data: [
          nutrients.calories,
          nutrients.protein_g,
          nutrients.fat_total_g,
          nutrients.carbohydrates_total_g,
          nutrients.fiber_g,
          nutrients.sugar_g,
        ],
        backgroundColor: [
          "#fc8019",
          "#ffb347",
          "#ffcc99",
          "#66b3ff",
          "#99ff99",
          "#ff9999",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Nutrients per Category" },
    },
  };

  return <Bar data={data} options={options} />;
};

// --------------------
// Main Content
// --------------------
const NutrientPageContent = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [nutritionCache, setNutritionCache] = useState({});
  const [error, setError] = useState("");

  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [searchNutrition, setSearchNutrition] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const userId = localStorage.getItem("userId");
  const [loadingPantryNutri, setLoadingPantryNutri] = useState(false);
  const limit = pLimit(5);

  // Fetch pantry items
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3001/api/pantry/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setPantryItems(data.data);
      })
      .catch(() => setError("Error fetching pantry items"));
  }, [userId]);

  // Fetch nutrition for pantry
  useEffect(() => {
    if (pantryItems.length === 0) return;

    const fetchAllNutritionLimited = async (items) => {
      setLoadingPantryNutri(true);
      const newCache = { ...nutritionCache };
      try {
        await Promise.all(
          items.map((item) =>
            limit(async () => {
              const key = item.name.toLowerCase();
              if (newCache[key]) return;
              const simpleName = normalizeName(item.name);
              const nutrition = await fetchNutritionData(simpleName);
              if (nutrition) newCache[key] = nutrition;
              else
                newCache[key] = {
                  source: "Not Found",
                  nutrients: {
                    calories: 0,
                    protein_g: 0,
                    fat_total_g: 0,
                    carbohydrates_total_g: 0,
                    fiber_g: 0,
                    sugar_g: 0,
                  },
                };
            })
          )
        );
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

  // --------------------
  // Search Handlers
  // --------------------
  const handleSearchByBarcode = async () => {
    setError("");
    setSearchNutrition(null);
    if (!selectedBarcode) return;
    const nutrition = await fetchNutritionData(normalizeName(selectedBarcode));
    if (nutrition) setSearchNutrition(nutrition);
    else setError("No nutrition data found for this barcode");
  };

  const handleSearchByName = async () => {
    setError("");
    setSearchNutrition(null);
    if (!manualName) return;
    const nutrition = await fetchNutritionData(normalizeName(manualName));
    if (nutrition) setSearchNutrition(nutrition);
    else setError("No nutrition data found for this name");
  };

  const filteredPantry =
    selectedCategory === "All"
      ? pantryItems
      : pantryItems.filter((item) => item.category === selectedCategory);

  const pantryByCategory = CATEGORIES.reduce((grouped, category) => {
    grouped[category] = filteredPantry.filter(
      (item) => item.category === category
    );
    return grouped;
  }, {});

  const categoriesWithItems = CATEGORIES.filter(
    (category) =>
      (pantryByCategory[category] || []).length > 0 && category !== "All"
  );

  const rowsOfCategories = [];
  for (let i = 0; i < categoriesWithItems.length; i += 2) {
    rowsOfCategories.push(categoriesWithItems.slice(i, i + 2));
  }

  return (
    <>
      <Navbar
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
      />
      <div
        style={{ padding: "100px 24px 40px", maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Search Section */}
        <div style={cardStyle}>
          <h2 style={headerHighlightStyle}>
            Search Nutrients of Any Ingredient
          </h2>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
          >
            <input
              type="text"
              placeholder="Enter Barcode or Product Name..."
              value={selectedBarcode}
              onChange={(e) => setSelectedBarcode(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleSearchByBarcode} style={buttonStyle}>
              Search by Barcode
            </button>
            <span style={{ alignSelf: "center", fontWeight: "bold" }}>OR</span>
            <input
              type="text"
              placeholder="Enter Product Name..."
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleSearchByName} style={buttonStyle}>
              Search by Name
            </button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {searchNutrition && (
            <div style={{ marginTop: 20 }}>
              <h3>Nutrition Info (Source: {searchNutrition.source})</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nutrient</th>
                    <th style={thStyle}>Amount (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(searchNutrition.nutrients).map(
                    ([nutrient, val]) => (
                      <tr key={nutrient}>
                        <td style={tdStyle}>{nutrient.replace(/_/g, " ")}</td>
                        <td style={tdStyle}>{formatNutrient(val)}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Filter by Category */}
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <label style={{ fontWeight: "bold", marginRight: 8 }}>
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 16,
              minWidth: 160,
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loadingPantryNutri && (
          <p
            style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}
          >
            Loading pantry nutrition data...
          </p>
        )}

        {/* Pantry Tables */}
        {rowsOfCategories.map((row, idx) => (
          <div key={idx} style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            {row.map((category) => {
              const items = pantryByCategory[category];
              if (!items || items.length === 0) return null;

              return (
                <section
                  key={category}
                  style={{ ...sectionStyle, borderColor: "#fc8019" }}
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
                      <tr style={{ backgroundColor: "#f0f0f0" }}>
                        <th style={thStyle}>Picture</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Quantity</th>
                        <th style={thStyle}>Nutritional Content (per unit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const nutrition =
                          nutritionCache[item.name.toLowerCase()];
                        return (
                          <tr
                            key={item._id}
                            style={{ borderBottom: "1px solid #ddd" }}
                          >
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
                            <td
                              style={{
                                ...tdStyle,
                                fontSize: 14,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {nutrition && nutrition.nutrients ? (
                                <>
                                  <div>
                                    Calories:{" "}
                                    {formatNutrient(
                                      nutrition.nutrients.calories
                                    )}
                                  </div>
                                  <div>
                                    Protein:{" "}
                                    {formatNutrient(
                                      nutrition.nutrients.protein_g
                                    )}
                                  </div>
                                  <div>
                                    Fat:{" "}
                                    {formatNutrient(
                                      nutrition.nutrients.fat_total_g
                                    )}
                                  </div>
                                  <div>
                                    Carbs:{" "}
                                    {formatNutrient(
                                      nutrition.nutrients
                                        .carbohydrates_total_g
                                    )}
                                  </div>
                                  <div>
                                    Fiber:{" "}
                                    {formatNutrient(
                                      nutrition.nutrients.fiber_g
                                    )}
                                  </div>
                                </>
                              ) : (
                                <span style={{ color: "#aaa" }}>Loading...</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              );
            })}
          </div>
        ))}

        {/* Nutrition Graphs */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ color: "#fc8019", textAlign: "center", marginBottom: 24 }}>
            Nutrition Graphs by Category
          </h2>

          {(() => {
            const categoriesWithData = CATEGORIES.filter((cat) => {
              const items = pantryByCategory[cat];
              return cat !== "All" && items && items.length > 0;
            });

            const rows = [];
            for (let i = 0; i < categoriesWithData.length; i += 2) {
              rows.push(categoriesWithData.slice(i, i + 2));
            }

            return rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{ display: "flex", gap: 24, marginBottom: 32 }}
              >
                {row.map((category) => {
                  const items = pantryByCategory[category];
                  const combined = items.reduce(
                    (acc, item) => {
                      const nutri = nutritionCache[item.name.toLowerCase()];
                      if (!nutri || !nutri.nutrients) return acc;
                      acc.calories += nutri.nutrients.calories || 0;
                      acc.protein_g += nutri.nutrients.protein_g || 0;
                      acc.fat_total_g += nutri.nutrients.fat_total_g || 0;
                      acc.carbohydrates_total_g +=
                        nutri.nutrients.carbohydrates_total_g || 0;
                      acc.fiber_g += nutri.nutrients.fiber_g || 0;
                      acc.sugar_g += nutri.nutrients.sugar_g || 0;
                      return acc;
                    },
                    {
                      calories: 0,
                      protein_g: 0,
                      fat_total_g: 0,
                      carbohydrates_total_g: 0,
                      fiber_g: 0,
                      sugar_g: 0,
                    }
                  );

                  return (
                    <div
                      key={category}
                      style={{
                        flex: 1,
                        padding: 16,
                        borderRadius: 8,
                        border: "2px solid #fc8019",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <h3 style={{ color: "#333", marginBottom: 16 }}>{category}</h3>
                      <NutritionChart nutrients={combined} />
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </div>
    </>
  );
};

// --------------------
// Styles
// --------------------
const cardStyle = {
  padding: 20,
  marginBottom: 32,
  backgroundColor: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
  flex: 1,
  minWidth: 200,
};

const buttonStyle = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  backgroundColor: "#fc8019",
  color: "#fff",
  cursor: "pointer",
};

const headerHighlightStyle = {
  color: "#fc8019",
  textAlign: "center",
  marginBottom: 16,
};

const sectionStyle = {
  flex: 1,
  padding: 16,
  borderRadius: 8,
  border: "2px solid",
  backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const categoryTitleStyle = {
  marginBottom: 8,
  color: "#fc8019",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: 6,
  backgroundColor: "#f5f5f5",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: 6,
  textAlign: "center",
};

// --------------------
// Export Page
// --------------------
export default function NutrientPage() {
  return (
    <ErrorBoundary>
      <NutrientPageContent />
    </ErrorBoundary>
  );
}