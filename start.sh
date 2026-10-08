#!/usr/bin/env bash
# DRIVA Startup Script for Linux / macOS / WSL

set -e

echo "========================================================"
echo "       DRIVA - Transportation Intelligence Platform"
echo "                'Every Journey. More Useful.'"
echo "========================================================"
echo ""

# Activate backend virtualenv
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
elif [ -d "backend/.venv" ]; then
    source backend/.venv/bin/activate
else
    echo "Virtual environment not found. Creating one in backend/venv..."
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
fi

# Ensure ML models exist
if [ ! -f "ml/models/cost_model.pkl" ]; then
    echo "[1/3] Generating ML dataset and training models..."
    python ml/generate_dataset.py
    python ml/training/train_models.py
else
    echo "[1/3] ML Models verified."
fi

# Seed database if not seeded
if [ ! -f "backend/driva.db" ]; then
    echo "Seeding database..."
    python database/seed/seed.py
fi

echo "[2/3] Starting FastAPI Backend on http://localhost:8000..."
(cd backend && uvicorn app.main:app --reload --port 8000) &
BACKEND_PID=$!

echo "[3/3] Starting Vite Frontend on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo ""
echo "========================================================"
echo "DRIVA is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Demo Credentials (Password: driva2024):"
echo "  Business: business@driva.demo"
echo "  Fleet:    fleet@driva.demo"
echo "  Agency:   agency@driva.demo"
echo "  Driver:   driver@driva.demo"
echo "  Admin:    admin@driva.demo"
echo "========================================================"

wait
