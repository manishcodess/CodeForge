const { GoogleGenAI } = require("@google/genai");

const generateProblem = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!process.env.GEMINI_KEY) {
            return res.status(500).json({ message: "Missing GEMINI_KEY environment variable" });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) problem setter for a platform similar to LeetCode. 
Your task is to generate a completely new coding problem based on the user's prompt. 
You MUST respond STRICTLY with a valid JSON object (no markdown formatting, no backticks, no comments) that exactly matches this schema:
{
  "title": "String (Problem Title)",
  "description": "String (Detailed problem description in Markdown/HTML. Include examples visually in the description)",
  "difficulty": "String (Must be exactly 'easy', 'medium', or 'hard')",
  "tags": "String (Must be exactly 'array', 'linkedList', 'graph', or 'dp')",
  "visibleTestCases": [
    {
      "input": "String",
      "output": "String",
      "explanation": "String"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "String",
      "output": "String"
    }
  ],
  "startCode": [
    { "language": "C++", "initialCode": "String" },
    { "language": "Java", "initialCode": "String" },
    { "language": "JavaScript", "initialCode": "String" }
  ],
  "referenceSolution": [
    { "language": "C++", "completeCode": "String" },
    { "language": "Java", "completeCode": "String" },
    { "language": "JavaScript", "completeCode": "String" }
  ]
}

Rules:
1. Provide at least 3 visibleTestCases.
2. Provide at least 3 hiddenTestCases.
3. The 'startCode' array must contain exactly 3 objects with languages "C++", "Java", and "JavaScript".
4. The 'referenceSolution' array must contain exactly 3 objects with languages "C++", "Java", and "JavaScript".
5. The 'tags' field must strictly be one of: 'array', 'linkedList', 'graph', 'dp'. Pick the closest match if the user's prompt suggests a different topic (e.g. string -> array, tree -> graph).
6. Provide fully working and correct reference solutions.
7. Return ONLY JSON. Do not wrap it in \`\`\`json \`\`\`.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt || "Generate a random coding problem",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            },
        });

        // The response text should already be valid JSON
        const rawJsonStr = response.text.trim();
        
        let problemData;
        try {
            problemData = JSON.parse(rawJsonStr);
        } catch (parseError) {
            console.error("AI returned invalid JSON:", rawJsonStr);
            return res.status(500).json({ message: "AI generated invalid JSON structure. Please try again." });
        }

        res.status(200).json({
            problem: problemData
        });

    } catch (err) {
        console.error("Error in generateProblem:", err);
        res.status(500).json({
            message: err.message || "Internal server error"
        });
    }
};

module.exports = generateProblem;
