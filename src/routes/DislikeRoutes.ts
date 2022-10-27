import { Router } from 'express';

import { DislikeController } from '../controllers';
import { AuthValidator } from '../middleware';

const router = Router();
const dislikeController = new DislikeController();
const authValidator = new AuthValidator();

/**
 * Get Dislikes
 * Three options:
 *    - normal: "/api/dislikes" -> get Dislike object with only comment id and user id
 *    - u: "/api/dislikes?u=$USER_ID" -> get Comments which user has disliked
 *    - c: "/api/dislikes?c=$COMMENT_ID" -> get Users which disliked the comment
 */
router.get('/', dislikeController.getDislikes);

/**
 * Create Dislike (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide comment id in url
 * Automatically deletes like if exists
 */
router.post(
  '/:id',
  authValidator.checkIfTokenExistsAndIsValid,
  dislikeController.createDislike
);

/**
 * Delete Dislike (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide comment id in url
 */
router.delete(
  '/:id',
  authValidator.checkIfTokenExistsAndIsValid,
  dislikeController.deleteDislike
);

export default router;
