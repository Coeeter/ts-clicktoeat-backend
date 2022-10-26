import { Router } from "express";
import UserController from "../controllers/UserController";
import { AuthValidator, UserValidator } from "../middleware";

const router = Router();
const userController = new UserController();
const userValidator = new UserValidator();
const authValidator = new AuthValidator();

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.get("/favorites/:id", userController.getUserFavorites);

router.get(
  "/validate-token",
  authValidator.checkIfTokenExistsAndIsValid,
  userController.validateIfUserIsStillLoggedIn
);

router.post(
  "/login",
  userValidator.getValidators("login"),
  userController.loginUser
);

router.post(
  "/create-account",
  userValidator.getValidators("create"),
  userController.createUser
);

router.post(
  "/favorites/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  userController.addFavorite
);

router.put(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  userController.updateUser
);

router.delete(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  userValidator.getValidators("delete"),
  userController.deleteUser
);

router.delete(
  "/favorites/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  userController.deleteFavorite
);

export default router;
