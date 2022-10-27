import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

import database from '../config/DatabaseConfig';
import { Restaurant } from '../models';

class RestaurantValidator {
  private _checkName = body('name').custom(async name => {
    if (!name) throw new Error('Field name is missing');
    const repository = database.getRepository(Restaurant);
    try {
      await repository.findOneByOrFail({ name });
    } catch (e) {
      return Promise.resolve();
    }
    return Promise.reject('Restaurant name already taken');
  });

  private _checkDescription = body('description')
    .exists()
    .withMessage('Field description is missing');

  private _handleErrors = (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = validationResult(req)
      .array()
      .map(item => ({
        error: item.msg,
        field: item.param,
      }));
    const errors = [...validationErrors];
    if (!req.files?.brandImage) {
      errors.push({
        error: 'Image brandImage is missing',
        field: 'brandImage',
      });
    }
    if (errors.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Errors in fields provided',
        errors: errors,
      });
    }
    next();
  };

  public getValidators() {
    return [this._checkName, this._checkDescription, this._handleErrors];
  }
}

export default RestaurantValidator;
