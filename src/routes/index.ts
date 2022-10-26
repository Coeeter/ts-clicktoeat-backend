import express, { Router } from "express";
import restaurantRoutes from "./RestaurantRoutes";
import branchRoutes from "./BranchRoutes";
import userRoutes from "./UserRoutes";
import commentRoutes from "./CommentRoutes";
import favoriteRoutes from "./FavoriteRoutes";

const router = Router();

router.use("/uploads", express.static("uploads"));

router.use("/api/restaurants", restaurantRoutes);
router.use("/api/branches", branchRoutes);
router.use("/api/users", userRoutes);
router.use("/api/comments", commentRoutes);
router.use("/api/favorites", favoriteRoutes);

router.use((req, res) => {
  res.status(404).send("Not Found");
});

export default router;
