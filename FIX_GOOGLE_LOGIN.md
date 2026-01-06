# How to Fix Google Login Error 400

The error "redirect_uri_mismatch" happens because your new website URL is not authorized to use the Google Login ID configured in your code.

## Do you own this Client ID?
`241819621736-cm441t7dafeo3epa3pg3p3qmud4fmkg1.apps.googleusercontent.com`

### IF YES (You have access to the Google Cloud Console):
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Find the OAuth 2.0 Client ID matching the one above.
3. Click **Edit** (Pencil Icon).
4. Look for **"Authorized JavaScript origins"**.
5. Click **ADD URI**.
6. Paste your **exact** Render URL:
   ```
   https://fresh-life-style-ai-print-on-demand2.onrender.com
   ```
   *(Note: Remove any trailing slash `/` at the end)*
7. Click **SAVE**.
8. **Wait 5-10 minutes**. Google takes time to update their servers.
9. Try logging in again.

---

### IF NO (You copied this ID from a tutorial/demo):
You cannot use someone else's ID for your own deployed website. You must create your own.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project**.
3. Go to **APIs & Services > OAuth consent screen**.
   - Select **External**.
   - Fill in app name (e.g., "Fresh Life Style").
   - Add your email.
   - Click Save/Next until finished.
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials** -> **OAuth client ID**.
6. Application Type: **Web application**.
7. Name: "Render Prod".
8. **Authorized JavaScript origins**:
   - Add: `https://fresh-life-style-ai-print-on-demand2.onrender.com`
   - Add: `http://localhost:5173` (for local testing)
   - Add: `http://localhost:3000` (for local testing)
9. Click **Create**.
10. Copy your **New Client ID**.
11. Open `index.tsx` in your code and replace the old ID with your new one.
12. Commit and Push.
