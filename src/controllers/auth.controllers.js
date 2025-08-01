import { upsertStreamUser } from "../helpers/stream.helper.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const SignUp = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                msg: "All fields are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Password should be atleast 6 and above characters",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Please enter a valid email",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.status(400).json({
                success: false,
                msg: "Email already exist please try again with a different email",
            });

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating stream user", error.message);
        }

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(201).json({
            success: true,
            msg: "User created successfully",
            newUser,
        });
    } catch (error) {
        console.log("Error in sign up controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};
export const LogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({
                success: false,
                msg: "All fields are required",
            });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password",
            });

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect)
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password",
            });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
            success: true,
            msg: "Logged In successfully - Welcome back",
            user,
        });
    } catch (error) {
        console.log("Error in log in controller", error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};
export const LogOut = async (req, res) => {
    try {
        await res.clearCookie("token");
        return res.status(200).json({
            success: true,
            msg: "Logged out successfully",
        });
    } catch (error) {
        console.log("Error in log in controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};

export const Onboard = async (req, res) => {
    try {
        const userId = req.user;
        const { fullName, bio, nativeLanguage, learningLanguage, location } =
            req.body;

        if (
            !fullName ||
            !bio ||
            !nativeLanguage ||
            !learningLanguage ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                msg: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true,
            },
            { new: true },
        );

        if (!updatedUser)
            return res.status(404).json({
                success: false,
                msg: "User not found",
            });
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
            console.log(`Stream user updated for ${updatedUser.fullName}`);
        } catch (error) {
            console.log("Error updating stream user", error.message);
        }
        return res.status(200).json({
            success: true,
            updatedUser,
        });
    } catch (error) {
        console.log("Error in onboard controller", error.message);
        return res.status(500).json({
            success: false,
            msg: "Internal server error",
        });
    }
};
