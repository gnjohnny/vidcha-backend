import { streamClient } from "../config/stream.config.js";

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.log("Error upserting stream user");
    }
};

export const generateStreamToken = (userId) => {
    try {
        const userIdStr = String(userId);
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.log("Error generating stream token", error);
    }
};
