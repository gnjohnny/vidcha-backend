import { model, Schema } from "mongoose";

const friendRequestSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    },
);

const FriendRequest = model("FriendRequest", friendRequestSchema);

export default FriendRequest;
