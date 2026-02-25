# IntentOps AI - Deployment Guide

## Prerequisites
- Node.js 18+
- GitHub account
- Supabase account
- Vercel account
- Google AI Studio account (for Gemini API key)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `intentops-ai`
5. Set database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

### 1.2 Run Database Schema
1. In your Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` from this repository
4. Paste into the SQL Editor
5. Click "Run"
6. Verify tables are created in Table Editor

### 1.3 Get Supabase Credentials
1. Go to Project Settings > API
2. Copy `Project URL` - this is your `VITE_SUPABASE_URL`
3. Copy `anon public` key - this is your `VITE_SUPABASE_ANON_KEY`

## Step 2: GitHub OAuth Setup

### 2.1 Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:
   - Application name: `IntentOps AI`
   - Homepage URL: `https://intentops-ai.vercel.app` (or your domain)
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
     - Replace `your-project-ref` with your Supabase project reference
4. Click "Register application"
5. Copy `Client ID`
6. Click "Generate a new client secret" and copy it

### 2.2 Configure in Supabase
1. In Supabase dashboard, go to Authentication > Providers
2. Find GitHub and click "Enable"
3. Paste your GitHub Client ID and Client Secret
4. Click "Save"

## Step 3: Gemini API Setup

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the API key - this is your `GEMINI_API_KEY`

## Step 4: Local Development

### 4.1 Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/intentops-ai.git
   git push -u origin main
   ```

### 5.2 Import to Vercel
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 5.3 Environment Variables in Vercel
Add these environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

### 5.4 Deploy
Click "Deploy" and wait for build to complete.

## Step 6: Post-Deployment

### 6.1 Update GitHub OAuth Callback
After deployment, update your GitHub OAuth App:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Edit your IntentOps AI app
3. Update Homepage URL to your Vercel domain
4. Update Authorization callback URL if needed

### 6.2 Test the Flow
1. Visit your deployed app
2. Click "Sign in with GitHub"
3. Authorize the app
4. Connect a repository
5. Run an analysis
6. View recommendations

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set correctly

### Authentication Issues
- Verify GitHub OAuth callback URL matches exactly
- Check Supabase Auth settings
- Ensure user has granted necessary permissions

### Database Issues
- Verify schema was applied correctly
- Check RLS policies are in place
- Confirm Supabase credentials are correct

### API Issues
- Verify Gemini API key is valid
- Check API rate limits
- Review browser console for errors

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│  Supabase   │────▶│   GitHub    │
│  (Frontend) │     │  (Auth/DB)  │     │   (Repos)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│    Gemini   │
│     AI      │
└─────────────┘
```

## Support

For issues or questions:
- Check the TODO.md for implementation status
- Review types.ts for data structures
- Examine services/ for API integrations
