# DRIVA One-Click Startup Script (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       DRIVA - Transportation Intelligence Platform" -ForegroundColor White
Write-Host "                'Every Journey. More Useful.'" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "ml\models\cost_model.pkl")) {
    Write-Host "[1/3] Generating ML dataset and training models..." -ForegroundColor Green
    & ".\backend\venv\Scripts\python.exe" "ml\generate_dataset.py"
    & ".\backend\venv\Scripts\python.exe" "ml\training\train_models.py"
} else {
    Write-Host "[1/3] ML Models verified." -ForegroundColor Green
}

Write-Host "[2/3] Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

Write-Host "[3/3] Starting Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "DRIVA is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  Swagger:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials (Password: driva2024):" -ForegroundColor Yellow
Write-Host "  Business: business@driva.demo"
Write-Host "  Fleet:    fleet@driva.demo"
Write-Host "  Agency:   agency@driva.demo"
Write-Host "  Driver:   driver@driva.demo"
Write-Host "  Admin:    admin@driva.demo"
Write-Host "========================================================" -ForegroundColor Cyan
