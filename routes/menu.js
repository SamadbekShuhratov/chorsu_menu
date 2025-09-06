import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // fayl xotirada

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Rasm kerak!");

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "menu_site" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(req.file.buffer);
    const image = result.secure_url;

    // Bu URL’ni SQLite3 bazaga saqlash joyi
    // const stmt = db.prepare("INSERT INTO menu_items (name, description, price, category_id, image_url, available) VALUES (?, ?, ?, ?, ?, ?)");
    // stmt.run(req.body.name, req.body.description, req.body.price, req.body.categoryId, image, req.body.available === "true");

    res.json({ message: "Rasm yuklandi!", image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

export default router;
