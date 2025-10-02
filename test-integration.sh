#!/bin/bash

# ClaimNow Integration Quick Test Script
# This script helps verify that the integration is working correctly

echo "🚀 ClaimNow Integration Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "📡 Checking if backend is running..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo -e "${YELLOW}Please start the backend:${NC}"
    echo "  cd mediclaim-backend"
    echo "  python -m uvicorn app.main:app --reload"
    exit 1
fi

echo ""

# Check if frontend dependencies are installed
echo "📦 Checking frontend dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}! Installing dependencies...${NC}"
    pnpm install
fi

echo ""

# Check environment variables
echo "🔧 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    if grep -q "NEXT_PUBLIC_API_BASE_URL" .env.local; then
        API_URL=$(grep NEXT_PUBLIC_API_BASE_URL .env.local | cut -d '=' -f2)
        echo -e "${GREEN}✓ API URL configured: ${API_URL}${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_API_BASE_URL not set${NC}"
    fi
else
    echo -e "${YELLOW}! Creating .env.local from .env.example${NC}"
    cp .env.example .env.local
fi

echo ""

# Test backend endpoints
echo "🧪 Testing backend endpoints..."

# Test health check
if curl -s http://localhost:8000/ | grep -q "status"; then
    echo -e "${GREEN}✓ Health check endpoint working${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

# Test API docs
if curl -s http://localhost:8000/docs > /dev/null; then
    echo -e "${GREEN}✓ API documentation accessible${NC}"
else
    echo -e "${RED}✗ API documentation not accessible${NC}"
fi

echo ""

# Check TypeScript compilation
echo "📝 Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}! TypeScript errors found (check with: pnpm run type-check)${NC}"
fi

echo ""

# Summary
echo "===================================="
echo "✨ Integration Check Complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: ${GREEN}pnpm dev${NC}"
echo "2. Open browser: ${GREEN}http://localhost:3000${NC}"
echo "3. Check example components in: ${GREEN}src/components/examples/${NC}"
echo "4. Test login with: username=${GREEN}testuser${NC}, password=${GREEN}password123${NC}"
echo ""
echo "📚 Documentation:"
echo "  - API_INTEGRATION.md - Comprehensive guide"
echo "  - INTEGRATION_SUMMARY.md - Quick overview"
echo "  - API_INTEGRATION_COMPLETE.md - Usage examples"
echo ""
echo "🛠️  Development Tools:"
echo "  - React Query DevTools: Available in dev mode"
echo "  - Backend API Docs: http://localhost:8000/docs"
echo ""
