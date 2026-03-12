# GitHub App Setup for Keystatic CMS

**Purpose**: Configure a public GitHub App to enable Keystatic CMS access for multiple collaborators.

**Why Public?**: Private GitHub Apps only allow organization members to authorize. A public app allows any GitHub user with repo write access to use Keystatic CMS, while still restricting the app to only access repositories where it's installed.

---

## Prerequisites

- GitHub account with admin access to `sparkst/bearlakecamp`
- Access to Vercel dashboard for bearlakecamp project
- List of collaborators who need CMS access

---

## Step 1: Transfer Repository to Personal Account (if in org)

If your repo is currently in a GitHub organization and you want it under your personal account:

1. Go to: `https://github.com/orgs/YOUR-ORG-NAME/settings`
2. Click **Repositories** in the left sidebar
3. Find `bearlakecamp` → Click the **Settings** icon
4. Scroll to **Danger Zone** → **Transfer ownership**
5. New owner: `sparkst` (your personal account)
6. Type `bearlakecamp` to confirm → **Transfer**

**After transfer**, update your local git remote:
```bash
git remote set-url origin https://github.com/sparkst/bearlakecamp.git
```

---

## Step 2: Create/Configure GitHub App

### If GitHub App Already Exists

1. Go to: `https://github.com/settings/apps/bearlakecamp-cms`
2. Scroll to **"Where can this GitHub App be installed?"**
3. Select **"Any account"** (makes it public)
4. Click **Save changes**

### If Creating New GitHub App

1. Go to: `https://github.com/settings/apps/new`

2. **Basic Information**:
   - **GitHub App name**: `bearlakecamp-cms` (must be globally unique)
   - **Homepage URL**: `https://prelaunch.bearlakecamp.com`

3. **Identifying and authorizing users**:
   - **Callback URL**: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
   - Check **Request user authorization (OAuth) during installation**
   - Leave **Enable Device Flow** unchecked

4. **Post installation**:
   - Leave **Setup URL** empty
   - Leave **Redirect on update** unchecked

5. **Webhook**:
   - Uncheck **Active** (Keystatic doesn't need webhooks)

6. **Repository permissions**:
   - **Contents**: Read and write
   - **Metadata**: Read-only (automatically selected)

7. **Where can this GitHub App be installed?**:
   - Select **Any account** (public - required for collaborators)

8. Click **Create GitHub App**

9. **Save credentials**:
   - Copy the **Client ID** (starts with `Iv23`)
   - Click **Generate a new client secret**
   - Copy the **Client Secret** immediately (shown only once)

---

## Step 3: Install the App on Your Repository

1. Go to: `https://github.com/settings/apps/bearlakecamp-cms/installations`
2. Click **Install** next to your account (`sparkst`)
3. Choose **Only select repositories**
4. Select `bearlakecamp`
5. Click **Install**

---

## Step 4: Update Vercel Environment Variables

1. Go to: Vercel Dashboard → bearlakecamp project → Settings → Environment Variables

2. Set these variables for **Production** environment:

   | Variable | Value |
   |----------|-------|
   | `KEYSTATIC_GITHUB_CLIENT_ID` | `Iv23...` (from Step 2) |
   | `KEYSTATIC_GITHUB_CLIENT_SECRET` | Secret from Step 2 |
   | `KEYSTATIC_SECRET` | Keep existing or generate new with `openssl rand -base64 32` |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | `bearlakecamp-cms` |

3. Click **Save**

---

## Step 5: Reconnect Vercel to Repository (if transferred)

If you transferred the repo from an org:

1. Go to: Vercel Dashboard → bearlakecamp → Settings → Git
2. Click **Disconnect** next to the current repo
3. Click **Connect Git Repository**
4. Select `sparkst/bearlakecamp`
5. Click **Connect**

---

## Step 6: Update keystatic.config.ts (if needed)

Ensure the config points to the correct owner:

**File**: `keystatic.config.ts`

```typescript
repo: {
  owner: 'sparkst',
  name: 'bearlakecamp',
},
```

---

## Step 7: Add Collaborators to Repository

1. Go to: `https://github.com/sparkst/bearlakecamp/settings/access`
2. Click **Add people**
3. Enter each collaborator's GitHub username
4. Set permission level to **Write** (required for Keystatic)
5. Click **Add to this repository**

Collaborators will receive email invitations they must accept.

---

## Step 8: Deploy and Test

1. Commit any config changes:
```bash
git add keystatic.config.ts
git commit -m "chore: update keystatic repo owner"
git push
```

2. Or trigger a manual redeploy in Vercel

3. Wait for deployment (~2 minutes)

---

## Step 9: Test Logins

### Admin Test
1. Visit: `https://prelaunch.bearlakecamp.com/keystatic`
2. Click **Sign in with GitHub**
3. Authorize the `bearlakecamp-cms` app
4. You should see the Keystatic dashboard

### Collaborator Test
1. Ensure collaborator has accepted the repository invitation
2. Have them visit: `https://prelaunch.bearlakecamp.com/keystatic`
3. Click **Sign in with GitHub**
4. Authorize the `bearlakecamp-cms` app (first-time only)
5. They should see the Keystatic dashboard

---

## Troubleshooting

### "Authorization failed" error
- Verify Vercel env vars match the GitHub App credentials
- Ensure deployment completed after env var changes
- Check callback URL is exactly: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- Confirm `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` matches the app slug

### Collaborator gets 404 on login
- Verify the GitHub App is set to **public** ("Any account" can install)
- Ensure collaborator has **Write** access to the repository
- Check they accepted the repository invitation

### Git push rejected
- Update git remote: `git remote set-url origin https://github.com/sparkst/bearlakecamp.git`

### Vercel deployment fails
- Reconnect the git repository in Vercel settings (Step 5)

### Debug endpoint
Visit `https://prelaunch.bearlakecamp.com/api/debug/keystatic-config` to verify:
- Client ID prefix (should start with `Iv23` for GitHub Apps)
- All required env vars are set
- Correct app slug is configured

---

## Security Notes

- **Public app is safe**: The app can ONLY access repositories where it's explicitly installed
- Collaborators need BOTH:
  - **Write access** to the repository
  - **Authorization** of the GitHub App
- Client secrets are stored only in Vercel, never in code
- The app only has Contents (read/write) and Metadata (read) permissions

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App Client ID | `Iv23li...` |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App Client Secret | (40-char hex string) |
| `KEYSTATIC_SECRET` | Session encryption key | (base64 string from `openssl rand -base64 32`) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | App slug from URL | `bearlakecamp-cms` |

---

## Checklist

- [ ] Repository under correct owner (`sparkst`)
- [ ] Local git remote updated
- [ ] GitHub App created/configured as **public**
- [ ] GitHub App installed on repository
- [ ] Vercel env vars updated with GitHub App credentials
- [ ] `keystatic.config.ts` has correct owner
- [ ] Vercel git integration connected to correct repo
- [ ] Changes deployed
- [ ] Admin login tested
- [ ] Collaborators added with Write access
- [ ] Collaborator login tested
