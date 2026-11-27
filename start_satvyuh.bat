@echo off
echo ======================================================================
echo             PROJECT SATVYUH : MISSION CONTROL LAUNCHER
echo      Multi-Layer Satellite Cybersecurity Defence Simulation System
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python dependencies...
python -c "import fastapi, uvicorn, numpy, scipy, pywt, phe, cryptography" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
)

echo [2/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "SATVYUH-Backend" cmd /k "run_backend.bat"

echo Waiting for backend to spin up...
timeout /t 3 /nobreak >nul

echo [3/3] Launching React Futuristic Command Center on http://localhost:5173 ...
start "SATVYUH-Frontend" cmd /k "run_frontend.bat"

timeout /t 3 /nobreak >nul
echo Opening Mission Control in browser...
start http://localhost:5173

echo.
echo ======================================================================
echo   SATVYUH IS NOW FULLY RUNNING!
echo   Mission Dashboard: http://localhost:5173
echo   FastAPI Swagger API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
