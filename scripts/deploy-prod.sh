#!/bin/bash
# =============================================================================
# QR Attends - Deploy to Production Convex
# =============================================================================
# Deploy Convex functions to production deployment

echo "============================================"
echo "  Deploy to Production Convex"
echo "============================================"
echo ""
echo "Production URL: https://glorious-axolotl-616.convex.cloud"
echo ""

# Check if convex is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed"
    exit 1
fi

# Deploy to production
echo "Deploying Convex functions to production..."
echo ""

# Set environment to production
export ACTIVE_ENVIRONMENT=production

# Deploy using convex CLI
npx convex deploy

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Build the app: eas build --platform android"
echo "2. Or continue development: npx convex dev"
echo ""
