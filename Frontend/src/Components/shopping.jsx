// src/components/ShoppingCart.jsx
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CART_BASE_URL = API_BASE_URL.replace("/api", "");
// const userId = localStorage.getItem("userId");

const ShoppingCart = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [error, setError] = useState(null);

  const [manualItemName, setManualItemName] = useState("");
  const [manualQuantity, setManualQuantity] = useState(1);

  // Fetch pantry
  useEffect(() => {
   const userId = localStorage.getItem("userId");  // ✅ get it here
    if (!userId) return setError("User not logged in");
    fetch(`${API_BASE_URL}/pantry/${userId}`)
      .then((res) => res.json())
      .then((data) => data.status === "success" && setPantryItems(data.data))
      .catch(() => setError("Error fetching pantry items"));
  }, []);

  // Fetch cart
  useEffect(() => {
          const userId = localStorage.getItem("userId");
      if (!userId) return setError("User not logged in");
    fetch(`${CART_BASE_URL}/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => data.status === "success" && setCartItems(data.cart))
      .catch((err) => console.error(err));
  }, []);

  const addToCart = (item, quantity = 1) => {
      const userId = localStorage.getItem("userId");
    if (!userId) return setError("User not logged in");
    const existing = cartItems.find((i) => i.name === item.name);
    const updatedCart = existing
      ? cartItems.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + quantity } : i
        )
      : [...cartItems, { ...item, quantity }];

    setCartItems(updatedCart);
    setRecentlyAdded((prev) => [item, ...prev.filter((i) => i.name !== item.name)]);

    fetch(`${CART_BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, item: { ...item, quantity } }),
    }).catch((err) => console.error("Error syncing cart:", err));
  };

  const removeFromCart = (item) => {
      const userId = localStorage.getItem("userId");
    if (!userId) return setError("User not logged in");
    const updatedCart = cartItems
      .map((i) => (i.name === item.name ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    setCartItems(updatedCart);

    fetch(`${CART_BASE_URL}/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, itemName: item.name }),
    }).catch((err) => console.error("Error removing cart item:", err));
  };

  // Pantry suggestions
  const getPantrySuggestions = () =>
    pantryItems
      .filter(
        (item) =>
          item.quantity <= 2 || (item.expiryDate && new Date(item.expiryDate) <= new Date())
      )
      .map((item) => ({
        ...item,
        reason: item.quantity <= 2 ? "Low Stock" : "Expiring",
      }));

  // Recipe suggestions
 const getRecipeSuggestions = () => {
  const favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]");
  const pantryNames = pantryItems.map((i) => i.name.toLowerCase());
  const suggestions = [];

  favoriteRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      // Safely get ingredient name
      const ingredientName =
        typeof ing === "string"
          ? ing
          : ing?.name || ""; // if ing is object, take .name

      if (ingredientName && !pantryNames.includes(ingredientName.toLowerCase())) {
        if (!suggestions.find((s) => s.name === ingredientName)) {
          suggestions.push({ name: ingredientName, reason: "From Recipe" });
        }
      }
    });
  });

  return suggestions;
};


  const allSuggestions = [...getPantrySuggestions(), ...getRecipeSuggestions()];

  const addManualItem = () => {
    if (!manualItemName.trim() || manualQuantity <= 0) return;

    const item = { name: manualItemName.trim(), quantity: manualQuantity, reason: "Manual" };
    addToCart(item, manualQuantity);

    setManualItemName("");
    setManualQuantity(1);
  };

  return (
    <div
     style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0, // removed padding so Navbar sits flush
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(135deg, #fffdf9, #fff8f0)",
        position: "relative",
        overflow: "hidden",
      }}
    >
     {/* Full-width Navbar at the top */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
        }}
      >
        <Navbar />
      </div>

      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          left: "-100px",
          width: "380px",
          height: "380px",
          background: "#FFA64D",
          borderRadius: "70%",
//      filter: "blur(50px)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          right: "-120px",
          width: "420px",
          height: "420px",
          background: "#FF6B00",
          borderRadius: "50%",
//           filter: "blur(130px)",
          opacity: 0.3,
        }}
      />
<div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "-100px",
          width: "380px",
          height: "380px",
          background: "#FFA64D",
          borderRadius: "70%",
//      filter: "blur(50px)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-100px",
          width: "380px",
          height: "380px",
          background: "#FFA64D",
          borderRadius: "70%",
//      filter: "blur(50px)",
          opacity: 0.4,
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>zz
        <h1 style={{ fontSize: "42px", fontWeight: "800", color: "#FF6B00" }}>
          <FaShoppingCart style={{ marginRight: "12px" }} />
          Shopping Cart
        </h1>
        <p style={{ fontSize: "16px", color: "#666" }}>
          Your intelligent shopping companion
        </p>
      </div>

      {/* Add Item Manually */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        style={{
          margin: "40px auto",
          padding: "25px",
          maxWidth: "850px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2 style={{ color: "#FF6B00", fontWeight: "700", flexShrink: 0 }}>
          <FaPlus style={{ marginRight: "10px" }} />
          Add Item
        </h2>
        <input
          type="text"
          placeholder="Enter item name..."
          value={manualItemName}
          onChange={(e) => setManualItemName(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "14px",
          }}
        />
        <input
          type="number"
          min="1"
          value={manualQuantity}
          onChange={(e) => setManualQuantity(Number(e.target.value))}
          style={{
            width: "70px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "14px",
            textAlign: "center",
          backdropFilter: "blur(1px)",
          }}
        />
        <button
          onClick={addManualItem}
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF914D)",
            color: "#fff",
            fontWeight: "600",
            border: "none",
            padding: "12px 20px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          + Add
        </button>
      </motion.div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <div
          style={{
            margin: "30px auto",
            padding: "25px",
            maxWidth: "850px",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 1,

          }}
        >
          <h2 style={{ color: "#FF6B00", fontWeight: "700", marginBottom: "15px" }}>
            Recently Added
          </h2>
          <div style={{ display: "flex", gap: "15px", overflowX: "auto" }}>
            {recentlyAdded.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                style={{
                  minWidth: "200px",
                  padding: "18px",
                  borderRadius: "15px",
                  background: "#fff9f3",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color:"black",
                }}
              >
                <span style={{ fontWeight: "600", fontSize: "16px" }}>{item.name}</span>
                <button
                  style={{
                    background: "linear-gradient(135deg, #FF6B00, #FF914D)",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => addToCart(item)}
                >
                  <FaShoppingCart />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Items */}
      <div
        style={{
          margin: "30px auto",
          padding: "25px",
          maxWidth: "850px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2 style={{ color: "#FF6B00", fontWeight: "700", marginBottom: "15px" }}>
          Smart Suggestions
        </h2>
        {allSuggestions.length === 0 && (
          <p style={{ fontStyle: "italic", color: "#777" }}>
            No suggestions available at the moment
          </p>
        )}
        {allSuggestions.map((item, index) => (
          <motion.div
            key={`${item.name}-${index}`}
            whileHover={{ scale: 1.02 }}
            style={{
              marginBottom: "12px",
              padding: "18px",
              borderRadius: "15px",
              background: "#fff9f3",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color:"black",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "16px" }}>{item.name}</span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {item.reason && (
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fff",
                    background:
                      item.reason === "Low Stock"
                        ? "#FF9900"
                        : item.reason === "Expiring"
                        ? "#FF3B3B"
                        : item.reason === "From Recipe"
                        ? "#9B59B6"
                        : "#22c55e",
                  }}
                >
                  {item.reason}
                </span>
              )}
              <button
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF914D)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() => addToCart(item)}
              >
                <FaShoppingCart />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cart */}
      <div
        style={{
          margin: "30px auto",
          padding: "25px",
          maxWidth: "850px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2 style={{ color: "#FF6B00", fontWeight: "700", marginBottom: "15px" }}>
          Your Cart ({cartItems.length} items)
        </h2>
        {cartItems.length === 0 && (
          <p style={{ fontStyle: "italic", color: "#777" }}>Your cart is empty</p>
        )}
        {cartItems.map((item, index) => (
          <motion.div
            key={`${item.name}-${index}`}
            whileHover={{ scale: 1.02 }}
            style={{
              marginBottom: "12px",
              padding: "18px",
              borderRadius: "15px",
              background: "#fff9f3",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color:"black",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "16px" }}>
              {item.name} - Qty: {item.quantity}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF914D)",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() => addToCart(item)}
              >
                ➕
              </button>
              <button
                style={{
                  background: "#FF3B3B",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={() => removeFromCart(item)}
              >
                ➖
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingCart;
