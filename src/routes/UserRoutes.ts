import { Router } from 'express';

import UserController from '../controllers/UserController';
import { AuthValidator, UserValidator } from '../middleware';

const router = Router();
const userController = new UserController();
const userValidator = new UserValidator();
const authValidator = new AuthValidator();

/**
 * Get all users
 */
router.get('/', userController.getAllUsers);

/**
 * Token Validation (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Can call this route to check if token from logging in is still valid.
 * Returns the profile of user associated with token if token is valid
 */
router.get(
  '/validate-token',
  authValidator.checkIfTokenExistsAndIsValid,
  userController.validateIfUserIsStillLoggedIn
);

/**
 * Get Account details by id
 * Provide user id in url
 */
router.get('/:id', userController.getUserById);

/**
 * Login user.
 * Provide email field and password field in body
 * Returns token if successful
 */
router.post(
  '/login',
  userValidator.getValidators('login'),
  userController.loginUser
);

/**
 * Create account
 * Required email, password, username in body
 * Optional to send profile photo with name of image
 * Optional to send fcm registration token of user device
 * returns token if successful
 */
router.post(
  '/create-account',
  userValidator.getValidators('create'),
  userController.createUser
);

/**
 * Send password reset link to email
 * Requires email field in body
 */
router.post(
  '/forget-password',
  userValidator.getValidators('forgot-password'),
  userController.sendPasswordResetLinkToEmail
);

/**
 * Check password reset link is valid
 * requires tokenized email and credential from url in email and credential field in body
 * returns token of user if successful to use to update password
 */
router.post(
  '/validate-credential',
  userValidator.getValidators('validate-credential'),
  userController.validatePasswordResetLink
);

/**
 * Update Account (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Require at least one field (email, password, username, image, fcmToken)
 * Optional field deleteImage -> if deleteImage == true & image == null, image will be deleted
 * returns token if successful
 */
router.put(
  '/',
  authValidator.checkIfTokenExistsAndIsValid,
  userController.updateUser
);

/**
 * Delete Account (NEEDS TO HAVE TOKEN IN AUTHORIZATION FIELD -> "Bearer $token")
 * Requires password field
 */
router.delete(
  '/',
  authValidator.checkIfTokenExistsAndIsValid,
  userValidator.getValidators('delete'),
  userController.deleteUser
);

export default router;
