# Google Analytics 4 (GA4) Setup Guide

This guide walks you through setting up Google Analytics on the Bear Lake Camp website. Once set up, you'll be able to see how many people visit the site, which pages they visit, and when they click CTA buttons (like "Register Now" or "Apply Now").

---

## Step 1: Create a Google Analytics Account

1. Go to [analytics.google.com](https://analytics.google.com)
2. Sign in with the Google account you want to manage analytics from
3. Click **"Start measuring"** (or "Admin" gear icon if you already have an account)

## Step 2: Create a Property

1. Click **"Create Property"**
2. Enter the property name: **Bear Lake Camp**
3. Select your time zone and currency
4. Click **Next**
5. Select **"Other"** for industry category (or "Travel" if available)
6. Select your business size
7. Click **Create**

## Step 3: Set Up a Web Data Stream

1. Select **"Web"** as the platform
2. Enter the website URL: **bearlakecamp.com** (select **https://**)
3. Enter a stream name: **Bear Lake Camp Website**
4. Click **"Create stream"**

## Step 4: Copy Your Measurement ID

After creating the stream, you'll see a **Measurement ID** that looks like:

```
G-XXXXXXXXXX
```

(It starts with "G-" followed by letters and numbers)

**Copy this ID** — you'll need it in the next step.

## Step 5: Add the Measurement ID to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on the **Bear Lake Camp** project
3. Go to **Settings** (top nav)
4. Click **Environment Variables** (left sidebar)
5. Add a new variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: paste your Measurement ID (the `G-XXXXXXXXXX` value)
   - **Environments**: check all three (Production, Preview, Development)
6. Click **Save**
7. Go to the **Deployments** tab and click **"Redeploy"** on the latest deployment (this picks up the new variable)

## Step 6: Verify It's Working

1. Wait about 2 minutes for the deployment to finish
2. Go to [bearlakecamp.com](https://bearlakecamp.com) in your browser
3. Go back to [analytics.google.com](https://analytics.google.com)
4. Click **"Reports"** in the left sidebar
5. Click **"Realtime"**
6. You should see yourself listed as an active user

If you see "1 user in the last 30 minutes" — it's working!

---

## What You Can See in GA4

### Automatic Reports (no setup needed)

- **Realtime**: Who's on the site right now
- **Acquisition**: How people find the site (Google search, social media, direct)
- **Engagement**: Which pages people visit, how long they stay
- **Retention**: How often people come back

### CTA Button Clicks (automatic)

Every "Register Now", "Apply Now", and other CTA button click is automatically tracked. To see them:

1. Go to **Reports** > **Engagement** > **Events**
2. Look for the event called **cta_click**
3. Click on it to see details like:
   - Which button was clicked (`cta_label`)
   - Where it linked to (`cta_href`)
   - Which button style was used (`cta_variant`)

### Custom Exploration (optional, more advanced)

To create a custom report for CTA clicks:

1. Click **"Explore"** in the left sidebar
2. Click **"Blank"** to start fresh
3. Add dimensions: `Event name`, `cta_label`, `cta_href`
4. Add metrics: `Event count`
5. Drag dimensions to Rows and metrics to Values
6. Filter by Event name = `cta_click`

---

## Troubleshooting

**"I don't see any data"**
- Make sure the Vercel environment variable is set correctly (starts with `G-`)
- Make sure you redeployed after adding the variable
- Wait 24-48 hours for historical reports to populate (Realtime should work immediately)

**"I see data but no CTA clicks"**
- CTA clicks only show up after someone actually clicks a button
- Test it yourself: click a "Register Now" button, then check Realtime > Events

**Need help?**
Contact Travis — he can verify the technical setup is correct.
