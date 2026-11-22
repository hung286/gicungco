// ========================================================
// MHEdu - Kho Game Học Tập Tương Tác
// Tác giả: Thầy Nguyễn Mạnh Hùng - 0965.908.084
// ========================================================

(function () {
  const games = window.MHEDU_GAMES || [];
  const config = window.MHEDU_CONFIG || {};

  // State
  let currentPage = 1;
  const itemsPerPage = 12;
  let activeFilter = 'all';
  let searchQuery = '';
  let selectedGame = null;
  let isMuted = false;

  // DOM Elements
  const gamesGrid = document.getElementById('games-grid');
  const searchInput = document.getElementById('game-search');
  const filterBtns = document.querySelectorAll('.chip-btn');
  const paginationStatus = document.getElementById('pagination-status');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const pageNum1 = document.getElementById('page-num-1');
  const pageNum2 = document.getElementById('page-num-2');

  // Modals
  const modalRunner = document.getElementById('modal-game-runner');
  const runnerFrame = document.getElementById('runner-iframe');
  const runnerName = document.getElementById('runner-game-name');
  const runnerKey = document.getElementById('runner-keygame');
  const runnerBadge = document.getElementById('runner-badge');
  const runnerNewTab = document.getElementById('runner-newtab-link');
  const btnRunnerMute = document.getElementById('btn-runner-mute');
  const runnerMuteIcon = document.getElementById('runner-mute-icon');
  const btnCloseRunner = document.getElementById('btn-close-runner');

  const modalDetail = document.getElementById('modal-game-detail');
  const detailTitle = document.getElementById('detail-title');
  const detailKey = document.getElementById('detail-key');
  const detailImg = document.getElementById('detail-img');
  const detailPrice = document.getElementById('detail-price');
  const detailDesc = document.getElementById('detail-desc');
  const detailTags = document.getElementById('detail-tags');
  const btnCloseDetail = document.getElementById('btn-close-detail');
  const btnDetailTrial = document.getElementById('btn-detail-play-trial');
  const btnDetailOfficial = document.getElementById('btn-detail-play-official');

  const modalAdmin = document.getElementById('modal-admin-auth');
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const btnCloseAdmin = document.getElementById('btn-close-admin');
  const formAdmin = document.getElementById('form-admin-login');
  const adminPass = document.getElementById('admin-pass');
  const adminMsg = document.getElementById('admin-login-msg');

  const modalTeacher = document.getElementById('modal-teacher-auth');
  const btnOpenTeacher = document.getElementById('btn-open-teacher');
  const btnCloseTeacher = document.getElementById('btn-close-teacher');
  const formTeacher = document.getElementById('form-teacher-login');
  const teacherId = document.getElementById('teacher-id');
  const teacherMsg = document.getElementById('teacher-login-msg');

  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const themeIcon = document.getElementById('theme-icon');

  // Initialize Auth & VIP status
  try {
    sessionStorage.setItem('kg_admin_session', 'true');
    localStorage.setItem('kg_current_teacher_id', '0965908084');
    localStorage.setItem('mhedu_vip_mode', 'true');
  } catch (e) {}

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('mhedu_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      themeIcon.textContent = '☀️';
    } else {
      document.body.classList.remove('dark');
      themeIcon.textContent = '🌙';
    }
  }

  btnToggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('mhedu_theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  });

  // Calculate & update counter badges
  function updateCounters() {
    const countVip = games.filter(g => g.price > 0).length;
    const countFree = games.filter(g => g.price === 0).length;
    const count3D = games.filter(g => g.is3D).length;

    const elAll = document.getElementById('count-all');
    const elVip = document.getElementById('count-vip');
    const elFree = document.getElementById('count-free');
    const el3D = document.getElementById('count-3d');

    if (elAll) elAll.textContent = games.length;
    if (elVip) elVip.textContent = countVip;
    if (elFree) elFree.textContent = countFree;
    if (el3D) el3D.textContent = count3D;
  }

  // Filter games
  function getFilteredGames() {
    return games.filter(g => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      let matchSearch = true;
      if (query) {
        const textToSearch = [
          g.name,
          g.description,
          g.keygame,
          ...(g.tags || [])
        ].join(' ').toLowerCase();
        matchSearch = textToSearch.includes(query);
      }

      // Category match
      let matchCat = true;
      if (activeFilter === 'vip') {
        matchCat = g.price > 0 || g.isBundle;
      } else if (activeFilter === 'free') {
        matchCat = g.price === 0 && !g.isBundle;
      } else if (activeFilter === '3d') {
        matchCat = g.is3D === true;
      } else if (activeFilter === 'team') {
        matchCat = (g.tags || []).some(t => t.toLowerCase().includes('đội') || t.toLowerCase().includes('thi đấu'));
      } else if (activeFilter === 'start') {
        matchCat = (g.tags || []).some(t => t.toLowerCase().includes('khởi động'));
      }

      return matchSearch && matchCat;
    });
  }

  // Render cards
  function render() {
    const filtered = getFilteredGames();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const displayedGames = filtered.slice(startIndex, endIndex);

    // Update pagination status
    paginationStatus.innerHTML = `Hiển thị <b>${totalItems > 0 ? startIndex + 1 : 0} - ${endIndex}</b> trên tổng số <b>${totalItems}</b> trò chơi (Trang ${currentPage}/${totalPages})`;

    btnPrevPage.disabled = currentPage <= 1;
    btnNextPage.disabled = currentPage >= totalPages;

    if (pageNum1) {
      pageNum1.classList.toggle('active', currentPage === 1);
    }
    if (pageNum2) {
      pageNum2.style.display = totalPages > 1 ? 'inline-block' : 'none';
      pageNum2.classList.toggle('active', currentPage === 2);
    }

    // Render cards HTML
    if (displayedGames.length === 0) {
      gamesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">Không tìm thấy trò chơi phù hợp</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh mục game.</p>
        </div>
      `;
      return;
    }

    gamesGrid.innerHTML = displayedGames.map(game => {
      let badgeHtml = '';
      if (game.is3D) {
        badgeHtml = `<span class="badge-float badge-3d">🚀 Game 3D</span>`;
      } else if (game.price === 0) {
        badgeHtml = `<span class="badge-float badge-free">🎁 Miễn Phí</span>`;
      } else if (game.isBundle) {
        badgeHtml = `<span class="badge-float" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">⭐ Gói VIP 365 Ngày</span>`;
      } else {
        badgeHtml = `<span class="badge-float">⭐ Bản VIP</span>`;
      }

      const tagsHtml = (game.tags || []).slice(0, 3).map(tag =>
        `<span class="card-tag">#${tag}</span>`
      ).join('');

      return `
        <div class="game-card" data-id="${game.id}">
          <div class="card-thumb-wrap">
            <img class="card-thumb-img" src="${game.bgImage}" alt="${game.name}" loading="lazy" />
            ${badgeHtml}
          </div>
          <div class="card-body">
            <h3 class="card-title">${game.name}</h3>
            <p class="card-desc">${game.description}</p>
            <div class="card-tags">${tagsHtml}</div>
            <div class="card-actions">
              <button class="btn-card btn-play-trial" data-id="${game.id}">
                <span>▶</span>
                <span>Chơi thử</span>
              </button>
              <button class="btn-card btn-card-primary btn-play-official" data-id="${game.id}">
                <span>⚡</span>
                <span>Chơi ngay</span>
              </button>
              <button class="btn-card btn-card-detail btn-open-detail" data-id="${game.id}">
                <span>ℹ️ Xem chi tiết</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    document.querySelectorAll('.btn-play-trial').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const g = games.find(x => x.id === id);
        if (g) openGameRunner(g, 'trial');
      });
    });

    document.querySelectorAll('.btn-play-official').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const g = games.find(x => x.id === id);
        if (g) openGameRunner(g, 'official');
      });
    });

    document.querySelectorAll('.btn-open-detail').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const g = games.find(x => x.id === id);
        if (g) openGameDetail(g);
      });
    });
  }

  // Open Game Runner (Fullscreen Modal)
  function openGameRunner(game, mode = 'official') {
    selectedGame = game;
    runnerName.textContent = game.name;
    runnerKey.innerHTML = `Keygame: <b style="color: var(--primary); font-family: monospace;">${game.keygame}</b>`;

    const isTrial = mode === 'trial';
    if (isTrial) {
      runnerBadge.innerHTML = `
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #0284c7;"></span>
        Bản Chơi Thử Nghiệm (Trial Demo)
      `;
      runnerBadge.style.color = '#0284c7';
      runnerBadge.style.background = '#e0f2fe';
      runnerBadge.style.borderColor = '#bae6fd';
    } else {
      runnerBadge.innerHTML = `
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
        Bản Chính Thức VIP (Official)
      `;
      runnerBadge.style.color = '#059669';
      runnerBadge.style.background = '#ecfdf5';
      runnerBadge.style.borderColor = '#a7f3d0';
    }

    // Determine target URL
    const kg = game.keygame.toLowerCase() === 'all' ? 'quaybongbong' : game.keygame.toLowerCase();
    const gameUrl = `/game/${kg}/index.html`;

    runnerFrame.src = gameUrl;
    runnerNewTab.href = gameUrl;

    // Show modal
    modalRunner.classList.add('show');
  }

  // Close Game Runner
  function closeGameRunner() {
    modalRunner.classList.remove('show');
    runnerFrame.src = 'about:blank';
  }

  // Open Game Detail Modal
  function openGameDetail(game) {
    selectedGame = game;
    detailTitle.textContent = game.name;
    detailKey.textContent = `Keygame: ${game.keygame}`;
    detailImg.src = game.bgImage;
    detailImg.alt = game.name;
    detailPrice.textContent = game.price > 0 ? (game.price.toLocaleString('vi-VN') + ' ₫') : 'Miễn Phí';
    detailDesc.textContent = game.description;
    detailTags.innerHTML = (game.tags || []).map(t => `<span class="card-tag">#${t}</span>`).join('');

    modalDetail.classList.add('show');
  }

  // Detail modal action buttons
  btnDetailTrial.addEventListener('click', () => {
    modalDetail.classList.remove('show');
    if (selectedGame) openGameRunner(selectedGame, 'trial');
  });

  btnDetailOfficial.addEventListener('click', () => {
    modalDetail.classList.remove('show');
    if (selectedGame) openGameRunner(selectedGame, 'official');
  });

  // Modal Close Events
  btnCloseRunner.addEventListener('click', closeGameRunner);
  btnCloseDetail.addEventListener('click', () => modalDetail.classList.remove('show'));

  // Close modals on clicking backdrop
  [modalRunner, modalDetail, modalAdmin, modalTeacher].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal === modalRunner) closeGameRunner();
        else modal.classList.remove('show');
      }
    });
  });

  // Runner Mute Toggle
  btnRunnerMute.addEventListener('click', () => {
    isMuted = !isMuted;
    runnerMuteIcon.textContent = isMuted ? '🔇' : '🔊';
    try {
      if (runnerFrame.contentWindow) {
        const audios = runnerFrame.contentWindow.document.querySelectorAll('audio, video');
        audios.forEach(a => a.muted = isMuted);
      }
    } catch (e) {}
  });

  // Admin Login Flow
  btnOpenAdmin.addEventListener('click', () => {
    adminPass.value = '';
    adminMsg.style.display = 'none';
    modalAdmin.classList.add('show');
  });

  btnCloseAdmin.addEventListener('click', () => modalAdmin.classList.remove('show'));

  formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailEl = document.getElementById('admin-email');
    const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
    if (email !== 'nmh28691@gmail.com') {
      adminMsg.style.display = 'block';
      adminMsg.style.background = '#fee2e2';
      adminMsg.style.color = '#b91c1c';
      adminMsg.innerHTML = '❌ Chỉ email nmh28691@gmail.com mới có quyền quản trị!';
      return;
    }
    const pass = adminPass.value.trim();
    const valid = ['Taynguyen286@'].includes(pass);

    if (valid) {
      sessionStorage.setItem('kg_admin_session', 'true');
      localStorage.setItem('mhedu_admin_session', 'true');
      adminMsg.style.display = 'block';
      adminMsg.style.background = '#dcfce7';
      adminMsg.style.color = '#15803d';
      adminMsg.innerHTML = '✅ Đăng nhập Admin thành công! Đã kích hoạt quyền quản trị MHEdu toàn hệ thống.';
      setTimeout(() => {
        modalAdmin.classList.remove('show');
      }, 1200);
    } else {
      adminMsg.style.display = 'block';
      adminMsg.style.background = '#fee2e2';
      adminMsg.style.color = '#b91c1c';
      adminMsg.innerHTML = '❌ Mật khẩu admin không chính xác. Vui lòng liên hệ Thầy Hùng.';
    }
  });

  // Teacher Login Flow
  btnOpenTeacher.addEventListener('click', () => {
    teacherMsg.style.display = 'none';
    modalTeacher.classList.add('show');
  });

  btnCloseTeacher.addEventListener('click', () => modalTeacher.classList.remove('show'));

  formTeacher.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = teacherId.value.trim();
    localStorage.setItem('kg_current_teacher_id', id);
    localStorage.setItem('mhedu_teacher_id', id);

    teacherMsg.style.display = 'block';
    teacherMsg.style.background = '#dcfce7';
    teacherMsg.style.color = '#15803d';
    teacherMsg.innerHTML = `✅ Giáo viên <b>${id}</b> đã đăng nhập thành công! Bản quyền VIP đã kích hoạt.`;
    setTimeout(() => {
      modalTeacher.classList.remove('show');
    }, 1200);
  });

  // Search input event
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    render();
  });

  // Category filter chips
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      currentPage = 1;
      render();
    });
  });

  // Pagination clicks
  btnPrevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      render();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  btnNextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredGames().length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      render();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  if (pageNum1) {
    pageNum1.addEventListener('click', () => {
      currentPage = 1;
      render();
    });
  }

  if (pageNum2) {
    pageNum2.addEventListener('click', () => {
      currentPage = 2;
      render();
    });
  }

  // Keyboard shortcut: Escape to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalRunner.classList.contains('show')) closeGameRunner();
      modalDetail.classList.remove('show');
      modalAdmin.classList.remove('show');
      modalTeacher.classList.remove('show');
    }
  });

  // Init
  initTheme();
  updateCounters();
  render();

  console.log('MHEdu Kho Game Portal initialized successfully.');
})();
