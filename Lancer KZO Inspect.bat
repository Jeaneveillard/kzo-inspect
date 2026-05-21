@echo off
chcp 65001 >nul 2>&1
if /i "%~1"=="--wait-browser" goto :wait_browser

cd /d "%~dp0"
set "PORT=8775"
set "URL=http://127.0.0.1:%PORT%/"

echo ========================================
echo   KZO Inspect
echo   %URL%
echo ========================================
echo.
echo   - Ne double-cliquez PAS sur index.html
echo   - Fermez cette fenetre pour arreter l'app
echo.

:: Detecte un vrai Python (pas le raccourci Microsoft Store)
set "PYCMD="
python -c "import sys" >nul 2>&1 && set "PYCMD=python"
if not defined PYCMD py -3 -c "import sys" >nul 2>&1 && set "PYCMD=py -3"
if not defined PYCMD python3 -c "import sys" >nul 2>&1 && set "PYCMD=python3"

if defined PYCMD (
  echo   Serveur : %PYCMD%
) else (
  echo   Serveur : PowerShell ^(Python non installe^)
)
echo.

:: Libere une instance precedente sur le port 8775
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\free-port.ps1" -Port %PORT% >nul 2>&1

start /b "" "%~f0" --wait-browser

if defined PYCMD (
  %PYCMD% -m http.server %PORT% --bind 127.0.0.1
  set "EXITCODE=%ERRORLEVEL%"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\local-server.ps1" -Port %PORT%
  set "EXITCODE=%ERRORLEVEL%"
)

if not "%EXITCODE%"=="0" (
  echo.
  echo  ERREUR : le serveur s'est arrete ^(code %EXITCODE%^).
  echo  Port %PORT% encore occupe ?
  echo  - Fermez les autres fenetres "KZO Inspect" ou cmd ouvertes
  echo  - Relancez ce fichier .bat
  echo.
)
pause
exit /b %EXITCODE%

:wait_browser
set "PORT=8775"
set "URL=http://127.0.0.1:%PORT%/"
set /a TRIES=0

:wait_loop
timeout /t 1 /nobreak >nul
powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; try{$c.Connect('127.0.0.1',%PORT%);$c.Close();exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel%==0 goto :open_browser
set /a TRIES+=1
if %TRIES% LSS 20 goto :wait_loop
exit /b 1

:open_browser
start "" "%URL%"
exit /b 0
