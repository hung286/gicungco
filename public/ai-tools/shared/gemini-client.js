/*
 * GeminiClient — dùng chung cho các công cụ vẽ hình AI (Tạo Ảnh Minh Họa SVG/TikZ & MathViz Studio).
 * - TỰ PHÁT HIỆN model mà Key được phép dùng (ListModels) → không bao giờ bị kẹt vì Google đổi/ngừng model.
 * - Tự đi theo gợi ý "use models/xxx" trong thông báo lỗi của Google.
 * - Xoay tua nhiều API Key + nhiều model; tự chờ & thử lại khi 429 (ngắn) / 503 (quá tải).
 * - 400 "invalid argument" → tự thử lại với cấu hình tối giản.
 * - Đọc đúng mọi "part" trả về (bỏ phần suy nghĩ), tách JSON bền vững, sửa JSON bị cắt.
 */
(function () {
  // Danh sách dự phòng khi không lấy được ListModels (mới nhất trước)
  const STATIC_QUEUE = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
  const BLOCK_KEY = 'gemini_client_blocked_v2';   // { "<key8>|<model>": untilTimestamp }
  const MODELS_CACHE = 'gemini_client_models_v2'; // { "<key8>": { at, models: [] } }
  const DEAD_KEY = 'gemini_client_dead_models_v2'; // { "<key8>": [model,...] }

  function getKeys() {
    const raw = (localStorage.getItem('gemini_api_key') || localStorage.getItem('gemini_api_keys') || localStorage.getItem('smartedu_gemini_key') || '').trim();
    if (!raw) return [];
    return raw.split(/[\n,;\s]+/).map(k => k.trim()).filter(k => k.length > 20).filter((k, i, a) => a.indexOf(k) === i);
  }

  const k8 = key => key.slice(-8);
  const readJson = (name, def) => { try { return JSON.parse(localStorage.getItem(name) || '') || def; } catch { return def; } };
  const writeJson = (name, v) => { try { localStorage.setItem(name, JSON.stringify(v)); } catch {} };

  function blockPair(key, model, ms) {
    const b = readJson(BLOCK_KEY, {});
    b[k8(key) + '|' + model] = Date.now() + ms;
    writeJson(BLOCK_KEY, b);
  }
  function isBlocked(key, model) {
    const t = readJson(BLOCK_KEY, {})[k8(key) + '|' + model];
    return t && t > Date.now();
  }
  function markDead(key, model) {
    const d = readJson(DEAD_KEY, {});
    const arr = d[k8(key)] || [];
    if (!arr.includes(model)) arr.push(model);
    d[k8(key)] = arr;
    writeJson(DEAD_KEY, d);
  }
  function isDead(key, model) {
    return (readJson(DEAD_KEY, {})[k8(key)] || []).includes(model);
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---------- Model discovery ----------
  function versionOf(name) {
    const m = name.match(/gemini-(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : (/latest/.test(name) ? 99 : 0);
  }
  function rankModels(names) {
    const ok = names.filter(n =>
      /flash/.test(n) &&
      !/(image|tts|audio|live|embedding|vision|native|thinking-exp|computer-use|robotics|8b)/.test(n)
    );
    // Ưu tiên các model ổn định và còn nguyên hạn mức quota
    const topPicks = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
    return ok.sort((a, b) => {
      const idxA = topPicks.indexOf(a);
      const idxB = topPicks.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      const pa = /preview|exp/.test(a) ? 1 : 0, pb = /preview|exp/.test(b) ? 1 : 0;
      if (pa !== pb) return pa - pb;              // bản ổn định trước bản preview
      const la = /lite/.test(a) ? 1 : 0, lb = /lite/.test(b) ? 1 : 0;
      const va = versionOf(a), vb = versionOf(b);
      if (va !== vb) return vb - va;              // phiên bản mới trước
      return la - lb;                             // flash trước flash-lite
    });
  }
  async function discoverModels(key) {
    const cache = readJson(MODELS_CACHE, {});
    const c = cache[k8(key)];
    if (c && Date.now() - c.at < 6 * 3600 * 1000 && Array.isArray(c.models) && c.models.length) return c.models;
    try {
      const names = [];
      let pageToken = '';
      for (let i = 0; i < 5; i++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(key)}` + (pageToken ? `&pageToken=${pageToken}` : '');
        const res = await fetch(url);
        if (!res.ok) break;
        const j = await res.json();
        (j.models || []).forEach(m => {
          if ((m.supportedGenerationMethods || []).includes('generateContent')) names.push(String(m.name).replace(/^models\//, ''));
        });
        if (!j.nextPageToken) break;
        pageToken = j.nextPageToken;
      }
      const ranked = rankModels(names);
      if (ranked.length) {
        cache[k8(key)] = { at: Date.now(), models: ranked };
        writeJson(MODELS_CACHE, cache);
      }
      return ranked;
    } catch {
      return [];
    }
  }

  // ---------- Helpers ----------
  function parseRetryDelayMs(errJson) {
    for (const d of (errJson?.error?.details || [])) {
      if (d && typeof d.retryDelay === 'string') {
        const s = parseFloat(d.retryDelay);
        if (!isNaN(s)) return Math.ceil(s * 1000);
      }
    }
    const m = (errJson?.error?.message || '').match(/retry in ([\d.]+)s/i);
    return m ? Math.ceil(parseFloat(m[1]) * 1000) : 0;
  }

  function extractText(resData) {
    const parts = resData?.candidates?.[0]?.content?.parts || [];
    return parts.filter(p => p && typeof p.text === 'string' && !p.thought).map(p => p.text).join('');
  }

  function repairTruncatedJson(s) {
    let inStr = false, esc = false;
    const stack = [];
    for (const ch of s) {
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}' || ch === ']') stack.pop();
    }
    let out = s;
    if (inStr) out += '"';
    while (stack.length) out += stack.pop() === '{' ? '}' : ']';
    return out;
  }

  function parseJsonLoose(text) {
    const t = (text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
    try { return JSON.parse(t); } catch {}
    const first = t.indexOf('{');
    const last = t.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try { return JSON.parse(t.slice(first, last + 1)); } catch {}
    }
    if (first >= 0) {
      try { return JSON.parse(repairTruncatedJson(t.slice(first))); } catch {}
    }
    throw new Error('AI trả về dữ liệu không đúng định dạng JSON.');
  }

  function classify(status, msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('api key not valid') || m.includes('api_key_invalid') || m.includes('api key expired')) return 'invalid_key';
    if (m.includes('no longer available') || m.includes('is not found') || m.includes('not supported for generatecontent') || status === 404) return 'no_model';
    if (status === 403 || m.includes('permission') || m.includes('leaked') || m.includes('suspended')) return 'forbidden_key';
    if (status === 429 || m.includes('quota') || m.includes('resource_exhausted') || m.includes('rate limit')) return 'quota';
    if (status === 503 || m.includes('high demand') || m.includes('overloaded') || m.includes('unavailable')) return 'busy';
    if (status === 400 && m.includes('invalid argument')) return 'bad_arg';
    if (status >= 500) return 'server';
    return 'other';
  }

  function suggestedModels(msg) {
    const out = [];
    const re = /models\/([a-z0-9.\-]+)/gi;
    let m;
    while ((m = re.exec(msg || ''))) {
      const name = m[1].replace(/[.\-]+$/, '');
      if (!out.includes(name)) out.push(name);
    }
    return out;
  }

  async function callOnce(key, model, parts, opts, minimal) {
    const genCfg = { temperature: 0.2, maxOutputTokens: opts.maxOutputTokens || 16384 };
    if (!minimal) {
      genCfg.responseMimeType = 'application/json';
      if (/^gemini-2\.5-flash/.test(model)) genCfg.thinkingConfig = { thinkingBudget: 0 };
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 150000);
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: genCfg }),
        signal: ctrl.signal
      });
    } catch (e) {
      return { ok: false, kind: 'network', msg: e.name === 'AbortError' ? 'Quá thời gian chờ (150s)' : (e.message || 'Lỗi mạng') };
    } finally {
      clearTimeout(timer);
    }
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${response.status}`;
      const kind = classify(response.status, msg);
      return { ok: false, kind, msg, retryMs: kind === 'quota' ? parseRetryDelayMs(errJson) : 0 };
    }
    const data = await response.json();
    const text = extractText(data);
    if (!text) {
      const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'EMPTY';
      return { ok: false, kind: 'other', msg: 'AI không trả về nội dung (' + reason + ')' };
    }
    try {
      return { ok: true, json: parseJsonLoose(text) };
    } catch (e) {
      return { ok: false, kind: 'bad_json', msg: e.message };
    }
  }

  /**
   * generateJson({ parts, preferredModel, maxOutputTokens, onProgress })
   */
  async function generateJson(opts) {
    const keys = getKeys();
    if (!keys.length) {
      const e = new Error('Chưa có Gemini API Key. Hãy dán Key (lấy miễn phí tại https://aistudio.google.com/apikey) vào ô "Key" rồi bấm Lưu.');
      e.code = 'no_key';
      throw e;
    }
    const progress = msg => { try { opts.onProgress && opts.onProgress(msg); } catch {} };
    const report = [];
    const badKeys = new Set();
    let waitCandidate = null;

    for (let kIdx = 0; kIdx < keys.length; kIdx++) {
      const key = keys[kIdx];
      progress(`Đang dò model khả dụng cho Key #${kIdx + 1}...`);
      const discovered = await discoverModels(key);
      const queue = [];
      const push = m => { if (m && !queue.includes(m)) queue.push(m); };
      if (opts.preferredModel && (!discovered.length || discovered.includes(opts.preferredModel))) push(opts.preferredModel);
      discovered.forEach(push);
      STATIC_QUEUE.forEach(push);

      let tried = 0;
      for (let qi = 0; qi < queue.length && tried < 8; qi++) {
        const model = queue[qi];
        if (badKeys.has(key)) break;
        if (isDead(key, model)) continue;
        if (isBlocked(key, model)) { report.push(`Key #${kIdx + 1} · ${model}: tạm khóa do vừa hết lượt`); continue; }
        tried++;
        progress(`AI đang vẽ bằng ${model} (Key #${kIdx + 1})...`);

        let r = await callOnce(key, model, opts.parts, opts, false);
        if (!r.ok && r.kind === 'bad_arg') r = await callOnce(key, model, opts.parts, opts, true);
        if (!r.ok && (r.kind === 'busy' || r.kind === 'server' || r.kind === 'network' || r.kind === 'bad_json')) {
          progress(`${model} đang quá tải, thử lại sau 3 giây...`);
          await sleep(3000);
          r = await callOnce(key, model, opts.parts, opts, r.kind === 'bad_json');
        }
        if (r.ok) return { data: r.json, model, keyIndex: kIdx + 1 };

        report.push(`Key #${kIdx + 1} · ${model}: ${String(r.msg).split('\n')[0].slice(0, 160)}`);
        if (r.kind === 'invalid_key') { badKeys.add(key); break; }
        if (r.kind === 'no_model') {
          markDead(key, model);
          suggestedModels(r.msg).forEach(s => { if (s !== model && !queue.includes(s)) queue.splice(qi + 1, 0, s); });
          tried--; // không tính lượt cho model đã ngừng
          continue;
        }
        if (r.kind === 'forbidden_key' && /leaked|suspended|api key/i.test(r.msg)) { badKeys.add(key); break; }
        if (r.kind === 'quota') {
          const isDaily = /per ?day|PerDay/i.test(r.msg);
          if (r.retryMs && r.retryMs <= 40000 && !isDaily && (!waitCandidate || r.retryMs < waitCandidate.ms)) {
            waitCandidate = { key, kIdx, model, ms: r.retryMs };
          }
          blockPair(key, model, isDaily ? 60 * 60 * 1000 : Math.max(r.retryMs, 20000));
        }
      }
    }

    if (waitCandidate) {
      progress(`Google yêu cầu chờ ${Math.ceil(waitCandidate.ms / 1000)}s, đang tự thử lại...`);
      await sleep(waitCandidate.ms + 500);
      const r = await callOnce(waitCandidate.key, waitCandidate.model, opts.parts, opts, false);
      if (r.ok) return { data: r.json, model: waitCandidate.model, keyIndex: waitCandidate.kIdx + 1 };
      report.push(`Thử lại Key #${waitCandidate.kIdx + 1} · ${waitCandidate.model}: ${String(r.msg).slice(0, 160)}`);
    }

    let hint;
    if (badKeys.size === keys.length) {
      hint = 'Tất cả API Key không hợp lệ hoặc đã bị Google chặn. Hãy tạo Key mới tại https://aistudio.google.com/apikey và dán lại.';
    } else if (report.some(x => /quota|exhausted|rate|tạm khóa/i.test(x))) {
      hint = 'Các Key hiện tại đã dùng hết hạn ngạch miễn phí của Google (theo phút/ngày). Chờ vài phút rồi thử lại, hoặc dán thêm Key từ tài khoản Google KHÁC.';
    } else if (report.some(x => /high demand|overloaded|quá tải/i.test(x))) {
      hint = 'Máy chủ Gemini đang quá tải tạm thời. Vui lòng bấm tạo lại sau ít phút.';
    } else {
      hint = 'Không gọi được Gemini. Kiểm tra kết nối mạng và Key.';
    }
    const e = new Error(hint + '\n\nChi tiết:\n- ' + report.slice(0, 10).join('\n- '));
    e.code = 'all_failed';
    throw e;
  }

  function clearBlocks() {
    writeJson(BLOCK_KEY, {});
    writeJson(MODELS_CACHE, {});
    writeJson(DEAD_KEY, {});
  }

  window.GeminiClient = { generateJson, getKeys, clearBlocks, discoverModels, STATIC_QUEUE };
})();
