# Credit Card Status App - Step-by-Step Setup Guide

This guide is written for beginners. Follow each step in order.

---

## What You Need Before Starting

1. **A computer** (Windows, Mac, or Linux)
2. **An internet connection**
3. **An Android phone** with Expo Go app installed
   - Download Expo Go from: https://play.google.com/store/apps/details?id=host.exp.exponent
4. **Your phone and computer on the same Wi-Fi** (for testing)

---

## Part 1: Set Up Supabase (Your Online Database)

Supabase is where your card data is stored. It's free.

### Step 1.1: Create a Supabase Account

1. Open your web browser (Chrome, Safari, Edge, etc.)
2. Go to: **https://supabase.com**
3. Click **"Start your project"** (top right)
4. Sign up with **Google** or **Email**
5. Verify your email if asked

### Step 1.2: Create a New Project

1. After login, click **"New Project"**
2. Choose your **Organization** (or create one - it's free)
3. Fill in:
   - **Name**: Type `credit-card-app` (or any name you like)
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Pick the one closest to you (e.g., "Mumbai" for India)
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to be ready (you'll see a loading screen)

### Step 1.3: Get Your Project URL and Key

1. When the project is ready, click **"Project Settings"** in the left menu (gear icon at bottom)
2. Click **"API"** in the left sidebar
3. You will see two important values. **Copy and save them**:

   - **Project URL**: Looks like `https://abcdefghijk.supabase.co`
     - Click the copy icon next to it
     - Paste and save in a text file or Notes app

   - **anon public key**: A long string starting with `eyJ...`
     - Click the copy icon next to it
     - Paste and save in the same place

### Step 1.4: Create the Database Tables

1. In the left menu, click **"SQL Editor"**
2. Click **"New query"** (green button)
3. Open the folder `CreditCardStatus` on your computer
4. Open the folder `supabase`
5. Open the file `schema.sql` in a text editor (Notepad, TextEdit, or VS Code)
6. Select **all** the text in that file (Ctrl+A on Windows, Cmd+A on Mac)
7. **Copy** it
8. Go back to the Supabase browser tab
9. **Paste** the text into the big empty box
10. Click **"Run"** (or press Ctrl+Enter)
11. You should see a green "Success" message. If you see any error, double-check you copied the entire file.

---

## Part 2: Set Up the App on Your Computer

### Step 2.1: Install Node.js (If Not Already Installed)

1. Go to: **https://nodejs.org**
2. Download the **LTS** version (the one with the green "Recommended" label)
3. Run the installer
4. Click "Next" through the steps (defaults are fine)
5. When done, **restart your computer** or open a new terminal/command prompt

### Step 2.2: Add Your Supabase Credentials to the App

1. Open the `CreditCardStatus` folder on your computer
2. Find the file named **`.env`**
   - If you don't see it: On Windows, enable "Show hidden files". On Mac, files starting with `.` are sometimes hidden.
   - You can also create it: Right-click → New file → Name it `.env`
3. Open `.env` in a text editor
4. You should see two lines. **Replace** the empty values with your Supabase details:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
   ```

   - For **EXPO_PUBLIC_SUPABASE_URL**: Paste the Project URL you saved from Step 1.3
   - For **EXPO_PUBLIC_SUPABASE_ANON_KEY**: Paste the anon public key you saved

5. **Save** the file (Ctrl+S or Cmd+S)

### Step 2.3: Install App Dependencies

1. Open **Terminal** (Mac) or **Command Prompt** (Windows) or **PowerShell**
   - On Mac: Press Cmd+Space, type "Terminal", press Enter
   - On Windows: Press Windows key, type "cmd" or "PowerShell", press Enter

2. Navigate to the project folder:
   - Type: `cd ` (with a space at the end)
   - Drag the `CreditCardStatus` folder into the terminal window (it will paste the path)
   - Press **Enter**

3. Install packages by typing:
   ```
   npm install
   ```
   Press **Enter**

4. Wait 1-2 minutes. You'll see lots of text. When it stops and shows a line like "added 933 packages", you're done.

---

## Part 3: Run the App

### Step 3.1: Start the Development Server

1. In the same terminal/command prompt (in the CreditCardStatus folder)
2. Type:
   ```
   npm start
   ```
   Press **Enter**

3. Wait for the app to start. You'll see:
   - A **QR code** in the terminal
   - Some options like "Press a │ open Android"
   - A line saying "Metro waiting on..."

### Step 3.2: Open the App on Your Phone

1. Make sure your phone is on the **same Wi-Fi** as your computer
2. Open the **Expo Go** app on your Android phone
3. Tap **"Scan QR code"**
4. Point the camera at the **QR code** in your computer's terminal
5. The app will load on your phone (may take 30-60 seconds the first time)

---

## Part 4: Use the App

### Step 4.1: Create an Account

1. When the app opens, you'll see the **Login** screen
2. Tap **"Don't have an account? Create one"**
3. Enter your **email** and a **password** (at least 6 characters)
4. Tap **"Create account"**
5. You may need to confirm your email. Check your inbox for a link from Supabase
6. After creating, tap **"Sign in"** and enter the same email and password

### Step 4.2: Add Your First Credit Card

1. Tap the **"+"** button (bottom right)
2. Type your card name (e.g., "HDFC Millennia") or pick from the list if you've added the catalog
3. Set **Cycle start day**: The day your billing cycle starts (e.g., 14 = 14th of each month)
4. Set **Cycle end day**: The day your cycle ends (e.g., 13 = 13th of next month)
5. Set **Due date days**: How many days after cycle end until payment is due (e.g., 21)
6. Tap **"Save"**

### Step 4.3: View Your Cards

1. You'll see your cards on the home screen
2. Each card shows:
   - **Days in cycle**: How many days left in the current billing period
   - **Days until due**: How many days until you must pay
3. Use the **"Due soonest"** / **"Due later"** toggle to sort
4. Tap a card to **edit** it
5. Pull down on the list to **refresh**

---

## Part 5: (Optional) Add Card Images to the Catalog

If you want to see card images when adding cards:

### Step 5.1: Create Storage Bucket in Supabase

1. In Supabase, go to **Storage** in the left menu
2. Click **"New bucket"**
3. Name it: `card-images`
4. Toggle **"Public bucket"** to ON (so images can be displayed)
5. Click **"Create bucket"**

### Step 5.2: Upload Your Card Images

1. Click on the `card-images` bucket
2. Click **"Upload file"**
3. Go to your `CreditCardStatus` folder → `Credit Cards` folder
4. Select all 10 PNG files and upload
5. After upload, click each file and copy its **Public URL**

### Step 5.3: Add Catalog Entries

1. Go to **SQL Editor** in Supabase
2. Open `supabase/seed-catalog.sql` on your computer
3. Replace each `REPLACE_WITH_STORAGE_URL` with the actual URL you copied for that card
4. Copy the full SQL and paste into Supabase SQL Editor
5. Click **"Run"**

Now when you add a card, you can pick from the list and the image will appear.

---

## Troubleshooting

**"npm: command not found"**  
- Node.js is not installed or not in your path. Reinstall Node.js and restart your terminal.

**"Cannot connect" or blank screen**  
- Check that your phone and computer are on the same Wi-Fi
- Try typing `a` in the terminal to open Android directly (if you have an emulator)

**"Invalid API key" or login fails**  
- Double-check your `.env` file. No extra spaces. URLs should start with `https://`

**App shows "Loading..." forever**  
- Check your internet connection
- Verify the Supabase URL and key in `.env`

**"credit_cards does not exist"**  
- You may have missed Step 1.4. Run the schema.sql again.

**Cannot sign in with email**  
- **First time?** Tap "Don't have an account? Create one" and sign up first.
- **"Email not confirmed"** – Supabase requires email confirmation by default. Either:
  1. Check your email inbox (and spam) for a Supabase confirmation link and click it, OR
  2. Disable confirmation: In Supabase Dashboard → **Authentication** → **Providers** → **Email** → Turn **OFF** "Confirm email" → Save.
- **"Invalid login credentials"** – Wrong password, or you haven't signed up yet. Create an account first.

---

## Quick Reference

| Step | What to do |
|------|------------|
| 1 | Create Supabase account, create project |
| 2 | Copy Project URL and anon key from Project Settings → API |
| 3 | Run schema.sql in SQL Editor |
| 4 | Put URL and key in .env file |
| 5 | Run `npm install` in the project folder |
| 6 | Run `npm start` |
| 7 | Scan QR code with Expo Go on your phone |
| 8 | Sign up and add your cards! |
