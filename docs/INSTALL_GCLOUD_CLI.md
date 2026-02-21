# Install Google Cloud SDK (gcloud CLI)

## For macOS

### Option 1: Using Homebrew (Easiest)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install gcloud CLI
brew install --cask google-cloud-sdk
```

### Option 2: Direct Download

1. **Download**: https://cloud.google.com/sdk/docs/install
2. **Run installer**: Follow the prompts
3. **Restart terminal** after installation

### Option 3: Using curl (Quick Install)

```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart shell or run:
exec -l $SHELL

# Initialize
gcloud init
```

---

## After Installation

### 1. Initialize gcloud

```bash
gcloud init
```

This will:
- Ask you to log in
- Select your project (`ensemble-portal`)
- Set default region (`us-central1`)

### 2. Verify Installation

```bash
gcloud --version
```

Should show: `Google Cloud SDK` version info

### 3. Login

```bash
gcloud auth login
```

Opens browser to authenticate.

---

## Quick Test

```bash
# List your projects
gcloud projects list

# Set default project
gcloud config set project ensemble-portal
```

---

**Once installed, you can deploy to Cloud Run!**
