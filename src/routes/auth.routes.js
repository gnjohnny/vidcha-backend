import { Router } from "express";
import {
    LogIn,
    LogOut,
    Onboard,
    SignUp,
} from "../controllers/auth.controllers.js";
import { protectedRoute } from "../utils/checkAuth.utils.js";

const router = Router();

router.post("/signup", SignUp);
router.post("/login", LogIn);
router.post("/logout", LogOut);

router.post("/onboarding", protectedRoute, Onboard);

router.get("/me", protectedRoute, (req, res) =>
    res.json({ success: true, user: req.user }),
);

export default router;
