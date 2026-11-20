# 🎮 SmartEdu Play - NMH Thầy Nguyễn Mạnh Hùng

> **Nền tảng tạo câu hỏi học tập thông minh và tổ chức trò chơi tương tác giáo dục trực tuyến**  
> Bản quyền phát triển bởi **NMH - Thầy Nguyễn Mạnh Hùng**.

---

## 🌟 Tính Năng Nổi Bật

1. **Chuẩn Hóa Đề Thi & Bóc Tách Tự Động (Chuẩn Bộ GD&ĐT 2025 - Azota / iexam.vn):**
   - **PHẦN I - Trắc nghiệm 4 phương án:** Tự động tách các câu hỏi $A, B, C, D$.
   - **PHẦN II - Trắc nghiệm Đúng / Sai:** Bóc tách phần dẫn và các mệnh đề $a), b), c), d)$, tạo thành các câu hỏi Đúng/Sai độc lập chơi được ngay trên game.
   - **PHẦN III - Trả lời ngắn:** Nhận diện đáp án số, hiển thị giao diện **4 ô số chuẩn đề THPT 2025**.
   - **Công thức Toán/Hóa học LaTeX ($...$):** Hiển thị sắc nét, mượt mà qua KaTeX và MathJax.
   - **Trích xuất hình ảnh:** Tự động nhận diện và đính kèm hình ảnh minh họa từ tài liệu Word/PDF.
   - **Đọc bảng đáp án:** Tự động bắt cặp đáp án từ bảng đáp án tổng hợp ở cuối tài liệu.

2. **Cơ Chế Trả Lời Sai Thông Minh (Sư Phạm Hiện Đại):**
   - Khi học sinh chọn/nhập sai: Hệ thống **hiển thị gợi ý & hướng dẫn giải chi tiết**.
   - Học sinh phải **suy nghĩ và trả lời lại cho đúng** để được tiếp tục chơi.
   - Lần trả lời lại đúng sẽ **không được cộng điểm** nhằm đảm bảo tính công bằng và rèn luyện tư duy thực chất.

3. **Kho 11 Trò Chơi Tương Tác Sôi Động:**
   - 🦘 **Nhảy Bao Bố 3D Liên Cấp (Bản Gốc 100%):** Hỗ trợ 3 chế độ: *1 màn hình tập thể*, *2 đội quét 2 mã QR trên điện thoại*, và *Đại hội 2-6 đội quét 1 mã QR thi đấu qua MQTT WebSocket thời gian thực*.
   - ⚔️ **Tranh Tài Kéo Co:** Đối kháng 2 đội Đỏ - Xanh theo từng lượt.
   - 🪢 **Kéo Co Kiến Thức:** Thi đấu kéo co tốc độ hoặc đường dài kèm đồng hồ đếm ngược.
   - 🏛️ **Tháp Trí Tuệ:** Trả lời đúng để xếp từng tầng tháp vươn cao, sai quá số lần tháp sẽ đổ.
   - ⚔️ **Vượt Ải Tri Thức:** Giao diện tối hiện đại, vượt chướng ngại vật từng màn thử thách.
   - 💎 **Săn Kho Báu:** Khai thác kho báu bí ẩn, hỗ trợ dạng kéo thả và điền khuyết.
   - 🖼️ **Bức Tranh Bí Ẩn:** Trả lời đúng từng câu để lật mở từng mảnh ghép của bức ảnh ẩn giấu.
   - 🐝 **Ong Tìm Chữ:** Tìm từ ẩn trong ma trận chữ cái (ngang, dọc, chéo).
   - 🧩 **Cặp Đôi Hoàn Hảo:** Nối ghép thông minh giữa cột A và cột B.
   - 🔤 **Vua Tiếng Việt:** Đảo chữ và ghép từ có giới hạn thời gian.
   - 🚪 **Phòng Thoát Hiểm:** Giải mã mật thư để mở khóa phòng theo 4 kịch bản thú vị.

4. **Tiện Ích Giáo Viên:**
   - 🧮 **Máy tính Casio fx-580VN X ảo:** Tích hợp sẵn sàng góc dưới màn hình, bấm 1 nút để mở máy tính tính toán ngay khi chơi game.
   - 📤 **Xuất Word (.doc):** Xuất toàn bộ ngân hàng câu hỏi đã chuẩn hóa ra file Word có định dạng đẹp mắt.
   - ⚙️ **Tùy chỉnh tác giả:** Tự động hiển thị thương hiệu **NMH thầy Nguyễn Mạnh Hùng** trên toàn bộ giao diện và chứng nhận.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Hệ Thống:
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động chạy tại: `http://localhost:3000/` (hoặc cổng hiển thị trên terminal).

### Bước 3: Đóng gói bản Production
```bash
npm run build
```
Toàn bộ mã nguồn đóng gói sẵn sàng triển khai sẽ nằm trong thư mục `dist/`.

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Triển Khai Online

### 1. Đưa dự án lên GitHub:
```bash
git init
git add .
git commit -m "feat: SmartEdu Play by NMH thầy Nguyễn Mạnh Hùng"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-thay>/<ten-repository>.git
git push -u origin main
```

### 2. Triển khai miễn phí lên Vercel / Netlify:
- **Vercel:** Đăng nhập [vercel.com](https://vercel.com) $\rightarrow$ *Add New Project* $\rightarrow$ Chọn kho GitHub này $\rightarrow$ Bấm **Deploy**.
- **Netlify:** Đăng nhập [netlify.com](https://netlify.com) $\rightarrow$ *Import from Git* $\rightarrow$ Chọn kho $\rightarrow$ Build command: `npm run build`, Publish directory: `dist` $\rightarrow$ Bấm **Deploy**.

---

## 👨‍🏫 Tác Giả & Bản Quyền

- **Tác giả phát triển:** **NMH - Thầy Nguyễn Mạnh Hùng**
- **Liên hệ / Hỗ trợ:** Thầy Nguyễn Mạnh Hùng
- **Phiên bản:** SmartEdu Play 2025 (Remix NMH Edition)
