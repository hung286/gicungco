// Alias for Cương Thi (Đại Náo Nghĩa Trang)
// Author: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)

(function (global) {
  if (typeof global.launchCuongThi === 'function') {
    global.launchDaiNaoNghiaTrang = global.launchCuongThi;
  } else {
    const s = document.createElement('script');
    s.src = '/ey/games/cuong-thi.js';
    s.onload = () => {
      global.launchDaiNaoNghiaTrang = global.launchCuongThi;
    };
    document.head.appendChild(s);
  }
})(window);
