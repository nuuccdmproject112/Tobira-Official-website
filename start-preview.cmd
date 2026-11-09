@echo off
cd /d "%~dp0"
python scan-content.py
if errorlevel 1 goto end
python -c "import time, re; p=r'prototype\index.html'; t=open(p,encoding='utf-8').read(); v=int(time.time()); t=re.sub(r'refinement\.css\?v=[^"\']+', f'refinement.css?v={v}', t); t=re.sub(r'app\.js\?v=[^"\']+', f'app.js?v={v}', t); open(p,'w',encoding='utf-8').write(t)"
cd prototype
echo ======================================================
echo 專題展覽網站預覽已就緒！
echo 請在瀏覽器開啟: http://127.0.0.1:4173/
echo (若畫面未更新，請按 Ctrl + F5 強制重新整理)
echo ======================================================
python -m http.server 4173 --bind 127.0.0.1
:end
pause
