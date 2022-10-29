import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

class CommentValidator {
  private _checkReview = body('review')
    .exists()
    .withMessage('Field review is missing');

  private _checkRating = body('rating')
    .exists()
    .withMessage('Field rating is missing')
    .isNumeric()
    .withMessage('Field rating should be a number');

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

  public getValidators = () => {
    return [
      this._checkRating,
      this._checkReview,
      this._handleErrors,
    ];
  };
}

export default CommentValidator;
