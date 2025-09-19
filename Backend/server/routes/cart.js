import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// 📌 Get cart items
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ status: "success", cart: [] });
    }

    res.json({ status: "success", cart: cart.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// 📌 Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, item } = req.body;

    if (!userId || !item) {
      return res.status(400).json({ status: "error", message: "Missing data" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [item] });
    } else {
      const existingItem = cart.items.find(i => i.name === item.name);
      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        cart.items.push(item);
      }
    }

    await cart.save();
    res.json({ status: "success", cart: cart.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// 📌 Remove item from cart (using itemName)
router.post("/remove", async (req, res) => {
  try {
    const { userId, itemName } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ status: "success", cart: [] });

    cart.items = cart.items.filter(i => i.name !== itemName);
    await cart.save();

    res.json({ status: "success", cart: cart.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// 📌 Clear cart
router.post("/clear", async (req, res) => {
  try {
    const { userId } = req.body;

    let cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.json({ status: "success", cart: cart ? cart.items : [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
