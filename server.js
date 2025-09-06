// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuid } from "uuid";
import db from "./db.js";
import upload from "./utils/multer.js";
import cloudinary from "cloudinary";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// === Cloudinary Config ===
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === Middlewares ===
app.use(express.json());

// === CORS Config ===
// Barcha domenlarga ruxsat berish (development uchun)
app.use(cors());

// Yoki faqat frontend domenga ruxsat berish (productionda tavsiya qilinadi)
app.use(
  cors({
    origin: "https://cheery-sopapillas-2d7ff4.netlify.app", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// === Static fayllarni servis qilish ===
// Frontend build fayllari backend static papkasida bo‘lsa, shu tarzda qo‘shamiz
app.use(express.static(path.join(process.cwd(), "frontend/dist")));

// Frontend route handler (SPA uchun)
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend/dist/index.html"));
});

// === HELPERS ===
const getTimestamps = () => ({
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const uploadToCloudinary = async (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      { folder: "menu_items" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
  });
};

// === Middlewares ===
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// === AUTH ===
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({
      token: "mock-jwt-token",
      user: { id: "1", username: "admin", role: "admin" },
    });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// === MENU ITEMS ===
// Get all
app.get("/api/menu-items", async (req, res, next) => {
  try {
    const items = await db("menu_items").select("*");
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Create
app.post("/api/menu-items", upload.single("image"), async (req, res, next) => {
  try {
    const { name, price, categoryId, description, available, image } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    /*let image = null;*/
    /*if (req.file) {
      image = await uploadToCloudinary(req.file.path);
    }*/

    const newItem = {
      id: uuid(),
      name,
      price: Number(price),
      categoryId,
      description: description || "",
      image: image,
      available: available === "true" || available === true,
      ...getTimestamps(),
    };

    await db("menu_items").insert(newItem);
    const savedItem = await db("menu_items").where({ id: newItem.id }).first();
    res.status(201).json(savedItem);
  } catch (err) {
    next(err);
  }
});

// Update
app.put("/api/menu-items/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, description, available } = req.body;

    const updates = {
      name,
      price: Number(price),
      categoryId,
      description: description || "",
      available: available === "true" || available === true,
      updatedAt: new Date().toISOString(),
    };

    if (req.file) {
      updates.image = await uploadToCloudinary(req.file.path);
    }

    const updated = await db("menu_items").where({ id }).update(updates);
    if (!updated) return res.status(404).json({ error: "Item not found" });

    const item = await db("menu_items").where({ id }).first();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Delete
app.delete("/api/menu-items/:id", async (req, res, next) => {
  try {
    const deleted = await db("menu_items").where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// === CATEGORIES ===
app.get("/api/categories", async (req, res, next) => {
  try {
    const cats = await db("categories").select("*");
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

app.post("/api/categories", async (req, res, next) => {
  try {
    const { name, displayOrder, active } = req.body;
    const [newCategory] = await db("categories")
      .insert({
        id: uuid(),
        name,
        displayOrder,
        active: active === true || active === "true",
        ...getTimestamps(),
      })
      .returning("*");
    res.json(newCategory);
  } catch (err) {
    next(err);
  }
});

app.put("/api/categories/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db("categories")
      .where({ id })
      .update({ ...req.body, updatedAt: new Date().toISOString() });
    if (!updated) return res.status(404).json({ error: "Category not found" });

    const category = await db("categories").where({ id }).first();
    res.json(category);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/categories/:id", async (req, res, next) => {
  try {
    const deleted = await db("categories").where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// === START SERVER ===
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
