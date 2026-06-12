const axios = require("axios");
require("dotenv").config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "http://localhost:2358";

const getLanguageById = (lang) => {//judge0 api ke hisab se language ka id chahiye hume to submit karne ke liye
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {//submissions is an array of objects where each object contains the code, language_id and stdin for each test case that we have to submit to judge0 api for evaluation and then we will get a token for each submission which we will use to check the result of each submission later
  const options = {
    method: "POST",
    url: `${JUDGE0_API_URL}/submissions/batch`,
    params: {
      base64_encoded: "false",
    },
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
};

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async (resultToken) => {//resultToken is an array of token received from judge0 api after submitting code for each test case and we have to keep on checking for result until we get the result for all test cases and then return the result to user
  const options = {
    method: "GET",
    url: `${JUDGE0_API_URL}/submissions/batch`,
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while (true) {
    const result = await fetchData();

    const IsResultObtained = result.submissions.every((r) => r.status_id > 2);//status_id > 2 means that the result is obtained for that test case and we have to check for all test cases if the result is obtained or not

    if (IsResultObtained) return result.submissions;//if result is obtained for all test cases then return the result to user

    await waiting(1000);
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
