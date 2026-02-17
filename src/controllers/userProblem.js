const {submitBatch,getLanguageById} =require("../utils/ProblemUtility")

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
            const submissions =visibleTestCases.map((input,output)=>({
                source_code:completeCode, //code written by user on leetcode
                language_id: languageId,  //selected c++ on leetcode
                stdin: input,    // judge0 question given
                expected_output:output //judge0 correct answer
            }));  // submission array of c++,java having batch of testcase each created =[{language:id,source_code:code,stdin:,output:}, {language:id,source_code:code}....]
        }
        const submitResult =await submitBatch(submissions);

    }
    catch(err){

    }
}