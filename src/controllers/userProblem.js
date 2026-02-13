const getLanguageById =require("../utils/ProblemUtility")

const createProblem =async (req,res) => {
    //problem.js will give title,des,diffiulty,tags to it  when user press submit
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,
        referenceSolution,problemCreator} =req.body;
        
    try{

        for(const {language,completeCode} of referenceSolution){
            //const referenceSolution =[ {language :"c++",completeCode:"3f3ff"},{},{}]
            const languageId =getLanguageById(language);
            //we need to make submission array
            //i am creating batch submission 
            const submissions =visibleTestCases.map((input,output)=>({
                source_code:completeCode,
                language_id: languageId,
                stdin: input,
                expected_output:output
            }));
        }

    }
    catch(err){

    }
}