/**
 * MHEDU NATIVE GOOGLE OAUTH 2.0 AUTHENTICATION MODULE
 * 100% độc lập cho hệ thống MHEdu / SmartEdu Play — KHÔNG dùng Firebase hay đường dẫn của web bên ngoài.
 *
 * Cơ chế hoạt động (Authorization Code Flow + HttpOnly SSO Cookie):
 * 1. Mở popup trỏ tới chính máy chủ của web: /api/auth/google/start
 * 2. Máy chủ chuyển hướng sang trang chọn tài khoản chính thức của Google (accounts.google.com)
 *    bằng GOOGLE_CLIENT_ID riêng của thầy.
 * 3. Google trả mã code về /api/auth/google/callback trên chính máy chủ của thầy.
 * 4. Máy chủ tự đổi code lấy token (bảo mật tuyệt đối GOOGLE_CLIENT_SECRET ở Backend),
 *    cấp cặp HttpOnly Cookie (sso_access_token + sso_refresh_token) và gửi thông tin user về cửa sổ chính.
 */

(function() {
  'use strict';

  function syncLocalUserProfile(user) {
    if (!user || !user.email) return null;
    var email = String(user.email).toLowerCase().trim();
    var isAdmin = !!(
      user.isAdmin ||
      user.role === 'admin' ||
      email === 'nmh28691@gmail.com' ||
      email === 'hungvd286@gmail.com'
    );

    var teacherProfile = {
      id: user.id || ('usr_' + Date.now()),
      idgv: user.phone || (isAdmin ? '0965908084' : email.split('@')[0]),
      name: user.name || (isAdmin ? 'Thầy Nguyễn Mạnh Hùng (Admin)' : email.split('@')[0]),
      fullname: user.name || (isAdmin ? 'Thầy Nguyễn Mạnh Hùng (Admin)' : email.split('@')[0]),
      email: email,
      avatar: user.avatar || '',
      subject: user.subject || 'Toán học & Khoa học',
      school: user.school || 'THPT Số 1 Lê Hồng Phong',
      vip: user.vip || (isAdmin ? 'VIP4 ADMIN' : 'VIP4'),
      expiry: '25/07/2050',
      status: 'Hoạt động',
      isAdmin: isAdmin,
      role: isAdmin ? 'admin' : (user.role || 'teacher'),
      credits: user.credits || (isAdmin ? 999999 : 500),
      total: 24,
      max: 2222,
      loginProvider: 'google'
    };

    try {
      localStorage.setItem('ht2_current_user', JSON.stringify(teacherProfile));
      localStorage.setItem('smartedu_auth_user', JSON.stringify(teacherProfile));
      localStorage.setItem('smartedu_teacher_session', JSON.stringify(teacherProfile));
      localStorage.setItem('smartedu_user', JSON.stringify(teacherProfile));
      localStorage.setItem('smartedu_current_user', JSON.stringify(teacherProfile));
      localStorage.setItem('ey_v2_auth_session', JSON.stringify({
        email: email,
        name: teacherProfile.name,
        role: teacherProfile.role,
        loginTime: Date.now()
      }));
      localStorage.setItem('mhedu_user', JSON.stringify(teacherProfile));
      localStorage.setItem('user_role', teacherProfile.role);
      localStorage.setItem('user_email', email);
    } catch (e) {}

    try {
      window.dispatchEvent(new CustomEvent('ey:auth-change', {
        detail: { role: teacherProfile.role, email: email, name: teacherProfile.name }
      }));
      window.dispatchEvent(new CustomEvent('mhedu:auth-success', { detail: teacherProfile }));
    } catch (e) {}

    return teacherProfile;
  }

  window.mheduLoginWithGoogle = function() {
    return new Promise(function(resolve) {
      var width = 520;
      var height = 640;
      var left = Math.max(0, Math.round((window.screen.width - width) / 2));
      var top = Math.max(0, Math.round((window.screen.height - height) / 2));
      var features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes,status=yes';

      var popup = window.open('/api/auth/google/start', 'mhedu_google_oauth', features);
      if (!popup) {
        resolve({
          success: false,
          error: 'Trình duyệt đang chặn cửa sổ Popup. Vui lòng cho phép mở Popup để đăng nhập Google.'
        });
        return;
      }

      var finished = false;
      var checkClosedTimer = null;

      function cleanup() {
        finished = true;
        window.removeEventListener('message', onMessage);
        if (checkClosedTimer) clearInterval(checkClosedTimer);
      }

      function onMessage(event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'MHEDU_GOOGLE_OAUTH_RESULT') return;
        cleanup();
        var payload = event.data.payload || {};
        if (payload.success && payload.user) {
          var profile = syncLocalUserProfile(payload.user);
          resolve({ success: true, user: profile });
        } else {
          resolve({
            success: false,
            error: payload.message || 'Đăng nhập Google không thành công.'
          });
        }
      }

      window.addEventListener('message', onMessage);

      checkClosedTimer = setInterval(function() {
        if (finished) return;
        try {
          if (popup.closed) {
            cleanup();
            resolve({
              success: false,
              error: 'Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất.'
            });
          }
        } catch (e) {}
      }, 500);
    });
  };

  window.mheduLogoutGoogle = async function() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    [
      'ht2_current_user',
      'smartedu_auth_user',
      'smartedu_teacher_session',
      'smartedu_user',
      'smartedu_current_user',
      'ey_v2_auth_session',
      'mhedu_user',
      'user_role',
      'user_email'
    ].forEach(function(k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    try {
      window.dispatchEvent(new CustomEvent('ey:auth-change', { detail: { role: null, email: '' } }));
    } catch (e) {}
  };
})();
