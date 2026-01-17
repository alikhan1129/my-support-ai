# AI-Powered Customer Support System

A full-stack AI customer support system built with a multi-agent architecture. The system uses a parent **Router Agent** to analyze user intent and delegate tasks to specialized sub-agents: **Order Agent**, **Billing Agent**, and **Support Agent**.

## 🚀 Features

- **Multi-Agent Architecture**: Intelligent routing between specialized agents.
- **Real-time Streaming**: AI responses are streamed to the frontend for a smooth UX.
- **Context Awareness**: Maintains conversation history and user context across messages.
- **Tool Integration**: Agents can interact with a PostgreSQL database via Prisma to fetch real-time order and invoice data.
- **Type-Safe**: Built with TypeScript and Hono RPC for end-to-end type safety.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (Lucide Icons).
- **Backend**: [Hono.dev](https://hono.dev), Node.js.
- **AI**: Vercel AI SDK, Google Gemini (gemini-2.5-flash).
- **Database**: PostgreSQL with Prisma ORM.
- **Monorepo Management**: Turborepo.

## 📋 Architecture

The project follows a **Controller-Service pattern**:
1.  **Router Agent**: Analyzes the incoming query and classifies it into `ORDER`, `BILLING`, or `SUPPORT`.
2.  **Sub-Agents**:
    -   **Order Agent**: Handles status checks, tracking, and order details.
    -   **Billing Agent**: Manages invoices, payment status, and refunds.
    -   **Support Agent**: Handles general FAQs and retrieves conversation history.
3.  **Tools**: Structured JSON tools allow agents to query the database safely.

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL instance (local or hosted)

### 2. Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your environment:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
   ```
4. Initialize the database and seed test data:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Backend (Railway/Render)
- Set **Root Directory** to `Backend`.
- Set **Build Command** to `npm install && npx prisma generate && npm run build`.
- Add environment variables for `DATABASE_URL` and `GOOGLE_GENERATIVE_AI_API_KEY`.

### Frontend (Vercel)
- Set **Root Directory** to `Frontend`.
- Add environment variable `VITE_API_URL` pointing to your deployed backend URL.

## 📝 Assessment Notes
- Fixed `INVALID_ARGUMENT` errors by refactoring Gemini tool returns to structured JSON objects.
- Corrected Prisma schema field mappings in AI tools (`totalAmount` -> `amount`).
- Implemented streaming responses for all agents.
