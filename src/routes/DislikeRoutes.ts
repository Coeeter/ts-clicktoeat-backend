import { Router } from "express";
import { DislikeController } from "../controllers";
import { AuthValidator } from "../middleware";

const router = Router();
const dislikeController = new DislikeController();
const authValidator = new AuthValidator();

router.get("/", dislikeController.getDislikes);

router.post(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  dislikeController.createDislike
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  dislikeController.deleteDislike
);

export default router;
