import { Router } from "express";
import { RestaurantController } from "../controllers";
import { RestaurantValidator } from "../middleware";

const router = Router();
const controller = new RestaurantController();

router.get("/", controller.getAllRestaurants);
router.get("/:id", controller.getRestaurantById);
router.post(
  "/",
  RestaurantValidator.getValidators(),
  controller.createRestaurant
);
router.put("/:id", controller.updateRestaurant);
router.delete("/:id", controller.deleteRestaurant);

export default router;
