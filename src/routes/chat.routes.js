import {Router} from "express";
import { protectedRoute } from "../utils/checkAuth.utils.js";
import { getStreamToken } from "../controllers/chat.controllers.js";

const router = Router();

router.get("/token",protectedRoute, getStreamToken)

export default router;