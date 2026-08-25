import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { getMyProfile, listAllUsers } from "./users.controller";

const router = Router();

router.get("/me/profile", authenticate, getMyProfile);
router.get("/", authenticate, authorize("ADMIN"), listAllUsers);

export default router;
