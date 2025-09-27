import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import "../styles/Pantry.css";
import Navbar from "./Navbar"; // Added Navbar import
import Footer from "../components/Footer";

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

const NON_VEG_INGREDIENTS = [
  "meat",
  "Chicken",
  "Beef",
  "Lamb",
  "Pork",
  "Turkey",
  "Duck",
  "Veal",
  "Goat meat",
  "Fish",
  "Shrimp",
  "Lobster",
  "Crab",
  "Scallops",
  "Squid",
  "Oysters",
  "Mussels",
  "Clams",
  "Sausages",
  "Bacon",
  "Ham",
  "Salami",
  "Pepperoni",
  "Hot dogs",
  "Deli meats",
  "Venison",
  "Wild boar",
  "Rabbit",
  "Pheasant",
  "Quail",
  "Squirrel",
  "Eggs",
  "Milk",
  "Cheese",
  "Butter",
  "Yogurt",
  "Gelatin",
];

function isNonVeg(name) {
  if (!name) return false;
  const lcName = name.toLowerCase();
  return NON_VEG_INGREDIENTS.some((ingredient) =>
    lcName.includes(ingredient.toLowerCase())
  );
}

const INITIAL = [];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UNSPLASH_ACCESS_KEY =  import.meta.env.VITE_UNSPLASH_KEY;
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

const defaultImage = "/images/pantry.png";
const vegImage = "/images/pantrygreen.png";
const nonVegImage = "/images/pantryred.png";

function Pantry({ currentUserId }) {
  const [pantry, setPantry] = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    category: "",
    expiry: "",
    consumed: 0,
    imageUrl: "",
  });
  const [flipped, setFlipped] = useState({});
  const [globalFilters, setGlobalFilters] = useState({
    category: "",
    expiry: "",
    items: "",
    vegNonVeg: "",
  });
  const [categoryFilters, setCategoryFilters] = useState(
    CATEGORIES.reduce((acc, cat) => {
      acc[cat] = { expiry: "", items: "" };
      return acc;
    }, {})
  );

  if (!currentUserId) {
    return <Navigate to="/login" replace />;
  }

  const isVegFilter = globalFilters.vegNonVeg === "veg";
  const isNonVegFilter = globalFilters.vegNonVeg === "nonveg";

  const headerBackgroundImage = isVegFilter
    ? `url(${vegImage})`
    : isNonVegFilter
    ? `url(${nonVegImage})`
    : `url(${defaultImage})`;

  useEffect(() => {
    if (!currentUserId) return;

    fetch(`${API_BASE_URL}/pantry/${currentUserId}`)

      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setPantry(data.data);
        else alert("Failed to load pantry items");
      })
      .catch(() => alert("Error loading pantry items"));
  }, [currentUserId]);

  useEffect(() => {
    if (!newItem.name.trim()) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchImage() {
      try {
        const query = encodeURIComponent(newItem.name.trim());

        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`,
          { signal }
        );
        if (!unsplashRes.ok) throw new Error(`Unsplash Error: ${unsplashRes.status}`);
        const unsplashData = await unsplashRes.json();

        if (unsplashData.results?.length > 0) {
          setNewItem((prev) => ({
            ...prev,
            imageUrl: unsplashData.results[0].urls.small,
          }));
          return;
        }

        const edamamRes = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?ingr=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
          { signal }
        );
        const edamamData = await edamamRes.json();

        if (edamamData.parsed?.length > 0 && edamamData.parsed[0].food.image) {
          setNewItem((prev) => ({
            ...prev,
            imageUrl: edamamData.parsed[0].food.image,
          }));
        } else if (edamamData.hints?.length > 0 && edamamData.hints[0].food.image) {
          setNewItem((prev) => ({
            ...prev,
            imageUrl: edamamData.hints[0].food.image,
          }));
        } else {
          setNewItem((prev) => ({ ...prev, imageUrl: "" }));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Image fetch error:", err);
          setNewItem((prev) => ({ ...prev, imageUrl: "" }));
        }
      }
    }
    fetchImage();
    return () => controller.abort();
  }, [newItem.name]);

  const flip = (id, flipState) => setFlipped((f) => ({ ...f, [id]: flipState }));

  function clearForm() {
    setNewItem({
      name: "",
      quantity: 1,
      category: "",
      expiry: "",
      consumed: 0,
      imageUrl: "",
    });
    setEditingId(null);
  }

  const filterItem = (item) => {
    const catFilt = categoryFilters[item.category] || {};

    if (globalFilters.category && item.category !== globalFilters.category) return false;

    const expiryFilters = [globalFilters.expiry, catFilt.expiry].filter(Boolean);
    for (const ef of expiryFilters) {
      if (ef === "expired" && !(new Date(item.expiry) < new Date())) return false;
      if (ef === "notexpired" && !(new Date(item.expiry) >= new Date())) return false;
    }

    const itemsFilters = [globalFilters.items, catFilt.items].filter(Boolean);
    for (const itf of itemsFilters) {
      if (itf === "low" && !(item.quantity < 3)) return false;
      if (itf === "enough" && !(item.quantity >= 3)) return false;
    }

    if (globalFilters.vegNonVeg) {
      const nonVeg = isNonVeg(item.name);
      if (globalFilters.vegNonVeg === "veg" && nonVeg) return false;
      if (globalFilters.vegNonVeg === "nonveg" && !nonVeg) return false;
    }

    return true;
  };

  const pantryByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = pantry.filter((item) => item.category === cat && filterItem(item));
    return acc;
  }, {});

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Please log in first.");
      return;
    }

    if (!newItem.name || !newItem.category || !newItem.expiry) {
      alert("Please fill all fields!");
      return;
    }

    let updatedQuantity = Number(newItem.quantity);
    if (editingId) {
      updatedQuantity = Number(newItem.quantity) - Number(newItem.consumed);
      if (updatedQuantity < 0) updatedQuantity = 0;
    }

    const itemData = {
      userId: currentUserId,
      name: newItem.name.trim(),
      quantity: updatedQuantity,
      consumed: editingId ? Number(newItem.consumed) : 0,
      category: newItem.category,
      expiry: newItem.expiry,
      imageUrl: newItem.imageUrl || "",
    };

    if (editingId) {
      fetch(`${API_BASE_URL}/pantry/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setPantry((p) =>
              p.map((item) => (item._id === editingId ? data.data : item))
            );
            clearForm();
            setShowForm(false);
          } else {
            alert("Failed to update item");
          }
        })
        .catch(() => alert("Error updating pantry item"));
    } else {
      fetch(`${API_BASE_URL}/pantry`,  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setPantry([data.data, ...pantry]);
            clearForm();
            setShowForm(false);
          } else {
            alert("Failed to add item");
          }
        })
        .catch(() => alert("Error adding pantry item"));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      fetch(`${API_BASE_URL}/pantry/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setPantry((p) => p.filter((item) => item._id !== id));
          } else {
            alert("Failed to delete item");
          }
        })
        .catch(() => alert("Error deleting pantry item"));
    }
  };

  return (
    <div
      className={`pantry-page ${
        isVegFilter ? "veg-theme" : isNonVegFilter ? "nonveg-theme" : ""
      }`}
    >
      <Navbar /> {/* Navbar added at the top */}

      <header
        className="pantry-header"
        style={{ backgroundImage: headerBackgroundImage }}
      >
        <div className="pantry-header-text">
          <div className="title">WELCOME TO PANTRY</div>
          <div className="subtitle">
            Stock up with your favorite ingredients and create delicious meals
            every day!
          </div>
        </div>
      </header>

      <div className="controls-container">
        <button
          className="btn-add"
          onClick={() => {
            clearForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close Form" : editingId ? "Edit Item" : "+ Add Item"}
        </button>

        <div className="global-filters">
          <select
            value={globalFilters.category}
            onChange={(e) =>
              setGlobalFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={globalFilters.expiry}
            onChange={(e) =>
              setGlobalFilters((prev) => ({ ...prev, expiry: e.target.value }))
            }
          >
            <option value="">Expiry</option>
            <option value="expired">Expired</option>
            <option value="notexpired">Not Expired</option>
          </select>

          <select
            value={globalFilters.items}
            onChange={(e) =>
              setGlobalFilters((prev) => ({ ...prev, items: e.target.value }))
            }
          >
            <option value="">Quantity</option>
            <option value="low">Low (less than 3)</option>
            <option value="enough">Enough (3+)</option>
          </select>

          <select
            value={globalFilters.vegNonVeg}
            onChange={(e) =>
              setGlobalFilters((prev) => ({ ...prev, vegNonVeg: e.target.value }))
            }
          >
            <option value="">Veg / Non-Veg</option>
            <option value="veg">🟩 Vegetarian</option>
            <option value="nonveg">🟥 Non-Vegetarian</option>
          </select>
        </div>
      </div>

      {showForm && (
        <form className="add-item-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              placeholder="Name (eg. Apple)"
              value={newItem.name}
              maxLength={40}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
              autoFocus
            />
          </label>
          <label>
            Number of Items:
            <input
              type="number"
              placeholder="Number of Items"
              value={newItem.quantity}
              min={1}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              required
            />
          </label>
          {editingId && (
            <label>
              Number of Items Consumed:
              <input
                type="number"
                placeholder="Number of Items Consumed"
                value={newItem.consumed}
                min={0}
                max={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    consumed:
                      e.target.value > newItem.quantity
                        ? newItem.quantity
                        : Number(e.target.value),
                  })
                }
              />
            </label>
          )}
          <label>
            Category:
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label>
            Expiry Date:
            <input
              type="date"
              value={newItem.expiry}
              onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
              required
            />
          </label>

          {newItem.imageUrl && (
            <img
              src={newItem.imageUrl}
              alt={newItem.name}
              style={{ maxWidth: 150, borderRadius: 8, marginTop: 12, marginBottom: 8 }}
            />
          )}

          <button type="submit">{editingId ? "Update Item" : "Add to Pantry"}</button>
        </form>
      )}

      <div className="category-sections-container">
        {CATEGORIES.map((category) => {
          const items = pantryByCategory[category];
          if (!items || items.length === 0) return null;

          return (
            <section key={category} className="category-section">
              <h2 className="category-title">{category}</h2>

              <div className="category-filters">
                <select
                  value={categoryFilters[category].expiry}
                  onChange={(e) =>
                    setCategoryFilters((prev) => ({
                      ...prev,
                      [category]: { ...prev[category], expiry: e.target.value },
                    }))
                  }
                >
                  <option value="">Expiry</option>
                  <option value="expired">Expired</option>
                  <option value="notexpired">Not Expired</option>
                </select>

                <select
                  value={categoryFilters[category].items}
                  onChange={(e) =>
                    setCategoryFilters((prev) => ({
                      ...prev,
                      [category]: { ...prev[category], items: e.target.value },
                    }))
                  }
                >
                  <option value="">Quantity</option>
                  <option value="low">Low (less than 3)</option>
                  <option value="enough">Enough (3+)</option>
                </select>
              </div>

              <div className="category-items-grid">
                {items.map((item) => {
                  const nonVeg = isNonVeg(item.name);
                  return (
                    <div
                      key={item._id}
                      className="flip-card"
                      tabIndex={0}
                      onMouseEnter={() => flip(item._id, true)}
                      onMouseLeave={() => flip(item._id, false)}
                    >
                      <div
                        className={`flip-card-inner${flipped[item._id] ? " is-flipped" : ""}`}
                      >
                        <div className="flip-card-front">
                          <div className="image-wrapper">
                            <img
                              src={
                                item.imageUrl ||
                                `https://via.placeholder.com/110?text=${encodeURIComponent(
                                  item.name
                                )}`
                              }
                              alt={item.name}
                              className="item-image"
                            />
                          </div>
                          <div
                            className="item-info"
                            style={{
                              textDecoration: "underline",
                              textDecorationColor: nonVeg ? "red" : "green",
                            }}
                          >
                            <strong>{item.name}</strong>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="flip-card-back">
                          <div className="card-controls">
                            <button
                              title="Delete item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                              className="btn-icon delete"
                            >
                              🗑
                            </button>
                            <button
                              title="Edit item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(item._id);
                                setShowForm(true);
                                setNewItem({
                                  name: item.name,
                                  quantity: item.quantity + (item.consumed || 0),
                                  consumed: item.consumed || 0,
                                  category: item.category,
                                  expiry: item.expiry,
                                  imageUrl: item.imageUrl,
                                });
                              }}
                              className="btn-icon edit"
                            >
                              ✏
                            </button>
                          </div>
                          <div
                            style={{
                              textDecoration: "underline",
                              textDecorationColor: nonVeg ? "red" : "green",
                            }}
                          >
                            <strong>Name:</strong> {item.name}
                          </div>
                          <div>
                            <strong>Category:</strong> {item.category}
                          </div>
                          <div>
                            <strong>Quantity Left:</strong> {item.quantity}
                          </div>
                          <div>
                            <strong>Expiry:</strong>{" "}
                            <span className={new Date(item.expiry) < new Date() ? "expired" : ""}>
                              {item.expiry}
                            </span>
                          </div>
                          {item.consumed > 0 && (
                            <div>
                              <em>Consumed: {item.consumed}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

     <Footer />
    </div>
  );
}

export default Pantry;
