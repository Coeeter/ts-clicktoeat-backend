import { Router } from "express";
import { CommentController } from "../controllers";
import { AuthValidator, CommentValidator } from "../middleware";

const router = Router();
const commentController = new CommentController();
const commentValidator = new CommentValidator();
const authValidator = new AuthValidator();

router.get("/", commentController.getComments);

router.post(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  commentValidator.getValidators(),
  commentController.createComment
);

router.put(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  commentController.updateComment
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  commentController.deleteComment
);

export default router;
