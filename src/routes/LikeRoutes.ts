import { Router } from "express";
import { LikeController } from "../controllers";
import { AuthValidator } from "../middleware";

const router = Router();
const likeController = new LikeController();
const authValidator = new AuthValidator();

router.get("/", likeController.getLikes);

router.post(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  likeController.createLike
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  likeController.deleteLike
);

export default router;
