import { Router } from "express";
import { FavoriteController } from "../controllers";
import { AuthValidator } from "../middleware";

const router = Router();
const favoriteController = new FavoriteController();
const authValidator = new AuthValidator();

router.get("/users/:id", favoriteController.getUserFavorites);

router.get("/restaurants/:id", favoriteController.getFavoriteUsers);

router.post(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  favoriteController.addFavorite
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  favoriteController.deleteFavorite
);

export default router;
