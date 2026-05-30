#!/bin/bash
# Wood & Power - Git Deployment Helper Script

REPO_DIR="/Users/gregoryblackmon/woodpower"
cd "$REPO_DIR" || { echo "Error: Could not enter directory $REPO_DIR"; exit 1; }

# Check for modified or untracked files
if [ -z "$(git status --porcelain)" ]; then
    echo "=============================================="
    echo "  Wood & Power: No changes detected to deploy."
    echo "=============================================="
    exit 0
fi

# Get commit message from argument, or generate default
COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update website - $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "=============================================="
echo "  Deploying Wood & Power Website Updates"
echo "=============================================="

echo "1. Staging files..."
git add .

echo "2. Committing changes..."
git commit -m "$COMMIT_MSG"

echo "3. Pushing to GitHub (origin/main)..."
git push origin main

echo ""
echo "=============================================="
echo "  Success! Changes pushed to GitHub."
echo "  Hostinger will deploy these updates in a few seconds."
echo "=============================================="
