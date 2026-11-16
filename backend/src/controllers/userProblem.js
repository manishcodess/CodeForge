const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");
const cloudinary = require('cloudinary').v2;
const redisClient = require("../config/redis");

// Reusable validator for reference solutions against visible test cases
const testReferenceSolutions = async (referenceSolution, visibleTestCases) => {
    if (!referenceSolution || !Array.isArray(referenceSolution) || referenceSolution.length === 0) {
        return null;
    }
    if (!visibleTestCases || !Array.isArray(visibleTestCases) || visibleTestCases.length === 0) {
        return null;
    }

    try {
        for (const { language, completeCode } of referenceSolution) {
            if (!completeCode) continue;
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id !== 3) {
                    return {
                        failed: true,
                        message: `Reference solution for ${language} failed on test case.`,
                        error: test.compile_output || test.stderr || test.message || "Unknown error",
                        status: test.status
                    };
                }
            }
        }
        return null;
    } catch (judgeError) {
        console.warn("Judge0 reference solution verification skipped due to external API error:", judgeError.message);
        // Do not block problem creation/updating if external Judge0 is unsubscribed, rate limited, or down
        return null;
    }
};

const createProblem = async (req, res) => {
    const { referenceSolution, visibleTestCases } = req.body;

    try {
        const validationError = await testReferenceSolutions(referenceSolution, visibleTestCases);
        if (validationError && validationError.failed) {
            return res.status(400).json(validationError);
        }

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        if (redisClient.isOpen) {
            redisClient.del("all_problems_cache").catch(() => {});
        }

        res.status(201).json({
            message: "Problem Saved Successfully",
            problemId: userProblem._id
        });
    } catch (err) {
        console.error("Error in createProblem:", err);
        res.status(400).json({
            message: "Failed to create problem",
            error: err.message
        });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { referenceSolution, visibleTestCases } = req.body;

    try {
        if (!id) {
            return res.status(400).send("Missing ID Field");
        }

        const dsaProblem = await Problem.findById(id);
        if (!dsaProblem) {
            return res.status(404).send("Problem does not exist");
        }

        // If visibleTestCases or referenceSolution are provided, test them
        const testCasesToUse = visibleTestCases || dsaProblem.visibleTestCases;
        if (referenceSolution && testCasesToUse) {
            const validationError = await testReferenceSolutions(referenceSolution, testCasesToUse);
            if (validationError && validationError.failed) {
                return res.status(400).json(validationError);
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(
            id,
            { ...req.body },
            { runValidators: true, new: true }
        );

        if (redisClient.isOpen) {
            redisClient.del("all_problems_cache").catch(() => {});
        }

        res.status(200).json(newProblem);
    } catch (err) {
        res.status(500).json({ message: "Failed to update problem", error: err.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is Missing");

        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) return res.status(404).send("Problem is Missing");

        // Clean up submissions for this problem
        await Submission.deleteMany({ problemId: id });

        // Clean up video associated with this problem and delete from Cloudinary
        const video = await SolutionVideo.findOneAndDelete({ problemId: id });
        if (video && video.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video', invalidate: true });
            } catch (cloudErr) {
                console.error("Failed to delete video from Cloudinary:", cloudErr);
            }
        }

        // Clean up users' problemSolved arrays
        await User.updateMany(
            { problemSolved: id },
            { $pull: { problemSolved: id } }
        );

        if (redisClient.isOpen) {
            redisClient.del("all_problems_cache").catch(() => {});
        }

        res.status(200).send("Successfully Deleted");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is Missing");

        // Public route: strictly exclude hiddenTestCases from everyone
        const getProblem = await Problem.findById(id).select(
            '_id title description difficulty tags visibleTestCases startCode referenceSolution'
        );
        if (!getProblem) return res.status(404).send("Problem is Missing");

        const videos = await SolutionVideo.findOne({ problemId: id });

        if (videos) {
            const responseData = {
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration,
            };
            return res.status(200).send(responseData);
        }

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const getAdminProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is Missing");

        // Admin route: returns full document including hiddenTestCases
        const getProblem = await Problem.findById(id);
        if (!getProblem) return res.status(404).send("Problem is Missing");

        const videos = await SolutionVideo.findOne({ problemId: id });

        if (videos) {
            const responseData = {
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration,
            };
            return res.status(200).send(responseData);
        }

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const getAllProblem = async (req, res) => {
    try {
        if (redisClient.isOpen) {
            try {
                const cached = await redisClient.get("all_problems_cache");
                if (cached) {
                    return res.status(200).json(JSON.parse(cached));
                }
            } catch (cacheErr) {
                console.warn("Redis get error:", cacheErr.message);
            }
        }

        const getProblem = await Problem.find({}).select('_id title difficulty tags').lean();

        if (redisClient.isOpen && getProblem) {
            try {
                await redisClient.set("all_problems_cache", JSON.stringify(getProblem), { EX: 300 });
            } catch (cacheSetErr) {
                console.warn("Redis set error:", cacheSetErr.message);
            }
        }

        res.status(200).json(getProblem || []);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

const solvedAllProblembyUser = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        }).lean();

        res.status(200).send(user?.problemSolved || []);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({ userId, problemId }).sort({ createdAt: -1 }).lean();
        res.status(200).send(ans);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};

const attemptedAllProblembyUser = async (req, res) => {
    try {
        const userId = req.result._id;
        const allSubmittedProblemIds = await Submission.distinct('problemId', { userId });
        const solvedProblemIds = (req.result.problemSolved || []).map(id => id.toString());

        const attemptedProblemIds = allSubmittedProblemIds.filter(
            pid => !solvedProblemIds.includes(pid.toString())
        );

        const attemptedProblems = await Problem.find({
            _id: { $in: attemptedProblemIds }
        }).select("_id title difficulty tags").lean();

        res.status(200).send(attemptedProblems);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAdminProblemById,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem,
    attemptedAllProblembyUser
};



