import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { syncUsersWithContact } from "../controllers/contactsController.js";

const router = express.Router();

// body: { phones: string[] }  (نرمالایز شده مثل "+989123456789")
router.post("/sync", authMiddleware, syncUsersWithContact);

export default router;