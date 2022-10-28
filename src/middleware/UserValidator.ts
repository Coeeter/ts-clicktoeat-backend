import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';

import database from '../config/DatabaseConfig';
import { User } from '../models';

class UserValidator {
  private repository: Repository<User>;

  constructor(repository: Repository<User> = database.getRepository(User)) {
    this.repository = repository;
  }

  private _checkIfUsernameAlreadyExistsInDB = body('username').custom(
    async username => {
      if (!username) throw new Error('Field username is missing');
      try {
        await this.repository.findOneByOrFail({ username });
      } catch (e) {
        return Promise.resolve();
      }
      return Promise.reject('Username already taken');
    }
  );

  private _checkEmail = body('email')
    .exists()
    .withMessage('Field email is missing')
    .isEmail()
    .withMessage('Invalid email provided');

  private _checkIfEmailAlreadyExistsInDB = body('email').custom(async email => {
    if (!email) throw new Error('Field email is missing');
    try {
      await this.repository.findOneByOrFail({ email });
    } catch (e) {
      return Promise.resolve();
    }
    return Promise.reject('Email already taken');
  });

  private _checkPassword = body('password')
    .exists()
    .withMessage('Field password is missing');

  private _checkPasswordWithLength = body('password').custom(async password => {
    if (!password) {
      throw new Error('Field password is missing');
    }
    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters long!');
    }
    return Promise.resolve();
  });

  private _checkCredential = body('credential')
    .exists()
    .withMessage('Field credential is missing');

  private _checkEmailToken = body('email')
    .exists()
    .withMessage('Field email is missing');

  private _handleErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors: { error: string; field: string }[] = [];
    validationResult(req)
      .array()
      .forEach(item => {
        const error = {
          error: item.msg,
          field: item.param,
        };
        if (errors.map(item => item.field).includes(error.field)) return;
        errors.push(error);
      });
    if (errors.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Errors in fields provided',
        errors,
      });
    }
    next();
  };

  public getValidators(
    route:
      | 'create'
      | 'login'
      | 'delete'
      | 'forgot-password'
      | 'validate-credential'
  ) {
    switch (route) {
      case 'login':
        return [this._checkEmail, this._checkPassword, this._handleErrors];
      case 'delete':
        return [this._checkPassword, this._handleErrors];
      case 'create':
        return [
          this._checkIfEmailAlreadyExistsInDB,
          this._checkIfUsernameAlreadyExistsInDB,
          this._checkPasswordWithLength,
          this._handleErrors,
        ];
      case 'forgot-password':
        return [this._checkEmail, this._handleErrors];
      case 'validate-credential':
        return [
          this._checkEmailToken,
          this._checkCredential,
          this._handleErrors,
        ];
    }
  }
}

export default UserValidator;
