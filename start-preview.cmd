@echo off
setlocal
cd /d "%~dp0" || goto failed
python -c "import sys; sys.exit(sys.version_info < (3, 8))" >nul 2>&1
if errorlevel 1 goto use_py
python preview.py %*
if errorlevel 1 goto failed
exit /b 0

:use_py
py -3 -c "import sys; sys.exit(sys.version_info < (3, 8))" >nul 2>&1
if errorlevel 1 goto no_python
py -3 preview.py %*
if errorlevel 1 goto failed
exit /b 0

:no_python
echo Python 3.8 or later was not found. Check your Python installation.
:failed
echo Preview could not start. See the error above.
pause
exit /b 1
