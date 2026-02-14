# LoveCheck.

The brutal, minimalist couple compatibility test. Answer separately, compare instantly.

> **"Are you In Sync or Chaos?"**

## 🇳🇬 Features

- **Nigerian-Themed Categories**:
  - **Love & Romance**: Intimacy, PDA, and "Have you eaten?"
  - **Wahala & Vibes**: Money, family drama, "African Time", and survival.
  - **Deep Talks**: Future plans, relocation (Japa), and core values.
- **Asynchronous Gameplay**: Player 1 creates a game -> Shares unique link -> Player 2 answers -> Results unlock.
- **Compatibility Index**: Get a percentage score and a "Breakdown" of every match/mismatch.
- **Minimalist Aesthetic**: Dark-mode first design with smooth Svelte transitions.

## 🛠 Tech Stack

- **Frontend**: Svelte (Vite), TailwindCSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel Postgres (Neon)
- **Deployment**: Vercel

## 🚀 Local Development

### 1. Clone & Install

```bash
git clone https://github.com/theakinwande/LoveCheck.git
cd LoveCheck
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
POSTGRES_URL="postgres://user:password@host:port/dbname?sslmode=require"
```

_You can get a local Postgres string or use a cloud instance._

### 3. Database Initialization

Run the schema script to create the necessary table:

```sql
-- Execute content of schema.sql in your database tool
```

### 4. Run Locally

To run the full stack locally (Frontend + API), use the custom server:

```bash
node server.js
```

The app will be available at `http://localhost:3000`.

## 📦 Deployment

This project is optimized for **Vercel**:

1.  Push code to GitHub.
2.  Import project to Vercel.
3.  Add **Vercel Postgres** from the Storage tab.
4.  Run the `schema.sql` query in the Vercel Data Browser.
5.  Deploy!

## 📄 License

Created by [Akinwande](https://akinwande.dev). Open source under MIT License.
