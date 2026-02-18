const {submitBatch,getLanguageById} =require("../utils/ProblemUtility")
const Problem = require("../models/problem");
//------------------------------------------------------------------------------
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
        
        const submitResult =await submitBatch(submissions);

        const resultToken =submitResult.map((value)=> value.token); //submit result=[{"token":" efef"},{"token":"fwf"},{"token":"gfe"}]
    //  result token ={"ffe","fre","frfr"}
        const testResult = await submitToken(resultToken);
        for(const test of testResult){
          if(test.status_id!=3){ return res.status(400).send("userproblem in createproblem error:"); } //return cause i want so this function dot run again
    }
}
    //we can store it in our db(dont put in for loop when everything settles then store)
    const userProblem =await  Problem.create({
        ...req.body,
        problemCreator:req.result._id //in line 23 of adminMidlleware.js i inserted result in req.result
    });
    
    res.status(201).send("problem saved success");

    }
    catch(err){
        res.status(400).send("err"+err);

    }
}

//-------------------------------------------------------------------------------------------------

const updateProblem = async (req,res)=>{
  const {id} = req.params;
  const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution, 
    problemCreator} = req.body;
  try{
    if(!id){ return res.status(400).send("Missing ID Field in updateproblem"); }//put return so if it occur fucntion dont go further
    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem){ return res.status(404).send("ID is not persent in server"); }

    for(const {language,completeCode} of referenceSolution){
      const languageId = getLanguageById(language);
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));
      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value)=> value.token);
      const testResult = await submitToken(resultToken);
     for(const test of testResult){
      if(test.status_id!=3){ return res.status(400).send("Error Occured");}
     }

    }
    const newProblem = await Problem.findByIdandUpdate(id,{...req.body},{runValidators:true, new:true})
    res.status(200).send(newProblem);
}
catch(err){"updateproblem error"+err}
}
//------------------------------------------------------------------------------------------------------
const deleteProblem =async (req,res)=>{
    const {id}=req.params;
    try{
        if(!id){return res.status(400).send("id missing in updateProblem")}
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem){ return res.status(404).send("problem is missing in deleteProblem")}
        res.status(200).send("successfully deleted");

    }
    catch(err){
        res.status(500).send("errror"+err);       
    }
}

//--------------------------------------------------------------------------------

const getProblemById =async (req,res)=>{
    const {id}=req.params;
    try{
        if(!id){return res.status(400).send("id misiing in updateProblem")}
        const getProblem = await Problem.findById(id);
        if(!getProblem){ return res.status(404).send("problem is missing in getProblemBYid")}
        res.status(200).send(getProblem);

    }
    catch(err){
        res.status(500).send("eror in getProbleminID"+err);       
    }
}

//------------------------------------------------------------------------------------------------

const getAllProblem =async (req,res)=>{
    try{
        const getProblem = await Problem.find({});   //gives array
        if(getProblem.length==0){ return res.status(404).send("not a single problem is present in server")}
        res.status(200).send(getProblem);

    }
    catch(err){
        res.status(500).send("error in getAllProblem"+err);       
    }  
}

//---------------------------------------------------------------------------------------

const solvedAllProblemByUser =(req,res)=>{
    
}

module.exports ={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser}