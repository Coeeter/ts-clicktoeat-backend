import { Router } from "express";
import RestaurantController from "../controllers/RestaurantController";
import validators from "../middleware/RestaurantValidator";

const router = Router();
const controller = new RestaurantController();

router.get("/", controller.getAllRestaurants);
router.get("/:id", controller.getRestaurantById);
router.post("/", validators, controller.createRestaurant);
router.put("/:id", controller.updateRestaurant);
router.delete("/:id", controller.deleteRestaurant);

export default router;
