/**
 * MHEDU CENTRALIZED SINGLE SIGN-ON (SSO) CLIENT SDK
 * File: public/assets/sso-client.js
 * 
 * Thư viện dùng chung an toàn:
 * - Tự động nhận diện phiên đăng nhập qua HttpOnly Cookie (/api/auth/me)
 * - Tự động Silent Refresh Token
 * - Đồng bộ Single Logout (SLO) trên toàn bộ các Tab trình duyệt
 * - KHÔNG BAO GIỜ xóa nhầm phiên cục bộ khi chỉ là kiểm tra nền ban đầu
 */

(function(window) {
  'use strict';

  var BROADCAST_CHANNEL_NAME = 'mhedu_sso_channel';
  var broadcastChannel = null;
  try {
    if (typeof window.BroadcastChannel === 'function') {
      broadcastChannel = new window.BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }
  } catch (e) {}

  var listeners = [];
  var currentUser = null;
  var checkPromise = null;
  var refreshTimer = null;

  var SSO = {
    user: null,
    isReady: false,

    getUser: function() {
      if (currentUser) return currentUser;
      // Khôi phục từ local cache nếu có
      try {
        var raw = localStorage.getItem('smartedu_auth_user') || localStorage.getItem('ht2_current_user');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return null;
    },

    isAuthenticated: function() {
      return !!SSO.getUser();
    },

    hasRole: function(role) {
      var u = SSO.getUser();
      if (!u) return false;
      if (u.role === 'admin' || u.isAdmin) return true;
      return u.role === role;
    },

    getCredits: function() {
      var u = SSO.getUser();
      return u ? (u.credits || 0) : 0;
    },

    onAuthChange: function(callback) {
      if (typeof callback === 'function') {
        listeners.push(callback);
        if (SSO.isReady) {
          callback(SSO.getUser());
        }
      }
      return function unsubscribe() {
        listeners = listeners.filter(function(cb) { return cb !== callback; });
      };
    },

    requireAuth: function(requiredRole, redirectUrl) {
      return SSO.checkAuth().then(function(user) {
        if (!user) {
          var target = redirectUrl || ('/?auth=login&redirect=' + encodeURIComponent(window.location.href));
          window.location.href = target;
          return null;
        }
        if (requiredRole && !SSO.hasRole(requiredRole)) {
          alert('⚠️ Bạn không có quyền truy cập vào chức năng này (Yêu cầu vai trò: ' + requiredRole + ')');
          window.location.href = '/';
          return null;
        }
        return user;
      });
    },

    checkAuth: function() {
      if (checkPromise) return checkPromise;

      checkPromise = fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      .then(function(res) {
        if (res.ok) return res.json();
        return null;
      })
      .then(function(data) {
        checkPromise = null;
        if (data && data.success && data.user) {
          setUser(data.user);
          startSilentRefreshTimer();
          return data.user;
        } else {
          // KHÔNG xóa localStorage ở đây để bảo vệ các phiên làm việc hiện tại
          currentUser = null;
          SSO.user = null;
          return null;
        }
      })
      .catch(function() {
        checkPromise = null;
        currentUser = null;
        SSO.user = null;
        return null;
      })
      .finally(function() {
        SSO.isReady = true;
      });

      return checkPromise;
    },

    login: function(email, password) {
      var cleanEmail = String(email || '').trim().toLowerCase();
      var cleanPass = String(password || '').trim();

      if (!cleanEmail || !cleanPass) {
        return Promise.reject(new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.'));
      }

      return fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Email hoặc mật khẩu không chính xác.');
          }
          setUser(data.user);
          startSilentRefreshTimer();
          broadcastMessage({ type: 'LOGIN', user: data.user });
          return data;
        });
      });
    },

    register: function(profile) {
      return fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile)
      })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Đăng ký tài khoản không thành công.');
          }
          setUser(data.user);
          startSilentRefreshTimer();
          broadcastMessage({ type: 'LOGIN', user: data.user });
          return data;
        });
      });
    },

    loginWithGoogle: function() {
      if (typeof window.mheduLoginWithGoogle === 'function') {
        return window.mheduLoginWithGoogle().then(function(gRes) {
          if (!gRes || !gRes.success || !gRes.user) {
            throw new Error((gRes && gRes.error) || 'Xác thực Google bị gián đoạn.');
          }
          // Server (/api/auth/google/callback) đã xác thực với Google và cấp sẵn HttpOnly SSO Cookies
          setUser(gRes.user);
          startSilentRefreshTimer();
          broadcastMessage({ type: 'LOGIN', user: gRes.user });
          return { success: true, user: gRes.user };
        });
      }
      return Promise.reject(new Error('Thư viện Google Auth chưa sẵn sàng.'));
    },

    refreshToken: function() {
      return fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success && data.user) {
          setUser(data.user);
          return data.user;
        }
        return null;
      })
      .catch(function() {
        return null;
      });
    },

    // Single Logout (SLO) - Chỉ xóa khi người dùng chủ động bấm Đăng xuất
    logout: function() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }

      return fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      .finally(function() {
        clearLocalSession();
        broadcastMessage({ type: 'LOGOUT' });
        try {
          if (typeof window.mheduLogoutGoogle === 'function') {
            window.mheduLogoutGoogle();
          }
        } catch (e) {}
      });
    }
  };

  function setUser(user) {
    currentUser = user;
    SSO.user = user;

    if (user) {
      var legacyProfile = {
        id: user.id,
        idgv: user.role === 'admin' ? '0965908084' : (user.phone || user.email.split('@')[0]),
        name: user.name,
        fullname: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        vip: user.vip || (user.role === 'admin' ? 'VIP4 ADMIN' : 'FREE'),
        avatar: user.avatar || (user.role === 'admin' ? '👑' : '👨‍🏫'),
        school: user.school || 'THPT Số 1 Lê Hồng Phong',
        credits: user.credits || 0
      };

      try {
        localStorage.setItem('smartedu_auth_user', JSON.stringify(legacyProfile));
        localStorage.setItem('smartedu_current_user', JSON.stringify(legacyProfile));
        localStorage.setItem('ht2_current_user', JSON.stringify(legacyProfile));
        localStorage.setItem('mhedu_user', JSON.stringify(legacyProfile));
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('ey_v2_auth_session', JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          loginTime: Date.now()
        }));
      } catch (e) {}
    }

    listeners.forEach(function(cb) {
      try { cb(currentUser); } catch (e) {}
    });

    try {
      window.dispatchEvent(new CustomEvent('sso:auth-change', { detail: { user: currentUser } }));
      window.dispatchEvent(new CustomEvent('ey:auth-change', { detail: { role: user ? user.role : null, email: user ? user.email : '' } }));
    } catch (e) {}
  }

  function clearLocalSession() {
    currentUser = null;
    SSO.user = null;
    try {
      localStorage.removeItem('smartedu_auth_user');
      localStorage.removeItem('smartedu_current_user');
      localStorage.removeItem('ht2_current_user');
      localStorage.removeItem('mhedu_user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('ey_v2_auth_session');
    } catch (e) {}

    listeners.forEach(function(cb) {
      try { cb(null); } catch (e) {}
    });

    try {
      window.dispatchEvent(new CustomEvent('sso:auth-change', { detail: { user: null } }));
      window.dispatchEvent(new CustomEvent('ey:auth-change', { detail: { role: null, email: '' } }));
    } catch (e) {}
  }

  function startSilentRefreshTimer() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(function() {
      if (currentUser) {
        SSO.refreshToken();
      }
    }, 10 * 60 * 1000);
  }

  function broadcastMessage(msg) {
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(msg); } catch (e) {}
    }
    try {
      localStorage.setItem('mhedu_sso_broadcast_event', JSON.stringify({ msg: msg, timestamp: Date.now() }));
    } catch (e) {}
  }

  if (broadcastChannel) {
    broadcastChannel.onmessage = function(event) {
      handleBroadcast(event.data);
    };
  }

  window.addEventListener('storage', function(e) {
    if (e.key === 'mhedu_sso_broadcast_event' && e.newValue) {
      try {
        var parsed = JSON.parse(e.newValue);
        if (parsed && parsed.msg) {
          handleBroadcast(parsed.msg);
        }
      } catch (err) {}
    }
  });

  function handleBroadcast(msg) {
    if (!msg) return;
    if (msg.type === 'LOGOUT') {
      clearLocalSession();
    } else if (msg.type === 'LOGIN' && msg.user) {
      setUser(msg.user);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      SSO.checkAuth();
    });
  } else {
    SSO.checkAuth();
  }

  window.SSO = SSO;
  window.authMiddleware = SSO;
})(window);
