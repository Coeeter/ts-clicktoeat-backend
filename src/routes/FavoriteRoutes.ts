import { Router } from "express";
import { FavoriteController } from "../controllers";
import { AuthValidator } from "../middleware";

const router = Router();
const favoriteController = new FavoriteController();
const authValidator = new AuthValidator();

/**
 * Get Favorite Restaurants of User
 * Provide user id in url
 * returns the restaurants which user has favorited
 */
router.get("/users/:id", favoriteController.getUserFavorites);

/**
 * Get Users who Favorite a specific restaurant
 * Provide restaurant id in url
 * returns the users who favorited the specific restaurant
 */
router.get("/restaurants/:id", favoriteController.getFavoriteUsers);

/**
 * Create Favorite (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide restaurant id in url
 */
router.post(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  favoriteController.addFavorite
);

/**
 * Delete Favorite (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide restaurant id in url
 */
router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  favoriteController.deleteFavorite
);

export default router;
