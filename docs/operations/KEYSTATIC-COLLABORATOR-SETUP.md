# Keystatic CMS Collaborator Setup Guide

**Last Updated**: 2025-12-17
**Version**: 1.0
**REQ-ID**: REQ-U01-005

---

## Overview

This guide explains how to authorize access to the Bear Lake Camp CMS (Keystatic) for GitHub collaborators. The CMS uses GitHub authentication to allow content editing.

## Prerequisites

1. **GitHub Account** - You must have a GitHub account
2. **Repository Access** - You must be added as a collaborator to the `sparkst/bearlakecamp` repository
3. **Browser** - A modern web browser (Chrome, Firefox, Safari, Edge)

## Step-by-Step Setup

### Step 1: Authorize the GitHub App

Before you can sign in to Keystatic, you need to authorize the "bearlakecamp-cms" GitHub App:

1. **Navigate to the GitHub App page**:
   - Go to: https://github.com/apps/bearlakecamp-cms

2. **Install/Authorize the App**:
   - Click **"Install"** or **"Configure"** button
   - Select **"Only select repositories"**
   - Choose **"sparkst/bearlakecamp"** from the list
   - Click **"Install"** or **"Save"**

3. **Verify Installation**:
   - Go to: https://github.com/settings/installations
   - You should see "bearlakecamp-cms" in your list of installed apps

### Step 2: Sign In to Keystatic

1. **Navigate to the CMS**:
   - Go to: https://prelaunch.bearlakecamp.com/keystatic

2. **Click "Sign in with GitHub"**:
   - You will be redirected to GitHub to authorize

3. **Authorize the Application**:
   - Review the permissions requested
   - Click **"Authorize"**

4. **Access the Dashboard**:
   - You should now see the Keystatic admin dashboard
   - You can view and edit pages, content, and settings

## Troubleshooting

### Issue: 404 Error on Sign In

**Symptom**: Clicking "Sign in with GitHub" shows a 404 page.

**Solution**:
1. Make sure you have authorized the GitHub App (Step 1 above)
2. Try clearing your browser cookies and cache
3. Try using an incognito/private browser window
4. If still failing, contact the repository admin

### Issue: "You don't have access to this repository"

**Symptom**: After signing in, you see an access denied message.

**Solution**:
1. Verify you are a collaborator on the repository:
   - Check: https://github.com/sparkst/bearlakecamp/settings/access
2. Ask the repository admin (sparkst) to add you as a collaborator

### Issue: Changes Not Saving

**Symptom**: You can edit content but changes don't save.

**Solution**:
1. Make sure you have "push" permissions (not just "read")
2. Check your GitHub notifications for any error messages
3. Try refreshing the page and editing again

## Contact Support

If you continue to have issues:

- **Email**: info@bearlakecamp.com
- **Repository Admin**: sparkst on GitHub

## Technical Details (For Admins)

### OAuth Configuration

- **Client ID**: `Iv23li34NGRJ6tYul4RW` (GitHub App, not OAuth App)
- **Callback URL**: `https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback`
- **Storage Mode**: GitHub (not local)

### Required Environment Variables (Vercel)

```
KEYSTATIC_GITHUB_CLIENT_ID=<GitHub App Client ID>
KEYSTATIC_GITHUB_CLIENT_SECRET=<GitHub App Client Secret>
KEYSTATIC_SECRET=<Random secret for session signing>
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=bearlakecamp-cms
```

### GitHub App Permissions Required

- **Repository Contents**: Read & Write
- **Repository Metadata**: Read-only

### Adding a New Collaborator

1. Add user as collaborator on GitHub: `sparkst/bearlakecamp` > Settings > Collaborators
2. Grant "push" permissions (for editing) or "admin" (for full access)
3. Have the user follow this setup guide to authorize the GitHub App

### Debugging OAuth Flow

Test the callback route exists:
```bash
curl -I https://prelaunch.bearlakecamp.com/api/keystatic/github/oauth/callback
# Should return HTTP 400 (not 404)
```

Test the Keystatic admin loads:
```bash
curl -I https://prelaunch.bearlakecamp.com/keystatic
# Should return HTTP 200
```

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-17 | 1.0 | Initial version |
