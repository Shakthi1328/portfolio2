# 🚀 Simple Database Setup Guide

Follow these exact steps to finish your portfolio's database:

### 1. Create the Project
- Open [Supabase Dashboard](https://supabase.com/dashboard/projects).
- Click **"New Project"**.
- Name: `portfolio`
- Password: `MySecurePassword123` (Save this!)
- Click **"Create new project"**.

### 2. Copy the Connection Link
- Wait for the setup to finish.
- Click the **Gear (Settings)** icon at the bottom left.
- Click **"Database"**.
- Scroll down to **"Connection string"** and select the **"Node.js"** tab.
- **Copy the link** that looks like this: `postgres://postgres.[id]:[pass]@[host]:5432/postgres`.

### 3. Add to Render
- Go to [Render Dashboard](https://dashboard.render.com).
- Open your **`portfolio2`** service.
- Click **"Environment"** > **"Add Environment Variable"**.
- **Key:** `DATABASE_URL`
- **Value:** Paste the link you copied (Replace `[YOUR-PASSWORD]` with `MySecurePassword123`).
- Click **"Save Changes"**.

**You are DONE!** 🎉
