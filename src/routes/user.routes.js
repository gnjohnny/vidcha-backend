import { Router } from "express";
import { protectedRoute } from "../utils/checkAuth.utils.js";
import {
    acceptFriendRequest,
    getFriendRequests,
    getMyFriends,
    getOutgoingFriendRequests,
    getRecommendedUsers,
    sendFriendRequest,
} from "../controllers/user.controllers.js";

const router = Router();

router.use(protectedRoute);
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;
