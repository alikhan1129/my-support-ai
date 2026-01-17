# AI-Powered Customer Support System

A full-stack AI customer support system built with a multi-agent architecture. The system uses a parent **Router Agent** to analyze user intent and delegate tasks to specialized sub-agents: **Order Agent**, **Billing Agent**, and **Support Agent**.

## 🔗 Quick Links

- **Demo Video**: [Loom Video](https://www.loom.com/share/9717109f6a584b74aa06c6b3ba972928)
- **Live Application**: [Vercel Deployment](https://my-support-ai-frontend-bh1kowo3m-alikhan1129s-projects.vercel.app)

## 🚀 Features

- **Multi-Agent Architecture**: Intelligent routing between specialized agents.
- **Real-time Streaming**: AI responses are streamed to the frontend for a smooth UX.
- **Context Awareness**: Maintains conversation history and user context across messages.
- **Tool Integration**: Agents can interact with a PostgreSQL database via Prisma to fetch real-time order and invoice data.
- **Type-Safe**: Built with TypeScript and Hono for end-to-end type safety.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Lucide Icons.
- **Backend**: [Hono](https://hono.dev), Node.js.
- **AI**: Vercel AI SDK, Google Gemini & OpenAI.
- **Database**: PostgreSQL (Supabase) with Prisma ORM.
- **Monorepo Management**: Turborepo.

## 📋 Architecture

The project follows a **Controller-Service pattern**:
1.  **Router Agent**: Analyzes the incoming query and classifies it into `ORDER`, `BILLING`, or `SUPPORT`.
2.  **Sub-Agents**:
    -   **Order Agent**: Handles status checks, tracking, and order details.
    -   **Billing Agent**: Manages invoices, payment status, and refunds.
    -   **Support Agent**: Handles general FAQs.
3.  **Tools**: Structured JSON tools allow agents to query the database safely.

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g., Supabase)

### 2. Installation
Run from the root directory:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the `Backend` directory:
```env
# Database
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# AI Providers
GOOGLE_GENERATIVE_AI_API_KEY="your_google_key"
OPENAI_API_KEY="your_openai_key"

# Supabase API (Optional if using direct DB connection)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

Create a `.env` file in the `Frontend` directory (optional for local, required for prod):
```env
VITE_API_URL="http://localhost:3000" # Or your production Backend URL
```

### 4. Database Setup
Initialize the database and seed test data:
```bash
cd Backend
npm run db:push
npm run db:seed
```

### 5. Running the App
From the root directory, start both Frontend and Backend in parallel:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🌐 Deployment

### Backend (Render)
1.  Connect your GitHub repo.
2.  **Root Directory**: `Backend`
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm start`
    *   *Note: The start command includes a safety build step.*
5.  **Environment Variables**: Add `DATABASE_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`.

### Frontend (Vercel)
1.  Connect your GitHub repo.
2.  **Root Directory**: `Frontend`
3.  **Build Command**: `npm run build` (Default)
4.  **Output Directory**: `dist` (Default)
5.  **Environment Variables**: 
    - `VITE_API_URL`: Your Render Backend URL (e.g., `https://my-support-ai.onrender.com`)

## 📝 Assessment Notes
- **Robust Deployment**: Backend is configured to auto-build typescript and generate Prisma clients on deployment.
- **Type Safety**: strict TypeScript configuration across the monorepo.
- **Error Handling**: Graceful error handling for missing API keys and database connection issues.

## ⚠️ Challenges & Errors Faced

During the development and deployment of this project, several technical hurdles were encountered and resolved:

1.  **Database Connection Issues (Prisma + Supabase)**: 
    - *Challenge*: Encountered issues with connection pooling when using Prisma with Supabase in a serverless/containerized environment.
    - *Solution*: Configured the connection string with `?pgbouncer=true` and adjusted the Prisma schema to handle connection limits effectively.

2.  **CORS & Production Environment Variables**:
    - *Challenge*: Initially, the frontend failed to communicate with the backend on Render due to CORS restrictions and incorrect environment variable naming in the production dashboard.
    - *Solution*: Implemented dynamic CORS configuration in the Hono backend to allow the specific Vercel domain and ensured all `VITE_` prefixed variables were correctly set in the Vercel dashboard.

3.  **Vercel AI SDK Streaming**:
    - *Challenge*: Getting the streaming response to work correctly between the Backend (Hono) and the Frontend (React) required precise handling of the `StreamData` and `AIStream` objects to ensure the UI updated in real-time without buffering.
    - *Solution*: Refined the backend tool-calling logic to ensure that streaming chunks were sent immediately after tool execution.

4.  **Monorepo Deployment Complexity**:
    - *Challenge*: Deploying a Turborepo project where the Frontend and Backend are in separate subdirectories required specific configuration for "Root Directory" and "Build Commands" on both Render and Vercel.
    - *Solution*: Configured the `Backend` directory as a standalone project for Render and used the `Frontend` directory as the root for Vercel, ensuring `npm install` worked correctly in both contexts.