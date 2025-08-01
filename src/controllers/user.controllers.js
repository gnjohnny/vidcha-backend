import FriendRequest from "../models/friendrequest.model.js";
import User from "../models/user.model.js";

export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true },
            ],
        });

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log("Error in get recommended users controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const getMyFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate(
                "friends",
                "fullName profilePic nativeLanguage learningLanguage",
            );

        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in get my friends controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const myId = req.user.id;
        const { id: recepientId } = req.params;

        if (myId === recepientId) {
            return res.status(400).json({
                success: false,
                msg: "You cannot send a friend request to yourself",
            });
        }
        const recepient = await User.findById(recepientId);
        if (!recepient) {
            return res.status(404).json({
                success: false,
                msg: "Recepient not found",
            });
        }

        if (recepient.friends.includes(myId)) {
            return res.status(400).json({
                success: false,
                msg: "You are already friends with this user",
            });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recepientId },
                { sender: recepientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                msg: "Friend request already sent",
            });
        }
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recepientId,
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.log("Error in send friend request controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({
                success: false,
                msg: "Friend request not found",
            });
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                msg: "You are not authorized to accept this friend request",
            });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

        res.status(200).json({ msg: "Friend request accepted" });
    } catch (error) {
        console.log("Error in accept friend request controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate(
            "sender",
            "fullName profilePic nativeLanguage learningLanguage",
        );

        const acceptedRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({incomingRequests, acceptedRequests});
    } catch (error) {
        console.log("Error in get friend requests controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const getOutgoingFriendRequests = async (req, res) => {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate(
            "recipient",
            "fullName profilePic nativeLanguage learningLanguage",
        );
        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log(
            "Error in get outgoing friend requests controller",
            error.message,
        );
        res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};
