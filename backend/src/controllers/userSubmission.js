const { text } = require("express");//to get data from req.body
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {
  getLanguageById,//judge0 api ke hisab se language ka id chahiye hume to submit karne ke liye
  submitBatch,//submissions is an array of objects where each object contains the code, language_id and stdin for each test case that we have to submit to judge0 api for evaluation and then we will get a token for each submission which we will use to check the result of each submission later
  submitToken,//resultToken is an array of token received from judge0 api after submitting code for each test case and we have to keep on checking for result until we get the result for all test cases and then return the result to user
} = require("../utils/ProblemUtility");
//send to judge0
const submitCode = async (req, res) => {//async because of await in submitBatch and submitToken which are asynchronous functions and we have to wait for their result before sending response to user
  try {
    const userId = req.results._id;//in line 23 of authMiddleware.js i inserted result in req.result so that we can access user id here and store it in submission collection to know which user submitted which code for which problem and what is the result of that submission
    const problemId = req.params.id;//problem id is coming from url as we have defined in line 14 of submit.js router /:id/submit so we can access it by req.params.id
    const { code, language } = req.body;//code and language is coming from user when user submit code for a problem and we have to send that code to judge0 api for evaluation and we also need to know the language in which user has written the code so that we can send the correct language id to judge0 api for evaluation

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send("some field are missing");
    }

    //fetch problem from database
    const problem = await Problem.findById(problemId);
    //testcases(hidden)

    //store submission at databse before sending to judge0
    const submittedResult = await Submission.create({//
      userId: userId,
      problemId: problemId,
      code: code,
      language: language,
      testCasesPassed: 0,
      status: "pending",
      testcasesTotal: problem.hiddenTestCases.length,
    });

    //submit code to judge0
    const languageId = getLanguageById(language);
    const submissions = problem.hiddenTestCases.map((testcase) => ({//we have to submit code for each test case to judge0 api for evaluation and then we will get the result for each test case and then we will calculate how many test cases passed and how many failed and then we will update the submission result in database and then we will send the result to user
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
    const submitResult = await submitBatch(submissions);//submitResult look like = [{"token":" efef"},{"token":"fwf"},{"token":"gfe"}]
    const resultToken = submitResult.map((value) => value.token);//result token look like ={"ffe","fre","frfr"}
    const testResult = await submitToken(resultToken); 
    
    //testResult look like = [{
    //     language_id: 54,
    //     stdin: '2 3',
    //     expected_output: '5',
    //     stdout: '5',
    //     status_id: 3,
    //     created_at: '2025-05-12T16:47:37.239Z',
    //     finished_at: '2025-05-12T16:47:37.695Z',
    //     time: '0.002',
    //     memory: 904,
    //     stderr: null,
    //     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',

    //}]

    //submissionresult need to be updated 44/3333 cases passed
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "error";
          errorMessage = test.stderr;
        } else {
          status = "wrong";
          errorMessage = test.stderr;
        }
      }
    }

    //store result in databse in submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    res.status(201).send(submittedResult);
  } catch (err) {
    res
      .status(500)
      .send("submitCode in usersubmisison in controllers error" + err);
  }
};

module.exports = submitCode;
