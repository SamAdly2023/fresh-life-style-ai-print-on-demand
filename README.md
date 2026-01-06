<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PkG49RyhEbur36B4szXN9rNeFdASdJqG

## Run Locally

**Prerequisites:**  Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

2. **Setup Environment:**
   - Create a `.env` file in the root directory (see `.env.example` if available).
   - Ensure `GEMINI_API_KEY` and `DATABASE_URL` are set.
   - For Google Login, ensure your Google Client ID is correct in `index.tsx`.

3. **Start the Backend Server (Terminal 1):**
   ```bash
   npm run server
   ```
   *The server runs on http://localhost:3001*

4. **Start the Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```
   *The app runs on http://localhost:3000*

