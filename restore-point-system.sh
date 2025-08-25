#!/bin/bash

# Enterprise Restore Point System
# Based on Google Cloud and Lovable.dev best practices
# =====================================================

# Configuration
PROJECT_DIR="/srv/www/domains/easynetpro.com/main/frontend"
BACKUP_DIR="/srv/backups/restore-points/immersive-landing"
GITHUB_REMOTE="origin"
MAX_LOCAL_BACKUPS=30  # Keep 30 days of local backups
MAX_GITHUB_TAGS=10    # Keep 10 major restore points in GitHub

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Ensure backup directory exists
sudo mkdir -p "$BACKUP_DIR"

# Function: Create restore point
create_restore_point() {
    local description="${1:-Manual restore point}"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local restore_id="restore_${timestamp}"
    
    echo -e "${BLUE}📸 Creating Restore Point...${NC}"
    echo "================================"
    
    cd "$PROJECT_DIR"
    
    # 1. Git Commit (Version Control)
    echo -e "${YELLOW}1️⃣ Creating Git snapshot...${NC}"
    git add -A
    git commit -m "🔄 Restore Point: $description [$timestamp]" || true
    
    # 2. Git Tag (Named restore point)
    echo -e "${YELLOW}2️⃣ Creating Git tag...${NC}"
    git tag -a "$restore_id" -m "$description"
    
    # 3. Push to GitHub (Cloud backup)
    echo -e "${YELLOW}3️⃣ Pushing to GitHub...${NC}"
    git push origin main --tags
    
    # 4. Local Snapshot (Fast recovery)
    echo -e "${YELLOW}4️⃣ Creating local snapshot...${NC}"
    sudo tar -czf "$BACKUP_DIR/${restore_id}.tar.gz" \
        --exclude=node_modules \
        --exclude=dist \
        --exclude=.git \
        -C "$PROJECT_DIR" .
    
    # 5. Save metadata
    echo -e "${YELLOW}5️⃣ Saving metadata...${NC}"
    cat > "$BACKUP_DIR/${restore_id}.json" << JSON
{
    "id": "$restore_id",
    "timestamp": "$timestamp",
    "description": "$description",
    "git_hash": "$(git rev-parse HEAD)",
    "created_by": "$(whoami)",
    "created_at": "$(date -Iseconds)",
    "size": "$(du -sh $BACKUP_DIR/${restore_id}.tar.gz | cut -f1)"
}
JSON
    
    echo -e "${GREEN}✅ Restore Point Created Successfully!${NC}"
    echo -e "ID: ${BLUE}$restore_id${NC}"
    echo -e "Description: $description"
    echo ""
}

# Function: List restore points
list_restore_points() {
    echo -e "${BLUE}📋 Available Restore Points${NC}"
    echo "============================"
    
    echo -e "\n${YELLOW}GitHub Tags (Major Points):${NC}"
    git tag -l "restore_*" --sort=-creatordate | head -10 | while read tag; do
        desc=$(git tag -l --format='%(subject)' "$tag")
        echo "  • $tag - $desc"
    done
    
    echo -e "\n${YELLOW}Local Snapshots (Fast Recovery):${NC}"
    ls -1t "$BACKUP_DIR"/*.json 2>/dev/null | head -10 | while read metadata; do
        if [ -f "$metadata" ]; then
            id=$(jq -r '.id' "$metadata")
            desc=$(jq -r '.description' "$metadata")
            size=$(jq -r '.size' "$metadata")
            echo "  • $id - $desc ($size)"
        fi
    done
    
    echo -e "\n${YELLOW}Recent Git History:${NC}"
    git log --oneline -10 --grep="Restore Point"
}

# Function: Restore from point
restore_from_point() {
    local restore_id="$1"
    
    if [ -z "$restore_id" ]; then
        echo -e "${RED}❌ Please specify a restore point ID${NC}"
        list_restore_points
        return 1
    fi
    
    echo -e "${BLUE}⏮️  Restoring from: $restore_id${NC}"
    echo "================================"
    
    # Create backup of current state
    echo -e "${YELLOW}📦 Backing up current state...${NC}"
    create_restore_point "Pre-restore backup (before restoring to $restore_id)"
    
    cd "$PROJECT_DIR"
    
    # Check if it's a Git tag
    if git rev-parse "$restore_id" >/dev/null 2>&1; then
        echo -e "${YELLOW}🔄 Restoring from Git tag...${NC}"
        git checkout "$restore_id"
        git switch -c "restored-from-$restore_id"
        git checkout main
        git merge "restored-from-$restore_id" --strategy=theirs
        git branch -d "restored-from-$restore_id"
    # Check if it's a local snapshot
    elif [ -f "$BACKUP_DIR/${restore_id}.tar.gz" ]; then
        echo -e "${YELLOW}📂 Restoring from local snapshot...${NC}"
        # Clean current directory (except .git)
        find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
        # Extract snapshot
        sudo tar -xzf "$BACKUP_DIR/${restore_id}.tar.gz" -C "$PROJECT_DIR"
    else
        echo -e "${RED}❌ Restore point not found: $restore_id${NC}"
        return 1
    fi
    
    # Rebuild application
    echo -e "${YELLOW}🔨 Rebuilding application...${NC}"
    npm install
    npm run build
    sudo chown -R www-data:www-data dist/
    
    echo -e "${GREEN}✅ Successfully restored from: $restore_id${NC}"
}

# Function: Auto-create restore points
auto_restore_points() {
    # Create hourly restore points (Google best practice)
    while true; do
        create_restore_point "Automated hourly backup"
        # Clean old backups (keep 30 days)
        find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
        find "$BACKUP_DIR" -name "*.json" -mtime +30 -delete
        sleep 3600  # 1 hour
    done
}

# Function: Quick rollback (Lovable.dev style)
quick_rollback() {
    echo -e "${BLUE}⏪ Quick Rollback (Last Known Good State)${NC}"
    echo "========================================="
    
    cd "$PROJECT_DIR"
    
    # Find last stable commit
    last_stable=$(git log --oneline -20 | grep -v "Auto-sync" | head -1 | cut -d' ' -f1)
    
    if [ -n "$last_stable" ]; then
        echo -e "${YELLOW}Rolling back to: $last_stable${NC}"
        git reset --hard "$last_stable"
        npm install
        npm run build
        sudo chown -R www-data:www-data dist/
        echo -e "${GREEN}✅ Rollback complete!${NC}"
    else
        echo -e "${RED}❌ No stable point found${NC}"
    fi
}

# Function: Export/Import for disaster recovery
export_backup() {
    local export_file="${1:-backup_export_$(date +%Y%m%d).tar.gz}"
    
    echo -e "${BLUE}📤 Exporting Full Backup...${NC}"
    
    # Create comprehensive backup
    sudo tar -czf "/tmp/$export_file" \
        "$PROJECT_DIR" \
        "$BACKUP_DIR" \
        /etc/nginx/sites-enabled/easynetpro.com.conf \
        /etc/systemd/system/easynet-autosync.service
    
    echo -e "${GREEN}✅ Backup exported to: /tmp/$export_file${NC}"
    echo "You can download this file for offsite storage"
}

# Main menu
case "$1" in
    create)
        create_restore_point "$2"
        ;;
    list)
        list_restore_points
        ;;
    restore)
        restore_from_point "$2"
        ;;
    rollback)
        quick_rollback
        ;;
    auto)
        auto_restore_points
        ;;
    export)
        export_backup "$2"
        ;;
    *)
        echo -e "${BLUE}🔄 Enterprise Restore Point System${NC}"
        echo "===================================="
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Commands:"
        echo "  create [description]  - Create a new restore point"
        echo "  list                 - List all restore points"
        echo "  restore [id]         - Restore from specific point"
        echo "  rollback             - Quick rollback to last stable"
        echo "  auto                 - Start automatic hourly backups"
        echo "  export [filename]    - Export full backup for DR"
        echo ""
        echo "Examples:"
        echo "  $0 create 'Before major update'"
        echo "  $0 restore restore_20250824_123456"
        echo "  $0 rollback"
        ;;
esac
