const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { solveDoubt, generateProblem, adminAiChat } = require('../controllers/aiController');

// AI doubt solving & co-pilot endpoints
aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.post('/generate-problem', adminMiddleware, generateProblem);
aiRouter.post('/admin-chat', adminMiddleware, adminAiChat);

module.exports = aiRouter;
