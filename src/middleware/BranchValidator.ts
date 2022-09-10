import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

class BranchValidator {
  private static checkQueryForR = query("r")
    .exists()
    .withMessage("Query r is missing");

  private static checkAddress = body("address")
    .exists()
    .withMessage("Field address is missing");

  private static checkLatitude = body("latitude")
    .exists()
    .withMessage("Field latitude is missing")
    .isNumeric()
    .withMessage("Field latitude should be a number");

  private static checkLongitude = body("longitude")
    .exists()
    .withMessage("Field longitude is missing")
    .isNumeric()
    .withMessage("Field longitude should be a number");

  private static handleErrors = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors = validationResult(req)
      .array()
      .map(item => ({
        error: item.msg,
        field: item.param,
      }));
    if (errors.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Errors in fields provided",
        errors,
      });
    }
    next();
  };

  public static getValidators(route: "save" | "delete") {
    if (route == "save") {
      return [
        this.checkQueryForR,
        this.checkAddress,
        this.checkLatitude,
        this.checkLongitude,
        this.handleErrors,
      ];
    }
    if (route == "delete") {
      return [this.checkQueryForR, this.handleErrors];
    }
    throw new Error("Invalid route passed");
  }
}

export default BranchValidator;
