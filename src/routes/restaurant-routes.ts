import {
  getRestaurants,
  createRestaurant,
} from "../services/restaurant-service";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await getRestaurants();
    res.status(200).json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;
