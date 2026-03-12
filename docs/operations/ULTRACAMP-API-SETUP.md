# UltraCamp API Setup Guide

This guide walks you through getting an API key from UltraCamp so the Bear Lake Camp website can display real-time session availability (spots filled, spots remaining, waitlist counts).

---

## What This Enables

Once the API key is configured, the session pages will automatically show:

- How many spots are filled vs. total capacity per session
- Status labels: "Almost Full!", "Filling Fast", "Spots Available"
- Waitlist and hold counts
- Data refreshes every 5 minutes — no manual updating needed

---

## Step 1: Get Your API Key

### Option A: Check the UltraCamp Admin Panel

1. Log into your UltraCamp admin at **ultracampmanagement.com**
2. Look for **Settings** or **Admin** in the top navigation
3. Look for a section called **API Settings**, **Integrations**, or **Developer Access**
4. If there's an option to generate or view an API key, copy it

### Option B: Contact UltraCamp Support

If you can't find API settings in the admin panel (some accounts need it enabled first):

1. Email **help@ultracamp.com** or call UltraCamp support
2. Use this message:

> Hi, we'd like to enable REST API access for our camp account (Camp ID: 268, camp code: blc). We want to use the Sessions API to display real-time session availability on our website. Could you provide or enable an API key for our account?

3. They'll either enable it in your admin panel or send you the key directly

---

## Step 2: Add the API Key to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on the **Bear Lake Camp** project
3. Go to **Settings** (top nav)
4. Click **Environment Variables** (left sidebar)
5. Add a new variable:
   - **Key**: `ULTRACAMP_API_KEY`
   - **Value**: paste the API key from Step 1
   - **Environments**: check **Production** only (not Preview or Development)
6. Click **Save**
7. Go to the **Deployments** tab and click **"Redeploy"** on the latest deployment

---

## Step 3: Verify It's Working

1. Wait about 2 minutes for the deployment to finish
2. Visit the camp sessions page on the website
3. You should see real registration numbers instead of mock data
4. Check that the spot counts match what you see in UltraCamp's admin dashboard

---

## Account Details

- **Camp ID**: 268
- **Camp Code**: blc
- **API Authentication**: Basic HTTP Auth (`Base64(campId:apiKey)`)
- **API Endpoint**: `https://rest.ultracamp.com/api/camps/268/sessions`
- **Cache**: Data is cached for 5 minutes on our end to avoid excessive API calls

---

## Demo Pages (Mock Data)

While waiting for the API key, you can preview how the capacity meters will look using mock data:

- **Card Grid Style**: `/capacity-demo-cards` — Individual cards with progress bars and Register buttons
- **Badge Style**: `/capacity-demo-badges` — Compact badges on the existing session layout

Pick which style you prefer and let Travis know.

---

## Troubleshooting

**"I still see mock data after adding the key"**
- Make sure the environment variable name is exactly `ULTRACAMP_API_KEY` (no spaces, all caps)
- Make sure you redeployed after adding the variable
- Check that the key is set for the **Production** environment

**"The numbers don't match UltraCamp"**
- Data refreshes every 5 minutes, so there may be a short delay
- The website shows `TotalEnrollment` which counts confirmed registrations only

**Need help?**
Contact Travis — he can verify the API connection is working correctly.
