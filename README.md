# CampusConnect — Smart Campus Management System

A college-level MERN stack project for managing student records. It demonstrates React Hooks, Axios API integration, Express REST APIs, MongoDB/Mongoose, CRUD operations, search, frontend/backend validation, and delete confirmation.

## Features
- Add, view, update, delete, and search student records
- React `useState` and `useEffect`
- Axios REST API integration
- Express + Mongoose + MongoDB
- Frontend and backend validation
- Duplicate roll number/email handling
- Success and error messages
- Responsive dashboard with summary cards

## Requirements
- Node.js 18+
- MongoDB local installation OR MongoDB Atlas connection string

## Setup
1. Install dependencies from the project root:
   ```bash
   npm install
   npm run install-all
   ```
2. Copy `server/.env.example` to `server/.env`.
3. Put your MongoDB connection string in `server/.env`.
4. Start both apps from the root:
   ```bash
   npm run dev
   ```
5. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

Backend runs at `http://localhost:5000`.

## Environment
See `server/.env.example`. Never upload real database credentials to GitHub.

## Main API routes
- `GET /api/students?search=...` — list/search
- `GET /api/students/:id` — get one
- `POST /api/students` — create
- `PUT /api/students/:id` — update
- `DELETE /api/students/:id` — delete
- `GET /api/health` — health check

## Suggested demonstration
1. Add a student with valid details.
2. Search by name, roll number, or email.
3. Edit a student and save.
4. Delete a student and confirm the prompt.
5. Try invalid email, missing fields, invalid semester, or duplicate roll number/email to demonstrate validation.

## Scope note
This submission-ready starter focuses on the Student Management module of the larger Smart Campus Management System. Faculty, attendance, assignments, and marks can be added as further modules.
