// src/components/ShoppingCart.jsx
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "../Components/Footer";
import "../styles/ShoppingCartLayout.css";


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
  const [ingredientImages, setIngredientImages] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);



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
        reason: item.quantity <= 2 ? "Running low in pantry" : "Expiring",
      }));

  // Recipe suggestions
const getRecipeSuggestions = () => {
  const favoriteRecipes = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]");
  const pantryNames = pantryItems.map((i) => i.name.toLowerCase());
  const suggestions = [];

  favoriteRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      const ingredientName =
        typeof ing === "string"
          ? ing
          : ing?.name || "";

      if (ingredientName && !pantryNames.includes(ingredientName.toLowerCase())) {
        if (!suggestions.find((s) => s.name === ingredientName)) {
          suggestions.push({
            name: ingredientName,
            reason: "From Recipe",
            recipeName: recipe.name // <-- added recipe name
          });
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
 const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;

const fetchIngredientImage = async (ingredientName) => {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        ingredientName
      )}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_KEY,
        },
      }
    );
    const data = await res.json();
    if (data.photos?.[0]?.src?.medium) return data.photos[0].src.medium;
    return null; // fallback if no image found
  } catch (err) {
    console.error("Error fetching ingredient image:", err);
    return null;
  }
};

useEffect(() => {
  const fetchImages = async () => {
    const allItems = [...allSuggestions, ...cartItems, ...recentlyAdded];
    const imagesMap = {};

    await Promise.all(
      allItems.map(async (item) => {
        if (!imagesMap[item.name]) {
          const img = await fetchIngredientImage(item.name);
          imagesMap[item.name] = img;
        }
      })
    );

    setIngredientImages(imagesMap);
  };

  fetchImages();
}, [allSuggestions, cartItems, recentlyAdded]);

  return (
    <div
    className="shopping-cart-page"
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
      <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(135deg, #fffdf9, #fff8f0)",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  }}
>
  {/* Left side: title */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <FaShoppingCart style={{ fontSize: "32px", color: "#FF6B00" }} />
    <div>
      <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#FF6B00" }}>
        Shopping Cart
      </h1>
      <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
        Your intelligent shopping companion
      </p>
    </div>
  </div>

  {/* Right side: button */}
  <button
    style={{
      background: "linear-gradient(135deg, #FF6B00, #FF914D)",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    }}
    onClick={() => setIsCartOpen(true)} // opens cart sidebar
  >
    View Cart ({cartItems.length})
  </button>
</div>


      {/* Add Item Manually */}
      <motion.div
  whileHover={{ scale: 1.01 }}
  className="add-item-container"
  style={{
    margin: "40px auto",
    padding: "25px",
    maxWidth: "850px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
    display: "flex",
    flexWrap: "wrap", // ✅ allows wrapping on smaller screens
    alignItems: "center",
    gap: "15px",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  }}
>
  <h2
    style={{
      color: "#FF6B00",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%", // ✅ forces heading on its own row
      textAlign: "center",
    }}
  >
    <FaPlus style={{ marginRight: "10px" }} />
    Add Item
  </h2>

  <input
    type="text"
    placeholder="Enter item name..."
    value={manualItemName}
    onChange={(e) => setManualItemName(e.target.value)}
    style={{
      flex: "1 1 200px",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #ddd",
      fontSize: "14px",
      minWidth: "200px",
    }}
  />

  <input
    type="number"
    min="1"
    value={manualQuantity}
    onChange={(e) => setManualQuantity(Number(e.target.value))}
    style={{
      width: "80px",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #ddd",
      fontSize: "14px",
      textAlign: "center",
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
      whiteSpace: "nowrap",
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
               <span
  style={{
    fontWeight: "600",
    fontSize: "16px",
    maxWidth: "140px",       // adjust based on your layout
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  }}
>
  {item.name}
</span>

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
    maxWidth: "900px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  }}
>
  <h2 style={{ color: "#FF6B00", fontWeight: "800", fontSize: "24px" }}>
    Smart Suggestions
  </h2>

  {allSuggestions.length === 0 && (
    <p style={{ fontStyle: "italic", color: "#777" }}>
      No suggestions available at the moment
    </p>
  )}

 {/* Suggestions Grid */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  }}
>
  {allSuggestions.map((item, index) => (
    <motion.div
      key={`${item.name}-${index}`}
      whileHover={{ scale: 1.03 }}
      className="item-card"
      style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "12px",
        textAlign: "center",
        transition: "all 0.2s ease",
      }}
    >
      {/* Image */}
      {ingredientImages[item.name] && (
        <img
          src={ingredientImages[item.name]}
          alt={item.name}
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "14px",
            objectFit: "cover",
            margin: "0 auto",
          }}
        />
      )}

      {/* Name */}
      <p style={{ fontWeight: "700", fontSize: "16px", margin: 0, color: "black" }}>
        {item.name}
      </p>

     {/* Reason Line */}
{item.reason && (
  <p
    style={{
      margin: 0,
      fontSize: "13px",
      color: "#666",
      fontWeight: "500",
    }}
  >
    {item.recipeName
       ? `Required for: ${item.recipeName}`  // show recipe name if present
       : item.reason}
  </p>
)}

      {/* Add to Cart Button */}
      <button
        style={{
          background: "linear-gradient(135deg, #FF6B00, #FF914D)",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "700",
          marginTop: "8px",
        }}
        onClick={() => addToCart(item)}
      >
        <FaShoppingCart /> Add to Cart
      </button>
    </motion.div>
  ))}
</div>
</div>


   {/* Cart Sidebar */}
{isCartOpen && (
  <>
    {/* Overlay */}
    <div
      onClick={() => setIsCartOpen(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.35)",
        zIndex: 1400,
      }}
    />

    {/* Sidebar */}
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "380px",
        height: "100%",
        background: "#fff",
        padding: "25px 20px",
        boxShadow: "-6px 0 30px rgba(0,0,0,0.15)",
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ color: "#FF6B00", fontWeight: "800", fontSize: "22px" }}>
          Your Cart ({cartItems.length})
        </h2>
        <button
          onClick={() => setIsCartOpen(false)}
          style={{
            background: "#FF3B3B",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Close
        </button>
      </div>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#777", textAlign: "center", marginTop: "50px" }}>
          Your cart is empty
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {cartItems.map((item, index) => (
            <motion.div
              key={`${item.name}-${index}`}
              whileHover={{ scale: 1.02 }}
              style={{
                background: "#fff",
                borderRadius: "18px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                padding: "15px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                transition: "all 0.2s ease",
              }}
            >
              {/* Left: Image + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                {ingredientImages[item.name] && (
                  <img
                    src={ingredientImages[item.name]}
                    alt={item.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "15px",
                      objectFit: "cover",
                      flexShrink: 0,
                      border: "1px solid #f0f0f0",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "#333" }}>
                    {item.name}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#888" }}>
                    Qty: {item.quantity}
                  </p>
                  {item.price && (
                    <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: "600", color: "#FF6B00" }}>
                      ${item.price.toFixed(2)} each
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Buttons */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      background: "linear-gradient(135deg, #FF6B00, #FF914D)",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
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
                      padding: "6px 12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                    onClick={() => removeFromCart(item)}
                  >
                    ➖
                  </button>
                </div>
                {item.price && (
                  <p style={{ margin: 0, fontWeight: "700", color: "#333" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}



    </div>
  </>
)}


      <Footer />
    </div>

  );
};

export default ShoppingCart;

