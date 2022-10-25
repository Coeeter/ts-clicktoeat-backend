import { Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

class BranchValidator {
  private _checkQueryForR = query("r")
    .exists()
    .withMessage("Query r is missing");

  private _checkAddress = body("address")
    .exists()
    .withMessage("Field address is missing");

  private _checkLatitude = body("latitude")
    .exists()
    .withMessage("Field latitude is missing")
    .isNumeric()
    .withMessage("Field latitude should be a number");

  private _checkLongitude = body("longitude")
    .exists()
    .withMessage("Field longitude is missing")
    .isNumeric()
    .withMessage("Field longitude should be a number");

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
        message: "Errors in fields provided",
        errors,
      });
    }
    next();
  };

  public getValidators(route: "save" | "delete") {
    if (route == "save") {
      return [
        this._checkQueryForR,
        this._checkAddress,
        this._checkLatitude,
        this._checkLongitude,
        this._handleErrors,
      ];
    }
    if (route == "delete") {
      return [this._checkQueryForR, this._handleErrors];
    }
    throw new Error("Invalid route passed");
  }
}

export default BranchValidator;
