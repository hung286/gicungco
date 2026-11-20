@echo off
chcp 65001 >nul
title SmartEdu Play - Remix NMH Play
echo ========================================================
echo   SMARTEDU PLAY - REMIX NMH PLAY
echo   Khởi động Web Game Giáo Dục Tương Tác AI
echo ========================================================
echo.
echo * MẸO: Nếu điện thoại không kết nối được máy chủ, hãy chạy:
echo   'Sua_Loi_Ket_Noi_Dien_Thoai.bat' (Run as Administrator)
echo.
echo Đang mở trình duyệt tại: http://localhost:3000/ ...
start http://localhost:3000/
echo.
call npm.cmd run dev -- --port 3000 --host 0.0.0.0
pause
