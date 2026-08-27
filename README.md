<div align="center">
  <h1>💻 CodeForge</h1>
  <p><strong>A highly scalable, full-stack coding platform to practice algorithms and ace your interviews.</strong></p>

  <p>
    <a href="https://code-forge-brown.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-code--forge--brown.vercel.app-blue?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge" alt="Build Status" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  </p>
</div>

---

## 📸 Demo

> **Live Demo:** [code-forge-brown.vercel.app](https://code-forge-brown.vercel.app/)

*(To display these screenshots properly, please save the images into the `docs/images/` directory)*

### Dashboard
| Dark Mode | Light Mode |
|:---:|:---:|
| ![Dashboard Dark Mode](./docs/images/dashboard-dark.png) | ![Dashboard Light Mode](./docs/images/dashboard-light.png) |

### Problem Solving & Assistance
| Code Editor | AI Chat Assistant |
|:---:|:---:|
| ![Code Editor](./docs/images/problem-solve.png) | ![AI Chat Assistant](./docs/images/ai-chat.png) |

### Editorials & Admin
| Video Editorial | Admin Dashboard |
|:---:|:---:|
| ![Video Editorial](./docs/images/editorial.png) | ![Admin Dashboard](./docs/images/admin-dashboard.png) |

### Problem Management
| Create Problem |
|:---:|
| ![Create Problem](./docs/images/create-problem.png) |

## ✨ Features

- **🔐 Secure Authentication:** JWT-based user login and registration system.
- **📚 Problem Library:** Extensive library of coding problems by difficulty and topic.
- **🤖 AI Assistant:** Integrated AI chat to help debug and understand optimal solutions.
- **⚡ Fast Code Execution:** Secure compilation and execution environment.
- **📈 Progress Tracking:** Monitor solved problems, submission history, and performance metrics.
- **🎨 Modern UI/UX:** Responsive, interactive interface with dark/light mode built with React.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React.js, Redux Toolkit, TailwindCSS/Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT) |
| **Deployment** | Vercel (Frontend), Render/Railway (Backend) |

## 🏛️ Architecture

```mermaid
graph TD
    Client["React client<br/>Vercel edge network"] -- HTTPS --> API["Express API gateway<br/>Render/Railway, auth + orchestration"]
    
    API --> DB["MongoDB Atlas<br/>Users, problems, submissions"]
    API --> Redis["Redis<br/>Rate limits, JWT blacklist"]
    API --> External["External APIs<br/>Judge0, Gemini, Cloudinary"]
    
    style DB fill:#e6f3e6,stroke:#82c29c
    style Redis fill:#e6f3e6,stroke:#82c29c
    style External fill:#fcebe6,stroke:#d99b8a
    style Client fill:#e6f0fa,stroke:#9dbad9
    style API fill:#f0ebfa,stroke:#bca6db
```

## 📁 Folder Structure

```text
CodeForge/
├── backend/                  # Node.js & Express.js server
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # JWT auth & validation (e.g., optionalUserMiddleware)
│   │   ├── models/           # Mongoose schemas
│   │   └── routes/           # API endpoints (e.g., aiChatting.js)
│   └── package.json
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, AdminUpdateAi)
│   │   ├── pages/            # View components (Admin, Home)
│   │   └── authSlice.js      # Redux state management for auth
│   └── package.json
└── docs/                     # Documentation and assets (LLD, diagrams)
```

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/manishcodess/CodeForge.git
   cd CodeForge
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env and configure PORT, MONGO_URI, JWT_SECRET, AI_API_KEY
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env and configure VITE_API_BASE_URL (if using Vite) or REACT_APP_API_URL
   npm run dev
   ```

4. **Open the App:** Navigate to `http://localhost:5173` (or `3000`).

## 📡 API Usage & Endpoints

Base URL: `/api/v1`

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/auth/register` | `POST` | Register a new user | No |
| `/auth/login` | `POST` | Login and receive JWT | No |
| `/problems/:id` | `GET` | Get problem details | Optional |
| `/problems/:id/submit` | `POST` | Submit code for execution | Yes |
| `/chat/ai` | `POST` | Interact with AI assistant | Yes |

*See full API documentation and postman collection in the `/docs` folder.*

## 🔄 Auth & Request Flow

```mermaid
graph TD
    Login["Login request<br/>bcrypt.compare against hash"] --> JWT["JWT issued<br/>7 day expiry, HTTP-only cookie"]
    
    JWT -- "on every request" --> Middleware["Protected route middleware<br/>verify signature + Redis blacklist check"]
    
    Middleware --> NotBlacklisted["Not blacklisted<br/>Request proceeds"]
    Middleware --> Blacklisted["Blacklisted<br/>Access denied"]
    
    Middleware -. "on logout" .-> Logout["Token added to Redis<br/>TTL set to match JWT's own expiry — no manual cleanup"]
    
    style Login fill:#e6f0fa,stroke:#9dbad9
    style JWT fill:#f0ebfa,stroke:#bca6db
    style Middleware fill:#fcf3e3,stroke:#d9bc8a
    style NotBlacklisted fill:#e6f3e6,stroke:#82c29c
    style Blacklisted fill:#fcebe6,stroke:#d99b8a
    style Logout fill:#fcebe6,stroke:#d99b8a
```

## 🧪 Testing

The platform utilizes a combination of unit testing and integration testing to ensure reliability.
- **Backend:** API endpoint testing with Jest and Supertest.
- **Frontend:** Component testing using React Testing Library.

Run tests using `npm test` in the respective directories.

## ☁️ Deployment

- **Frontend:** Hosted on [Vercel](https://vercel.com) for edge caching and fast global delivery. Continuous deployment configured via GitHub.
- **Backend:** Hosted on a scalable Node.js environment (e.g., Render or Railway) connecting to a managed MongoDB Atlas cluster.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📜 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
