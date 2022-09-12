import { Router } from "express";
import { restaurantController } from "../controllers";
import { restaurantValidator } from "../middleware";

const router = Router();

router.get("/", restaurantController.getAllRestaurants);
router.get("/:id", restaurantController.getRestaurantById);
router.post(
  "/",
  restaurantValidator.getValidators(),
  restaurantController.createRestaurant
);
router.put("/:id", restaurantController.updateRestaurant);
router.delete("/:id", restaurantController.deleteRestaurant);

export default router;
