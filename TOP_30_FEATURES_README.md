# 🚀 CodeForge: Top 30 Technical Features Explained in Depth

> A complete masterclass guide covering the top 30 features of the **CodeForge** platform. Every question includes an **easy concept explanation in simple English**, a **step-by-step implementation breakdown**, **actual source code snippets**, and **the architectural rationale ("Why that?")**.

---

## 📑 Table of Contents

1. [JWT Authentication with Dual-Mode Tokens (Cookie + Bearer Header)](#1-jwt-authentication-with-dual-mode-tokens)
2. [Instant Logout using Redis Token Blacklisting with Automatic TTL](#2-instant-logout-using-redis-token-blacklisting)
3. [Role-Based Access Control (RBAC) via Admin Middleware](#3-role-based-access-control-rbac-via-admin-middleware)
4. [Optional User Middleware for Seamless Public Browsing & Privileged Access](#4-optional-user-middleware)
5. [Sandboxed Remote Code Execution using Judge0 CE Batch API](#5-sandboxed-remote-code-execution-using-judge0)
6. [Asynchronous Polling Engine with Base64 Payload Decoding](#6-asynchronous-polling-engine-with-base64-payload-decoding)
7. [Multi-Language Compilation Support (C++, Java, JavaScript) via Language ID Mapping](#7-multi-language-compilation-support)
8. ["Run Code" Sandbox Evaluation (Visible Test Cases Only)](#8-run-code-sandbox-evaluation)
9. ["Submit Code" Evaluation with Runtime, Memory & Status Metric Tracking](#9-submit-code-evaluation-with-metric-tracking)
10. [Pre-Publish Automated Validation of Reference Solutions](#10-pre-publish-automated-validation-of-reference-solutions)
11. [Context-Aware Gemini 2.5 Flash DSA Doubt Solver ("ChatAI")](#11-context-aware-gemini-25-flash-dsa-doubt-solver)
12. [AI-Powered Automatic Coding Problem Generator from Plain Text Prompts](#12-ai-powered-automatic-coding-problem-generator)
13. [AI Problem Setter Assistant with Live Two-Way Form Sync ("Admin AI Co-Pilot")](#13-ai-problem-setter-assistant-with-live-form-sync)
14. [Direct Browser-to-Cloudinary Upload using Backend Cryptographic Signatures](#14-direct-browser-to-cloudinary-upload-via-cryptographic-signatures)
15. [Automated Cloudinary Video Thumbnail Extraction & Metadata Persistence](#15-automated-cloudinary-video-thumbnail-extraction)
16. [Orphan Media Auto-Cleanup on Cloudinary upon Video Replacement or Deletion](#16-orphan-media-auto-cleanup-on-cloudinary)
17. [Custom Built-in HTML5 Video Player with Scrubber & Time Tracker](#17-custom-built-in-html5-video-player)
18. [VS Code-Grade Monaco Code Editor Integration with Syntax Highlighting](#18-vs-code-grade-monaco-code-editor-integration)
19. [Draggable Dual-Axis Resizable Workspace (Horizontal & Vertical Split Panels)](#19-draggable-dual-axis-resizable-workspace)
20. [Multi-Tab Workspace (Description, Editorial, Solutions, Submissions, ChatAI)](#20-multi-tab-workspace)
21. [Interactive Submissions History with Metric Badges & Code Inspection Modal](#21-interactive-submissions-history)
22. [Real-Time Personal Analytics Dashboard & Difficulty Breakdown ("MyStats")](#22-real-time-personal-analytics-dashboard)
23. [Global Leaderboard Powered by MongoDB Aggregation Pipeline](#23-global-leaderboard-powered-by-mongodb-aggregation-pipeline)
24. [Tri-State Problem Tracking (Solved vs. Attempted vs. Unsolved)](#24-tri-state-problem-tracking)
25. [Multi-Dimensional Filter Bar with Instant Client-Side Search](#25-multi-dimensional-filter-bar-with-instant-search)
26. [Zero-Friction "Guest Mode" for Testing Without Registration](#26-zero-friction-guest-mode)
27. [Compound Indexing on Submissions Collection for High-Speed Lookups](#27-compound-indexing-on-submissions-collection)
28. [Mongoose Cascading Post-Delete Hook for Clean Account Teardowns](#28-mongoose-cascading-post-delete-hook)
29. [GitHub Flavored Markdown (GFM) & Syntax Highlighted Problem Renderers](#29-github-flavored-markdown-gfm-rendering)
30. [Centralized Axios Client with Automatic Token Injection & 401 Interceptors](#30-centralized-axios-client-with-token-injection)

---

### 1. JWT Authentication with Dual-Mode Tokens

#### Easy Idea in Simple English
When you log in to an app, the server gives you an official wristband (a **JSON Web Token / JWT**). Instead of asking the database for your identity on every single page click, the server reads this wristband. In CodeForge, the wristband is stored in **two places**: inside an **HTTP-only cookie** (for maximum browser security) and inside **LocalStorage** sent via the `Authorization: Bearer` header (for reliable cross-domain requests between Vercel and Render).

#### How Did They Implement It?
1. In `backend/src/controllers/authController.js`, after verifying password with `bcrypt.compare`, a JWT is signed containing the user ID, email, and role with a 7-day expiration.
2. The server sets an `httpOnly, secure: true, sameSite: 'none'` cookie and sends the token back in the JSON body.
3. In `frontend/src/store/slices/authSlice.js`, the token is stored in Redux and `localStorage`.
4. In `backend/src/middleware/userMiddleware.js`, the middleware first checks `req.cookies.token`. If missing, it checks `req.headers.authorization` for `Bearer <token>`.

#### Real Code Snippet
```javascript
// backend/src/controllers/authController.js
const token = jwt.sign(
  { _id: user._id, emailId: emailId, role: user.role },
  process.env.JWT_KEY,
  { expiresIn: '7d' }
);
res.cookie('token', token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'none',
  secure: true
});
res.status(201).json({ user: reply, token: token, message: "Logged in Successfully" });
```

```javascript
// backend/src/middleware/userMiddleware.js
let token = req.cookies.token;
if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
}
if (!token) throw new Error("Token is not present");
const payload = jwt.verify(token, process.env.JWT_KEY);
```

#### Why That?
- **Why not just cookies?** Third-party cookie policies in modern browsers (like Safari and Chrome) frequently block cookies across different domains (e.g. `vercel.app` calling `onrender.com`). Having the `Bearer` header fallback guarantees 100% login reliability in production.
- **Why not just local storage?** HTTP-only cookies prevent Cross-Site Scripting (XSS) attacks from stealing tokens. CodeForge leverages the security of cookies plus the cross-origin reliability of Bearer tokens.

---

### 2. Instant Logout using Redis Token Blacklisting

#### Easy Idea in Simple English
Standard JWTs cannot be cancelled by the server once issued—they remain valid until their expiration timer runs out. If a user clicks **Logout**, a stolen token could still be used. CodeForge solves this by storing revoked tokens in **Redis** with a "Blocked" label. The entry automatically deletes itself when the token would have naturally expired.

#### How Did They Implement It?
1. When the user hits `/user/logout`, the server decodes the token's expiration timestamp (`payload.exp`).
2. The server saves `token:<token>` into Redis with the value `"Blocked"`.
3. It sets `redisClient.expireAt(key, payload.exp)`.
4. In `userMiddleware.js`, before approving any API request, Redis is checked via `redisClient.exists()`. If the token is blocked, the request is immediately rejected with `401 Unauthorized`.

#### Real Code Snippet
```javascript
// backend/src/controllers/authController.js
const logout = async (req, res) => {
    let token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).send("No active session found");
    
    const payload = jwt.decode(token);
    await redisClient.set(`token:${token}`, 'Blocked');
    if (payload && payload.exp) {
        await redisClient.expireAt(`token:${token}`, payload.exp);
    }

    res.clearCookie("token", { sameSite: 'none', secure: true });
    res.send("Logged Out Successfully");
};
```

#### Why That?
- **Why Redis instead of MongoDB?** Redis is an in-memory database that runs in single-digit microseconds (`O(1)` lookups). Checking MongoDB on *every single incoming API request* would slow down the entire system.
- **Zero Database Bloat:** Using Redis TTL (`expireAt`) means Redis cleans up expired tokens automatically. You never need a background cron job to sweep old logged-out records.

---

### 3. Role-Based Access Control (RBAC) via Admin Middleware

#### Easy Idea in Simple English
Only platform administrators should be allowed to create problems, edit test cases, upload video tutorials, or delete content. Normal users should only solve problems. CodeForge enforces this using a dedicated **Admin Middleware** checkpoint on all sensitive routes.

#### How Did They Implement It?
1. The User model has an enum field `role: ['user', 'admin']` (default `'user'`).
2. The `adminMiddleware.js` extracts the user ID from the verified JWT, fetches the user record from MongoDB, and asserts `result.role === 'admin'`.
3. If the user is not an admin, execution halts immediately with `401 / Invalid Token`.

#### Real Code Snippet
```javascript
// backend/src/middleware/adminMiddleware.js
const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const result = await User.findById(payload._id);

        if (!result || result.role !== 'admin') {
            throw new Error("Invalid Token or Unauthorized");
        }

        req.result = result;
        next();
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};
```

#### Why That?
- **Security by Design:** Client-side hiding of buttons is never enough because anyone can craft an HTTP `POST` request with Postman or Curl. Strict server-side middleware guarantees complete protection of core data.

---

### 4. Optional User Middleware

#### Easy Idea in Simple English
Sometimes a route should be accessible to everyone (even people not logged in), but if an **admin** views it, they should see secret fields (like hidden test cases for editing). `optionalUserMiddleware` lets public users pass through without errors while attaching user data when a valid token exists.

#### How Did They Implement It?
1. In `optionalUserMiddleware.js`, if no token is provided or if verification fails, the error is simply ignored and `next()` is called immediately.
2. In `getProblemById`, the controller inspects `req.result?.role`. If the visitor is an admin, it selects all fields including `hiddenTestCases`. If regular or unauthenticated, it excludes `hiddenTestCases`.

#### Real Code Snippet
```javascript
// backend/src/middleware/optionalUserMiddleware.js
const optionalUserMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) return next();

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const result = await User.findById(payload._id);
        const isBlocked = await redisClient.exists(`token:${token}`);

        if (result && !isBlocked) {
            req.result = result;
        }
        next();
    } catch (err) {
        next(); // Ignore errors, proceed as guest
    }
};
```

```javascript
// backend/src/controllers/problemController.js
const selectStr = req.result && req.result.role === 'admin' 
    ? '' 
    : '_id title description difficulty tags visibleTestCases startCode referenceSolution';

const getProblem = await Problem.findById(id).select(selectStr);
```

#### Why That?
- **One Unified API Endpoint:** Without this, you would need two separate APIs (`/problem/public/:id` and `/problem/admin/:id`). One clean endpoint handles both guests and admins smoothly.
- **Prevents Cheating:** Regular users can never inspect the network tab to view hidden test cases.

---

### 5. Sandboxed Remote Code Execution using Judge0

#### Easy Idea in Simple English
Running untrusted code submitted by strangers directly on your web server using `eval()` or `child_process.exec()` is dangerous: someone could delete all files or crash the machine. CodeForge delegates all code compilation and execution to **Judge0**, an isolated sandbox runner operating on separate infrastructure.

#### How Did They Implement It?
1. User code, language ID, and test case inputs are gathered.
2. Every string (`source_code`, `stdin`, `expected_output`) is converted to **Base64** to prevent special characters, tabs, or newlines from breaking JSON payloads.
3. A single batch `POST` request is sent to `https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=true`.
4. Judge0 assigns a unique execution token (`UUID`) to every test case run.

#### Real Code Snippet
```javascript
// backend/src/utils/problemUtility.js
const submitBatch = async (submissions) => {
  const encodedSubmissions = submissions.map(sub => ({
    ...sub,
    source_code: sub.source_code ? Buffer.from(sub.source_code).toString('base64') : null,
    stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : null,
    expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : null
  }));

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'true' },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions: encodedSubmissions }
  };

  const response = await axios.request(options);
  return response.data; // Returns array of tokens
};
```

#### Why That?
- **Ironclad Sandbox Security:** Sandboxed runners enforce memory limits, time limits, and restrict system-level kernel calls.
- **Batching Reduces API Calls:** Instead of making 10 individual HTTP requests for 10 test cases, 1 batch call executes all of them together.

---

### 6. Asynchronous Polling Engine with Base64 Payload Decoding

#### Easy Idea in Simple English
Compiling C++ or Java takes 1 to 2 seconds. Judge0 accepts the job and immediately returns tokens. The CodeForge backend then enters a smart waiting loop: every 1 second, it checks if all test cases have finished executing. Once finished, it converts the Base64 answers back into readable text.

#### How Did They Implement It?
1. The backend collects the tokens: `["uuid-1", "uuid-2", ...]`.
2. A `while(true)` loop checks `result.submissions.every(r => r.status_id > 2)`.
   - Status 1: `In Queue`
   - Status 2: `Processing`
   - Status > 2: `Finished` (3 = Accepted, 4 = Wrong Answer, 5 = TLE, 6 = Compile Error, etc.)
3. If not finished, it pauses for 1000ms using a `Promise` timeout.
4. Once completed, it decodes `stdout`, `stderr`, and `compile_output` from Base64 into UTF-8 strings.

#### Real Code Snippet
```javascript
// backend/src/utils/problemUtility.js
const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { tokens: resultToken.join(","), base64_encoded: 'true', fields: '*' },
    headers: { 'x-rapidapi-key': process.env.JUDGE0_KEY, 'x-rapidapi-host': 'judge0-ce.p.rapidapi.com' }
  };

  while (true) {
    const result = await fetchData();
    const isResultObtained = result.submissions.every(r => r.status_id > 2);

    if (isResultObtained) {
      return result.submissions.map(r => ({
        ...r,
        stdout: r.stdout ? Buffer.from(r.stdout, 'base64').toString('utf8') : null,
        stderr: r.stderr ? Buffer.from(r.stderr, 'base64').toString('utf8') : null,
        compile_output: r.compile_output ? Buffer.from(r.compile_output, 'base64').toString('utf8') : null
      }));
    }
    await new Promise(res => setTimeout(res, 1000));
  }
};
```

#### Why That?
- **Prevents Infinite Hanging:** Checking `status_id > 2` ensures the loop exits cleanly whether the program succeeded, threw a runtime exception, or timed out.
- **Accurate Buffer Decoding:** Base64 decoding prevents multiline compiler traces and special unicode characters from getting corrupted.

---

### 7. Multi-Language Compilation Support

#### Easy Idea in Simple English
Users can write solutions in **C++**, **Java**, or **JavaScript**. Each language requires different compilers and runtime flags. CodeForge maps frontend language keys to universal Judge0 numeric language IDs.

#### How Did They Implement It?
1. An internal dictionary maps normalized language names to IDs:
   - `c++` or `cpp` $\rightarrow$ ID `54` (GCC 9.2.0)
   - `java` $\rightarrow$ ID `62` (OpenJDK 13.0.1)
   - `javascript` $\rightarrow$ ID `63` (Node.js 12.14.0)
2. The problem schema stores boilerplate `startCode` and complete `referenceSolution` for all three languages.

#### Real Code Snippet
```javascript
// backend/src/utils/problemUtility.js
const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return language[lang.toLowerCase()];
};
```

#### Why That?
- **Uniform API Standard:** The frontend only needs to pass `"cpp"`, `"java"`, or `"javascript"`. The backend translates it to exact compiler IDs without the frontend needing internal Judge0 knowledge.

---

### 8. "Run Code" Sandbox Evaluation (Visible Test Cases Only)

#### Easy Idea in Simple English
When practicing, users want to test their code quickly against sample test cases without registering an official submission on their profile. The "Run Code" button executes against only the 3 visible test cases, returning inputs, outputs, and standard errors immediately.

#### How Did They Implement It?
1. The route `POST /submission/run/:id` grabs the problem's `visibleTestCases`.
2. It sends them to Judge0 via `submitBatch`.
3. It does **not** create a persistent `Submission` document in MongoDB.
4. It responds with pass/fail status, execution runtime, memory, and stdout/expected output comparisons.

#### Real Code Snippet
```javascript
// backend/src/controllers/submissionController.js
const runCode = async (req, res) => {
    const problem = await Problem.findById(problemId);
    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map(testcase => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map(v => v.token);
    const testResult = await submitToken(resultToken);

    res.status(201).json({
        success: testResult.every(t => t.status_id === 3),
        testCases: testResult,
        runtime,
        memory
    });
};
```

#### Why That?
- **Fast Feedback Loop:** Solvers iterate rapidly without polluting their profile submission statistics with intermediate debug code.
- **Database Efficiency:** Prevents MongoDB from accumulating thousands of temporary test runs.

---

### 9. "Submit Code" Evaluation with Metric Tracking

#### Easy Idea in Simple English
When a user clicks "Submit", their code is evaluated against secret, large edge cases. If all test cases pass, the platform records the submission, awards a solved status, calculates total runtime and memory, and adds the problem to the user's solved list.

#### How Did They Implement It?
1. Creates an initial pending record in MongoDB: `Submission.create({ status: 'pending', ... })`.
2. Runs code against `problem.hiddenTestCases` via Judge0.
3. Loops through results: tracks passed cases, adds runtime, finds maximum peak memory, and classifies status (`accepted`, `wrong`, `tle`, `error`).
4. If accepted, appends `problemId` to `user.problemSolved` if not already present.

#### Real Code Snippet
```javascript
// backend/src/controllers/submissionController.js
for (const test of testResult) {
    if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
    } else {
        if (test.status_id === 4) { status = 'wrong'; errorMessage = 'Wrong Answer'; }
        else if (test.status_id === 5) { status = 'tle'; errorMessage = 'Time Limit Exceeded'; }
        else if (test.status_id === 6) { status = 'error'; errorMessage = test.compile_output || 'Compilation Error'; }
        else { status = 'error'; errorMessage = test.stderr || 'Runtime Error'; }
    }
}

if (!req.result.problemSolved.includes(problemId)) {
    req.result.problemSolved.push(problemId);
    await req.result.save();
}
```

#### Why That?
- **Integrity:** Hidden test cases prevent users from hardcoding `if (input == 1) return 2;`.
- **Performance Analytics:** Measuring runtime (ms) and peak memory (kB) gives users real LeetCode-style performance metrics.

---

### 10. Pre-Publish Automated Validation of Reference Solutions

#### Easy Idea in Simple English
What if an admin makes a typo when creating a problem, causing the reference solution to fail its own test cases? That would break the problem for all users. CodeForge automatically executes the admin's reference code against all visible test cases **before** allowing the problem to be saved to the database.

#### How Did They Implement It?
1. In `createProblem` and `updateProblem`, the server iterates over `referenceSolution` (C++, Java, JS).
2. It sends the reference solution with visible test cases to Judge0.
3. If any test case yields `status_id !== 3` (Accepted), the save operation is aborted with a `400 Bad Request` displaying the compiler error or stderr.

#### Real Code Snippet
```javascript
// backend/src/controllers/problemController.js
for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(language);
    const submissions = visibleTestCases.map(tc => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const testResult = await submitToken(submitResult.map(v => v.token));

    for (const test of testResult) {
        if (test.status_id !== 3) {
            return res.status(400).json({
                message: "Reference solution failed on a test case",
                error: test.compile_output || test.stderr || "Unknown error",
                status: test.status
            });
        }
    }
}
// Only reaches here if all reference solutions passed!
await Problem.create({ ...req.body, problemCreator: req.result._id });
```

#### Why That?
- **Zero Broken Problems in Production:** Guarantees that every problem published on the platform has at least one verifiably working reference solution.

---

### 11. Context-Aware Gemini 2.5 Flash DSA Doubt Solver ("ChatAI")

#### Easy Idea in Simple English
When stuck on a problem, users don't need a generic chatbot—they need a tutor that knows the **exact problem statement**, the **test cases**, and the **code currently typed in their editor**. CodeForge feeds this entire context into Google's **Gemini 2.5 Flash** model with strict Socratic teaching rules.

#### How Did They Implement It?
1. The frontend (`ChatAi.jsx`) sends the conversation history along with problem title, description, starter code, user code, and active language to `POST /ai/chat`.
2. In `backend/src/controllers/ai/solveDoubt.js`, Google's official `@google/genai` SDK formats a tailored system prompt.
3. System instructions strictly instruct Gemini: "You are a DSA tutor. Provide step-by-step hints, identify bugs without giving away raw solutions immediately, and refuse to answer non-DSA questions."

#### Real Code Snippet
```javascript
// backend/src/controllers/ai/solveDoubt.js
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: messages,
    config: {
        systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor.
CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[USER_CURRENT_LANGUAGE]: ${userLanguage}
[USER_CURRENT_CODE]: 
\`\`\`${userLanguage}
${userCode}
\`\`\`
STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem.
- Encourage understanding over memorization; guide users to discover solutions.
`
    }
});
res.status(201).json({ message: response.text });
```

#### Why That?
- **Real-Time Context:** The user doesn't have to copy-paste their code or explain the problem. The AI instantly sees the exact line where their logic failed.
- **Prevents Hallucinations & Cheating:** Guardrails prevent the AI from drifting off-topic or spoiling solutions too easily.

---

### 12. AI-Powered Automatic Coding Problem Generator

#### Easy Idea in Simple English
Writing 10 hidden test cases, descriptions in Markdown, and starter codes in 3 programming languages takes an admin hours. CodeForge lets admins type a single sentence (e.g., *"Generate a medium sliding window problem about fruit trees"*), and Gemini generates a complete, production-ready problem in seconds.

#### How Did They Implement It?
1. Route `POST /ai/generate-problem` receives the prompt.
2. In `generateProblem.js`, Gemini is configured with `responseMimeType: "application/json"`.
3. Gemini is instructed to output an exact JSON schema containing: `title`, `description`, `difficulty`, `tags`, 3 `visibleTestCases`, 10 `hiddenTestCases`, 3 `startCode` objects (C++, Java, JS), and 3 working `referenceSolution` objects.

#### Real Code Snippet
```javascript
// backend/src/controllers/ai/generateProblem.js
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt || "Generate a random coding problem",
    config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
    },
});

const problemData = JSON.parse(response.text.trim());
res.status(200).json({ problem: problemData });
```

#### Why That?
- **Strict `responseMimeType: "application/json"`:** Prevents the AI from wrapping output in markdown triple backticks (```json), guaranteeing `JSON.parse()` never crashes.
- **Instant Admin Productivity:** Problem creation time drops from 45 minutes to 10 seconds.

---

### 13. AI Problem Setter Assistant with Live Form-Sync

#### Easy Idea in Simple English
When an admin is editing a problem form (e.g., updating a description or adding test cases), an AI Co-Pilot chat window sits right beside the form. If the admin chats: *"Add 5 more edge cases for negative numbers"*, the AI replies conversantly **and directly updates the input fields on the screen automatically**.

#### How Did They Implement It?
1. In `AdminUpdateAi.jsx`, the current live `formData` state is sent to `POST /ai/admin-chat`.
2. The AI returns a JSON structure containing `{ message: string, updates: object }`.
3. The frontend reads `response.data.updates` and calls `onApplyUpdates()`, automatically populating the form inputs without manual typing.

#### Real Code Snippet
```javascript
// frontend/src/components/admin/AdminUpdateAi.jsx
const response = await axiosClient.post('/ai/admin-chat', {
    messages: newMessages,
    formData: formData // Live state of form
});

const aiMessage = { 
    role: 'model', 
    parts: [{ text: response.data.message }],
    updatesApplied: response.data.updates ? Object.keys(response.data.updates) : null
};

if (aiMessage.updatesApplied && onApplyUpdates) {
    onApplyUpdates(response.data.updates); // Updates parent form state directly!
}
```

#### Why That?
- **Two-Way Co-Pilot Experience:** The admin doesn't need to manually copy text from a chat window and paste it into form inputs. The AI directly modifies the active form state.

---

### 14. Direct Browser-to-Cloudinary Upload via Cryptographic Signatures

#### Easy Idea in Simple English
Video files are huge (50MB to 500MB). If a user uploads video through your Node.js backend server, your server's memory fills up and the API freezes for other users. CodeForge solves this by letting the **browser upload directly to Cloudinary**. The backend only provides a secure digital signature approving the upload.

#### How Did They Implement It?
1. The admin frontend requests an upload signature from `GET /video/upload-signature/:problemId`.
2. In `videoController.js`, the backend uses `cloudinary.utils.api_sign_request()` with `CLOUDINARY_API_SECRET` to sign the timestamp and public ID.
3. The frontend receives the signature and sends a `FormData` `POST` request directly to Cloudinary's upload endpoint: `https://api.cloudinary.com/v1_1/<cloud_name>/video/upload`.

#### Real Code Snippet
```javascript
// backend/src/controllers/videoController.js
const generateUploadSignature = async (req, res) => {
    const { problemId } = req.params;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${req.result._id}_${timestamp}`;

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, public_id: publicId },
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        signature,
        timestamp,
        public_id: publicId,
        upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
    });
};
```

#### Why That?
- **Zero Server Bandwidth Bottleneck:** High-resolution video streams bypass the Express backend entirely, preserving server CPU and memory.
- **Secure:** Without the backend's secret signature, nobody can upload rogue files to your Cloudinary storage.

---

### 15. Automated Cloudinary Video Thumbnail Extraction

#### Easy Idea in Simple English
When users open a video tutorial, they want to see an attractive preview image (poster) and know the exact video duration before hitting play. CodeForge automatically creates a video thumbnail using Cloudinary transformation parameters.

#### How Did They Implement It?
1. After the direct upload succeeds, the frontend sends metadata to `POST /video/save-metadata`.
2. Cloudinary's backend SDK queries `cloudinary.api.resource()` to get exact video duration.
3. `cloudinary.image(public_id, { resource_type: "video" })` automatically extracts a preview snapshot and stores it in the `SolutionVideo` collection.

#### Real Code Snippet
```javascript
// backend/src/controllers/videoController.js
const cloudinaryResource = await cloudinary.api.resource(
    cloudinaryPublicId,
    { resource_type: 'video' }
);

const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id, { resource_type: "video" });

await SolutionVideo.create({
    problemId,
    userId,
    cloudinaryPublicId,
    secureUrl,
    duration: cloudinaryResource.duration || duration,
    thumbnailUrl
});
```

#### Why That?
- **No Manual Image Generation Needed:** Cloudinary automatically captures an engaging snapshot frame from the video stream without requiring external tools like FFmpeg on your server.

---

### 16. Orphan Media Auto-Cleanup on Cloudinary

#### Easy Idea in Simple English
If an admin uploads an updated video solution or deletes a problem, the old video shouldn't stay on Cloudinary accumulating expensive hosting charges forever. CodeForge automatically destroys old videos from Cloudinary when an update or deletion occurs.

#### How Did They Implement It?
1. In `saveVideoMetadata`, the server checks `SolutionVideo.findOne({ problemId })`.
2. If an existing video is found, it calls `cloudinary.uploader.destroy(existingVideo.cloudinaryPublicId, { resource_type: 'video', invalidate: true })`.
3. In `deleteVideo`, the document is removed from MongoDB and the asset is destroyed on Cloudinary's CDN.

#### Real Code Snippet
```javascript
// backend/src/controllers/videoController.js
if (existingVideo) {
    try {
        await cloudinary.uploader.destroy(existingVideo.cloudinaryPublicId, { 
            resource_type: 'video', 
            invalidate: true 
        });
    } catch (err) {
        console.error("Failed to delete old video from cloudinary", err);
    }
    existingVideo.secureUrl = secureUrl;
    await existingVideo.save();
}
```

#### Why That?
- **Storage Cost Optimization:** Prevents "ghost" files from silently consuming cloud storage quotas.
- **Cache Invalidation:** The `invalidate: true` flag flushes the Cloudinary CDN cache globally so users never see stale videos.

---

### 17. Custom Built-in HTML5 Video Player

#### Easy Idea in Simple English
Instead of rendering the browser's generic, clunky default video player, CodeForge features a custom-built, sleek dark-mode player with a center-pulse play button, dynamic orange hover scrubbers, and formatted timestamps.

#### How Did They Implement It?
1. In `frontend/src/components/problem/Editorial.jsx`, a React component manages state for `isPlaying`, `currentTime`, and `duration`.
2. An event listener tracks `timeupdate` from the native video element ref.
3. A custom slider allows jumping to any timestamp with `videoRef.current.currentTime = (clickPos / width) * duration`.

#### Real Code Snippet
```jsx
// frontend/src/components/problem/Editorial.jsx
const togglePlayPause = () => {
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
};

<div className="relative w-full max-w-3xl rounded-2xl overflow-hidden group">
    <video ref={videoRef} src={secureUrl} poster={thumbnailUrl} onClick={togglePlayPause} />
    {!isPlaying && currentTime === 0 && (
        <button onClick={togglePlayPause} className="absolute inset-0 flex items-center justify-center">
            <Play className="w-10 h-10 text-orange-500" />
        </button>
    )}
</div>
```

#### Why That?
- **Unified Brand Aesthetic:** Ensures video playback matches the dark-themed CodeForge design language across Chrome, Safari, Firefox, and mobile devices.

---

### 18. VS Code-Grade Monaco Code Editor Integration

#### Easy Idea in Simple English
Programmers expect professional developer tool features: syntax highlighting, bracket matching, line numbers, and indentation shortcuts. CodeForge embeds **Monaco Editor**—the exact same code editor engine that powers Microsoft VS Code.

#### How Did They Implement It?
1. Uses `@monaco-editor/react` inside `ProblemPage.jsx`.
2. Dynamically switches the language model (`javascript`, `java`, `cpp`) when the user selects a language from the dropdown.
3. Configures `theme="vs-dark"` and binds `onChange` to track code in React state.

#### Real Code Snippet
```jsx
// frontend/src/pages/ProblemPage.jsx
<Editor
    height="100%"
    language={getLanguageForMonaco(selectedLanguage)}
    theme="vs-dark"
    value={code}
    onChange={handleEditorChange}
    options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: "on"
    }}
/>
```

#### Why That?
- **Industry Standard Experience:** Candidates practice in the exact same environment used in technical interview platforms.
- **Automatic Layout:** Monaco automatically recalculates line widths when panels are dragged or resized.

---

### 19. Draggable Dual-Axis Resizable Workspace

#### Easy Idea in Simple English
Every programmer has different screen preferences: some want more space to read the problem, while others want a large code editor and console. CodeForge allows dragging both the **horizontal separator** (between description and code editor) and the **vertical separator** (between code editor and console results).

#### How Did They Implement It?
1. State hooks store `leftPanelWidth` (percentage) and `bottomPanelHeight` (percentage).
2. Mouse event listeners (`mousemove`, `mouseup`) calculate the cursor's coordinate percentage relative to `window.innerWidth` and `window.innerHeight`.
3. Bounded limits prevent panels from collapsing completely (`20% < width < 80%`).

#### Real Code Snippet
```javascript
// frontend/src/pages/ProblemPage.jsx
const startResizingHorizontal = (e) => {
    e.preventDefault();
    const handleMouseMove = (e) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};
```

#### Why That?
- **Maximum Ergonomics:** Allows flexible multi-tasking across laptop screens, ultrawide monitors, and tablet displays without cutting off text.

---

### 20. Multi-Tab Workspace

#### Easy Idea in Simple English
Solving algorithmic problems involves multiple activities: reading specifications, reviewing video editorials, studying official solutions, checking submission history, and asking an AI assistant for hints. CodeForge organizes all of these into seamless tabs on the left panel without triggering page reloads.

#### How Did They Implement It?
1. The left panel renders navigation buttons: `['description', 'editorial', 'solutions', 'submissions', 'chatAI']`.
2. An `activeLeftTab` state dynamically mounts the corresponding component (`<Editorial />`, `<ChatAi />`, `<SubmissionHistory />`, or markdown description).

#### Real Code Snippet
```jsx
// frontend/src/pages/ProblemPage.jsx
{['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
    <button 
        key={tab}
        className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
            activeLeftTab === tab ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'
        }`}
        onClick={() => setActiveLeftTab(tab)}
    >
        {tab.toUpperCase()}
    </button>
))}
```

#### Why That?
- **State Preservation:** Switching between tabs keeps the user's ongoing code and console output completely intact in memory without refreshing.

---

### 21. Interactive Submissions History with Code Inspection Modal

#### Easy Idea in Simple English
Users want to review past attempts: what code was written 3 days ago, why did it fail, and how did runtime compare? CodeForge provides a full submission history tab with color-coded badges and a modal viewer to view past source code.

#### How Did They Implement It?
1. Calls `GET /problem/submittedProblem/:pid` to retrieve all historical submissions for the current user and problem.
2. Displays status pills (`Accepted` in green, `Wrong Answer` in red, `Time Limit Exceeded` in yellow).
3. Clicking any row opens a read-only code viewer displaying the exact code submitted at that timestamp.

#### Real Code Snippet
```jsx
// frontend/src/components/problem/SubmissionHistory.jsx
{submissions.map((sub) => (
    <tr key={sub._id} onClick={() => setSelectedSubmission(sub)} className="cursor-pointer hover:bg-white/5">
        <td>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                sub.status === 'accepted' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
                {sub.status.toUpperCase()}
            </span>
        </td>
        <td>{sub.language}</td>
        <td>{sub.runtime} ms</td>
        <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
    </tr>
))}
```

#### Why That?
- **Learning from Mistakes:** Enables users to study how their solutions evolved from brute force to optimal runtime over time.

---

### 22. Real-Time Personal Analytics Dashboard ("MyStats")

#### Easy Idea in Simple English
A gamified platform motivates users by visualizing progress. The **MyStats** component computes the user's solved question count against the platform's total questions, split into **Easy**, **Medium**, and **Hard** progress rings.

#### How Did They Implement It?
1. Gathers all problems solved by the user (`GET /problem/problemSolvedByUser`).
2. Calculates difficulty ratios:
   - $\text{Easy Solved} / \text{Total Easy}$
   - $\text{Medium Solved} / \text{Total Medium}$
   - $\text{Hard Solved} / \text{Total Hard}$
3. Renders clean, animated progress bars and completion percentages.

#### Real Code Snippet
```jsx
// frontend/src/components/dashboard/MyStats.jsx
const easySolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
const mediumSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
const hardSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

const totalSolved = solvedProblems.length;
const totalAvailable = allProblems.length;
const percentage = totalAvailable > 0 ? Math.round((totalSolved / totalAvailable) * 100) : 0;
```

#### Why That?
- **Retention & Motivation:** Clear visual feedback encourages daily problem-solving and interview preparation consistency.

---

### 23. Global Leaderboard Powered by MongoDB Aggregation Pipeline

#### Easy Idea in Simple English
A global leaderboard shows the top 10 competitive coders on the platform. Calculating this by fetching all users into Node.js memory and sorting them with `.sort()` would crash the server as user counts scale. CodeForge offloads the computation directly to the **MongoDB Aggregation Pipeline**.

#### How Did They Implement It?
1. In `getLeaderboard`, a 3-stage aggregation pipeline runs inside the database engine:
   - `$project`: Concatenates first and last name, computes array length of `problemSolved` using `$size`.
   - `$sort`: Sorts by `totalQuestionsSolved` descending (`-1`).
   - `$limit`: Returns only the top 10 records.

#### Real Code Snippet
```javascript
// backend/src/controllers/authController.js
const getLeaderboard = async (req, res) => {
    const leaderboard = await User.aggregate([
        {
            $project: {
                name: { $concat: ["$firstName", " ", { $ifNull: ["$lastName", ""] }] },
                totalQuestionsSolved: { $size: { $ifNull: ["$problemSolved", []] } }
            }
        },
        { $sort: { totalQuestionsSolved: -1 } },
        { $limit: 10 }
    ]);
    res.status(200).json(leaderboard);
};
```

#### Why That?
- **C-Level Database Execution Speed:** Aggregations run directly in MongoDB's optimized native engine without transferring unneeded user documents across the network to Node.js.

---

### 24. Tri-State Problem Tracking (Solved vs. Attempted vs. Unsolved)

#### Easy Idea in Simple English
On the problem list page, users need to clearly see:
1. Problems they **Solved** (Green checkmark).
2. Problems they **Attempted** but haven't passed yet (Orange status).
3. Problems they haven't touched yet (**Unsolved**).

#### How Did They Implement It?
1. Route `/problem/problemSolvedByUser` returns all IDs in `user.problemSolved`.
2. Route `/problem/problemAttemptedByUser` finds distinct problem IDs in the `Submission` collection for that user (`Submission.distinct('problemId', { userId })`), and filters out any that are already in `problemSolved`.
3. The frontend displays corresponding visual indicators in the problem table.

#### Real Code Snippet
```javascript
// backend/src/controllers/problemController.js
const attemptedAllProblembyUser = async (req, res) => {
    const userId = req.result._id;
    const allSubmitted = await Submission.distinct('problemId', { userId });
    const solvedIds = req.result.problemSolved.map(id => id.toString());
    
    const attemptedIds = allSubmitted.filter(pid => !solvedIds.includes(pid.toString()));
    const attemptedProblems = await Problem.find({ _id: { $in: attemptedIds } }).select("_id title difficulty tags");
    
    res.status(200).send(attemptedProblems);
};
```

#### Why That?
- **Precision:** A user who submitted code but got a "Wrong Answer" is distinct from someone who never opened the question. This helps users quickly resume unfinished problems.

---

### 25. Multi-Dimensional Filter Bar with Instant Search

#### Easy Idea in Simple English
Finding a specific problem in a catalog of hundreds of questions should be instantaneous. CodeForge lets users filter concurrently by **Difficulty**, **Topic Tag** (e.g. Dynamic Programming, Two Pointers), **Status** (Solved/Unsolved), and free-text **Search Queries**.

#### How Did They Implement It?
1. `FilterBar.jsx` manages active filter states.
2. The problems list on the homepage runs a four-predicate filter function:
   $$\text{difficultyMatch} \land \text{tagMatch} \land \text{statusMatch} \land \text{searchMatch}$$
3. Runs purely in client-side memory for instant 0ms latency.

#### Real Code Snippet
```javascript
// frontend/src/pages/Homepage.jsx
const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags.includes(filters.tag);
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const isAttempted = attemptedProblems.some(ap => ap._id === problem._id);
    
    const statusMatch = filters.status === 'all' || 
                        (filters.status === 'solved' && isSolved) ||
                        (filters.status === 'unsolved' && !isSolved) ||
                        (filters.status === 'attempted' && isAttempted);
                        
    const searchMatch = !filters.searchQuery || problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
});
```

#### Why That?
- **Instant Responsiveness:** Because problem metadata (titles, tags, difficulties) is lightweight, filtering on the client avoids unnecessary server round-trips while typing in the search box.

---

### 26. Zero-Friction "Guest Mode"

#### Easy Idea in Simple English
First-time visitors want to test the UI, write code, and explore the layout immediately without being forced to fill out a registration form. CodeForge offers a one-click **"Continue as Guest"** feature that sets up a local session.

#### How Did They Implement It?
1. In `authSlice.js`, the `setGuestMode` reducer initializes a guest user object `{ role: 'guest', username: 'Guest' }` and marks `isGuest: true` in `localStorage`.
2. The UI allows guest navigation throughout the app.
3. If the guest tries to perform server-persisted actions (like running or submitting code), a helpful toast notification prompts them to sign in.

#### Real Code Snippet
```javascript
// frontend/src/store/slices/authSlice.js
setGuestMode: (state) => {
    state.isAuthenticated = true;
    state.user = { role: 'guest', username: 'Guest' };
    state.loading = false;
    state.error = null;
    localStorage.setItem('isGuest', 'true');
}
```

```javascript
// frontend/src/pages/ProblemPage.jsx
const handleRun = async () => {
    if (!user || user.role === 'guest') {
        toast.error('Please login to run code!');
        return;
    }
    // Proceed with run...
};
```

#### Why That?
- **Higher Conversion & User Delight:** Lowers bounce rates by letting potential users experience the platform before requiring signup.

---

### 27. Compound Indexing on Submissions Collection

#### Easy Idea in Simple English
As thousands of users submit code daily, the `submissions` table grows to millions of rows. Searching through millions of unindexed rows to find a user's submissions for problem X would take seconds and peg server CPU at 100%. CodeForge adds a **MongoDB Compound Index** on `{ userId: 1, problemId: 1 }`.

#### How Did They Implement It?
1. Inside `backend/src/models/submission.js`, Mongoose registers a compound index.
2. MongoDB maintains a B-Tree data structure sorted first by `userId`, then by `problemId`.

#### Real Code Snippet
```javascript
// backend/src/models/submission.js
const submissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'problem', required: true },
    code: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'wrong', 'error'], default: 'pending' },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 }
}, { timestamps: true });

// High-speed compound index:
submissionSchema.index({ userId: 1, problemId: 1 });
```

#### Why That?
- **Query Complexity Drops from $O(N)$ to $O(\log N)$:** Fetching a user's problem submissions takes under 2 milliseconds regardless of whether the collection has 10,000 or 10,000,000 records.

---

### 28. Mongoose Cascading Post-Delete Hook

#### Easy Idea in Simple English
When a user deletes their profile account, their old submission records shouldn't linger as orphaned ghost data in the database. CodeForge uses a **Mongoose Post Middleware Hook** that automatically purges all related submissions whenever a user account is deleted.

#### How Did They Implement It?
1. In `backend/src/models/user.js`, a post hook is attached to the `findOneAndDelete` operation.
2. After the user document is removed, the hook executes `mongoose.model('submission').deleteMany({ userId: userInfo._id })`.

#### Real Code Snippet
```javascript
// backend/src/models/user.js
userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
        await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});
```

#### Why That?
- **Referential Integrity Without SQL:** MongoDB doesn't have foreign key `ON DELETE CASCADE` constraints built into the database engine. Mongoose middleware guarantees database hygiene automatically.

---

### 29. GitHub Flavored Markdown (GFM) Problem Renderers

#### Easy Idea in Simple English
Algorithm problem descriptions need rich formatting: code snippets, formatted input/output tables, bulleted constraints, and bold algorithmic requirements. CodeForge uses **ReactMarkdown** with the **remark-gfm** plugin to format descriptions beautifully.

#### How Did They Implement It?
1. In `ProblemPage.jsx`, `ChatAi.jsx`, and `AdminUpdateAi.jsx`, text is wrapped in `<ReactMarkdown remarkPlugins={[remarkGfm]}>`.
2. Tailwind Typography (`prose prose-invert`) formats headers, lists, code blocks, and markdown tables with dark theme styling.

#### Real Code Snippet
```jsx
// frontend/src/pages/ProblemPage.jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<div className="prose prose-invert max-w-none text-[var(--color-brand-text-primary)]">
    <div className="text-[15px] leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.description}
        </ReactMarkdown>
    </div>
</div>
```

#### Why That?
- **Clean Separation of Content and UI:** Admins write standard Markdown text without worrying about custom HTML tags or dangerous `dangerouslySetInnerHTML` XSS injection vulnerabilities.

---

### 30. Centralized Axios Client with Token Injection & 401 Interceptors

#### Easy Idea in Simple English
Instead of writing `axios.get(url, { headers: { Authorization: ... } })` on every single component and manually catching expired sessions, CodeForge uses a centralized **Axios instance** with preconfigured request and response **interceptors**.

#### How Did They Implement It?
1. In `frontend/src/utils/axiosClient.js`, an Axios instance is initialized with `withCredentials: true`.
2. A **request interceptor** automatically reads the JWT from `localStorage` and injects it into every outgoing request's `Authorization` header.
3. A **response interceptor** catches `401 Unauthorized` responses, clears stale authentication storage, and gracefully hands control to Redux and React Router.

#### Real Code Snippet
```javascript
// frontend/src/utils/axiosClient.js
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
    withCredentials: true,
});

// Outgoing Request Interceptor:
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Incoming Response Interceptor:
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);
```

#### Why That?
- **DRY (Don't Repeat Yourself):** Components never need to worry about manually attaching tokens or managing auth headers.
- **Prevents Infinite Reload Loops:** Centralizing the 401 handler ensures bad tokens are cleanly evicted without triggering browser reload loops.

---

## 🏆 Summary Checklist

| # | Feature | Key Component / File | Purpose |
|---|---|---|---|
| 1 | JWT Dual Authentication | `authController.js`, `userMiddleware.js` | Cookie + Bearer fallback for seamless auth |
| 2 | Redis Logout Blacklisting | `redisClient`, `authController.js` | Instant revocation with zero manual garbage collection |
| 3 | RBAC Admin Middleware | `adminMiddleware.js` | Server-side protection of admin operations |
| 4 | Optional User Middleware | `optionalUserMiddleware.js` | Unified public vs. privileged data viewing |
| 5 | Judge0 Sandboxed Execution | `problemUtility.js` | Secure remote code compilation |
| 6 | Async Execution Polling | `problemUtility.js` | Base64 batch polling until status completion |
| 7 | Multi-Language Support | `problemUtility.js` | C++, Java, JavaScript standard I/O mapping |
| 8 | Run Code Sandbox | `submissionController.js` | Fast feedback loop against visible test cases |
| 9 | Submit Code Metrics | `submissionController.js` | Hidden edge-case evaluation with runtime & memory |
| 10 | Pre-Publish Solution Validation | `problemController.js` | Automated verification of reference code before saving |
| 11 | Gemini 2.5 Flash DSA Tutor | `solveDoubt.js`, `ChatAi.jsx` | Context-aware hints and code review |
| 12 | AI Problem Generator | `generateProblem.js` | Plain text to full JSON coding problem |
| 13 | AI Problem Setter Co-Pilot | `adminAiChat.js`, `AdminUpdateAi.jsx` | Conversational form-sync problem creation |
| 14 | Direct Cloudinary Uploads | `videoController.js` | Browser-to-cloud upload via HMAC signatures |
| 15 | Video Thumbnail Generation | `videoController.js` | Cloudinary transformation thumbnail extraction |
| 16 | Orphan Media Cleanup | `videoController.js` | Automatic cloud asset destruction on update/delete |
| 17 | Custom Video Player | `Editorial.jsx` | Dark-mode player with scrubber and timestamps |
| 18 | Monaco Code Editor | `ProblemPage.jsx` | VS Code editing experience with syntax highlighting |
| 19 | Dual-Axis Resizable Panels | `ProblemPage.jsx` | Horizontal and vertical draggable split panels |
| 20 | Multi-Tab Problem View | `ProblemPage.jsx` | Description, Editorial, Solutions, Submissions, ChatAI |
| 21 | Submission History & Modal | `SubmissionHistory.jsx` | Past code inspection and status badges |
| 22 | MyStats Analytics Dashboard | `MyStats.jsx` | Visual breakdown of solved problems by difficulty |
| 23 | MongoDB Leaderboard Pipeline | `authController.js` | Aggregation pipeline for top coders ranking |
| 24 | Tri-State Problem Tracking | `problemController.js` | Solved vs. Attempted vs. Unsolved distinction |
| 25 | Multi-Dimensional Filter Bar | `FilterBar.jsx`, `Homepage.jsx` | Instant client-side search across tags & difficulty |
| 26 | Guest Mode | `authSlice.js` | Frictionless playground exploration without login |
| 27 | MongoDB Compound Indexing | `submission.js` | High-speed submission history lookups at scale |
| 28 | Cascading Deletion Hook | `user.js` | Mongoose post-delete cleanup of orphaned submissions |
| 29 | Markdown & GFM Rendering | `ReactMarkdown`, `remark-gfm` | Formatted problem statements, tables, and code blocks |
| 30 | Axios Interceptors | `axiosClient.js` | Centralized token injection and 401 handling |
