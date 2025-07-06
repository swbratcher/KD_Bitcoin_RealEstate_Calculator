# GitHub Actions Auto-Deployment Guide

## Overview
Set up automated deployment from GitHub to your CPanel hosting environment. This eliminates manual deployments and ensures consistent, tested releases.

## How It Works
1. **Push code to `main` branch** → Triggers deployment
2. **GitHub Actions runs tests** → Ensures code quality
3. **Builds static files** → Creates optimized production build
4. **Auto-deploys to CPanel** → Updates live site automatically

## Setup Instructions

### 1. GitHub Secrets Configuration
Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these repository secrets:
- `FTP_HOST` - Your CPanel domain (e.g., `yourdomain.com`)
- `FTP_USERNAME` - Your CPanel FTP username
- `FTP_PASSWORD` - Your CPanel FTP password

### 2. Verify Workflow File
The deployment workflow is already created at `.github/workflows/deploy.yml`

**Update these settings if needed:**
```yaml
server-dir: /public_html/bitcoin_realestate_calculator/
```
Change the path to match your exact CPanel directory structure.

### 3. CPanel Directory Structure
Ensure your CPanel has this structure:
```
public_html/
├── (WordPress files for main site)
└── bitcoin_realestate_calculator/
    └── (Calculator app files will be deployed here)
```

### 4. First Deployment
1. **Commit and push** any changes to the `main` branch
2. **Go to GitHub** → Your repo → **Actions tab**
3. **Monitor the deployment** progress in real-time
4. **Verify success** by visiting your live site

## Deployment Workflow Features

✅ **Automatic Testing** - Tests must pass before deployment  
✅ **Build Optimization** - Creates production-ready static files  
✅ **FTP Upload** - Securely transfers files to CPanel  
✅ **Manual Triggers** - Can manually trigger deployments  
✅ **Build History** - Track all deployments in GitHub Actions  

## Manual Deployment Trigger
1. Go to **GitHub** → **Actions** tab
2. Select **"Deploy Bitcoin Calculator"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

## Troubleshooting

### Common Issues:
- **Build fails:** Check test results in Actions log
- **FTP connection fails:** Verify GitHub secrets are correct
- **Wrong directory:** Update `server-dir` in workflow file
- **Permissions:** Ensure FTP user has write access to target directory

### Deployment Log Location:
GitHub → Your repo → Actions → Latest deployment run

## Security Notes
- FTP credentials are stored securely in GitHub Secrets
- Only repository maintainers can view/edit secrets
- All deployments are logged and auditable

## Alternative: SSH Deployment
For enhanced security, the workflow can be modified to use SSH instead of FTP. This requires:
- SSH key pair generation
- Public key installation on server
- Workflow modification to use SSH actions

## Benefits Over Manual Deployment
- **Consistency:** Same build process every time
- **Testing:** Automated testing prevents broken deployments
- **History:** Full deployment history and rollback capability
- **Team Collaboration:** Multiple developers can deploy safely
- **No Local Dependencies:** Works from any environment

---

**Ready to deploy?** Just push to main branch and watch the magic happen! 🚀