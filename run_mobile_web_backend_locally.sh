#!/usr/bin/env bash

# ==============================================================================
# AgriConnect - Local Development Launcher
# Starts Backend (Go), Web App (Vite/React), and Mobile App (Expo) concurrently.
#
# MOBILE CONNECTIVITY STRATEGY:
#   1. Start backend on port 8080 (binds to all interfaces)
#   2. Start localtunnel → get a public HTTPS URL for the backend
#   3. Inject that URL into Expo via API_URL env var → app.config.js
#   4. Mobile app reads it from Constants.expoConfig.extra.apiUrl
#   This allows Expo Go on physical devices to reach the backend from anywhere.
# ==============================================================================

set -e  # Exit on error during setup

# Colors for terminal formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Determine project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Detect local LAN IP address (wlan0 / eth0 only — not docker bridges)
LOCAL_IP=$(ip -4 addr show scope global | grep -oP 'inet \K[\d.]+' | grep -v '^172\.' | head -n 1)
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="127.0.0.1"
fi

echo -e "${CYAN}======================================================================${NC}"
echo -e "${GREEN}🌾  AgriConnect Unified Local Development Launcher  🌾${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e "📍 Local Network IP: ${YELLOW}${LOCAL_IP}${NC}\n"

# ------------------------------------------------------------------------------
# Helper: check if a TCP port is open
# ------------------------------------------------------------------------------
is_port_open() {
  (echo > /dev/tcp/localhost/$1) 2>/dev/null
}

# ------------------------------------------------------------------------------
# 1. Kill any stale processes that might block our ports
# ------------------------------------------------------------------------------
echo -e "${BLUE}[0/5] Freeing ports 8080, 5173, 8081...${NC}"
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true
sleep 1
echo -e "  ${GREEN}✓ Ports cleared.${NC}\n"

# ------------------------------------------------------------------------------
# 2. Check MongoDB Status
# ------------------------------------------------------------------------------
echo -e "${BLUE}[1/5] Checking MongoDB service...${NC}"
is_mongo_up() {
  (echo > /dev/tcp/localhost/27017) 2>/dev/null || pgrep -x "mongod" > /dev/null
}

if is_mongo_up; then
  echo -e "  ${GREEN}✓ MongoDB is running on port 27017.${NC}\n"
else
  echo -e "  ${YELLOW}⚠️  MongoDB not running. Attempting to start...${NC}"
  if command -v docker &> /dev/null; then
    docker start pageant-mongodb 2>/dev/null || docker start dev-mongodb 2>/dev/null || true
  fi
  if ! is_mongo_up && command -v systemctl &> /dev/null; then
    sudo systemctl start mongodb 2>/dev/null || sudo systemctl start mongod 2>/dev/null || true
  fi
  sleep 2
  if is_mongo_up; then
    echo -e "  ${GREEN}✓ MongoDB started.${NC}\n"
  else
    echo -e "  ${RED}❌ Could not connect to MongoDB. Proceeding anyway...${NC}\n"
  fi
fi

# PIDs array for cleanup
PIDS=()
TUNNEL_LOG=$(mktemp)

# Graceful cleanup on script termination (Ctrl+C)
cleanup() {
  echo -e "\n${YELLOW}----------------------------------------------------------------------${NC}"
  echo -e "${YELLOW}Shutting down all AgriConnect local services...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  rm -f "$TUNNEL_LOG"
  echo -e "${GREEN}✓ All services stopped. Goodbye!${NC}"
  echo -e "${YELLOW}----------------------------------------------------------------------${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

set +e  # Don't exit on error after setup

# ------------------------------------------------------------------------------
# 3. Start Go Backend API Server and wait until ready
# ------------------------------------------------------------------------------
echo -e "${BLUE}[2/5] Starting Go Backend Server (Port 8080)...${NC}"
(
  cd "$PROJECT_ROOT/backend"
  go run ./cmd/api/main.go
) &
BACKEND_PID=$!
PIDS+=("$BACKEND_PID")

# Wait up to 15s for backend to be ready
for i in $(seq 1 30); do
  sleep 0.5
  if is_port_open 8080; then
    echo -e "  ${GREEN}✓ Backend is ready on port 8080.${NC}\n"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "  ${RED}❌ Backend did not start in time. Check for errors above.${NC}\n"
  fi
done

# ------------------------------------------------------------------------------
# 4. Start Cloudflare Tunnel → inject URL into Expo via API_URL env var
# ------------------------------------------------------------------------------
echo -e "${BLUE}[3/5] Starting Cloudflare Tunnel for Expo Go mobile access...${NC}"
TUNNEL_URL=""
CLOUDFLARED_BIN=""

# Find cloudflared (pre-downloaded or in PATH)
if [ -x "/tmp/cloudflared" ]; then
  CLOUDFLARED_BIN="/tmp/cloudflared"
elif command -v cloudflared &> /dev/null; then
  CLOUDFLARED_BIN="cloudflared"
fi

if [ -n "$CLOUDFLARED_BIN" ] && is_port_open 8080; then
  TUNNEL_LOG2=$(mktemp)
  "$CLOUDFLARED_BIN" tunnel --url http://localhost:8080 --no-autoupdate > "$TUNNEL_LOG2" 2>&1 &
  TUNNEL_PID=$!
  PIDS+=("$TUNNEL_PID")

  # Wait up to 15 seconds for the tunnel URL to appear
  for i in $(seq 1 30); do
    sleep 0.5
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9\-]+\.trycloudflare\.com' "$TUNNEL_LOG2" 2>/dev/null | head -n 1)
    if [ -n "$TUNNEL_URL" ]; then
      break
    fi
  done
  PIDS+=("$TUNNEL_PID")
fi

if [ -n "$TUNNEL_URL" ]; then
  echo -e "  ${GREEN}✓ Tunnel active → ${YELLOW}${TUNNEL_URL}${NC}"
  echo -e "  ${CYAN}  Mobile app will connect via this public HTTPS URL.${NC}\n"
  export API_URL="$TUNNEL_URL"
else
  echo -e "  ${YELLOW}⚠️  Tunnel unavailable. Using LAN IP: http://${LOCAL_IP}:8080${NC}"
  echo -e "  ${YELLOW}   Make sure your phone is on the same Wi-Fi as this machine.${NC}\n"
  export API_URL="http://${LOCAL_IP}:8080"
fi

# ------------------------------------------------------------------------------
# 5. Start Web App (Vite React)
# ------------------------------------------------------------------------------
echo -e "${BLUE}[4/5] Starting Web Frontend (Vite)...${NC}"
(
  cd "$PROJECT_ROOT/web"
  npm run dev
) &
WEB_PID=$!
PIDS+=("$WEB_PID")
sleep 2

# ------------------------------------------------------------------------------
# 6. Start Mobile App (Expo) — API_URL env var is already exported
# ------------------------------------------------------------------------------
echo -e "${BLUE}[5/5] Starting Mobile App (Expo SDK 54)...${NC}\n"

echo -e "${CYAN}----------------------------------------------------------------------${NC}"
echo -e "${GREEN}✨ ALL SERVICES LAUNCHED SUCCESSFULLY! ✨${NC}"
echo -e "${CYAN}----------------------------------------------------------------------${NC}"
echo -e " 🟢 ${MAGENTA}Backend API:${NC}  http://localhost:8080  |  http://${LOCAL_IP}:8080"
if [ -n "$TUNNEL_URL" ]; then
  echo -e " 🔗 ${MAGENTA}Tunnel URL:${NC}   ${YELLOW}${TUNNEL_URL}${GREEN}  ← Expo Go uses this${NC}"
else
  echo -e " 📡 ${MAGENTA}Mobile API:${NC}   ${YELLOW}http://${LOCAL_IP}:8080${NC}  ← Phone must be on same Wi-Fi"
fi
echo -e " 🌐 ${MAGENTA}Web App:${NC}      http://localhost:5173"
echo -e " 📱 ${MAGENTA}Mobile App:${NC}   Expo Metro Bundler starting below..."
echo -e "${CYAN}----------------------------------------------------------------------${NC}"
echo -e "${YELLOW}Press [Ctrl + C] to stop all services.${NC}\n"

(
  cd "$PROJECT_ROOT/mobile"
  # API_URL is passed to app.config.js → Constants.expoConfig.extra.apiUrl
  API_URL="$API_URL" npx expo start --clear
) &
MOBILE_PID=$!
PIDS+=("$MOBILE_PID")

# Keep script alive
wait
