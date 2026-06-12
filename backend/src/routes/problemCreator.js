
const express= require('express');
const problemRouter = express.Router();
const adminMiddleware =require("../middleware/adminMiddleware");
const userMiddleware =require("../middleware/userMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser} =require("../controllers/userProblem");
// see /:id thatswhy was accesssing using req.params was used
//router      crud    url      middleware      controllers -> routes
problemRouter.post("/create",adminMiddleware, createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

problemRouter.get("/getproblemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",getAllProblem);
problemRouter.get("/problemSolvedByUser", solvedAllProblemByUser);

module.exports =problemRouter;
//probelm fetch
//update
//delete
