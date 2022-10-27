import { Router } from 'express';

import { CommentController } from '../controllers';
import { AuthValidator, CommentValidator } from '../middleware';

const router = Router();
const commentController = new CommentController();
const commentValidator = new CommentValidator();
const authValidator = new AuthValidator();

/**
 * Get Comments
 * Three options:
 *    - normal: "/api/comments" -> Gets all comments in DB
 *    - u: "/api/comments?u=$USER_ID" -> Get all comments of a specific user
 *    - r: "/api/comments?r=$RESTAURANT_ID" -> Get all comments of a restaurant
 */
router.get('/', commentController.getComments);

/**
 * Create Comment (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Requires restaurant id in query r -> "/api/comments?r=$RESTAURANT_ID"
 * Requires review, rating fields in body
 * optional field is parentComment -> to reply to a comment
 * returns insertId of comment in DB
 */
router.post(
  '/',
  authValidator.checkIfTokenExistsAndIsValid,
  commentValidator.getValidators(),
  commentController.createComment
);

/**
 * Update Comment (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Can only update comments associated with token
 * Provide comment id in url
 * Requires at least one field to update (review, rating)
 * returns updated comment if successful
 */
router.put(
  '/:id',
  authValidator.checkIfTokenExistsAndIsValid,
  commentController.updateComment
);

/**
 * Delete Comment (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Can only delete comments associated with token
 * Provide comment id in url
 */
router.delete(
  '/:id',
  authValidator.checkIfTokenExistsAndIsValid,
  commentController.deleteComment
);

export default router;
