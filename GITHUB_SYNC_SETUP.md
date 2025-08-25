# 🚀 Enterprise GitHub Auto-Sync Setup
**Based on Google & Lovable.dev Best Practices**

## Overview
This system provides automatic bi-directional synchronization between your local environment and GitHub, similar to Lovable.dev's real-time sync capabilities.

## 📋 Setup Instructions

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)
4. Copy the token (you won't see it again!)

### Step 2: Configure Git Authentication

```bash
# Option A: Using Personal Access Token (Recommended)
cd /srv/www/domains/easynetpro.com/main/frontend
git remote set-url origin https://<YOUR_GITHUB_USERNAME>:<YOUR_TOKEN>@github.com/natocool2/immersive-landing.git

# Option B: Using SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add this key to GitHub → Settings → SSH Keys
```

### Step 3: Configure GitHub Secrets (for GitHub Actions)

In your GitHub repository settings, add these secrets:
- `SERVER_HOST`: Your server IP address
- `SERVER_USER`: SSH username (e.g., natanielfreire)
- `SERVER_SSH_KEY`: Your server's SSH private key

### Step 4: Test Manual Sync

```bash
# Test push to GitHub
sudo /srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh push

# Test pull from GitHub
sudo /srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh pull
```

### Step 5: Enable Automatic Sync Service

```bash
# Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable easynet-autosync.service
sudo systemctl start easynet-autosync.service

# Check service status
sudo systemctl status easynet-autosync.service

# View logs
sudo journalctl -u easynet-autosync.service -f
```

## 🔄 How It Works

### Automatic Sync Flow:
1. **Local Changes** → Detected every 30 seconds → Auto-commit → Push to GitHub
2. **GitHub Changes** → Trigger GitHub Actions → Deploy to server
3. **Bi-directional** → Changes sync both ways automatically

### Manual Commands:

```bash
# Push local changes to GitHub
sudo /srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh push

# Pull changes from GitHub
sudo /srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh pull

# Start continuous auto-sync (runs in foreground)
sudo /srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh auto
```

## 🛠️ Advanced Configuration

### Customize Sync Interval
Edit `/srv/www/domains/easynetpro.com/main/frontend/auto-sync.sh`:
```bash
sleep 30  # Change this value (in seconds)
```

### Exclude Files from Sync
Create/edit `.gitignore`:
```
node_modules/
dist/
.env
*.log
```

### Custom Commit Messages
Edit the auto-sync.sh script to customize commit messages:
```bash
git commit -m "Your custom message: $(date '+%Y-%m-%d %H:%M:%S')"
```

## 🔒 Security Best Practices

1. **Never commit sensitive data** (use .env files)
2. **Rotate tokens regularly** (every 90 days)
3. **Use SSH keys** for production environments
4. **Enable 2FA** on GitHub account
5. **Restrict token permissions** to minimum required

## 🎯 Features

- ✅ **Automatic commits** every 30 seconds (configurable)
- ✅ **Bi-directional sync** (like Lovable.dev)
- ✅ **GitHub Actions CI/CD** pipeline
- ✅ **Automatic build & deploy** on push
- ✅ **Systemd service** for reliability
- ✅ **Colored output** for better visibility
- ✅ **Error handling** and retry logic

## 📊 Monitoring

```bash
# Check sync service status
sudo systemctl status easynet-autosync

# View recent sync logs
sudo journalctl -u easynet-autosync -n 50

# Monitor in real-time
sudo journalctl -u easynet-autosync -f

# Check GitHub Actions status
# Visit: https://github.com/natocool2/immersive-landing/actions
```

## 🚨 Troubleshooting

### Authentication Failed
```bash
# Test GitHub connection
git ls-remote https://github.com/natocool2/immersive-landing.git

# Re-configure remote with token
git remote set-url origin https://USERNAME:TOKEN@github.com/natocool2/immersive-landing.git
```

### Service Not Starting
```bash
# Check service logs
sudo journalctl -xe | grep easynet-autosync

# Restart service
sudo systemctl restart easynet-autosync
```

### Merge Conflicts
```bash
# Pull with rebase
git pull --rebase origin main

# Resolve conflicts manually, then
git add .
git rebase --continue
```

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lovable.dev GitHub Integration](https://docs.lovable.dev/integrations/git-integration)
- [Google Cloud CI/CD Best Practices](https://cloud.google.com/architecture/devops/devops-tech-continuous-integration)

---

**Last Updated**: 2025-08-24
**Maintained by**: EasyNet Pro DevOps Team
