import { Router } from "express";
import restaurantRoutes from "./RestaurantRoutes";

const router = Router();

router.use("/api/restaurants", restaurantRoutes);

router.use('', (req, res) => {
  res.status(404).send('Not Found')
})

export default router;
