# CI/CD Setup Guide

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### Frontend Deploy (`frontend-deploy.yml`)
- **Triggers**: Push to `main` branch with changes in `frontend/**`
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install npm dependencies
  4. Build with Vite: `npm run build`
  5. Deploy to Spaceship

**Required Secrets**:
- `SPACESHIP_API_KEY` - Your Spaceship API key
- `SPACESHIP_PROJECT_ID` - Your Spaceship project ID

**Configuration**: The deployment step needs to be customized based on your Spaceship setup. Update the deployment command in the workflow file.

### Backend Deploy (`backend-deploy.yml`)
- **Triggers**: Push to `main` branch with changes in `backend/**`
- **Steps**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install npm dependencies
  4. Build TypeScript: `npm run build`
  5. Deploy to Render using deploy hook

**Required Secrets**:
- `RENDER_DEPLOY_HOOK` - Your Render deploy hook URL (recommended method)
- Optionally: `RENDER_API_KEY` and `RENDER_SERVICE_ID` if using API method

**Getting Render Deploy Hook**:
1. Go to your Render service dashboard
2. Navigate to "Deploy" → "Deploy Hooks"
3. Create a new deploy hook and copy the URL
4. Add it as `RENDER_DEPLOY_HOOK` secret in GitHub

## Setting Up Secrets

### In GitHub Repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each required secret:

#### Frontend Secrets:
- Name: `SPACESHIP_API_KEY` | Value: `<your_api_key>`
- Name: `SPACESHIP_PROJECT_ID` | Value: `<your_project_id>`

#### Backend Secrets:
- Name: `RENDER_DEPLOY_HOOK` | Value: `<your_deploy_hook_url>`

## Manual Deployment

If you need to deploy manually:

**Frontend**:
```bash
cd frontend
npm install
npm run build
# Then deploy dist/ folder to Spaceship
```

**Backend**:
```bash
cd backend
npm install
npm run build
# Backend is ready to deploy (dist/ folder)
npm start
```

## Environment Variables

### Backend (.env file in backend/)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### Frontend
If using environment variables, create `frontend/.env.local`:
```
VITE_API_URL=https://your-backend-url.com
```

## Troubleshooting

- **Frontend build fails**: Ensure TypeScript compiles without errors: `cd frontend && npx tsc --noEmit`
- **Backend build fails**: Check TypeScript compilation: `cd backend && npx tsc --noEmit`
- **Deployment fails**: Verify all required secrets are set in GitHub repository settings
- **Render deploy not triggering**: Ensure the deploy hook URL is correct and accessible

## Local Testing

Before pushing, test builds locally:

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```
