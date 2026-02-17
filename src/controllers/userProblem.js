const {submitBatch,getLanguageById} =require("../utils/ProblemUtility")
const Problem = require("../models/problem")
const createProblem =async (req,res) => {
    //problem.js will give title,des,diffiulty,tags to it  when user press submit
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,
        referenceSolution,problemCreator} =req.body;
        
    try{

        for(const {language,completeCode} of referenceSolution){
            //const referenceSolution =[ {language :"c++",completeCode:"3f3ff"},{},{}]
            const languageId =getLanguageById(language);
            //we need to make batch submission array
            //visibleTestCases =[{input:"ded" ,output:" efe",explanantion:" efuew"},{input:"ded" ,output:" efe",explanantion:" efuew"}]
            const submissions =visibleTestCases.map((testcase)=>({
                source_code:completeCode, //code written by user on leetcode
                language_id: languageId,  //selected c++ on leetcode
                stdin: testcase.input,    // judge0 question given
                expected_output: testcase.output //judge0 correct answer
            }));  // submission array of c++,java having batch of testcase each created =[{language:id,source_code:code,stdin:,output:}, {language:id,source_code:code}....]
        }
        const submitResult =await submitBatch(submissions);

        const resulttoken =submitResult.map((value)=> value.token); //submit result=[{"token":" efef"},{"token":"fwf"},{"token":"gfe"}]
    //  result token ={"ffe","fre","frfr"}
    const testResult = await submitToken(resultToken);
    for(const test of testResult){
        if(test.status_id!=3){ return res.status(400).send("error occured"); } //return cause i want so this function dot run again
    }
    //we can store it in our db(dont put in for loop when everything settles then store)
    await  Problem.create({
        ...req.body,
        problemCreator:req.result._id //in line 23 of adminMidlleware.js i inserted result in req.result
    });
    
    res.status(201).send("problem saved success");

    }
    catch(err){
        res.status(400).send("err"+err);

    }
}