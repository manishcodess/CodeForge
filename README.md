# Rohit LeetCode

Local development

Backend:

```bash
cd backend
npm install
npm start        # runs node src/index.js
# or for development with auto-restart
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev      # starts Vite at http://localhost:5173
```

Notes:

- The backend expects a `.env` file with `PORT`, `DB_CONNECT_STRING`, and other keys. A `.env` already exists in the backend folder for local development.
- Sensitive files like `.env` are excluded via `.gitignore`.
