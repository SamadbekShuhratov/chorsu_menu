import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// ESM modullarda __dirname olish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/")); // uploads papkasiga saqlanadi
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
