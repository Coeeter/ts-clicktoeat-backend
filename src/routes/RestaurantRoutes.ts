import { Router } from "express";
import { RestaurantController } from "../controllers";
import { AuthValidator, RestaurantValidator } from "../middleware";

const router = Router();
const restaurantController = new RestaurantController();
const restarantValidator = new RestaurantValidator();
const authValidator = new AuthValidator();

/**
 * Get all Restaurants
 */
router.get("/", restaurantController.getAllRestaurants);

/**
 * Get One Restaurant by its Id
 * Provide id in url
 */
router.get("/:id", restaurantController.getRestaurantById);

/**
 * Create Restaurant (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Requires fields name, description and brandImage
 * returns insertId of restaurant in DB if successful
 */
router.post(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  restarantValidator.getValidators(),
  restaurantController.createRestaurant
);

/**
 * Update Restaurant (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Requires at least one field (name, description, brandImage)
 * returns updated restaurant object if successful
 */
router.put(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  restaurantController.updateRestaurant
);

/**
 * Delete Restaurant (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide restaurant id in url
 */
router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  restaurantController.deleteRestaurant
);

export default router;
