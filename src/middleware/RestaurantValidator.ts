import { body } from "express-validator";
import { Restaurant } from "../models";
import source from "../config/DatabaseConfig";

const checkName = body("name").custom(async name => {
  if (!name) throw new Error("Field name is missing");
  const repository = source.getRepository(Restaurant);
  try {
    await repository.findOneByOrFail({ name });
  } catch (e) {
    return Promise.resolve();
  }
  return Promise.reject("Restaurant name already taken");
});

const checkDescription = body("description")
  .exists()
  .withMessage("Field description is missing");

export default [checkName, checkDescription];
