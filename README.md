# HelpDesk FullStack Project

A complete Help Desk ticketing and appointment scheduling system built with the PERN stack (PostgreSQL, Express, React, Node.js).

## Features

- **Customers**: Create support tickets, track ticket status, and book appointments with support agents.
- **Agents**: Manage assigned tickets using a drag-and-drop Kanban board, set availability slots, and view scheduled meetings on a calendar.
- **Admins**: View system dashboards, manage all tickets, and invite new agents to the platform.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Material UI
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### 1. Backend Setup

Open a terminal, navigate to the backend folder, install dependencies, and start the server:

```bash
cd helpdesk-bd
npm install

# Make sure you have created your PostgreSQL database
# Rename .env.example to .env and update your database credentials
cp .env.example .env

# Setup the database tables and default data
npm run migrate
npm run seed

# Start the backend server (runs on port 5000)
npm run dev
```

### 2. Frontend Setup

Open a new terminal tab, navigate to the frontend folder, install dependencies, and start the UI:

```bash
cd helpdesk-fd/frontend
npm install

# Start the frontend React app (runs on port 5173)
npm run dev
```

## Default Admin Credentials

You can log in to the admin dashboard right away using the test credentials:

- **Email:** `admin1@helpdesk.com`
- **Password:** `12345`
