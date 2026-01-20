# Supabase Deployment Guide

This guide explains how to deploy the database schema and seed data to a **free Supabase project**.

## Prerequisites

1.  **Supabase Account:** Create one at [supabase.com](https://supabase.com).
2.  **Supabase CLI:** Installed on your machine.
    *   Mac: `brew install supabase/tap/supabase`
    *   Windows: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase`
    *   NPM: `npm install -g supabase`

## Step-by-Step Deployment

### 1. Login to Supabase CLI

```bash
npx supabase login
```
Follow the browser instructions to authenticate.

### 2. Link your Local Project to Remote Project

1.  Go to your Supabase Dashboard and create a new project.
2.  Get the `Reference ID` (it's in the project URL: `https://supabase.com/dashboard/project/<REFERENCE_ID>`).
3.  Run the link command:

```bash
npx supabase link --project-ref <REFERENCE_ID>
```
You will be asked for your database password (created during project setup).

### 3. Push Database Schema (Migrations)

Apply the table structure, enums, and RLS policies:

```bash
npx supabase db push
```

### 4. Seed the Data (Insert Test Scholarships)

The `db push` command does *not* automatically run the seed file on remote projects (it's for local dev primarily). You have two options:

**Option A: Manual SQL Execution (Easiest)**
1.  Open the file `supabase/seed.sql` in your editor.
2.  Copy the entire content.
3.  Go to Supabase Dashboard > SQL Editor.
4.  Paste and run.

**Option B: CLI Reset (Warning: Destructive)**
If you want to fully reset the remote DB and seed it (WARNING: Deletes all existing data):

```bash
npx supabase db reset --linked
```

### 5. Verification

Go to the **Table Editor** in your Supabase Dashboard. You should see:
*   Table `scholarships`
*   5 Rows of verified data
*   Columns `data` populated with JSON content.

## Local Development (Optional)

To test locally before pushing:

```bash
# Start local docker containers
npx supabase start

# Reset and seed local db
npx supabase db reset
```

# Vercel Deployment Guide (Frontend)

This guide explains how to deploy the Next.js Admin Console to **Vercel**.

## Prerequisites

1.  **Vercel Account:** Create one at [vercel.com](https://vercel.com).
2.  **GitHub Repo:** Ensure your code is pushed to a GitHub repository.

## Step-by-Step Deployment

### 1. Import Project in Vercel

1.  Go to Vercel Dashboard > **Add New...** > **Project**.
2.  Select your GitHub repository `traillearn-data-provider-scholarships`.
3.  **Root Directory:** Select `web` (since the Next.js app is in a subdirectory).

### 2. Configure Environment Variables

Add the following environment variables in the Vercel Project Settings:

*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### 3. Deploy

Click **Deploy**. Vercel will build the Next.js application and serve it globally.

### 4. Verify

Visit the generated URL (e.g., `https://traillearn-admin.vercel.app`) to access the Admin Console.
