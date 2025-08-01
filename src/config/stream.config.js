import { StreamChat } from "stream-chat";
import "dotenv/config";

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key || !api_secret) {
    throw new Error("Stream API key or Secret is missing");
}

export const streamClient = StreamChat.getInstance(api_key, api_secret);
