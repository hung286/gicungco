@echo off
chcp 65001 >nul
title Khắc Phục Lỗi Kết Nối Điện Thoại - SmartEdu Play (iExam)
echo ====================================================================
echo   KHẮC PHỤC LỖI KẾT NỐI ĐIỆN THOẠI VỚI MÁY CHỦ (iEXAM / SMARTEDU)
echo ====================================================================
echo.

:: Kiểm tra quyền Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Đang mở cửa sổ xác nhận quyền Quản trị viên (Run as Administrator)...
    echo     Vui lòng nhấn "YES" (ĐỒNG Ý) trên bảng thông báo hiện lên!
    powershell -Command "Start-Process cmd -ArgumentList '/c `\"%~f0`\"' -Verb RunAs"
    exit /b
)

echo [1/4] Đang gỡ bỏ luật chặn của Windows Firewall đối với Node.js...
netsh advfirewall firewall delete rule name="Node.js JavaScript Runtime" >nul 2>&1

echo [2/4] Đang mở cổng 3000 (TCP Inbound) cho phòng thi iExam...
netsh advfirewall firewall add rule name="SmartEdu Live Port 3000" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1

echo [3/4] Đang cho phép Node.js nhận kết nối từ điện thoại...
netsh advfirewall firewall add rule name="Node.js Server Inbound" dir=in action=allow program="C:\Program Files\nodejs\node.exe" profile=any >nul 2>&1

echo [4/4] Đang chuyển mạng Wi-Fi sang chế độ Mạng riêng tư (Private Network)...
powershell -Command "Set-NetConnectionProfile -InterfaceAlias 'Wi-Fi' -NetworkCategory Private -ErrorAction SilentlyContinue" >nul 2>&1

echo.
echo ====================================================================
echo   ĐÃ MỞ TƯỜNG LỬA VÀ THIẾT LẬP KẾT NỐI THÀNH CÔNG!
echo ====================================================================
echo.
echo Thông tin máy chủ kết nối điện thoại:
powershell -Command "$ip = (Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress; if (-not $ip) { $ip = '127.0.0.1' }; Write-Host ' - Địa chỉ IP Wi-Fi của máy:' $ip; Write-Host ' - Link vào phòng thi trên điện thoại:' ('http://' + $ip + ':3000/live')"
echo.
echo LƯU Ý ĐỂ ĐIỆN THOẠI KẾT NỐI ĐƯỢC VÀO PHÒNG:
echo 1. Điện thoại PHẢI BẮT CHUNG MẠNG WI-FI với máy tính (không dùng 4G/5G).
echo 2. Quét mã QR hiển thị trên màn hình hoặc gõ link hiển thị ở trên.
echo.
pause
