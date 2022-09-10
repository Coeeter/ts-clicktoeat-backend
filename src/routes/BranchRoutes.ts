import { Router } from "express";
import { BranchController } from "../controllers";
import { BranchValidator } from "../middleware";

const router = Router();
const controller = new BranchController();

router.post("/", BranchValidator.getValidators("save"), controller.saveBranch);

router.delete(
  "/:id",
  BranchValidator.getValidators("delete"),
  controller.deleteBranch
);

export default router;
