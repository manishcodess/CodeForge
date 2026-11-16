const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAdminProblemById,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem,
    attemptedAllProblembyUser
} = require('../controllers/problemController');

// Admin problem management routes
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);
problemRouter.get('/admin/problemById/:id', adminMiddleware, getAdminProblemById);

// Public problem view routes
problemRouter.get('/problemById/:id', getProblemById);
problemRouter.get('/getAllProblem', getAllProblem);

// User-specific problem progress routes
problemRouter.get('/problemSolvedByUser', userMiddleware, solvedAllProblembyUser);
problemRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem);
problemRouter.get('/problemAttemptedByUser', userMiddleware, attemptedAllProblembyUser);

module.exports = problemRouter;
