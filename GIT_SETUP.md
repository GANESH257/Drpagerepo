# Git Setup Commands

Run these commands in order to set up the repository and push to GitHub.

## Step 1: Initialize Git Repository

```bash
cd /Users/ganesh/Desktop/DRPNEW

# If .git directory exists but has issues, remove it first:
rm -rf .git

# Initialize fresh git repository
git init
```

## Step 2: Configure Git (if not already configured globally)

```bash
# Set your name and email (replace with your GitHub credentials)
git config user.name "GANESH257"
git config user.email "your-email@example.com"
```

## Step 3: Add All Files

```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Alliance of Independent Physicians platform

- Complete Next.js 14 application with TypeScript
- Doctor directory with 115+ profiles
- Admin and Doctor dashboards
- Public health resources
- Medical student resources
- Trustee board portal
- Static export ready for GoDaddy deployment"
```

## Step 5: Set Up Remote and Push

```bash
# Set the main branch name
git branch -M main

# Add remote repository
git remote add origin git@github.com:GANESH257/Drpagerepo.git

# Verify remote is set correctly
git remote -v

# Push to GitHub
git push -u origin main
```

## If Push Fails (SSH Key Issues)

If you get authentication errors, you may need to:

1. **Use HTTPS instead of SSH:**
   ```bash
   git remote set-url origin https://github.com/GANESH257/Drpagerepo.git
   git push -u origin main
   ```

2. **Or set up SSH keys:**
   - Follow GitHub's guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

## Complete Command Sequence (Copy & Paste)

```bash
cd /Users/ganesh/Desktop/DRPNEW

# Remove existing .git if needed
rm -rf .git

# Initialize
git init

# Configure (adjust email if needed)
git config user.name "GANESH257"
git config user.email "your-email@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit: Alliance of Independent Physicians platform"

# Set branch name
git branch -M main

# Add remote
git remote add origin git@github.com:GANESH257/Drpagerepo.git

# Push
git push -u origin main
```

## What Gets Committed

The `.gitignore` file ensures these are NOT committed:
- `node_modules/` - Dependencies (install with `npm install`)
- `.next/` - Build cache
- `out/` - Build output
- `*.zip` - Deployment zip files
- `.DS_Store` - macOS system files
- `.env*.local` - Local environment files

Everything else (source code, components, data, public assets, config files) will be committed.

## Verification

After pushing, verify on GitHub:
1. Go to https://github.com/GANESH257/Drpagerepo
2. Check that all files are present
3. Verify README.md displays correctly

## For the Person Receiving the Repository

They should run:
```bash
git clone git@github.com:GANESH257/Drpagerepo.git
cd Drpagerepo
npm install
npm run dev
```
