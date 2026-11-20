const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../scratch/pdf2docx');
const outDir = path.resolve(__dirname, '../public/ai-tools/pdf-to-docx');
const distDir = path.resolve(__dirname, '../dist/ai-tools/pdf-to-docx');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'icons'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });

// Copy vendor files and icons
fs.copyFileSync(path.join(srcDir, 'assets/vendor-D6uvTVix.js'), path.join(outDir, 'assets/vendor-D6uvTVix.js'));
fs.copyFileSync(path.join(srcDir, 'assets/vendor-8tIVgPt_.css'), path.join(outDir, 'assets/vendor-8tIVgPt_.css'));
fs.copyFileSync(path.join(srcDir, 'assets/index-cO9qd_Zo.css'), path.join(outDir, 'assets/index-cO9qd_Zo.css'));
if (fs.existsSync(path.join(srcDir, 'assets/pdf.worker.min-iDqQPrd3.mjs'))) {
  fs.copyFileSync(path.join(srcDir, 'assets/pdf.worker.min-iDqQPrd3.mjs'), path.join(outDir, 'assets/pdf.worker.min-iDqQPrd3.mjs'));
}
fs.copyFileSync(path.join(srcDir, 'manifest.webmanifest'), path.join(outDir, 'manifest.webmanifest'));
fs.copyFileSync(path.join(srcDir, 'icons/apple-touch-icon.png'), path.join(outDir, 'icons/apple-touch-icon.png'));
fs.copyFileSync(path.join(srcDir, 'images/qr-donate.png'), path.join(outDir, 'images/qr-donate.png'));

// Patch index-D2iP3usK.js
let js = fs.readFileSync(path.join(srcDir, 'assets/index-D2iP3usK.js'), 'utf8');

// Neutralize dt() and mt()
js = js.replace('function dt(){', 'function dt(){return;');
js = js.replace('function mt(){', 'function mt(){return;');
// Neutralize ln domain regex
js = js.replace('ln=/^(localhost|127\\.0\\.0\\.1|\\[::1\\]|.*\\.localhost)$/', 'ln=/.*/');

// Replace author strings
js = js.split('Nguyễn Văn Sang').join('NMH thầy Nguyễn Mạnh Hùng');
js = js.split('Sang PDF2Word').join('PDF Sang Word');

fs.writeFileSync(path.join(outDir, 'assets/index-D2iP3usK.js'), js, 'utf8');

// Patch HTML
let html = fs.readFileSync(path.resolve(__dirname, '../scratch/pdf2docx.html'), 'utf8');
html = html.replace('<title>Sang PDF2Word — Chuyển đề PDF sang Word giữ công thức và hình vẽ</title>', '<title>PDF Sang Word — Chuyển đề PDF sang Word giữ công thức & hình vẽ • Tác giả: NMH thầy Nguyễn Mạnh Hùng</title>');
html = html.split('Sang PDF2Word').join('PDF Sang Word');
html = html.split('Nguyễn Văn Sang').join('NMH thầy Nguyễn Mạnh Hùng');
html = html.replace('Hệ sinh thái ConicTypst · Chuyển đề PDF sang Word', 'Chuyển đề PDF sang Word giữ công thức & hình vẽ · Tác giả: NMH thầy Nguyễn Mạnh Hùng');

const autoSyncScript = `
  <!-- Auto-sync Gemini API Keys & Pre-activate settings -->
  <script>
    (function() {
      try {
        var userKey = localStorage.getItem('gemini_api_key') ||
                      localStorage.getItem('gemini_api_keys') ||
                      localStorage.getItem('smartedu_gemini_key') ||
                      localStorage.getItem('math_visualizer_api_key') ||
                      'AQ.Ab8RN6JNUwMbEY9iaGXMl4nRq5Nu2ldYu7MJz55fiG-uZXjbDw';
        if (userKey && typeof userKey === 'string') {
          var clean = userKey.split(/[\\n,;\\t]+/)[0].trim();
          if (clean.length > 20) {
            if (!localStorage.getItem('ocr_typst_key_gemini')) {
              localStorage.setItem('ocr_typst_key_gemini', clean);
            }
            if (!localStorage.getItem('ocr_typst_key_gemini_pool')) {
              localStorage.setItem('ocr_typst_key_gemini_pool', clean);
            }
          }
        }
        localStorage.setItem('sang_pdf2docx_release_v2_0_20261111', '1');
        localStorage.setItem('pw_math_mode', localStorage.getItem('pw_math_mode') || 'both');
      } catch (e) {}
    })();
  </script>
`;

html = html.replace('</head>', autoSyncScript + '\n</head>');

const backBtn = `
  <style>
    #games2-back-btn {
      position: fixed;
      bottom: 16px;
      right: 20px;
      z-index: 99999;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.92);
      color: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.4);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      transition: transform 0.15s ease, background 0.15s ease;
    }
    #games2-back-btn:hover {
      background: rgba(30, 41, 59, 0.98);
      transform: translateY(-1px);
    }
  </style>
  <button id="games2-back-btn" type="button" onclick="exitToGames2Home(event)" title="Trở về trang chủ Game 2">
    ← Trang chủ Game 2
  </button>
  <script>
    function exitToGames2Home(e) {
      if (e) e.preventDefault();
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'CLOSE_AI_MODAL' }, '*');
          window.parent.postMessage({ type: 'EXIT_GAME' }, '*');
          if (typeof window.parent.closeAllPortals === 'function') {
            window.parent.closeAllPortals();
            return;
          }
          window.top.location.href = '/dashboard';
          return;
        }
      } catch (err) {}
      window.location.href = '/dashboard';
    }
  </script>
`;

html = html.replace('</body>', backBtn + '\n</body>');

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

// Duplicate to dist
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(outDir, distDir, { recursive: true });

console.log('PDF to Docx Tool successfully created at:');
console.log('  1. ' + outDir);
console.log('  2. ' + distDir);
