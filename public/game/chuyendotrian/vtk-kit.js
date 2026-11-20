/* =====================================================================
   VTK – Bộ tính năng thi đội dùng chung cho game Vọc AI cùng Nam
   - VTK.spin(teams)            : vòng quay chọn đội đi trước → Promise<chỉ số đội>
   - VTK.tie(teams, tied)       : câu hỏi phụ khi bằng điểm   → Promise<chỉ số đội thắng | null>
   - VTK.music(mode)            : nhạc nền 'vui' | 'hoi' (đếm giờ) | null (tắt)
   - VTK.musicButton(cls)       : HTML nút 🎶 NHẠC để chèn vào thanh công cụ của game
   - VTK.settingsHTML()/VTK.readSettings(root) : khối "🏆 Thi đội" chèn vào màn Soạn/Cài đặt
   - VTK.cfg                    : { spin:true, music:true, tie:'câu | A | B | C | D | đáp án | lời giải' }
   Cấu hình mặc định lấy từ <script id="vtk-config" type="application/json">, sửa thì lưu localStorage.
   teams: mảng { name, color } (hoặc chuỗi tên).
   ===================================================================== */
(function () {
  if (window.VTK) return;
  const GID = (document.getElementById('vtk-config')?.dataset.id) || location.pathname.split('/').filter(Boolean).slice(-2).join('/') || document.title;
  const LS = 'vtk:' + GID;
  const DEF = { spin: true, music: true, tie: '' };
  let cfg = Object.assign({}, DEF);
  try { Object.assign(cfg, JSON.parse(document.getElementById('vtk-config')?.textContent || '{}')); } catch (e) {}
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(cfg)); } catch (e) {} };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLORS = ['#e5484d', '#1f6fd1', '#f5a524', '#1f9d55', '#8e4ec6', '#e5609a'];
  const norm = teams => (teams || []).map((t, i) => typeof t === 'string' ? { name: t, color: COLORS[i % 6] } : { name: t.name ?? t.n ?? t.ten ?? ('Đội ' + (i + 1)), color: t.color ?? t.c ?? t.mau ?? COLORS[i % 6] });

  /* ---------- CSS riêng, tiền tố vtk- để không đụng game ---------- */
  const css = `
.vtk-ov{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:rgba(10,8,30,.78);font-family:inherit;animation:vtk-in .25s}
@keyframes vtk-in{from{opacity:0}}
.vtk-card{width:min(92vw,980px);max-height:94vh;overflow:auto;background:#fffdf6;border-radius:28px;border:6px solid #ffcd00;box-shadow:0 20px 60px rgba(0,0,0,.5);padding:22px 28px;text-align:center;color:#24182a}
.vtk-card h2{margin:4px 0 10px;font-size:clamp(24px,3.4vw,40px);color:#c8102e}
.vtk-card p{margin:6px 0;font-size:clamp(16px,1.8vw,22px)}
.vtk-wheel{position:relative;width:min(62vh,80vw);height:min(62vh,80vw);margin:6px auto}
.vtk-wheel svg{width:100%;height:100%;transition:transform 4.6s cubic-bezier(.12,.8,.22,1);filter:drop-shadow(0 10px 18px rgba(0,0,0,.3))}
.vtk-ptr{position:absolute;left:50%;top:-12px;transform:translateX(-50%);border-left:24px solid transparent;border-right:24px solid transparent;border-top:46px solid #7a0a14;z-index:2}
.vtk-hub{position:absolute;left:50%;top:50%;width:18%;height:18%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#fff4a8,#ffcd00);border:5px solid #c8102e;display:grid;place-items:center;font-size:clamp(22px,4vh,44px)}
.vtk-msg{min-height:1.4em;font-size:clamp(22px,3vw,38px)!important;font-weight:800;color:#c8102e}
.vtk-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:12px 0}
.vtk-btn{font:inherit;font-weight:800;font-size:clamp(16px,1.9vw,24px);padding:10px 26px;border-radius:999px;border:4px solid #fff;background:#c8102e;color:#fff;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.25)}
.vtk-btn:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.25)}
.vtk-btn.ok{background:#1f9d55}.vtk-btn.gray{background:#6b6b80}.vtk-btn.big{font-size:clamp(20px,2.6vw,32px);padding:12px 40px}
.vtk-pulse{animation:vtk-p 1s infinite}@keyframes vtk-p{50%{transform:scale(1.06)}}
.vtk-q{font-size:clamp(20px,2.6vw,32px)!important;font-weight:800;margin:10px 0!important}
.vtk-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.vtk-opt{padding:10px 14px;border-radius:16px;background:#fff;border:3px solid #e9dfc9;font-size:clamp(16px,1.9vw,24px);text-align:left}
.vtk-opt b{color:#c8102e;margin-right:6px}.vtk-opt.right{border-color:#1f9d55;background:#e7f8ee}
.vtk-ans{filter:blur(8px);cursor:pointer;transition:filter .2s}.vtk-ans:hover{filter:none}
.vtk-set{border:2px dashed #d7b65c;border-radius:16px;padding:12px 14px;margin:12px 0;background:#fffaf0;text-align:left;color:#24182a;font-size:15px}
.vtk-set h4{margin:0 0 8px;font-size:17px;color:#b07a00}
.vtk-set label{display:flex;gap:8px;align-items:center;margin:6px 0;cursor:pointer;color:#24182a!important;font-weight:normal}
.vtk-set input[type=checkbox]{width:auto!important;height:auto;margin:0}
.vtk-set textarea{width:100%;box-sizing:border-box;min-height:64px;font:inherit;font-size:14px;padding:8px;border-radius:10px;border:2px solid #e6d9b8}
.vtk-set small{color:#7a6a50}
.vtk-mbtn{cursor:pointer}`;
  const st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- âm thanh ---------- */
  let AC, NOISE;
  const ac = () => { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; };
  addEventListener('pointerdown', () => { try { ac(); if (MUS.want && !MUS.id) music(MUS.want); } catch (e) {} }, true);
  const nb = c => { if (!NOISE) { NOISE = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return NOISE; };
  function hiss(t, d, vol, ft, fq, out) { const c = AC, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = nb(c); s.loop = true; f.type = ft; f.frequency.value = fq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + d + .05); }
  function kick(t, out, vol) { const c = AC, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .14); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .32); o.connect(g).connect(out); o.start(t); o.stop(t + .35); }
  function note(t, f, d, type, vol, out, cut) { const c = AC, o = c.createOscillator(), g = c.createGain(); let n = o; o.type = type; o.frequency.setValueAtTime(f, t); if (cut) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); n = lp; } g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + d); n.connect(g).connect(out); o.start(t); o.stop(t + d + .02); }
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  function blip(f, d, type = 'triangle', vol = .15, at = 0) { try { const c = ac(), t = c.currentTime + at; note(t, f, d, type, vol, c.destination); } catch (e) {} }

  const MUS = { mode: null, want: null, bus: null, t: 0, step: 0, id: null, vol: .32 };
  const PROG = [[48, 64, 67, 72], [43, 62, 67, 71], [45, 64, 69, 72], [41, 65, 69, 72]];
  const MEL = [[76, 0, 79, 81, 79, 76, 74, 0], [74, 0, 74, 76, 79, 0, 76, 0], [72, 0, 76, 79, 81, 79, 76, 0], [77, 76, 74, 72, 74, 0, 79, 0]];
  function tick() {
    if (!AC || AC.state !== 'running') { if (AC) MUS.t = AC.currentTime + .08; return; }
    const out = MUS.bus, hot = MUS.mode === 'hoi', s16 = 60 / (hot ? 140 : 122) / 4;
    while (MUS.t < AC.currentTime + .15) {
      const s = MUS.step % 16, bar = (MUS.step >> 4) % 4, t = MUS.t, ch = PROG[hot ? [0, 0, 2, 2][bar] : bar];
      if (s % 4 === 0) kick(t, out, hot ? .8 : .7);
      if (s % 8 === 4) hiss(t, .18, hot ? .3 : .25, 'bandpass', 1900, out);
      if (s % 2 === 0 || hot) hiss(t, .035, s % 4 === 2 ? .16 : .08, 'highpass', 8000, out);
      if (hot) { note(t, mf(ch[0] - 12 + (s % 2 ? 12 : 0)), .12, 'sawtooth', .16, out, 900); if (s % 4 === 0) note(t, mf(81 + (bar % 2) + ((MUS.step >> 6) % 4)), .1, 'square', .045, out); }
      else {
        if ([0, 3, 6, 8, 11, 14].includes(s)) note(t, mf(ch[0] - 12 + (s === 14 ? 12 : 0)), .2, 'sawtooth', .17, out, 700);
        if (s === 2 || s === 6 || s === 10 || s === 14) ch.slice(1).forEach(m => note(t, mf(m), .12, 'square', .022, out, 2800));
        if (s % 2 === 0) { const m = MEL[bar][s >> 1]; if (m) note(t, mf(m), .22, 'triangle', .085, out); }
      }
      MUS.t += s16; MUS.step++;
    }
  }
  /** mode: 'vui' (nhạc nền) | 'hoi' (đang đếm giờ) | null (tắt) */
  function music(mode) {
    MUS.want = mode;
    if (!cfg.music) mode = null;
    if (mode === MUS.mode && (MUS.id || !mode)) return;
    MUS.mode = mode; clearInterval(MUS.id); MUS.id = null;
    if (!mode || !AC) return;
    const c = ac();
    if (!MUS.bus) { MUS.bus = c.createGain(); MUS.bus.gain.value = MUS.vol; const comp = c.createDynamicsCompressor(); MUS.bus.connect(comp).connect(c.destination); }
    MUS.t = c.currentTime + .08; MUS.step = 0; MUS.id = setInterval(tick, 25);
  }
  /** nhỏ nhạc lại khi đọc/đọc to, on=false để trả lại */
  function duck(on) { if (!MUS.bus || !AC) return; const g = MUS.bus.gain, t = AC.currentTime; g.cancelScheduledValues(t); g.setTargetAtTime(on ? MUS.vol * .3 : MUS.vol, t, on ? .05 : .4); }
  function musicLabel() { return (cfg.music ? '🎶' : '🎵') + `<small>${cfg.music ? 'NHẠC' : 'TẮT'}</small>`; }
  function toggleMusic() { cfg.music = !cfg.music; save(); ac(); const w = MUS.want; MUS.mode = undefined; music(w); document.querySelectorAll('.vtk-mbtn').forEach(b => b.innerHTML = b.dataset.plain ? (cfg.music ? '🎶 Nhạc: bật' : '🎵 Nhạc: tắt') : musicLabel()); }
  /** cls: class nút của game để nút nhạc cùng kiểu; plain=true thì hiện chữ thường "🎶 Nhạc: bật" */
  function musicButton(cls = '', plain = false) { return `<button type="button" class="${cls} vtk-mbtn" ${plain ? 'data-plain="1"' : ''} title="Bật/tắt nhạc nền" onclick="VTK.toggleMusic()">${plain ? (cfg.music ? '🎶 Nhạc: bật' : '🎵 Nhạc: tắt') : musicLabel()}</button>`; }

  /* ---------- vòng quay chọn đội đi trước ---------- */
  function overlay(html) { close(); const d = document.createElement('div'); d.className = 'vtk-ov'; d.id = 'vtk-ov'; d.innerHTML = `<div class="vtk-card">${html}</div>`; document.body.appendChild(d); return d; }
  function close() { document.getElementById('vtk-ov')?.remove(); }
  /** Promise<index>. Không bật vòng quay hoặc < 2 đội thì trả 0 ngay (đội đầu tiên). */
  function spin(teamsIn, opts = {}) {
    const teams = norm(teamsIn);
    if ((!cfg.spin && !opts.force) || teams.length < 2) return Promise.resolve(0);
    return new Promise(res => {
      const n = teams.length, segN = n * 2, deg = 360 / segN;
      const seg = i => { const a0 = (i * deg - 90) * Math.PI / 180, a1 = ((i + 1) * deg - 90) * Math.PI / 180, r = 100, t = teams[i % n], mid = (i + .5) * deg;
        return `<path d="M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}Z" fill="${t.color}" stroke="#fff" stroke-width="2"/>
          <text transform="rotate(${mid}) translate(0 -62) rotate(90)" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-weight="800" font-size="${Math.max(7, Math.min(13, 70 / Math.max(4, t.name.length)))}" style="paint-order:stroke" stroke="rgba(0,0,0,.35)" stroke-width="1.5">${esc(t.name)}</text>`; };
      overlay(`<h2>🎡 Vòng quay may mắn · Đội nào đi trước?</h2>
        <div class="vtk-wheel"><div class="vtk-ptr"></div><svg id="vtk-wh" viewBox="-108 -108 216 216"><circle r="106" fill="#ffcd00" stroke="#c8102e" stroke-width="5"/>${Array.from({ length: segN }, (_, i) => seg(i)).join('')}</svg><div class="vtk-hub">⭐</div></div>
        <p class="vtk-msg" id="vtk-msg"></p>
        <div class="vtk-row"><button class="vtk-btn big vtk-pulse" id="vtk-go">QUAY! 🎡</button></div>`);
      const go = document.getElementById('vtk-go');
      go.onclick = () => {
        if (go.dataset.done) { close(); return res(+go.dataset.first); }
        go.disabled = true; go.classList.remove('vtk-pulse'); ac();
        const pick = Math.floor(Math.random() * segN), first = pick % n;
        const turn = 360 * 6 + (360 - (pick + .5) * deg) + (Math.random() - .5) * deg * .6;
        document.getElementById('vtk-wh').style.transform = `rotate(${turn}deg)`;
        let k = 0; const tk = setInterval(() => { blip(1100 + (k++ % 3) * 120, .04, 'square', .06); }, 120);
        setTimeout(() => clearInterval(tk), 3900);
        setTimeout(() => {
          [523, 659, 784, 1047].forEach((f, i) => blip(f, .3, 'square', .1, i * .09));
          document.getElementById('vtk-msg').innerHTML = `🎉 <span style="color:${teams[first].color}">${esc(teams[first].name)}</span> được đi trước!`;
          go.disabled = false; go.textContent = 'BẮT ĐẦU ▶'; go.dataset.done = 1; go.dataset.first = first; go.classList.add('vtk-pulse');
        }, 4700);
      };
    });
  }

  /* ---------- câu hỏi phụ khi bằng điểm ---------- */
  /** Đọc câu hỏi phụ: "câu | A | B | (C) | (D) | đáp án (A/B/C/D) | (lời giải)". Thiếu thì null. */
  function tieQ() {
    const p = String(cfg.tie || '').split('|').map(s => s.trim());
    if (p.length < 4 || !p[0]) return null;
    const ai = p.findIndex((s, i) => i >= 3 && /^[A-Da-d]$/.test(s));
    if (ai < 0) return null;
    const opts = p.slice(1, ai).filter(Boolean), a = 'ABCD'.indexOf(p[ai].toUpperCase());
    if (opts.length < 2 || a < 0 || a >= opts.length) return null;
    return { q: p[0], o: opts, a, s: p[ai + 1] || '' };
  }
  /** Tìm các đội đang bằng điểm cao nhất (scores: mảng số). Trả mảng chỉ số, < 2 phần tử nghĩa là không hòa. */
  function tiedTop(scores) { const m = Math.max(...scores); return scores.map((s, i) => s === m ? i : -1).filter(i => i >= 0); }
  /** Promise<chỉ số đội thắng | null>. Không có câu hỏi phụ hoặc không hòa thì trả null ngay. Game tự cộng điểm cho đội thắng. */
  function tie(teamsIn, tied) {
    const teams = norm(teamsIn), q = tieQ();
    if (!q || !tied || tied.length < 2) return Promise.resolve(null);
    return new Promise(res => {
      const tried = [];
      const optHTML = (show) => `<div class="vtk-opts">${q.o.map((o, i) => `<div class="vtk-opt ${show && i === q.a ? 'right' : ''}"><b>${'ABCD'[i]}.</b>${esc(o)}</div>`).join('')}</div>`;
      const ask = () => {
        const left = tied.filter(k => !tried.includes(k));
        overlay(`<h2>⚡ Câu hỏi phụ phân thắng thua</h2>
          <p><b>${tied.map(k => `<span style="color:${teams[k].color}">${esc(teams[k].name)}</span>`).join(', ')}</b> đang bằng điểm! Đội nào <b>giơ tay trước</b> được trả lời. Sai thì đội còn lại giành quyền.</p>
          <p class="vtk-q">${esc(q.q)}</p>${optHTML(false)}
          <p>✋ Đội nào giơ tay trước?</p>
          <div class="vtk-row">${left.map(k => `<button class="vtk-btn" style="background:${teams[k].color}" data-k="${k}">${esc(teams[k].name)}</button>`).join('')}</div>`);
        blip(880, .15, 'square', .08); blip(1175, .15, 'square', .08, .07); blip(1568, .2, 'square', .08, .14);
        document.querySelectorAll('#vtk-ov [data-k]').forEach(b => b.onclick = () => judge(+b.dataset.k));
      };
      const judge = k => {
        overlay(`<h2>⚡ <span style="color:${teams[k].color}">${esc(teams[k].name)}</span> trả lời</h2>
          <p class="vtk-q">${esc(q.q)}</p>${optHTML(false)}
          <p style="font-size:16px;color:#7a6a50">Đáp án (rê chuột để xem): <span class="vtk-ans">${'ABCD'[q.a]}</span></p>
          <div class="vtk-row"><button class="vtk-btn ok" id="vtk-y">✅ ĐÚNG</button><button class="vtk-btn" id="vtk-n">❌ SAI</button></div>`);
        document.getElementById('vtk-y').onclick = () => done(k);
        document.getElementById('vtk-n').onclick = () => {
          tried.push(k); blip(220, .4, 'sawtooth', .1);
          const left = tied.filter(x => !tried.includes(x));
          if (left.length === 1) return done(left[0], true);
          if (!left.length) return finish(null);
          ask();
        };
      };
      const done = (k, byDefault) => {
        [523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, .25, 'square', .1, i * .08));
        overlay(`<h2>🏆 ${esc(teams[k].name)} chiến thắng!</h2>
          <p>${byDefault ? 'Đội bạn trả lời chưa đúng, ' + esc(teams[k].name) + ' giành quyền.' : 'Trả lời chính xác câu hỏi phụ!'}</p>
          <p class="vtk-q">${esc(q.q)}</p>${optHTML(true)}${q.s ? `<p>💡 ${esc(q.s)}</p>` : ''}
          <div class="vtk-row"><button class="vtk-btn ok big" id="vtk-end">XEM KẾT QUẢ 🏆</button></div>`);
        document.getElementById('vtk-end').onclick = () => finish(k);
      };
      const finish = k => { close(); res(k); };
      ask();
    });
  }

  /* ---------- khối cài đặt chèn vào màn Soạn/Cài đặt của game ---------- */
  /** opts.teams=false: game không chia đội → chỉ hiện ô nhạc nền; opts.spin=false: ẩn ô vòng quay */
  function settingsHTML(opts = {}) {
    const T = opts.teams !== false, SP = T && opts.spin !== false;
    return `<div class="vtk-set" id="vtk-set"><h4>${T ? '🏆 Thi đội' : '🎶 Âm nhạc'}</h4>
      <label ${SP ? '' : 'style="display:none!important"'}><input type="checkbox" id="vtk-s-spin" ${cfg.spin ? 'checked' : ''}> Quay vòng chọn đội đi trước khi bắt đầu</label>
      <label><input type="checkbox" id="vtk-s-music" ${cfg.music ? 'checked' : ''}> Nhạc nền sôi động (nhạc dồn dập khi đếm giờ)</label>
      <div ${T ? '' : 'hidden'}><div style="margin-top:8px"><b>Câu hỏi phụ khi bằng điểm</b> <small>– cuối game các đội bằng điểm thì đội giơ tay trước được trả lời. Để trống nếu không dùng.</small></div>
      <textarea id="vtk-s-tie" placeholder="Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Lời giải (nếu có)">${esc(cfg.tie)}</textarea>
      <small>Có thể chỉ 2 đáp án: Câu hỏi | A | B | A. Ví dụ: 7 × 8 = ? | 54 | 56 | 58 | 64 | B | 7 × 8 = 56</small>
      <div id="vtk-s-warn" style="color:#c8102e;font-weight:700"></div></div></div>`;
  }
  /** Đọc khối cài đặt (gọi khi bấm Lưu). Trả chuỗi lỗi nếu câu hỏi phụ sai định dạng, '' nếu ổn. */
  function readSettings(root = document) {
    const g = id => root.querySelector('#' + id);
    if (!g('vtk-s-spin')) return '';
    cfg.spin = g('vtk-s-spin').checked; cfg.tie = g('vtk-s-tie').value.trim();
    const m = g('vtk-s-music').checked; if (m !== cfg.music) { cfg.music = !m; toggleMusic(); }
    save();
    const err = cfg.tie && !tieQ() ? 'Câu hỏi phụ chưa đúng mẫu: Câu hỏi | A | B | (C) | (D) | Đáp án đúng | (Lời giải)' : '';
    const w = g('vtk-s-warn'); if (w) w.textContent = err;
    return err;
  }
  /** Ghi cấu hình hiện tại vào thẻ <script id="vtk-config"> trong chuỗi HTML (dùng khi game xuất/tải file mới). */
  function embed(html) {
    const tag = `<script id="vtk-config" type="application/json" data-id="${esc(GID)}">${JSON.stringify(cfg).replace(/</g, '\\u003c')}<\/script>`;
    return /<script id="vtk-config"[^>]*>[\s\S]*?<\/script>/.test(html) ? html.replace(/<script id="vtk-config"[^>]*>[\s\S]*?<\/script>/, () => tag) : html.replace(/<\/head>/i, () => tag + '\n</head>');
  }

  window.VTK = { spin, tie, tieQ, tiedTop, music, duck, toggleMusic, musicButton, settingsHTML, readSettings, embed, close, get cfg() { return cfg; } };
})();

