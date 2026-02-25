#!/bin/bash

# Start all services for the video streaming platform

echo "🚀 Starting VideoHub Platform..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Start Docker services
echo -e "${BLUE}📦 Starting Docker services...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📥 Installing dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🎬 VideoHub Platform Services:${NC}"
echo ""
echo "📌 To start everything, run in separate terminals:"
echo ""
echo -e "  ${GREEN}Terminal 1: API Server${NC}"
echo "    cd apps/api && npm run dev"
echo "    → Running at http://localhost:3001"
echo ""
echo -e "  ${GREEN}Terminal 2: Frontend${NC}"
echo "    cd apps/web && npm run dev"
echo "    → Running at http://localhost:3000"
echo ""
echo -e "  ${GREEN}Terminal 3: Transcoding Workers (optional)${NC}"
echo "    cd apps/api && npm run worker"
echo "    → Processes video uploads in parallel"
echo ""
echo -e "${BLUE}📂 Service URLs:${NC}"
echo ""
echo "  🎥 Frontend:        http://localhost:3000"
echo "  🔧 API Server:      http://localhost:3001/api"
echo "  💾 MinIO Console:   http://localhost:9001"
echo "  🔍 Elasticsearch:   http://localhost:9200"
echo "  📊 ClickHouse:      http://localhost:8123"
echo "  🗄️  MongoDB:         localhost:27017"
echo "  ⚡ Redis:           localhost:6379"
echo ""
echo -e "${BLUE}🔐 MinIO Credentials:${NC}"
echo "  Username: minioadmin"
echo "  Password: minioadmin"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Quick Start:   ./QUICKSTART.md"
echo "  • Architecture:  ./ARCHITECTURE.md"
echo "  • Frontend:      ./FRONTEND.md"
echo "  • API Docs:      ./apps/api/README.md"
echo ""
echo -e "${BLUE}🚀 Ready to build a video streaming platform!${NC}"
