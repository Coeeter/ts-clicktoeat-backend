import { Router } from "express";
import { RestaurantController } from "../controllers";
import { AuthValidator, RestaurantValidator } from "../middleware";

const router = Router();
const restaurantController = new RestaurantController();
const restarantValidator = new RestaurantValidator();
const authValidator = new AuthValidator();

router.get("/", restaurantController.getAllRestaurants);

router.get("/:id", restaurantController.getRestaurantById);

router.get("/favorites/:id", restaurantController.getFavoriteUsers);

router.post(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  restarantValidator.getValidators(),
  restaurantController.createRestaurant
);

router.put(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  restaurantController.updateRestaurant
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  restaurantController.deleteRestaurant
);

export default router;
