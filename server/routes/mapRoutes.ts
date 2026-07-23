import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  updateLocation,
  toggleMapVisibility,
  getNearbyUsers,
} from "../controllers/mapController.js";

const router = express.Router();

router.patch("/location", authMiddleware, updateLocation);
router.patch("/visibility", authMiddleware, toggleMapVisibility);
router.get("/nearby", authMiddleware, getNearbyUsers);

export default router;