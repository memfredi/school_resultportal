#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────
# School Results Portal – Local Startup Script
# Usage: ./start.sh
# ──────────────────────────────────────────────────────────

echo "🧹 Cleaning up existing processes on ports 3000, 3001, 5000 and 5432..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5432/tcp 2>/dev/null || true
sleep 1

echo "🐘 Starting PostgreSQL container..."
docker rm -f results_portal_db 2>/dev/null || true
docker run -d \
  --name results_portal_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=results_portal \
  -p 5432:5432 \
  postgres:15

echo "⏳ Waiting for PostgreSQL to be ready (10 seconds)..."
sleep 10

echo "⚙️  Setting up Backend..."
cd backend

# Export environment variables for Prisma and the API server
export DATABASE_URL="postgresql://admin:password@localhost:5432/results_portal"
export JWT_SECRET="supersecret123_change_in_production"
export PORT=5000
export NODE_ENV=development

echo "   → Generating Prisma Client..."
npx prisma generate

echo "   → Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "   → Seeding database with demo data..."
npx tsx src/utils/seed.ts

echo "   → Starting API server on http://localhost:5000..."
DATABASE_URL="$DATABASE_URL" JWT_SECRET="$JWT_SECRET" npm run dev &

BACKEND_PID=$!
cd ..

echo "🎨 Starting Frontend on http://localhost:3001..."
cd frontend
export PORT=3001
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          School Results Portal is RUNNING!           ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  🌐 Frontend :  http://localhost:3001                ║"
echo "║  🔌 Backend  :  http://localhost:5000/api/health     ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  👤 ADMIN LOGIN:                                     ║"
echo "║     Username  : admin                                ║"
echo "║     Password  : admin123                             ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  🎓 STUDENT LOGINS (Password: password123):          ║"
echo "║     BTECH CSE : CSE01, CSE02, CSE03, CSE04, CSE05   ║"
echo "║     BTECH MEC : MEC01, MEC02, MEC03, MEC04, MEC05   ║"
echo "║     BTECH EEE : EEE01, EEE02, EEE03, EEE04, EEE05   ║"
echo "║     BSC  MIS  : MIS01, MIS02, MIS03, MIS04, MIS05   ║"
echo "║     BSC  SWE  : SWE01, SWE02, SWE03, SWE04, SWE05   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all servers."

wait $BACKEND_PID $FRONTEND_PID
