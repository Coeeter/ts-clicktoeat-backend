import { Router } from 'express';

import { BranchController } from '../controllers';
import { AuthValidator, BranchValidator } from '../middleware';

const router = Router();
const branchController = new BranchController();
const branchValidator = new BranchValidator();
const authValidator = new AuthValidator();

/**
 * Get all branches
 * Branches of specific restaurants are automatically added to restaurant object recieved from the server
 * Use this route to get all branches so can display nearest restaurant to user
 */
router.get('/', branchController.getAllBranches);

/**
 * Create Branch (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Requires restaurant id in query r -> "/api/branches?r=$RESTAURANT_ID"
 * Requires fields address, latitude and longitude
 * returns insertId of branch saved in db
 */
router.post(
  '/',
  authValidator.checkIfTokenExistsAndIsValid,
  branchValidator.getValidators('save'),
  branchController.saveBranch
);

/**
 * Delete Branch (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Provide Branch id to url
 * Requires restaurant id in query r -> "api/branches/$BRANCH_ID?r=$RESTAURANT_ID"
 */
router.delete(
  '/:id',
  authValidator.checkIfTokenExistsAndIsValid,
  branchValidator.getValidators('delete'),
  branchController.deleteBranch
);

export default router;
