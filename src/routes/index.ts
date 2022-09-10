import { Router } from "express";
import restaurantRoutes from "./RestaurantRoutes";
import branchRoutes from "./BranchRoutes";

const router = Router();

router.use("/api/restaurants", restaurantRoutes);
router.use("/api/branches", branchRoutes);

router.use("", (req, res) => {
  res.status(404).send("Not Found");
});

export default router;
