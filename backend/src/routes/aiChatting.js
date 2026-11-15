const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const solveDoubt = require('../controllers/solveDoubt');
const generateProblem = require('../controllers/generateProblem');
const adminAiChat = require('../controllers/adminAiChat');

aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/generate-problem', adminMiddleware, generateProblem);
aiRouter.post('/admin-chat', adminMiddleware, adminAiChat);

module.exports = aiRouter;
