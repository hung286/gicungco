@echo off
chcp 65001 > nul
echo ======================================================
echo    DANG CAP NHAT ADD-IN MH2026 CHO MICROSOFT WORD
echo ======================================================
echo.
echo Dang kiem tra tien trinh Word...
tasklist /fi "imagename eq WINWORD.EXE" | find /i "WINWORD.EXE" > nul
if not errorlevel 1 (
    echo [!] Phat hien Microsoft Word dang mo.
    echo Vui long luu tai lieu va DONG hoan toan Microsoft Word de file add-in khong bi khoa.
    echo Nhan phim bat ky de tu dong dong Word va cap nhat...
    pause
    taskkill /f /im WINWORD.EXE > nul 2>&1
    timeout /t 1 /nobreak > nul
)

if not exist "%APPDATA%\Microsoft\Word\STARTUP" (
    mkdir "%APPDATA%\Microsoft\Word\STARTUP" > nul 2>&1
)

copy /y "%~dp0MH2026.dotm" "%APPDATA%\Microsoft\Word\STARTUP\MH2026.dotm" > nul
if errorlevel 1 (
    echo [X] Loi: Chua copy duoc vao thu muc STARTUP cua Word. Hay dam bao Word da tat han va thu Run as Administrator.
) else (
    echo [OK] Da cap nhat thanh cong MH2026.dotm vao thu muc STARTUP cua Word!
    echo      %APPDATA%\Microsoft\Word\STARTUP\MH2026.dotm
    echo Bay gio ban co the mo lai Word va su dung cac chuc nang MH2026 / Toggle TeX binh thuong.
)
echo.
pause