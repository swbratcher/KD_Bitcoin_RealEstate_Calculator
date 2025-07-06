#!/bin/bash

# Bitcoin Real Estate Calculator - Automated Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: staging|production (default: production)

set -e  # Exit on any error

# Configuration
PROJECT_NAME="bitcoin-calculator"
BUILD_DIR="out"
DEPLOY_ZIP="bitcoin-calculator-deploy.zip"

# Default environment
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment for ${ENVIRONMENT}...${NC}"

# Clean previous builds
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"
rm -rf .next $BUILD_DIR $DEPLOY_ZIP 2>/dev/null || true

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Verify build output
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed - no output directory found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
cd $BUILD_DIR
zip -r ../$DEPLOY_ZIP . >/dev/null
cd ..

echo -e "${GREEN}✅ Deployment package created: $DEPLOY_ZIP${NC}"

# Deployment method selection
echo -e "${YELLOW}🚀 Choose deployment method:${NC}"
echo "1) SSH/rsync (recommended)"
echo "2) FTP"
echo "3) Manual (create zip only)"
echo "4) Local copy (for local testing)"
read -p "Enter choice [1-4]: " deploy_choice

case $deploy_choice in
    1)
        echo -e "${YELLOW}📡 SSH/rsync deployment${NC}"
        # SSH deployment configuration
        read -p "Enter SSH host (e.g., your-domain.com): " SSH_HOST
        read -p "Enter SSH user: " SSH_USER
        read -p "Enter remote path (e.g., /home/user/public_html/bitcoin_realestate_calculator): " REMOTE_PATH
        
        echo -e "${YELLOW}📤 Deploying via SSH...${NC}"
        
        # Extract and sync files
        rm -rf temp_deploy 2>/dev/null || true
        mkdir temp_deploy
        cd temp_deploy
        unzip -q ../$DEPLOY_ZIP
        
        # Sync to server
        rsync -avz --delete . $SSH_USER@$SSH_HOST:$REMOTE_PATH/
        
        cd ..
        rm -rf temp_deploy
        
        echo -e "${GREEN}✅ Deployment completed via SSH${NC}"
        echo -e "${GREEN}🌐 Your app should be available at: https://$SSH_HOST/bitcoin_realestate_calculator/${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}📡 FTP deployment${NC}"
        read -p "Enter FTP host: " FTP_HOST
        read -p "Enter FTP username: " FTP_USER
        read -p "Enter FTP remote path: " FTP_PATH
        
        # Check if lftp is available
        if command -v lftp >/dev/null 2>&1; then
            echo -e "${YELLOW}📤 Deploying via FTP...${NC}"
            
            # Extract files for FTP upload
            rm -rf temp_deploy 2>/dev/null || true
            mkdir temp_deploy
            cd temp_deploy
            unzip -q ../$DEPLOY_ZIP
            
            # Upload via lftp
            lftp -c "open ftp://$FTP_USER@$FTP_HOST; mirror -R . $FTP_PATH"
            
            cd ..
            rm -rf temp_deploy
            
            echo -e "${GREEN}✅ Deployment completed via FTP${NC}"
        else
            echo -e "${RED}❌ lftp not found. Please install lftp or use manual deployment.${NC}"
            echo -e "${YELLOW}📦 Deployment package ready: $DEPLOY_ZIP${NC}"
        fi
        ;;
        
    3)
        echo -e "${YELLOW}📦 Manual deployment${NC}"
        echo -e "${GREEN}✅ Deployment package ready: $DEPLOY_ZIP${NC}"
        echo -e "${YELLOW}Manual steps:${NC}"
        echo "1. Upload $DEPLOY_ZIP to your server"
        echo "2. Extract to your web directory: /bitcoin_realestate_calculator/"
        echo "3. Ensure index.html is in the subdirectory root"
        ;;
        
    4)
        echo -e "${YELLOW}💻 Local deployment${NC}"
        read -p "Enter local target directory (e.g., /var/www/html/bitcoin_realestate_calculator): " LOCAL_PATH
        
        if [ ! -d "$(dirname "$LOCAL_PATH")" ]; then
            echo -e "${RED}❌ Parent directory does not exist: $(dirname "$LOCAL_PATH")${NC}"
            exit 1
        fi
        
        # Create target directory if it doesn't exist
        sudo mkdir -p "$LOCAL_PATH" 2>/dev/null || mkdir -p "$LOCAL_PATH"
        
        # Extract and copy files
        rm -rf temp_deploy 2>/dev/null || true
        mkdir temp_deploy
        cd temp_deploy
        unzip -q ../$DEPLOY_ZIP
        
        # Copy to local path
        if [ -w "$(dirname "$LOCAL_PATH")" ]; then
            cp -r . "$LOCAL_PATH/"
        else
            sudo cp -r . "$LOCAL_PATH/"
        fi
        
        cd ..
        rm -rf temp_deploy
        
        echo -e "${GREEN}✅ Local deployment completed${NC}"
        echo -e "${GREEN}🌐 Your app should be available at: http://localhost/bitcoin_realestate_calculator/${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Cleanup
if [ "$deploy_choice" != "3" ]; then
    read -p "Clean up deployment package? [Y/n]: " cleanup
    if [[ $cleanup =~ ^[Yy]?$ ]]; then
        rm -f $DEPLOY_ZIP
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    fi
fi

echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${YELLOW}💡 Tip: Add this script to your development workflow${NC}"