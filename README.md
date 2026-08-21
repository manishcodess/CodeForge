# CodeForge 🚀

<div align="center">
  <img src="./frontend/public/codeforge-logo.jpg" alt="CodeForge Logo" width="150" height="150" />
  
  <h3>A Full-Stack Code Learning & Execution Platform (LeetCode Clone)</h3>

  <p>
    <strong>Live Demo:</strong> <a href="https://code-forge-brown.vercel.app/" target="_blank">code-forge-brown.vercel.app</a>
  </p>
</div>

## 📖 Overview

CodeForge is a modern, comprehensive competitive programming platform inspired by LeetCode. It provides a highly interactive environment for users to practice Data Structures and Algorithms (DSA), complete with an integrated code editor, test case execution, and an advanced AI Chatbot Assistant powered by Google Gemini to help explain concepts and debug logic. 

Whether you are practicing for interviews or hosting a coding competition, CodeForge comes equipped with a fully functional admin dashboard for managing coding problems, uploading video editorials, and more.

## ✨ Features

- **Interactive Code Editor:** Embedded Monaco Editor with syntax highlighting for C++ and multiple languages.
- **AI Teaching Assistant:** Built-in ChatAI tab powered by Google GenAI. It analyzes your code and gives hints or explains logic without just giving the answer!
- **Dark/Light Mode:** Seamlessly toggle between dark and light themes for the best coding experience.
- **Problem Filtering & Stats:** Filter problems by tags, difficulty, and status (Solved, Attempted, Unsolved). View your real-time progress on your dashboard.
- **Real-Time Execution:** Run your code against predefined test cases and get instant feedback on Memory, Runtime, and Pass/Fail status.
- **Admin Dashboard:** A dedicated space to create new problems (supports Markdown/HTML), update existing ones, and manage video editorials.
- **Submissions History:** Keeps track of past submissions, displaying the status (Accepted, Wrong), runtime, memory, and testcases passed.
- **Secure Authentication:** JWT-based authentication system to securely manage user sessions.

## 📸 Screenshots

*(To display these screenshots properly, please save the images provided in our chat into the `docs/images/` directory with the following filenames)*

### Dashboard (Dark Mode)
![Dashboard Dark Mode](./docs/images/dashboard-dark.png)

### Dashboard (Light Mode)
![Dashboard Light Mode](./docs/images/dashboard-light.png)

### Problem Solving & AI Assistant
![Code Editor & Submissions](./docs/images/problem-solve.png)
![AI Chat Assistant](./docs/images/ai-chat.png)

### Editorials & Solutions
![Video Editorial](./docs/images/editorial.png)

### Admin Panel
![Admin Dashboard](./docs/images/admin-dashboard.png)
![Create Problem](./docs/images/create-problem.png)

## 🛠️ Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/) (v19)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/) for beautiful styling
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code environment
- React Router DOM, React Hook Form, Zod

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & Mongoose
- [Redis](https://redis.io/) for caching/queuing
- [Google GenAI API](https://ai.google.dev/) for the AI Chatbot
- Cloudinary, JWT (JSON Web Tokens), Bcrypt

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Redis server
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manishcodess/CodeForge.git
   cd CodeForge
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory and configure your variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   REDIS_URL=your_redis_url
   CLOUDINARY_URL=your_cloudinary_url
   ```
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` directory (if needed):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173`

## 👨‍💻 Author

**Manish Kr. Sharma**
- GitHub: [@manishcodess](https://github.com/manishcodess)

## 📝 License

© CodeForge. All rights reserved.
