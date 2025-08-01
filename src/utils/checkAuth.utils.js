import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) return res.status(400).json({
            success: false,
            msg: "No token provided"
        })

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                msg: "Unauthorised - Invalid token"
            })
        }

        const decodedUser = await User.findById(decoded.userId).select("-password")

        if (!decodedUser) return res.status(404).json({
            success: false,
            msg: "Unauthorised user - not found"
        })

        req.user = decodedUser;
        next()
    } catch (error) {
        console.log("Error checking auth", error.message)
        next(error)
    }
}