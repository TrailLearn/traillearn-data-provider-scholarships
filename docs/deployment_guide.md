# Traillearn Scholarships - Deployment Guide

This guide explains how to deploy the full stack: Database (Supabase), Edge Functions (Workers), and Frontend (Next.js Admin Console).

## 📚 Prerequisites

1.  **Supabase Account:** [supabase.com](https://supabase.com) (Pro plan recommended for `pg_cron` in production, though Free tier supports Edge Functions).
2.  **Vercel Account:** [vercel.com](https://vercel.com) (for Frontend).
3.  **Supabase CLI:** `npm install -g supabase`

---

## 🗄️ Backend Deployment (Supabase)

### 1. Project Setup & Linking

1.  Create a new project on Supabase.
2.  **Important:** In the dashboard, go to **Database > Extensions** and enable:
    *   `pg_cron` (for scheduled tasks)
    *   `pg_net` (for HTTP requests from DB triggers)
    *   *Note: On the Free Tier, you might be limited regarding custom extensions. Check support status.*
3.  Link your local environment:
    ```bash
    npx supabase login
    npx supabase link --project-ref <YOUR_PROJECT_ID>
    ```

### 2. Database Schema (Epic 1 & 4)

Push the migrations to create tables (`scholarships`, `url_checks`), enums, functions, and triggers:

```bash
npx supabase db push
```

*This includes:*
*   Health Score logic (PL/PGSQL)
*   Auto-degradation triggers
*   Audit logs tables

### 3. Edge Functions (Epic 4 - The Watchdog)

Deploy the availability checking worker:

1.  **Set Secrets:** The function uses the built-in `SUPABASE_URL` but needs your Service Role Key (renamed to avoid reserved prefix) to bypass RLS.
    ```bash
    npx supabase secrets set PRIVATE_SERVICE_ROLE_KEY=<your-service-role-key>
    ```
    *Find this in Dashboard > Project Settings > API.*

2.  **Deploy Function:**
    ```bash
    npx supabase functions deploy check-availability
    ```

### 4. Configure Cron Job (Epic 4)

The migration `20260120000300_schedule_check_worker.sql` attempts to schedule the job. However, the URL for the function needs to be correct for the production environment.

1.  Go to **Supabase Dashboard > SQL Editor**.
2.  Run the following SQL to verify or update the schedule with the **real** Edge Function URL:
    ```sql
    -- Replace with your actual deployed function URL
    -- (Find it in Dashboard > Edge Functions > check-availability > Details)
    SELECT cron.schedule(
      'nightly-availability-check',
      '0 2 * * *', -- Runs at 2:00 AM UTC
      $$
      PERFORM net.http_post(
          url := 'https://<PROJECT_REF>.supabase.co/functions/v1/check-availability',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
          body := '{}'::jsonb
      );
      $$
    );
    ```
    *Note: Storing the Service Key in the cron job definition is common for internal tasks, but ensure your database access is secure.*

### 5. Seed Data (Optional)

To populate the DB with initial data:

```bash
# WARNING: This resets the remote DB!
# Use manual SQL copy-paste from supabase/seed.sql into SQL Editor for non-destructive insert.
npx supabase db reset --linked
```

---

## 🖥️ Frontend Deployment (Epic 3)

The frontend contains the Admin Console, Review Queue, and Smart Diff Viewer.

### 1. Vercel Deployment

1.  Import the repo into Vercel.
2.  Set **Root Directory** to `web`.
3.  Add **Environment Variables**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

### 2. Verify Features

*   **Review Queue:** Visit `/queue` to see the Admin Dashboard.
*   **API Docs:** Visit `/docs` to see the Swagger UI (Epic 5 preview).
*   **Inline Edit:** Click "Edit" on an item in the queue. Technical fields (ID, Dates) should be read-only.
*   **Trust Badge:** Verified scholarships should show a colored Trust Badge.

---

## 🛠️ Verification & Troubleshooting

### How to test the Watchdog (Epic 4)?

1.  **Trigger Manually:** You can invoke the function from the CLI or Dashboard.
    ```bash
    curl -i --location --request POST 'https://<PROJECT_REF>.supabase.co/functions/v1/check-availability' \
    --header 'Authorization: Bearer <ANON_KEY>'
    ```
    *(Ensure you allowed Anon access or use Service Key if function enforces it)*

2.  **Check Logs:**
    *   **Edge Function Logs:** Dashboard > Edge Functions > check-availability > Logs.
    *   **Database Logs:** Check the `url_checks` table:
        ```sql
        SELECT * FROM url_checks ORDER BY checked_at DESC LIMIT 10;
        ```

3.  **Verify Degradation:**
    *   If a URL returns 404 twice in a row, the scholarship status in `scholarships` table should change to `REVIEW_NEEDED` and `health_score` should drop.