const { text } = require("express");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/ProblemUtility");
//send to judge0
const submitCode = async (req, res) => {
  try {
    const userId = req.results._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).send("some field are missing");
    }

    //fetch problem from database
    const problem = await Problem.findById(problemId);
    //testcases(hidden)

    //store submission at databse before sending to judge0
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      status: "pending",
      testcasesTotal: problem.hiddenTestCases.length,
    });

    //submit code to judge0
    const languageId = getLanguageById(language);
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));
    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    console.log(testResult);
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
