const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            name: user.name,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
};


const register = async (req, res, next) => {
    try {
        const {
            name,
            username,
            email,
            password,
            confirmPassword,
            phone,
            gender,
            DOB,
        } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "Name, email, password and confirm password are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Password and confirm password do not match",
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, ...(username ? [{ username: username.toLowerCase() }] : [])] });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        const user = await User.create({
            name,
            username,
            email,
            password,
            phone,
            gender,
            DOB,
        })

        const accessToken = generateToken(user);

        res.status(201).json({
            message: "Account created successfully",
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};



const login = async (req, res, next) => {
    try {
        const { email, username, identifier, password } = req.body;
        const loginId = (identifier || username || email || "").trim().toLowerCase();
        const user = await User.findOne({ $or: [{ email: loginId }, { username: loginId }] });

        if (!user || !(await user.isCorrectPassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Check blocked account
        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account is blocked",
            });
        }

        const accessToken = generateToken(user);

        res.status(200).json({
            message: "Logged in successfully",
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        })
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, };