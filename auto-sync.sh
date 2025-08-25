#!/bin/bash

# Enterprise Auto-Sync Script for GitHub
# Based on Lovable.dev and Google best practices

PROJECT_DIR="/srv/www/domains/easynetpro.com/main/frontend"
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_REPO="natocool2/immersive-landing"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 EasyNet Pro Auto-Sync System${NC}"
echo "================================"

# Function to check git status
check_git_status() {
    cd "$PROJECT_DIR"
    if [ -n "$(git status --porcelain)" ]; then
        return 0  # Changes detected
    else
        return 1  # No changes
    fi
}

# Function to commit and push changes
sync_to_github() {
    cd "$PROJECT_DIR"
    
    echo -e "${YELLOW}📦 Building application...${NC}"
    npm run build
    
    echo -e "${YELLOW}📝 Committing changes...${NC}"
    git add -A
    git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S') - Updated from Claude"
    
    echo -e "${YELLOW}⬆️  Pushing to GitHub...${NC}"
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully synced to GitHub!${NC}"
    else
        echo -e "${RED}❌ Push failed. Check authentication.${NC}"
        return 1
    fi
}

# Function to pull latest changes
pull_from_github() {
    cd "$PROJECT_DIR"
    echo -e "${YELLOW}⬇️  Pulling latest changes from GitHub...${NC}"
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pulled from GitHub!${NC}"
        npm install
        npm run build
        sudo chown -R www-data:www-data dist/
        sudo systemctl reload nginx
    else
        echo -e "${RED}❌ Pull failed.${NC}"
        return 1
    fi
}

# Main sync logic
case "$1" in
    push)
        if check_git_status; then
            sync_to_github
        else
            echo -e "${YELLOW}No changes to sync.${NC}"
        fi
        ;;
    pull)
        pull_from_github
        ;;
    auto)
        # Continuous sync mode (like Lovable.dev)
        echo -e "${GREEN}🔄 Auto-sync mode activated${NC}"
        while true; do
            if check_git_status; then
                sync_to_github
            fi
            sleep 30  # Check every 30 seconds
        done
        ;;
    *)
        echo "Usage: $0 {push|pull|auto}"
        exit 1
        ;;
esac
