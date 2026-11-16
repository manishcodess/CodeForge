const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");
const cloudinary = require('cloudinary').v2;

const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, lastName, emailId, password, age } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            role: 'user'
        });

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'user' }, process.env.JWT_KEY, { expiresIn: '7d' });
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        };

        res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
        res.status(201).json({
            user: reply,
            token: token,
            message: "Registered Successfully"
        });
    } catch (err) {
        res.status(400).send("Error: " + (err.message || err));
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).send("Error: Email and password are required");
        }

        const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });
        if (!user) {
            return res.status(401).send("Error: Invalid Credentials");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send("Error: Invalid Credentials");
        }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        };

        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '7d' });
        res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
        res.status(200).json({
            user: reply,
            token: token,
            message: "Logged in successfully"
        });
    } catch (err) {
        res.status(401).send("Error: " + (err.message || err));
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const token = req.token || req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

        if (token && redisClient.isOpen) {
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                await redisClient.set(`token:${token}`, 'Blocked', { EXAT: payload.exp });
            } else {
                await redisClient.set(`token:${token}`, 'Blocked', { EX: 7 * 24 * 60 * 60 });
            }
        }

        res.clearCookie("token", { sameSite: 'none', secure: true });
        res.status(200).send("Logged Out Successfully");
    } catch (err) {
        res.status(500).send("Error: " + (err.message || err));
    }
};

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, lastName, emailId, password, age } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            role: 'admin'
        });

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: 'admin' }, process.env.JWT_KEY, { expiresIn: '7d' });
        res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
        res.status(201).json({
            message: "Admin Registered Successfully",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            },
            token
        });
    } catch (err) {
        res.status(400).send("Error: " + (err.message || err));
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        // Delete user
        await User.findByIdAndDelete(userId);

        // Delete user submissions
        await Submission.deleteMany({ userId });

        // Clean up any uploaded solution videos by this user
        const videos = await SolutionVideo.find({ userId });
        for (const video of videos) {
            try {
                if (video.cloudinaryPublicId) {
                    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video', invalidate: true });
                }
            } catch (cloudErr) {
                console.error("Cloudinary video delete error:", cloudErr);
            }
        }
        await SolutionVideo.deleteMany({ userId });

        res.status(200).send("Profile and associated data deleted successfully");
    } catch (err) {
        res.status(500).send("Internal Server Error: " + (err.message || err));
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.aggregate([
            {
                $project: {
                    name: {
                        $trim: {
                            input: { $concat: ["$firstName", " ", { $ifNull: ["$lastName", ""] }] }
                        }
                    },
                    totalQuestionsSolved: {
                        $size: {
                            $setUnion: [{ $ifNull: ["$problemSolved", []] }, []]
                        }
                    }
                }
            },
            { $sort: { totalQuestionsSolved: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).send("Error: " + (err.message || err));
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile, getLeaderboard };
