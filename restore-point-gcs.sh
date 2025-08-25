#!/bin/bash

# Enterprise Restore Point System with GCS
# =========================================

PROJECT_DIR="/srv/www/domains/easynetpro.com/main/frontend"
GCS_BUCKET="gs://enpro-migration-backup-20250824"
GCS_PATH="immersive-landing/restore-points"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function: Create GCS restore point
create_gcs_restore_point() {
    local description="${1:-Manual restore point}"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local restore_id="gcs_restore_${timestamp}"
    
    echo -e "${BLUE}☁️ Creating GCS Enterprise Restore Point...${NC}"
    echo "========================================="
    
    cd "$PROJECT_DIR"
    
    # 1. Create local snapshot
    echo -e "${YELLOW}📦 Creating snapshot...${NC}"
    tar -czf /tmp/${restore_id}.tar.gz \
        --exclude=node_modules \
        --exclude=dist \
        --exclude=.git \
        -C "$PROJECT_DIR" .
    
    # 2. Upload to GCS with metadata
    echo -e "${YELLOW}☁️ Uploading to GCS...${NC}"
    gsutil -h "x-goog-meta-description:$description" \
           -h "x-goog-meta-created-by:$(whoami)" \
           -h "x-goog-meta-git-hash:$(git rev-parse HEAD 2>/dev/null || echo 'none')" \
           cp /tmp/${restore_id}.tar.gz \
           ${GCS_BUCKET}/${GCS_PATH}/${restore_id}.tar.gz
    
    # 3. Create metadata file
    cat > /tmp/${restore_id}.json << JSON
{
    "id": "$restore_id",
    "timestamp": "$timestamp",
    "description": "$description",
    "size": "$(du -sh /tmp/${restore_id}.tar.gz | cut -f1)",
    "gcs_path": "${GCS_BUCKET}/${GCS_PATH}/${restore_id}.tar.gz",
    "created_at": "$(date -Iseconds)"
}
JSON
    
    gsutil cp /tmp/${restore_id}.json \
              ${GCS_BUCKET}/${GCS_PATH}/${restore_id}.json
    
    # Clean temp files
    rm /tmp/${restore_id}.*
    
    echo -e "${GREEN}✅ GCS Restore Point Created!${NC}"
    echo -e "ID: ${BLUE}$restore_id${NC}"
    echo -e "Location: ${GCS_BUCKET}/${GCS_PATH}/"
}

# Function: List GCS restore points
list_gcs_restore_points() {
    echo -e "${BLUE}☁️ GCS Restore Points${NC}"
    echo "====================="
    
    gsutil ls -L ${GCS_BUCKET}/${GCS_PATH}/*.json 2>/dev/null | \
        grep -E "gcs_restore_.*\.json" | \
        while read line; do
            if [[ $line =~ (gcs_restore_[0-9]+_[0-9]+) ]]; then
                echo "  • ${BASH_REMATCH[1]}"
            fi
        done
}

# Function: Restore from GCS
restore_from_gcs() {
    local restore_id="$1"
    
    echo -e "${BLUE}⬇️ Restoring from GCS: $restore_id${NC}"
    echo "===================================="
    
    # Download from GCS
    echo -e "${YELLOW}Downloading from GCS...${NC}"
    gsutil cp ${GCS_BUCKET}/${GCS_PATH}/${restore_id}.tar.gz /tmp/
    
    # Backup current state first
    create_gcs_restore_point "Pre-restore backup"
    
    # Extract
    cd "$PROJECT_DIR"
    find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
    tar -xzf /tmp/${restore_id}.tar.gz -C "$PROJECT_DIR"
    
    # Rebuild
    npm install
    npm run build
    sudo chown -R www-data:www-data dist/
    
    echo -e "${GREEN}✅ Restored from GCS!${NC}"
}

# Function: Show GCS stats
gcs_stats() {
    echo -e "${BLUE}📊 GCS Backup Statistics${NC}"
    echo "========================"
    
    echo -e "\n${YELLOW}Storage Usage:${NC}"
    gsutil du -sh ${GCS_BUCKET}/immersive-landing/
    
    echo -e "\n${YELLOW}Number of Restore Points:${NC}"
    gsutil ls ${GCS_BUCKET}/${GCS_PATH}/*.tar.gz 2>/dev/null | wc -l
    
    echo -e "\n${YELLOW}Estimated Monthly Cost:${NC}"
    SIZE=$(gsutil du -s ${GCS_BUCKET}/immersive-landing/ | awk '{print $1}')
    COST=$(echo "scale=2; $SIZE / 1073741824 * 0.02" | bc)
    echo "$COST USD (Standard class)"
}

# Main menu
case "$1" in
    create)
        create_gcs_restore_point "$2"
        ;;
    list)
        list_gcs_restore_points
        ;;
    restore)
        restore_from_gcs "$2"
        ;;
    stats)
        gcs_stats
        ;;
    *)
        echo -e "${BLUE}☁️ Enterprise GCS Restore System${NC}"
        echo "================================="
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Commands:"
        echo "  create [desc]  - Create GCS restore point"
        echo "  list          - List GCS restore points"
        echo "  restore [id]  - Restore from GCS"
        echo "  stats         - Show GCS statistics"
        ;;
esac
