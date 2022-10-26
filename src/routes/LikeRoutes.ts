import { Router } from "express";
import { LikeController } from "../controllers";
import { AuthValidator } from "../middleware";

const router = Router();
const likeController = new LikeController();
const authValidator = new AuthValidator();

/**
 * Get Likes
 * Three options:
 *    - normal: "/api/likes" -> get Like object with only comment id and user id
 *    - u: "/api/likes?u=$USER_ID" -> get Comments which user has liked
 *    - c: "/api/likes?c=$COMMENT_ID" -> get Users which liked the comment
 */
router.get("/", likeController.getLikes);

/**
 * Create Like (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide comment id in url
 * Automatically deletes dislike if exists
 */
router.post(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  likeController.createLike
);

/**
 * Delete Like (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide comment id in url
 */
router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  likeController.deleteLike
);

export default router;
