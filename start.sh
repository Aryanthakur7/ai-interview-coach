#!/bin/bash

# ─────────────────────────────────────────────────────────────
#  AI Interview Coach — one-shot startup script
#  Usage: bash start.sh
# ─────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       AI Interview Coach 🎯           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Check for GROQ_API_KEY ──────────────────────────────────
if [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | xargs)
fi

if [ -z "$GROQ_API_KEY" ]; then
  echo -e "${RED}ERROR: GROQ_API_KEY is not set.${NC}"
  echo ""
  echo "  1. Get a free key at https://console.groq.com"
  echo "  2. Create the file  backend/.env  with:"
  echo "     GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx"
  echo ""
  exit 1
fi

echo -e "${GREEN}✔ GROQ_API_KEY found${NC}"
echo ""

# ── Backend ─────────────────────────────────────────────────
echo -e "${YELLOW}▶ Setting up backend...${NC}"
cd backend

python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt -q

echo -e "${GREEN}✔ Backend dependencies installed${NC}"

# Start Flask in background
python3 app.py &
BACKEND_PID=$!
echo -e "${GREEN}✔ Flask running on http://localhost:5000  (PID $BACKEND_PID)${NC}"

cd ..

# ── Frontend ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Setting up frontend...${NC}"
cd frontend

npm install --silent
echo -e "${GREEN}✔ Frontend dependencies installed${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  App running at → http://localhost:5173${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Vite (foreground — Ctrl+C stops everything)
trap "kill $BACKEND_PID 2>/dev/null; echo ''; echo 'Stopped.'" EXIT
npm run dev
