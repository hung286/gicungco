@echo off
chcp 65001 >nul
title SmartEdu Play - NMH thầy Nguyễn Mạnh Hùng
echo ========================================================
echo   SMARTEDU PLAY - NMH THẦY NGUYỄN MẠNH HÙNG
echo   Khởi động Nền tảng Trò chơi Giáo dục & Trình chiếu Toán
echo ========================================================
echo.
cd /d "%~dp0"

echo * MẸO: Nếu điện thoại học sinh không kết nối được phòng thi,
echo   hãy chạy tệp 'Sua_Loi_Ket_Noi_Dien_Thoai.bat' bằng quyền Admin!
echo.
echo Đang mở trình duyệt tại: http://localhost:3000/ ...
start "" "http://localhost:3000/"

echo.
echo Đang chạy máy chủ Vite dev server...
call npm.cmd run dev -- --port 3000 --host 0.0.0.0
pause
