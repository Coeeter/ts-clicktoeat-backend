import { Router } from "express";
import { BranchController } from "../controllers";
import { AuthValidator, BranchValidator } from "../middleware";

const router = Router();
const branchController = new BranchController();
const branchValidator = new BranchValidator();
const authValidator = new AuthValidator();

router.get("/", branchController.getAllBranches);

router.post(
  "/",
  authValidator.checkIfTokenExistsAndIsValid,
  branchValidator.getValidators("save"),
  branchController.saveBranch
);

router.delete(
  "/:id",
  authValidator.checkIfTokenExistsAndIsValid,
  branchValidator.getValidators("delete"),
  branchController.deleteBranch
);

export default router;
