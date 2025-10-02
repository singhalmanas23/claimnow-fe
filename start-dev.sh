#!/bin/bash

# Quick Start Script for ClaimNow Integration
# This script helps you start both frontend and backend servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 ClaimNow Integration Quick Start"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}Starting Backend Server...${NC}"
    cd "${PROJECT_ROOT}/mediclaim-backend"
    
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    if [ ! -f ".env_setup_done" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        pip install -r requirements.txt
        touch .env_setup_done
    fi
    
    echo -e "${GREEN}✓ Backend starting on http://localhost:8000${NC}"
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/claimnow_backend.pid
    
    # Wait for backend to be ready
    echo "Waiting for backend to be ready..."
    sleep 3
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}Starting Frontend Server...${NC}"
    cd "${PROJECT_ROOT}/claimnow-fe"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Node modules not found. Installing...${NC}"
        npm install
    fi
    
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}Creating .env.local file...${NC}"
        echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
    fi
    
    echo -e "${GREEN}✓ Frontend starting on http://localhost:3000${NC}"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/claimnow_frontend.pid
}

# Function to stop servers
stop_servers() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    
    if [ -f /tmp/claimnow_backend.pid ]; then
        BACKEND_PID=$(cat /tmp/claimnow_backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm /tmp/claimnow_backend.pid
        echo -e "${GREEN}✓ Backend stopped${NC}"
    fi
    
    if [ -f /tmp/claimnow_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/claimnow_frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm /tmp/claimnow_frontend.pid
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi
    
    echo -e "${GREEN}All servers stopped successfully!${NC}"
    exit 0
}

# Trap CTRL+C
trap stop_servers INT TERM

# Check if ports are already in use
if check_port 8000; then
    echo -e "${RED}✗ Port 8000 is already in use!${NC}"
    echo "Please stop the existing process or use a different port."
    exit 1
fi

if check_port 3000; then
    echo -e "${RED}✗ Port 3000 is already in use!${NC}"
    echo "Please stop the existing process or use a different port."
    exit 1
fi

# Start servers
start_backend
start_frontend

echo ""
echo -e "${GREEN}======================================"
echo "✓ All servers are running!"
echo "======================================${NC}"
echo ""
echo -e "📱 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "🔧 Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "📚 API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press CTRL+C to stop all servers${NC}"
echo ""

# Wait for user to stop
wait
