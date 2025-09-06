import cloudinary from "cloudinary";
import { v4 as uuid } from "uuid";
import db from "../db.js"; // db konfiguratsiya

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, categoryId, available } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: "Iltimos, barcha majburiy maydonlarni to‘ldiring!" });
    }

    // Narxni raqamga aylantirish va tekshirish
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: "Narx 0 dan katta bo‘lishi kerak!" });
    }

    // Image URL (default qiymat)
    let image = "https://res.cloudinary.com/demo/image/upload/v123456/default.jpg";
    if (req.file?.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: "menu_site" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        image = result.secure_url;
      } catch (err) {
        console.error("❌ Rasm yuklashda xatolik:", err);
        return res.status(500).json({ message: "Rasm yuklashda xatolik yuz berdi" });
      }
    }

    // DB ga yozish
    const query = `
      INSERT INTO menu_items
        (id, name, description, price, categoryId, available, image, createdAt, updatedAt)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      uuid(),
      typeof name === "string" ? name : "",
      typeof description === "string" ? description : "",
      priceNum,
      categoryId,
      available === true || available === "true",
      image
    ];

    const result = await db.query(query, values);

    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("❌ Menu item yaratishda xatolik:", err);
    return res.status(500).json({ message: "Menu item yaratishda xatolik yuz berdi" });
  }
};
