import express from "express";
import { getMenuItems, createMenuItem } from "../controllers/menuController.js";

const router = express.Router();

// GET hamon o‘sha
router.get("/menu-items", getMenuItems);

// POST — rasm yuklash bilan
router.post("/menu-items", createMenuItem);

export default router;
