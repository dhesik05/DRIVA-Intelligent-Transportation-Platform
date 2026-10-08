@echo off
echo ========================================================
echo        DRIVA - Transportation Intelligence Platform
echo                 "Every Journey. More Useful."
echo ========================================================
echo.

echo [1/3] Ensuring ML Models and Dataset exist...
if not exist "ml\models\cost_model.pkl" (
    echo Training ML Models...
    .\backend\venv\Scripts\python.exe ml\generate_dataset.py
    .\backend\venv\Scripts\python.exe ml\training\train_models.py
)

echo [2/3] Starting DRIVA FastAPI Backend on port 8000...
start "DRIVA Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [3/3] Starting DRIVA React Frontend on port 5173...
start "DRIVA Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo DRIVA is now running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo Demo credentials:
echo   Business: business@driva.demo / driva2024
echo   Fleet:    fleet@driva.demo    / driva2024
echo   Agency:   agency@driva.demo   / driva2024
echo   Driver:   driver@driva.demo   / driva2024
echo   Admin:    admin@driva.demo    / driva2024
echo ========================================================
pause
