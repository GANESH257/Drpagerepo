# Fix Embedded Git Repository Warning

## Problem
The `Ensembledemospace` directory contains its own `.git` folder, which causes a warning when adding files.

## Solution
Remove the embedded `.git` directory so all files are included as regular files in your repository.

## Commands to Run

```bash
cd /Users/ganesh/Desktop/DRPNEW

# Remove the embedded .git directory
rm -rf Ensembledemospace/.git

# Remove it from git cache if already added
git rm --cached Ensembledemospace 2>/dev/null || true

# Add all files again (now Ensembledemospace will be included as regular files)
git add .

# Verify the warning is gone
git status
```

## Complete Sequence

```bash
cd /Users/ganesh/Desktop/DRPNEW

# Fix embedded repository issue
rm -rf Ensembledemospace/.git
git rm --cached Ensembledemospace 2>/dev/null || true

# Add all files
git add .

# Commit
git commit -m "Initial commit: Alliance of Independent Physicians platform"

# Push
git branch -M main
git remote add origin git@github.com:GANESH257/Drpagerepo.git
git push -u origin main
```
