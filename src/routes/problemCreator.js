
const express= require('express');
const problemRouter = express.Router();
const adminMiddleware =require("../middleware/adminMiddleware");
const createProblem =require("../controllers/userProblem")
//create
problemRouter.post("/create",adminMiddleware, createProblem);
// problemRouter.patch("/update/:id",updateProblem);
// problemRouter.delete("/delete/:id",deleteProblem);

// problemRouter.get("/problemById/:id",getProblemById);
// problemRouter.get("/getAllProblem",getAllProblem);
// problemRouter.get("/problemSolvedByUser", solvedAllProblemByUser);

module.exports =problemRouter;
//probelm fetch
//update
//delete