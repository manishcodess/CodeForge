const axios = require('axios');

const getLanguageById = (lang) => {
    if (!lang) return 63;
    const language = {
        "c++": 54,
        "cpp": 54,
        "java": 62,
        "javascript": 63,
        "js": 63
    };

    return language[lang.toLowerCase()] || 63;
};

const submitBatch = async (submissions) => {
    if (!submissions || submissions.length === 0) return [];

    const encodedSubmissions = submissions.map(sub => ({
        ...sub,
        source_code: sub.source_code ? Buffer.from(sub.source_code).toString('base64') : null,
        stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : null,
        expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : null
    }));

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions: encodedSubmissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Judge0 API Error in submitBatch:", error.response ? error.response.data : error.message);
        throw new Error("Judge0 API Error: " + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
    if (!resultToken || !Array.isArray(resultToken) || resultToken.length === 0) {
        return [];
    }

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    const MAX_ATTEMPTS = 20; // 20 attempts * 1 second = max 20 seconds wait time
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        let responseData;
        try {
            const response = await axios.request(options);
            responseData = response.data;
        } catch (error) {
            console.error("Judge0 API Error in submitToken:", error.response ? error.response.data : error.message);
            throw new Error("Judge0 API Error: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        }

        if (!responseData || !Array.isArray(responseData.submissions)) {
            throw new Error("Invalid response received from Judge0");
        }

        const isResultObtained = responseData.submissions.every((r) => r.status_id > 2);

        if (isResultObtained) {
            return responseData.submissions.map(r => ({
                ...r,
                stdout: r.stdout ? Buffer.from(r.stdout, 'base64').toString('utf8') : null,
                stderr: r.stderr ? Buffer.from(r.stderr, 'base64').toString('utf8') : null,
                compile_output: r.compile_output ? Buffer.from(r.compile_output, 'base64').toString('utf8') : null,
                message: r.message ? Buffer.from(r.message, 'base64').toString('utf8') : null,
                stdin: r.stdin ? Buffer.from(r.stdin, 'base64').toString('utf8') : null,
                expected_output: r.expected_output ? Buffer.from(r.expected_output, 'base64').toString('utf8') : null,
            }));
        }

        await waiting(1000);
    }

    throw new Error("Evaluation timed out. Judge0 took too long to evaluate test cases.");
};

module.exports = { getLanguageById, submitBatch, submitToken };









// 


