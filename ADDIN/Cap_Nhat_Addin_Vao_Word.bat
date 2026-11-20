@echo off
chcp 65001 > nul
echo ======================================================
echo    ĐANG CẬP NHẬT ADD-IN MH2026 CHO MICROSOFT WORD
echo ======================================================
echo.
echo Đang kiểm tra tiến trình Word...
tasklist /fi "imagename eq WINWORD.EXE" | find /i "WINWORD.EXE" > nul
if not errorlevel 1 (
    echo [!] Phát hiện Microsoft Word đang mở.
    echo Vui lòng lưu tài liệu và ĐÓNG hoàn toàn Microsoft Word để file add-in không bị khóa.
    echo.
    pause
)

taskkill /f /im WINWORD.EXE 2>nul
timeout /t 1 /nobreak > nul

copy /y "%~dp0MH2026.dotm" "%APPDATA%\Microsoft\Word\STARTUP\MH2026.dotm" > nul
if errorlevel 1 (
    echo [X] Lỗi: Chưa copy được vào thư mục STARTUP của Word. Hãy đảm bảo Word đã tắt hẳn.
) else (
    echo [OK] Đã cập nhật thành công MH2026.dotm vào thư mục STARTUP của Word!
    echo Bây giờ bạn có thể mở lại Word và sử dụng nút "Toggle TeX" bình thường.
)
echo.
pause
