import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";
import { login, logout, me, refresh, register } from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);
router.get("/me", authenticate, me);

export default router;
