import express from 'express';
import upload from './middleware/upload.js';
import { v4 as uuid } from 'uuid';
import db from './db.js';

const app = express();

app.post('/api/menu-items', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, categoryId, available } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path); // <-- Cloudinary URL
    }

    const newItem = {
      id: uuid(),
      name,
      price: Number(price),
      description: description || "",
      categoryId,
      available: available === "true" || available === true,
      image: image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db('menu_items').insert(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
