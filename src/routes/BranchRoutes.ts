import { Router } from "express";
import { branchController } from "../controllers";
import { branchValidator } from "../middleware";

const router = Router();

router.post("/", branchValidator.getValidators("save"), branchController.saveBranch);

router.delete(
  "/:id",
  branchValidator.getValidators("delete"),
  branchController.deleteBranch
);

export default router;
