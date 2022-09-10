import { body, validationResult } from "express-validator";
import { Restaurant } from "../models";
import database from "../config/DatabaseConfig";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class RestaurantValidator {
  private static checkName = body("name").custom(async name => {
    if (!name) throw new Error("Field name is missing");
    const repository = database.getRepository(Restaurant);
    try {
      await repository.findOneByOrFail({ name });
    } catch (e) {
      return Promise.resolve();
    }
    return Promise.reject("Restaurant name already taken");
  });

  private static checkDescription = body("description")
    .exists()
    .withMessage("Field description is missing");

  private static handleErrors = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validationErrors = validationResult(req)
      .array()
      .map(item => ({
        error: item.msg,
        field: item.param,
      }));
    const errors = [...validationErrors];
    if (!req.files?.brandImage) {
      errors.push({
        error: "Image brandImage is missing",
        field: "brandImage",
      });
    }
    if (errors.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Errors in fields provided",
        errors: errors,
      });
    }
    next();
  };

  public static getValidators() {
    return [this.checkName, this.checkDescription, this.handleErrors];
  }
}

export default RestaurantValidator;
