import express, { Router } from "express";
import restaurantRoutes from "./RestaurantRoutes";
import branchRoutes from "./BranchRoutes";
import userRoutes from "./UserRoutes";

const router = Router();

router.use("/uploads", express.static("uploads"));

router.use("/api/restaurants", restaurantRoutes);
router.use("/api/branches", branchRoutes);
router.use("/api/users", userRoutes);

router.use((req, res) => {
  res.status(404).send("Not Found");
});

export default router;
