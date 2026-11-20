/**
 * Tạo Ảnh Minh Họa Bài Toán AI (SVG & TikZ Vector)
 * High School Math, Physics, Chemistry (Vietnam GDPT 2018)
 * Standard SVG Vector Generation + PGF/TikZ LaTeX Code Exporter
 */

const AppState = {
  activeTab: 'svg', // 'svg' | 'tikz'
  model: 'gemini-2.5-flash',
  apiKey: '',
  currentSvg: '',
  currentTikz: '',
  currentTitle: 'Sơ Đồ Thí Nghiệm Xác Định Nhiệt Dung Riêng Của Nước'
};

// Khai báo các thuộc tính màu cho template SVG câu 43
const groundFill = 'url(#groundP)';
const groundBorder = '#059669';
const mountainBody = 'url(#mountainGrad)';
const mountainRidge = '#92400e';
const mountainShadow = 'url(#mountainShadow)';
const fogFill = 'url(#fogMist)';
const redLine = '#dc2626';
const blueLine = '#0284c7';
const heliColor = 'url(#heliGrad)';
const blimpColor = 'url(#blimpGrad)';

const SAMPLE_DATA = {
  free_fall_graphs: {
    title: "Đồ Thị Vận Tốc & Độ Dịch Chuyển Rơi Tự Do (Vật Lí 10 - Hình 4 & Hình 5)",
    svg: `<svg id="main-freefall-svg" viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <marker id="arrow-axis-ff" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a"/>
    </marker>
    <style>
      .draggable-dot { cursor: grab; transition: r 0.1s; }
      .draggable-dot:hover { stroke: #2563eb; stroke-width: 3px; cursor: grab; }
      .draggable-dot:active { cursor: grabbing; fill: #2563eb; }
      .draggable-text { cursor: move; user-select: none; }
      .draggable-text:hover { fill: #2563eb; font-weight: bold; }
    </style>
  </defs>

  <!-- ================= HÌNH 4: ĐỒ THỊ VẬN TỐC - THỜI GIAN ================= -->
  <g id="hinh-4-group" transform="translate(60, 20)">
    <!-- Trục tung v(m/s) -->
    <line x1="50" y1="210" x2="50" y2="35" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-ff)" />
    <text class="draggable-text" x="36" y="34" font-size="20" font-weight="bold" font-style="italic" text-anchor="middle">v</text>

    <!-- Trục hoành t(s) -->
    <line x1="30" y1="190" x2="270" y2="190" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-ff)" />
    <text class="draggable-text" x="282" y="196" font-size="20" font-weight="bold" font-style="italic">t</text>

    <!-- Gốc tọa độ 0 -->
    <text class="draggable-text" x="38" y="208" font-size="18" font-weight="bold">0</text>

    <!-- Đồ thị vận tốc: Đường thẳng dốc lên xuất phát từ gốc O (v = gt) -->
    <line id="line-v-t" x1="50" y1="190" x2="225" y2="60" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
    <circle class="draggable-dot" cx="225" cy="60" r="4.5" fill="#0f172a" />

    <!-- Nhãn Hình 4 thông thoáng -->
    <text class="draggable-text" x="140" y="265" font-size="21" font-weight="bold" text-anchor="middle">Hình 4</text>
  </g>

  <!-- ================= HÌNH 5: ĐỒ THỊ ĐỘ DỊCH CHUYỂN IN TRONG ĐỀ THI GỐC ================= -->
  <g id="hinh-5-group" transform="translate(420, 20)">
    <!-- Trục tung d(m) -->
    <line x1="50" y1="210" x2="50" y2="35" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-ff)" />
    <text class="draggable-text" x="36" y="34" font-size="20" font-weight="bold" font-style="italic" text-anchor="middle">d</text>

    <!-- Trục hoành t(s) -->
    <line x1="30" y1="190" x2="270" y2="190" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-ff)" />
    <text class="draggable-text" x="282" y="196" font-size="20" font-weight="bold" font-style="italic">t</text>

    <!-- Gốc tọa độ 0 -->
    <text class="draggable-text" x="38" y="208" font-size="18" font-weight="bold">0</text>

    <!-- ĐỀ BÀI GỐC IN ĐƯỜNG THẲNG DỐC LÊN TỪ GỐC O (ĐỂ BẪY CÂU HỎI TRẮC NGHIỆM ĐÚNG/SAI) -->
    <line id="line-d-t" x1="50" y1="190" x2="225" y2="60" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
    <circle class="draggable-dot" cx="225" cy="60" r="4.5" fill="#0f172a" />

    <!-- Nhãn Hình 5 thông thoáng -->
    <text class="draggable-text" x="140" y="265" font-size="21" font-weight="bold" text-anchor="middle">Hình 5</text>
  </g>
</svg>`,
    tikz: `% Đồ thị rơi tự do v-t (Hình 4) và d-t (Hình 5)
\\begin{tikzpicture}[>=stealth, scale=0.9, font=\\small]
  % Hình 4: v - t
  \\begin{scope}[xshift=0cm]
    \\draw[->, thick] (0,0) -- (4,0) node[below] {$t$};
    \\draw[->, thick] (0,0) -- (0,3) node[left] {$v$};
    \\node[below left] at (0,0) {$0$};
    \\draw[very thick] (0,0) -- (3.2,2.4);
    \\node[below=8pt] at (1.8,-0.1) {\\textbf{Hình 4}};
  \\end{scope}

  % Hình 5: d - t (Đường thẳng bẫy trong đề thi)
  \\begin{scope}[xshift=5.5cm]
    \\draw[->, thick] (0,0) -- (4,0) node[below] {$t$};
    \\draw[->, thick] (0,0) -- (0,3) node[left] {$d$};
    \\node[below left] at (0,0) {$0$};
    \\draw[very thick] (0,0) -- (3.2,2.4);
    \\node[below=8pt] at (1.8,-0.1) {\\textbf{Hình 5}};
  \\end{scope}
\\end{tikzpicture}`
  },

  goalkeeper_graph: {
    title: "Đồ Thị Độ Dịch Chuyển - Thời Gian Của Thủ Môn (Vật Lí 10)",
    svg: `<svg id="main-goalkeeper-svg" viewBox="0 0 740 480" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <marker id="arrow-axis-gk" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a"/>
    </marker>
    <style>
      .graph-anchor { cursor: grab; fill: #0f172a; stroke: #2563eb; stroke-width: 0px; transition: stroke-width 0.15s, r 0.15s; }
      .graph-anchor:hover { stroke-width: 4px; r: 7px; cursor: grab; fill: #2563eb; }
      .graph-anchor:active { stroke-width: 5px; fill: #1d4ed8; cursor: grabbing; }
      .draggable-label { cursor: move; user-select: none; font-style: italic; }
      .draggable-label:hover { fill: #2563eb; font-weight: bold; }
    </style>
  </defs>

  <!-- ================= 1. HỆ TRỤC TỌA ĐỘ d - t ================= -->
  <!-- Trục tung d(m) -->
  <line id="axis-d" x1="100" y1="410" x2="100" y2="60" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-gk)" />
  <text class="draggable-label" id="label-axis-d" x="110" y="55" font-size="20" font-weight="bold" fill="#0f172a">d(m)</text>

  <!-- Trục hoành t(s) -->
  <line id="axis-t" x1="80" y1="390" x2="650" y2="390" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-gk)" />
  <text class="draggable-label" id="label-axis-t" x="655" y="380" font-size="20" font-weight="bold" fill="#0f172a">t(s)</text>

  <!-- Gốc tọa độ 0 -->
  <text class="draggable-label" id="label-0" x="88" y="410" font-size="18" font-weight="bold">0</text>

  <!-- Vạch chia trục d: 10, 20 -->
  <line x1="94" y1="260" x2="106" y2="260" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-val-10" x="82" y="266" font-size="18" font-weight="bold" text-anchor="end">10</text>

  <line x1="94" y1="130" x2="106" y2="130" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-val-20" x="82" y="136" font-size="18" font-weight="bold" text-anchor="end">20</text>

  <!-- Vạch chia trục t: 1, 2, 3, 4, 5, 6 -->
  <line x1="175" y1="384" x2="175" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-1" x="175" y="416" font-size="18" font-weight="bold" text-anchor="middle">1</text>

  <line x1="250" y1="384" x2="250" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-2" x="250" y="416" font-size="18" font-weight="bold" text-anchor="middle">2</text>

  <line x1="325" y1="384" x2="325" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-3" x="325" y="416" font-size="18" font-weight="bold" text-anchor="middle">3</text>

  <line x1="400" y1="384" x2="400" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-4" x="400" y="416" font-size="18" font-weight="bold" text-anchor="middle">4</text>

  <line x1="475" y1="384" x2="475" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-5" x="475" y="416" font-size="18" font-weight="bold" text-anchor="middle">5</text>

  <line x1="550" y1="384" x2="550" y2="396" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-t-6" x="550" y="416" font-size="18" font-weight="bold" text-anchor="middle">6</text>


  <!-- ================= 2. ĐƯỜNG DÓNG NÉT ĐỨT (PROJECTION LINES) ================= -->
  <!-- Dóng B: d=10 sang B(250, 260) và B xuống t=2(250, 390) -->
  <line id="proj-b-h" x1="100" y1="260" x2="250" y2="260" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />
  <line id="proj-b-v" x1="250" y1="260" x2="250" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />

  <!-- Dóng C: d=20 sang C(325, 130) và C xuống t=3(325, 390) -->
  <line id="proj-c-h" x1="100" y1="130" x2="325" y2="130" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />
  <line id="proj-c-v" x1="325" y1="130" x2="325" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />

  <!-- Dóng D: D(400, 130) xuống t=4(400, 390) -->
  <line id="proj-d-v" x1="400" y1="130" x2="400" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />


  <!-- ================= 3. ĐỒ THỊ CHÍNH (NÉT ĐẬM CHUẨN ĐỀ THI) ================= -->
  <!-- Đoạn AB: Parabol đỉnh A(100, 390) đến B(250, 260), tiếp tuyến hoàn hảo tại B -->
  <path id="curve-ab" d="M 100 390 Q 175 390 250 260" fill="none" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />

  <!-- Đoạn BC: Đoạn thẳng từ B(250, 260) lên C(325, 130) -->
  <line id="line-bc" x1="250" y1="260" x2="325" y2="130" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />

  <!-- Đoạn CD: Đoạn thẳng nằm ngang từ C(325, 130) sang D(400, 130) -->
  <line id="line-cd" x1="325" y1="130" x2="400" y2="130" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />

  <!-- Đoạn DE: Đoạn thẳng dốc xuống từ D(400, 130) về E(550, 390) -->
  <line id="line-de" x1="400" y1="130" x2="550" y2="390" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />


  <!-- ================= 4. ĐIỂM CHỐT TƯƠNG TÁC (INTERACTIVE ANCHORS) & TÊN ĐIỂM ================= -->
  <!-- Điểm A(100, 390) -->
  <circle class="graph-anchor" id="anchor-A" cx="100" cy="390" r="5" data-point="A" />
  <text class="draggable-label" id="label-A" x="78" y="385" font-size="22" font-weight="bold">A</text>

  <!-- Điểm B(250, 260) -->
  <circle class="graph-anchor" id="anchor-B" cx="250" cy="260" r="5" data-point="B" />
  <text class="draggable-label" id="label-B" x="228" y="250" font-size="22" font-weight="bold">B</text>

  <!-- Điểm C(325, 130) -->
  <circle class="graph-anchor" id="anchor-C" cx="325" cy="130" r="5" data-point="C" />
  <text class="draggable-label" id="label-C" x="315" y="112" font-size="22" font-weight="bold">C</text>

  <!-- Điểm D(400, 130) -->
  <circle class="graph-anchor" id="anchor-D" cx="400" cy="130" r="5" data-point="D" />
  <text class="draggable-label" id="label-D" x="405" y="112" font-size="22" font-weight="bold">D</text>

  <!-- Điểm E(550, 390) -->
  <circle class="graph-anchor" id="anchor-E" cx="550" cy="390" r="5" data-point="E" />
  <text class="draggable-label" id="label-E" x="555" y="380" font-size="22" font-weight="bold">E</text>
</svg>`,
    tikz: `\\begin{tikzpicture}[scale=1.1, >=stealth, font=\\small]
  % Trục tọa độ
  \\draw[->, thick] (0,0) -- (7.0,0) node[right] {$t(\\text{s})$};
  \\draw[->, thick] (0,0) -- (0,5.0) node[above] {$d(\\text{m})$};
  \\node[below left] at (0,0) {$0$};

  % Vạch chia trục d
  \\draw (0, 2.0) -- (-0.1, 2.0) node[left] {$10$};
  \\draw (0, 4.0) -- (-0.1, 4.0) node[left] {$20$};

  % Vạch chia trục t
  \\foreach \\t in {1, 2, 3, 4, 5, 6} {
    \\draw (\\t, 0) -- (\\t, -0.1) node[below] {$\\t$};
  }

  % Đường dóng nét đứt
  \\draw[dashed, color=gray!80, line width=0.6pt] (0,2.0) -- (2.0,2.0) -- (2.0,0);
  \\draw[dashed, color=gray!80, line width=0.6pt] (0,4.0) -- (3.0,4.0) -- (3.0,0);
  \\draw[dashed, color=gray!80, line width=0.6pt] (4.0,4.0) -- (4.0,0);

  % Đồ thị: Đoạn AB (Parabol d = 2.5 t^2), đoạn BC (đoạn thẳng), đoạn CD (nằm ngang), đoạn DE (dốc xuống)
  \\draw[very thick, domain=0:2, smooth, variable=\\t] plot ({\\t}, {0.5*\\t*\\t});
  \\draw[very thick] (2.0, 2.0) -- (3.0, 4.0);
  \\draw[very thick] (3.0, 4.0) -- (4.0, 4.0);
  \\draw[very thick] (4.0, 4.0) -- (6.0, 0);

  % Điểm và tên điểm
  \\fill (0,0) circle (2pt) node[above left] {$A$};
  \\fill (2.0, 2.0) circle (2pt) node[above left] {$B$};
  \\fill (3.0, 4.0) circle (2pt) node[above left] {$C$};
  \\fill (4.0, 4.0) circle (2pt) node[above right] {$D$};
  \\fill (6.0, 0) circle (2pt) node[above right] {$E$};
\\end{tikzpicture}`
  },

  paper_tape: {
    title: "Phân Tích Chuyển Động Trên Băng Giấy (Vật Lí 10)",
    svg: `<svg id="main-paper-tape-svg" viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <style>
      .draggable-dot { cursor: grab; transition: r 0.1s; }
      .draggable-dot:hover { stroke: #2563eb; stroke-width: 3px; cursor: grab; }
      .draggable-dot:active { cursor: grabbing; fill: #2563eb; }
      .draggable-text { cursor: move; user-select: none; }
      .draggable-text:hover { fill: #2563eb; font-weight: bold; }
    </style>
  </defs>

  <!-- ================= BĂNG 1 (HÌNH 1: CHUYỂN ĐỘNG THẲNG ĐỀU) ================= -->
  <g id="tape-1-group">
    <!-- Thân băng giấy với 2 đầu nét răng cưa zigzag (như mép giấy bị xé rách) -->
    <path d="M 60,30 L 55,34.6 L 65,39.2 L 55,43.8 L 65,48.4 L 55,53 L 65,57.6 L 55,62.2 L 65,66.8 L 55,71.4 L 60,76 L 690,76 L 685,71.4 L 695,66.8 L 685,62.2 L 695,57.6 L 685,53 L 695,48.4 L 685,43.8 L 695,39.2 L 685,34.6 L 690,30 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    
    <!-- Vạch mốc thời gian đứng qua số 0 -->
    <line x1="100" y1="18" x2="100" y2="88" stroke="#000000" stroke-width="2.2" />
    <text class="draggable-text" x="86" y="58" font-size="19" font-weight="bold" text-anchor="end">0</text>
    <circle class="draggable-dot" cx="100" cy="53" r="4.5" fill="#000000" />
    
    <!-- Các chấm cách đều nhau (chuyển động thẳng đều) -->
    <circle class="draggable-dot" cx="185" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="270" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="355" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="440" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="525" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="610" cy="53" r="4.2" fill="#000000" />
    
    <!-- Nhãn Hình 1 -->
    <text class="draggable-text" x="375" y="105" font-size="16" font-weight="bold" text-anchor="middle">Hình 1</text>
  </g>

  <!-- ================= BĂNG 2 (HÌNH 2: CHUYỂN ĐỘNG NHANH DẦN ĐỀU) ================= -->
  <g id="tape-2-group">
    <path d="M 60,135 L 55,139.6 L 65,144.2 L 55,148.8 L 65,153.4 L 55,158 L 65,162.6 L 55,167.2 L 65,171.8 L 55,176.4 L 60,181 L 690,181 L 685,176.4 L 695,171.8 L 685,167.2 L 695,162.6 L 685,158 L 695,153.4 L 685,148.8 L 695,144.2 L 685,139.6 L 690,135 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    
    <line x1="100" y1="123" x2="100" y2="193" stroke="#000000" stroke-width="2.2" />
    <text class="draggable-text" x="86" y="163" font-size="19" font-weight="bold" text-anchor="end">0</text>
    <circle class="draggable-dot" cx="100" cy="158" r="4.5" fill="#000000" />
    
    <!-- Các chấm khoảng cách dãn dần đều (gia tốc lớn) -->
    <circle class="draggable-dot" cx="128" cy="158" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="180" cy="158" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="260" cy="158" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="370" cy="158" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="510" cy="158" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="660" cy="158" r="4.2" fill="#000000" />
    
    <text class="draggable-text" x="375" y="210" font-size="16" font-weight="bold" text-anchor="middle">Hình 2</text>
  </g>

  <!-- ================= BĂNG 3 (HÌNH 3: CHUẨN XÁC 100% THEO ĐỀ BÀI GỐC SGK) ================= -->
  <g id="tape-3-group">
    <path d="M 60,240 L 55,244.6 L 65,249.2 L 55,253.8 L 65,258.4 L 55,263 L 65,267.6 L 55,272.2 L 65,276.8 L 55,281.4 L 60,286 L 690,286 L 685,281.4 L 695,276.8 L 685,272.2 L 695,267.6 L 685,263 L 695,258.4 L 685,253.8 L 695,249.2 L 685,244.6 L 690,240 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    
    <line x1="100" y1="228" x2="100" y2="298" stroke="#000000" stroke-width="2.2" />
    <text class="draggable-text" x="86" y="268" font-size="19" font-weight="bold" text-anchor="end">0</text>
    <circle class="draggable-dot" cx="100" cy="263" r="4.5" fill="#000000" />
    
    <!-- Các chấm theo đúng ảnh gốc SGK: chấm đầu xa rồi sít dần về bên phải -->
    <circle class="draggable-dot" cx="260" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="390" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="490" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="560" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="610" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="640" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="660" cy="263" r="4.2" fill="#000000" />
    
    <text class="draggable-text" x="375" y="315" font-size="16" font-weight="bold" text-anchor="middle">Hình 3</text>
  </g>
</svg>`,
    tikz: `\\begin{tikzpicture}[scale=0.9, >=stealth, font=\\small]
  \\usetikzlibrary{decorations.pathmorphing}
  
  % --- BĂNG 1: Chuyển động thẳng đều ---
  \\draw[thick, fill=white] (0.8, 4.0) -- (10.0, 4.0);
  \\draw[thick] (0.8, 3.2) -- (10.0, 3.2);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (0.8, 4.0) -- (0.8, 3.2);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (10.0, 4.0) -- (10.0, 3.2);
  \\draw[very thick] (1.5, 4.2) -- (1.5, 3.0);
  \\node[left] at (1.45, 3.6) {\\textbf{0}};
  \\foreach \\x in {1.5, 2.8, 4.1, 5.4, 6.7, 8.0, 9.3} {
    \\fill (\\x, 3.6) circle (2.2pt);
  }
  \\node[below] at (5.4, 3.0) {\\textbf{Hình 1}};

  % --- BĂNG 2: Chuyển động nhanh dần đều ---
  \\draw[thick, fill=white] (0.8, 2.2) -- (10.0, 2.2);
  \\draw[thick] (0.8, 1.4) -- (10.0, 1.4);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (0.8, 2.2) -- (0.8, 1.4);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (10.0, 2.2) -- (10.0, 1.4);
  \\draw[very thick] (1.5, 2.4) -- (1.5, 1.2);
  \\node[left] at (1.45, 1.8) {\\textbf{0}};
  \\foreach \\x in {1.5, 1.9, 2.7, 3.9, 5.6, 7.7, 9.6} {
    \\fill (\\x, 1.8) circle (2.2pt);
  }
  \\node[below] at (5.4, 1.2) {\\textbf{Hình 2}};

  % --- BĂNG 3: Chuẩn ảnh gốc SGK ---
  \\draw[thick, fill=white] (0.8, 0.4) -- (10.0, 0.4);
  \\draw[thick] (0.8, -0.4) -- (10.0, -0.4);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (0.8, 0.4) -- (0.8, -0.4);
  \\draw[thick, decorate, decoration={zigzag, segment length=6pt, amplitude=3pt}] (10.0, 0.4) -- (10.0, -0.4);
  \\draw[very thick] (1.5, 0.6) -- (1.5, -0.6);
  \\node[left] at (1.45, 0.0) {\\textbf{0}};
  \\foreach \\x in {1.5, 4.0, 6.0, 7.5, 8.5, 9.1, 9.5, 9.8} {
    \\fill (\\x, 0.0) circle (2.2pt);
  }
  \\node[below] at (5.4, -0.6) {\\textbf{Hình 3}};
\\end{tikzpicture}`
  },

  house3d: {
    title: "Mô Hình Ngôi Nhà 3D & Ánh Sáng Mặt Trời Trong Hệ Tọa Độ Oxyz (Toán 12)",
    svg: `<svg width="860" height="540" viewBox="0 0 860 540" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <!-- Mặt trời 3D gradient -->
    <radialGradient id="sun3d" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="40%" stop-color="#FACC15"/>
      <stop offset="85%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </radialGradient>

    <!-- Mẫu vân ngói lượn sóng chuẩn SGK -->
    <pattern id="roofTiles" width="16" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
      <path d="M 0 0 L 16 0 M 0 5 L 16 5 M 0 10 L 16 10" stroke="#7C2D12" stroke-width="0.8"/>
      <path d="M 4 0 L 4 5 M 12 5 L 12 10" stroke="#9A3412" stroke-width="0.6"/>
    </pattern>

    <!-- Mũi tên trục toạ độ màu xanh dương đậm -->
    <marker id="arrowOxyz" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0369A1"/>
    </marker>
    <!-- Mũi tên tia sáng v -->
    <marker id="arrowRay" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284C7"/>
    </marker>
    <!-- Mũi tên kích thước 2 đầu -->
    <marker id="dimArr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 2 L 6 5 L 0 8 z" fill="#334155"/>
    </marker>
    <marker id="dimArrRev" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 2 L 6 5 L 0 8 z" fill="#334155"/>
    </marker>
  </defs>

  <!-- NỀN TRẮNG SÁCH GIÁO KHOA -->
  <rect width="860" height="540" fill="#FFFFFF"/>

  <!-- MẶT TRỜI HÌNH CẦU 3D VÀ TIA SÁNG VECTƠ v -->
  <g transform="translate(135, 70)">
    <!-- Quả cầu mặt trời 3D vàng rực -->
    <circle cx="0" cy="0" r="28" fill="url(#sun3d)"/>
    <!-- Tia sáng xiên chúc xuống mái nhà -->
    <line x1="26" y1="26" x2="68" y2="68" stroke="#0284C7" stroke-width="2.8" marker-end="url(#arrowRay)"/>
    <!-- Ký hiệu vectơ v -->
    <g transform="translate(62, 28)">
      <text font-style="italic" font-weight="bold" font-size="19" fill="#0284C7">v</text>
      <line x1="2" y1="-14" x2="16" y2="-14" stroke="#0284C7" stroke-width="1.8"/>
      <polygon points="17,-14 13,-17 13,-11" fill="#0284C7"/>
    </g>
  </g>

  <!-- ============================================================ -->
  <!-- 1. MÔ HÌNH NGÔI NHÀ 3D CHUẨN XÁC 100% THEO HÌNH GỐC SGK -->
  <!-- ============================================================ -->

  <!-- A. MẶT BÊN PHẢI (ĐẦU HỒI PHẢI HÌNH NGŨ GIÁC) -->
  <!-- P(480, 420) -> Q(680, 290) -> N(680, 130) -> G(575, 55) -> F(480, 260) -->
  <polygon points="480,420 680,290 680,130 575,55 480,260" fill="#FEF08A" stroke="#1E293B" stroke-width="2"/>

  <!-- 4 CỬA SỔ HÌNH BÌNH HÀNH BÊN HÔNG PHẢI -->
  <!-- Tầng 2 bên hông -->
  <polygon points="535,210 575,185 575,145 535,170" fill="#67E8F9" stroke="#0E7490" stroke-width="1.4"/>
  <polygon points="620,158 660,133 660,93 620,118" fill="#67E8F9" stroke="#0E7490" stroke-width="1.4"/>
  <!-- Tầng 1 bên hông -->
  <polygon points="535,285 575,260 575,220 535,245" fill="#67E8F9" stroke="#0E7490" stroke-width="1.4"/>
  <polygon points="620,233 660,208 660,168 620,193" fill="#67E8F9" stroke="#0E7490" stroke-width="1.4"/>

  <!-- B. MÁI NGÓI DỐC MẶT TRƯỚC (HÌNH BÌNH HÀNH E-H-G-F) -->
  <!-- E(170, 260) -> H(265, 55) -> G(575, 55) -> F(480, 260) -->
  <polygon points="170,260 265,55 575,55 480,260" fill="#C2410C" stroke="#1E293B" stroke-width="2.2"/>
  <polygon points="170,260 265,55 575,55 480,260" fill="url(#roofTiles)" opacity="0.6"/>

  <!-- Đường sống mái nằm ngang HG -->
  <line x1="265" y1="55" x2="575" y2="55" stroke="#1E293B" stroke-width="2.5"/>
  <!-- Mép mái dốc bên trái EH -->
  <line x1="170" y1="260" x2="265" y2="55" stroke="#1E293B" stroke-width="2.5"/>
  <!-- Mép mái trước nằm ngang EF -->
  <line x1="165" y1="260" x2="485" y2="260" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
  <line x1="165" y1="260" x2="485" y2="260" stroke="#1E293B" stroke-width="2"/>

  <!-- C. MẶT TIỀN NHÀ (HÌNH CHỮ NHẬT 8m x 4m) -->
  <!-- O(170, 420) -> P(480, 420) -> F(480, 260) -> E(170, 260) -->
  <polygon points="170,420 480,420 480,260 170,260" fill="#FEF9C3" stroke="#1E293B" stroke-width="2.2"/>

  <!-- CỬA CHÍNH TẦNG 1 (Ở GIỮA) -->
  <rect x="295" y="325" width="55" height="95" fill="#D97706" stroke="#1E293B" stroke-width="1.8"/>
  <line x1="309" y1="325" x2="309" y2="420" stroke="#78350F" stroke-width="1.4"/>
  <line x1="323" y1="325" x2="323" y2="420" stroke="#78350F" stroke-width="1.4"/>
  <line x1="337" y1="325" x2="337" y2="420" stroke="#78350F" stroke-width="1.4"/>
  <circle cx="302" cy="375" r="2.2" fill="#1E293B"/>
  <!-- Hộp thư / ô nhỏ cạnh cửa -->
  <rect x="282" y="365" width="8" height="6" fill="#1E293B"/>

  <!-- CỬA SỔ TẦNG TRỆT BÊN TRÁI (4 Ô KÍNH XANH) -->
  <rect x="195" y="340" width="65" height="48" fill="#67E8F9" stroke="#1E293B" stroke-width="1.6"/>
  <line x1="227" y1="340" x2="227" y2="388" stroke="#1E293B" stroke-width="1.4"/>
  <line x1="195" y1="364" x2="260" y2="364" stroke="#1E293B" stroke-width="1.4"/>

  <!-- CỬA SỔ TẦNG TRỆT BÊN PHẢI (Ô MÀU XÁM TỐI) -->
  <rect x="380" y="340" width="65" height="48" fill="#64748B" stroke="#1E293B" stroke-width="1.6"/>

  <!-- CỬA SỔ TẦNG 2 BÊN TRÁI (4 Ô KÍNH XANH) -->
  <rect x="195" y="278" width="65" height="48" fill="#67E8F9" stroke="#1E293B" stroke-width="1.6"/>
  <line x1="227" y1="278" x2="227" y2="326" stroke="#1E293B" stroke-width="1.4"/>
  <line x1="195" y1="302" x2="260" y2="302" stroke="#1E293B" stroke-width="1.4"/>

  <!-- CỬA SỔ TẦNG 2 BÊN PHẢI (KÍNH CHIA 3 CÁNH MỞ HÉ) -->
  <rect x="380" y="278" width="65" height="48" fill="#67E8F9" stroke="#1E293B" stroke-width="1.6"/>
  <polygon points="380,326 412,310 445,326" fill="#38BDF8" stroke="#1E293B" stroke-width="1.2"/>
  <line x1="412" y1="278" x2="412" y2="310" stroke="#1E293B" stroke-width="1.2"/>

  <!-- 2 Ô VUÔNG THÔNG GIÓ TRẮNG NHỎ Ở GIỮA TẦNG 2 -->
  <rect x="296" y="288" width="16" height="16" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.3"/>
  <rect x="322" y="288" width="16" height="16" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.3"/>

  <!-- D. THANH VẬT THỂ AB VÀ BÓNG CỦA NÓ TRÊN MÁI NGÓI -->
  <!-- Điểm A cắm trên mặt mái dốc tại (305, 175) -->
  <!-- Thanh AB thẳng đứng màu trắng viền đen từ (305, 175) lên (305, 120) -->
  <!-- Bóng của thanh AB kéo dài từ A(305, 175) xiên xuống phải đến (365, 230) -->
  <line x1="305" y1="175" x2="365" y2="230" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
  <!-- Thanh AB trắng viền đen -->
  <line x1="305" y1="175" x2="305" y2="120" stroke="#1E293B" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="305" y1="175" x2="305" y2="120" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Nút điểm A và B -->
  <circle cx="305" cy="175" r="2.5" fill="#1E293B"/>
  <circle cx="305" cy="120" r="2.5" fill="#1E293B"/>
  <text x="296" y="202" font-style="italic" font-weight="bold" font-size="17" fill="#1E293B">A</text>
  <text x="296" y="112" font-style="italic" font-weight="bold" font-size="17" fill="#1E293B">B</text>

  <!-- ============================================================ -->
  <!-- 2. HỆ TRỤC TỌA ĐỘ Oxyz TẠI GỐC O (GÓC DƯỚI BÊN TRÁI MẶT TIỀN) -->
  <!-- ============================================================ -->
  <!-- Gốc O -->
  <text x="142" y="442" font-style="italic" font-weight="bold" font-size="22" fill="#0284C7">O</text>

  <!-- Trục Ox (Dọc theo chân tường mặt trước sang phải) -->
  <line x1="170" y1="420" x2="225" y2="420" stroke="#0284C7" stroke-width="3" marker-end="url(#arrowOxyz)"/>

  <!-- Trục Oz (Thẳng đứng hướng lên theo cột tường trái) -->
  <line x1="170" y1="420" x2="170" y2="365" stroke="#0284C7" stroke-width="3" marker-end="url(#arrowOxyz)"/>

  <!-- Trục Oy (Xiên chúc xuống bên trái hướng ra phía trước người quan sát) -->
  <line x1="170" y1="420" x2="135" y2="455" stroke="#0284C7" stroke-width="3" marker-end="url(#arrowOxyz)"/>

  <!-- ============================================================ -->
  <!-- 3. CÁC ĐIỂM ĐỈNH NHÃN CHỮ TOÁN HỌC (E, F, H, G) -->
  <!-- ============================================================ -->
  <!-- Điểm E (Góc trên trái mặt tiền) -->
  <text x="146" y="258" font-style="italic" font-weight="bold" font-size="20" fill="#1E293B">E</text>

  <!-- Điểm F (Góc trên phải mặt tiền) -->
  <text x="492" y="272" font-style="italic" font-weight="bold" font-size="20" fill="#1E293B">F</text>

  <!-- Điểm H (Đỉnh đầu hồi bên trái) -->
  <text x="254" y="50" font-style="italic" font-weight="bold" font-size="21" fill="#1E293B">H</text>

  <!-- Điểm G (Đỉnh đầu hồi bên phải) -->
  <text x="562" y="50" font-style="italic" font-weight="bold" font-size="21" fill="#1E293B">G</text>

  <!-- ============================================================ -->
  <!-- 4. CÁC ĐƯỜNG KÍCH THƯỚC CHUẨN XÁC Y HỆT ẢNH SGK -->
  <!-- ============================================================ -->
  <!-- Kích thước 4m: Chiều cao cột tường bên trái (bên cạnh OE) -->
  <line x1="152" y1="420" x2="152" y2="260" stroke="#334155" stroke-width="1.3" marker-start="url(#dimArrRev)" marker-end="url(#dimArr)"/>
  <text x="135" y="348" font-size="16" font-weight="bold" fill="#0F172A" text-anchor="end">4 m</text>

  <!-- Kích thước 8m: Chiều rộng mặt trước (dưới đáy OP) -->
  <line x1="170" y1="438" x2="480" y2="438" stroke="#334155" stroke-width="1.3" marker-start="url(#dimArrRev)" marker-end="url(#dimArr)"/>
  <text x="325" y="468" font-size="17" font-weight="bold" fill="#0F172A" text-anchor="middle">8 m</text>

  <!-- Kích thước 8m: Chiều sâu bên hông phải (dọc cạnh đáy PQ) -->
  <line x1="500" y1="435" x2="695" y2="308" stroke="#334155" stroke-width="1.3" marker-start="url(#dimArrRev)" marker-end="url(#dimArr)"/>
  <text x="618" y="388" font-size="17" font-weight="bold" fill="#0F172A">8 m</text>

  <!-- Kích thước 4m: Chiều cao cột tường sau bên phải -->
  <line x1="695" y1="290" x2="695" y2="130" stroke="#334155" stroke-width="1.3" marker-start="url(#dimArrRev)" marker-end="url(#dimArr)"/>
  <text x="708" y="215" font-size="16" font-weight="bold" fill="#0F172A">4 m</text>

  <!-- Kích thước 2m: Chiều cao mái dóng từ đỉnh G thẳng đứng xuống -->
  <!-- Từ đỉnh G(575, 55) dóng thẳng xuống trần (575, 145) có nét ngang dóng sang -->
  <line x1="575" y1="55" x2="575" y2="145" stroke="#1E293B" stroke-width="1.4"/>
  <line x1="565" y1="145" x2="585" y2="145" stroke="#1E293B" stroke-width="1.4"/>
  <text x="585" y="105" font-size="16" font-weight="bold" fill="#0F172A">2 m</text>
</svg>`,
    tikz: `% Mô hình ngôi nhà 3D và bóng mặt trời trong không gian Oxyz (Chuẩn SGK Toán 12)
\\begin{tikzpicture}[scale=0.85, >=stealth, font=\\footnotesize, line cap=round, line join=round]
  % Hệ trục tọa độ Oxyz tại gốc O
  \\coordinate (O) at (0,0);
  \\coordinate (P) at (7,0);
  \\coordinate (F) at (7,3.5);
  \\coordinate (E) at (0,3.5);
  \\coordinate (Q) at (10,1.8);
  \\coordinate (N) at (10,5.3);
  \\coordinate (G) at (8.5,6.5);
  \\coordinate (H) at (1.5,6.5);

  % Mái ngói trước (E - H - G - F)
  \\fill[orange!85!brown] (E) -- (H) -- (G) -- (F) -- cycle;
  % Mặt tiền (O - P - F - E)
  \\fill[yellow!20] (O) -- (P) -- (F) -- (E) -- cycle;
  % Mặt bên phải (P - Q - N - G - F)
  \\fill[yellow!40] (P) -- (Q) -- (N) -- (G) -- (F) -- cycle;

  % Đường nét viền
  \\draw[thick] (O) -- (P) -- (F) -- (E) -- cycle;
  \\draw[thick] (P) -- (Q) -- (N) -- (G) -- (F);
  \\draw[thick] (E) -- (H) -- (G);

  % Cửa chính và cửa sổ
  \\fill[brown!70!black] (3.0,0) rectangle (4.0,2.0);
  \\draw[thick] (3.0,0) rectangle (4.0,2.0);
  \\fill[cyan!30] (0.7,0.5) rectangle (2.1,1.5);
  \\draw (0.7,0.5) rectangle (2.1,1.5);
  \\fill[gray!50] (4.9,0.5) rectangle (6.3,1.5);
  \\draw (4.9,0.5) rectangle (6.3,1.5);
  \\fill[cyan!30] (0.7,2.0) rectangle (2.1,3.0);
  \\draw (0.7,2.0) rectangle (2.1,3.0);
  \\fill[cyan!30] (4.9,2.0) rectangle (6.3,3.0);
  \\draw (4.9,2.0) rectangle (6.3,3.0);

  % Cột AB trên mái ngói và bóng đổ
  \\coordinate (A) at (3.2,4.6);
  \\coordinate (B) at (3.2,5.7);
  \\draw[ultra thick, black] (A) -- (4.6,3.8); % Vệt bóng đổ của AB
  \\draw[ultra thick, white] (A) -- (B);
  \\draw[thick, black] (A) -- (B);
  \\fill (A) circle (2pt) node[below] {$A$};
  \\fill (B) circle (2pt) node[above] {$B$};

  % Trục tọa độ Oxyz (x sang phải, z lên trên, y chúc xuống trái)
  \\draw[->, ultra thick, blue!80!black] (O) -- (2.2,0) node[below] {$x$};
  \\draw[->, ultra thick, blue!80!black] (O) -- (0,2.2) node[left] {$z$};
  \\draw[->, ultra thick, blue!80!black] (O) -- (-1.0,-0.7) node[below left] {$y$};
  \\node[blue!80!black, below left] at (O) {$O$};

  % Nhãn các đỉnh
  \\node[left] at (E) {$E$};
  \\node[right] at (F) {$F$};
  \\node[above] at (H) {$H$};
  \\node[above] at (G) {$G$};

  % Các đường kích thước 8m, 4m, 2m
  \\draw[<->] (O) ++(-0.5,0) -- ++(0,3.5) node[midway, left] {$4\\text{ m}$};
  \\draw[<->] (O) ++(0,-0.5) -- ++(7,0) node[midway, below] {$8\\text{ m}$};
  \\draw[<->] (P) ++(0.3,-0.2) -- ++(3,1.8) node[midway, below right] {$8\\text{ m}$};
  \\draw[<->] (Q) ++(0.5,0) -- ++(0,3.5) node[midway, right] {$4\\text{ m}$};
  \\draw[dashed] (G) -- (8.5,4.7) node[midway, right] {$2\\text{ m}$};
\\end{tikzpicture}`
  },
  airship43: {
    title: "Khinh Khí Cầu, Trực Thăng & Tường Sương Mù Oxyz (Toán 12 - Câu 43)",
    svg: `<svg width="920" height="600" viewBox="0 0 920 600" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <!-- Mặt đất phối cảnh 3D -->
    <linearGradient id="groundP" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#6ee7b7" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#34d399" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Dãy núi địa hình 3D -->
    <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="25%" stop-color="#fde68a"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="mountainShadow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#78350f" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#b45309" stop-opacity="0.1"/>
    </linearGradient>

    <!-- Bức tường sương mù E_ABC bán trong suốt -->
    <linearGradient id="fogMist" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.75"/>
      <stop offset="50%" stop-color="#94a3b8" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#64748b" stop-opacity="0.35"/>
    </linearGradient>

    <!-- Thân khinh khí cầu dạng khí cầu thoi 3D -->
    <radialGradient id="blimpGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="35%" stop-color="#7dd3fc"/>
      <stop offset="75%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <!-- Thân máy bay trực thăng màu vàng cam cứu hộ -->
    <linearGradient id="heliGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>

    <!-- Kính buồng lái trực thăng -->
    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <!-- Mũi tên trục toạ độ -->
    <marker id="axisArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a"/>
    </marker>
  </defs>

  <!-- NỀN TRẮNG SÁCH GIÁO KHOA -->
  <rect width="920" height="600" fill="#FFFFFF"/>

  <!-- TIÊU ĐỀ BÀI TOÁN CÂU 43 -->
  <g transform="translate(30, 28)">
    <text font-family="Arial, sans-serif" font-size="14.5" font-weight="bold" fill="#0F172A">
      CÂU 43: QUỸ ĐẠO KHÍ CẦU &amp; TRỰC THĂNG TRONG HỆ TỌA ĐỘ Oxyz
    </text>
    <text y="18" font-family="Arial, sans-serif" font-size="11.5" fill="#64748B">
      Khinh khí cầu l: L(24; 52; 0) → P(20; 42; 2) → Tường sương mù N • Trực thăng h: F(20; -8; 0) → Đỉnh núi S(-4; 32; 16)
    </text>
  </g>

  <!-- ============================================================ -->
  <!-- 1. MẶT PHẲNG ĐÁY MẶT ĐẤT (Oxy) VỚI PHỐI CẢNH 3D -->
  <!-- ============================================================ -->
  <polygon points="160,500 710,440 840,515 280,580" fill="${groundFill}" stroke="${groundBorder}" stroke-width="1.8"/>
  <!-- Lưới phối cảnh mặt đất -->
  <line x1="280" y1="486" x2="745" y2="460" stroke="#059669" stroke-width="0.8" opacity="0.4"/>
  <line x1="220" y1="540" x2="775" y2="480" stroke="#059669" stroke-width="0.8" opacity="0.4"/>

  <!-- ============================================================ -->
  <!-- 2. DÃY NÚI ĐỊA HÌNH 3D PHÍA SAU (BÊN PHẢI) -->
  <!-- ============================================================ -->
  <!-- Khối núi chính với đỉnh S tại (540, 130) -->
  <path d="M 345,395 Q 420,240 540,130 Q 610,210 680,260 Q 750,220 830,440 L 345,440 Z" fill="${mountainBody}" stroke="${mountainRidge}" stroke-width="2"/>
  <!-- Vùng đổ bóng sườn núi phía đông -->
  <path d="M 540,130 Q 570,220 640,320 L 680,260 Z" fill="${mountainShadow}"/>
  <!-- Nếp gấp và sườn núi phụ -->
  <path d="M 680,260 Q 730,190 790,270 Q 820,330 845,440" fill="none" stroke="${mountainRidge}" stroke-width="1.6"/>
  <path d="M 540,130 Q 510,230 460,330" fill="none" stroke="${mountainRidge}" stroke-width="1.4" opacity="0.7"/>
  <path d="M 540,130 Q 550,210 590,300" fill="none" stroke="${mountainRidge}" stroke-width="1.4" opacity="0.7"/>
  <path d="M 730,190 Q 750,250 780,360" fill="none" stroke="${mountainRidge}" stroke-width="1.2" opacity="0.6"/>

  <!-- ĐỈNH NÚI S(-4; 32; 16) TẠI (540, 130) -->
  <circle cx="540" cy="130" r="5" fill="#1E293B"/>
  <text x="555" y="128" font-style="italic" font-weight="bold" font-size="22" fill="#0F172A">S</text>

  <!-- ============================================================ -->
  <!-- 3. HỆ TRỤC TỌA ĐỘ Oxyz -->
  <!-- ============================================================ -->
  <!-- Gốc tọa độ O tại (310, 360) -->
  <!-- Trục Z (Thẳng đứng lên trên) -->
  <line x1="310" y1="360" x2="310" y2="70" stroke="#0F172A" stroke-width="2.2" marker-end="url(#axisArrow)"/>
  <text x="290" y="65" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">Z</text>

  <!-- Trục X (Xiên chúc xuống phía dưới bên trái) -->
  <line x1="310" y1="360" x2="165" y2="525" stroke="#0F172A" stroke-width="2.2" marker-end="url(#axisArrow)"/>
  <text x="145" y="538" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">X</text>

  <!-- Trục Y (Xiên chúc sang bên phải theo mặt đất) -->
  <line x1="310" y1="360" x2="815" y2="445" stroke="#0F172A" stroke-width="2.2" marker-end="url(#axisArrow)"/>
  <text x="825" y="455" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">Y</text>

  <!-- ============================================================ -->
  <!-- 4. BỨC TƯỜNG SƯƠNG MÙ (MẶT PHẲNG E_ABC) -->
  <!-- A(16;0;0) tại (235, 445), B(0;16;0) tại (465, 385), C(0;0;16) tại (310, 145) -->
  <!-- ============================================================ -->
  <polygon points="235,445 465,385 310,145" fill="${fogFill}" stroke="#64748B" stroke-width="2"/>
  <line x1="235" y1="445" x2="465" y2="385" stroke="#475569" stroke-width="1.8" stroke-dasharray="4,3"/>

  <!-- ============================================================ -->
  <!-- 5. QUỸ ĐẠO TRỰC THĂNG h: SÂN BAY F(20; -8; 0) -> ĐỈNH NÚI S -->
  <!-- ============================================================ -->
  <!-- Điểm F trên mặt đất tại (215, 470) -->
  <circle cx="215" cy="470" r="4.5" fill="#0F172A"/>
  <text x="195" y="492" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">F</text>

  <!-- Đường bay thẳng màu đỏ của trực thăng từ F lên S -->
  <line x1="215" y1="470" x2="540" y2="130" stroke="${redLine}" stroke-width="2.8"/>

  <!-- HÌNH VẼ MÁY BAY TRỰC THĂNG CỨU HỘ VÀNG CAM TẠI (295, 385) -->
  <g transform="translate(290, 380) rotate(-46)">
    <!-- Thân máy bay (fuselage) -->
    <path d="M -16,-7 C 6,-9 22,-5 22,2 C 22,9 6,11 -16,8 Z" fill="${heliColor}" stroke="#78350F" stroke-width="1.4"/>
    <!-- Kính buồng lái (cockpit windshield) -->
    <path d="M 6,-6 C 14,-6 20,-2 20,2 C 16,3 10,2 6,-6 Z" fill="url(#glassGrad)" stroke="#0369A1" stroke-width="0.8"/>
    <!-- Trục cánh quạt chính -->
    <line x1="4" y1="-8" x2="4" y2="-15" stroke="#1E293B" stroke-width="2"/>
    <!-- Cánh quạt chính đang quay (main rotor blades) -->
    <ellipse cx="4" cy="-15" rx="30" ry="2.5" fill="#475569" opacity="0.8"/>
    <line x1="-24" y1="-15" x2="32" y2="-15" stroke="#0F172A" stroke-width="2"/>
    <!-- Đuôi máy bay (tail boom) -->
    <line x1="-15" y1="1" x2="-38" y2="1" stroke="#B45309" stroke-width="3"/>
    <!-- Cánh đuôi đứng và cánh quạt đuôi (tail rotor) -->
    <polygon points="-38,1 -42,-8 -35,-8" fill="${heliColor}" stroke="#78350F" stroke-width="1"/>
    <line x1="-39" y1="-12" x2="-39" y2="-4" stroke="#0F172A" stroke-width="1.8"/>
    <!-- Càng hạ cánh (landing skids) -->
    <line x1="-8" y1="8" x2="-8" y2="13" stroke="#475569" stroke-width="1.2"/>
    <line x1="12" y1="8" x2="12" y2="13" stroke="#475569" stroke-width="1.2"/>
    <line x1="-14" y1="13" x2="18" y2="13" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- ============================================================ -->
  <!-- 6. QUỸ ĐẠO KHINH KHÍ CẦU l: SÂN BAY L(24; 52; 0) -> P(20; 42; 2) -> N -->
  <!-- ============================================================ -->
  <!-- Sân bay L trên mặt đất tại (675, 470) -->
  <circle cx="675" cy="470" r="4.5" fill="#0F172A"/>
  <text x="690" y="475" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">L</text>

  <!-- Điểm P(20; 42; 2) tại (605, 435) -->
  <circle cx="605" cy="435" r="4.5" fill="#0F172A"/>
  <text x="590" y="455" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">P</text>

  <!-- Vết bóng chiếu hình học từ P xuống mặt đất -->
  <line x1="605" y1="435" x2="605" y2="465" stroke="#0284C7" stroke-width="1.4" stroke-dasharray="3,3"/>
  <circle cx="605" cy="465" r="2.5" fill="#0284C7"/>
  <!-- Đường chiếu chân quỹ đạo trên mặt đất -->
  <line x1="675" y1="470" x2="605" y2="465" stroke="#0284C7" stroke-width="1.4" stroke-dasharray="4,3"/>
  <line x1="605" y1="465" x2="360" y2="405" stroke="#0284C7" stroke-width="1.4" stroke-dasharray="4,3"/>

  <!-- Điểm N (nơi khí cầu đi vào tường sương mù) tại (360, 290) -->
  <circle cx="360" cy="290" r="5" fill="#0F172A"/>
  <text x="340" y="285" font-style="italic" font-weight="bold" font-size="20" fill="#0F172A">N</text>

  <!-- Đường bay màu xanh dương của khí cầu từ L qua P đâm vào N -->
  <line x1="675" y1="470" x2="605" y2="435" stroke="${blueLine}" stroke-width="2.6"/>
  <line x1="605" y1="435" x2="360" y2="290" stroke="${blueLine}" stroke-width="2.6"/>

  <!-- HÌNH VẼ KHÍ CẦU KHÍ ĐỘNG HỌC (BLIMP / AIRSHIP) 3D TẠI (485, 360) -->
  <g transform="translate(485, 360) rotate(-30)">
    <!-- Thân khí cầu hình thoi khí động học (airship envelope) -->
    <ellipse cx="0" cy="0" rx="48" ry="24" fill="${blimpColor}" stroke="#0369A1" stroke-width="1.8"/>
    <!-- Múi gân và nếp gấp 3D trên thân khí cầu -->
    <path d="M -48,0 C -25,-12 25,-12 48,0" fill="none" stroke="#BAE6FD" stroke-width="1.6" opacity="0.8"/>
    <path d="M -48,0 C -25,12 25,12 48,0" fill="none" stroke="#0369A1" stroke-width="1.4" opacity="0.6"/>
    <!-- Nón mũi khí cầu với dây thừng gia cố (nose cap) -->
    <path d="M -48,0 Q -42,-7 -36,-8 L -36,8 Q -42,7 -48,0 Z" fill="#0284C7" stroke="#0369A1" stroke-width="1.2"/>
    <!-- 4 Cánh lái ổn định đuôi (tail fins) màu trắng/xám -->
    <polygon points="40,-12 56,-24 48,-4" fill="#F8FAFC" stroke="#0F172A" stroke-width="1.2"/>
    <polygon points="40,12 56,24 48,4" fill="#F8FAFC" stroke="#0F172A" stroke-width="1.2"/>
    <polygon points="38,-3 54,0 38,3" fill="#E2E8F0" stroke="#0F172A" stroke-width="1"/>
    <!-- Khoang cabin chở khách / giỏ hàng phía dưới (gondola) -->
    <rect x="-8" y="24" width="26" height="8" rx="2" fill="#92400E" stroke="#1E293B" stroke-width="1.2"/>
    <circle cx="-3" cy="28" r="1.5" fill="#FEF08A"/>
    <circle cx="4" cy="28" r="1.5" fill="#FEF08A"/>
    <circle cx="11" cy="28" r="1.5" fill="#FEF08A"/>
  </g>

  <!-- ============================================================ -->
  <!-- 7. BẢNG THÔNG TIN TOẠ ĐỘ & MÔ TẢ ĐỀ THI SGK CHUẨN XÁC -->
  <!-- ============================================================ -->
  <g transform="translate(30, 480)">
    <rect width="300" height="95" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2"/>
    <text x="12" y="20" font-family="Arial, sans-serif" font-size="11.5" font-weight="bold" fill="#0F172A">TỌA ĐỘ BÀI TOÁN (CÂU 43):</text>
    <text x="12" y="38" font-size="13" fill="#1E293B">• Sân bay quân sự: F(20; -8; 0)</text>
    <text x="12" y="56" font-size="13" fill="#1E293B">• Đỉnh núi: S(-4; 32; 16)</text>
    <text x="12" y="74" font-size="13" fill="#0284C7">• Khinh khí cầu: L(24; 52; 0) → P(20; 42; 2)</text>
    <text x="12" y="90" font-size="12" fill="#64748B">• Tường sương mù E_ABC: A(16;0;0), B(0;16;0), C(0;0;16)</text>
  </g>
</svg>`,
    tikz: `% Câu 43: Khinh khí cầu, trực thăng, đỉnh núi & tường sương mù trong không gian Oxyz (Toán 12)
\begin{tikzpicture}[scale=0.85, >=stealth, line cap=round, line join=round]
  % Trục tọa độ Oxyz
  \coordinate (O) at (0,0);
  \draw[thick, ->] (O) -- (-2.5,-2.2) node[below left] {$X$};
  \draw[thick, ->] (O) -- (7,-1) node[below right] {$Y$};
  \draw[thick, ->] (O) -- (0,5.5) node[above] {$Z$};
  \node[above left] at (O) {$O$};

  % Mặt đất Oxy
  \fill[green!20, opacity=0.6] (-2.8,-2.4) -- (6.8,-1.2) -- (8.2,0.5) -- (-1.4,-0.7) -- cycle;

  % Dãy núi phía sau
  \fill[brown!40] (1,0) .. controls (2.5,2.5) .. (4.5,4.2) -- (4.5,4.2) coordinate (S) .. controls (5.5,2) and (6.5,1.5) .. (8,0.5) -- (1,0) -- cycle;
  \draw[thick, brown!70!black] (1,0) .. controls (2.5,2.5) .. (S) .. controls (5.5,2) and (6.5,1.5) .. (8,0.5);
  \fill (S) circle (2pt) node[above] {$S$};

  % Tường sương mù E_ABC
  \coordinate (A) at (-1.3,-1.1);
  \coordinate (B) at (2.2,-0.3);
  \coordinate (C) at (0,3.8);
  \fill[cyan!15, opacity=0.55] (A) -- (B) -- (C) -- cycle;
  \draw[thick, blue!40!gray] (A) -- (B) -- (C) -- cycle;
  \coordinate (N) at (0.8,1.6);
  \fill (N) circle (2pt) node[above left] {$N$};

  % Quỹ đạo trực thăng (F -> S)
  \coordinate (F) at (-1.8,-1.6);
  \fill (F) circle (2pt) node[below left] {$F$};
  \draw[thick, red] (F) -- (S);

  % Quỹ đạo khinh khí cầu (L -> P -> N)
  \coordinate (L) at (5.5,-0.8);
  \coordinate (P) at (4.2,0.2);
  \fill (L) circle (2pt) node[below] {$L$};
  \fill (P) circle (2pt) node[below] {$P$};
  \draw[thick, blue] (L) -- (P) -- (N);
  \draw[dashed, blue!50] (P) -- (4.2,-0.6);
  \draw[dashed, blue!50] (L) -- (4.2,-0.6) -- (0.8,-0.1);
\end{tikzpicture}`
  },
  calorimeter: {
    title: "Sơ Đồ Thí Nghiệm Xác Định Nhiệt Dung Riêng Của Nước",
    svg: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
  <defs>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="beakerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <!-- Table surface -->
  <line x1="80" y1="410" x2="620" y2="410" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <!-- Tripod Stand -->
  <polygon points="170,410 190,340 370,340 390,410" fill="none" stroke="#475569" stroke-width="3"/>
  <line x1="280" y1="340" x2="280" y2="410" stroke="#475569" stroke-width="3"/>
  <rect x="180" y="335" width="200" height="7" fill="#64748b" rx="2"/>

  <!-- Calorimeter Beaker Outer & Inner -->
  <rect x="200" y="190" width="160" height="145" rx="8" fill="url(#beakerGrad)" stroke="#1e293b" stroke-width="3"/>
  <!-- Water inside -->
  <rect x="206" y="225" width="148" height="104" rx="4" fill="url(#waterGrad)"/>
  <text x="215" y="240" font-size="11" fill="#0369a1" font-weight="600">Nước (m)</text>

  <!-- Heating Resistor Coil -->
  <path d="M 240,170 L 240,290 C 240,305 255,305 255,290 C 255,275 270,275 270,290 C 270,305 285,305 285,290 C 285,275 300,275 300,290 L 300,170" fill="none" stroke="#dc2626" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="240" cy="170" r="4" fill="#dc2626"/>
  <circle cx="300" cy="170" r="4" fill="#dc2626"/>

  <!-- Thermometer with Stand -->
  <rect x="420" y="80" width="16" height="330" fill="#64748b" rx="2"/>
  <line x1="420" y1="130" x2="330" y2="130" stroke="#64748b" stroke-width="4"/>
  <rect x="325" y="122" width="12" height="16" fill="#334155" rx="2"/>
  
  <!-- Glass Thermometer -->
  <rect x="328" y="100" width="6" height="190" rx="3" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="331" cy="290" r="6" fill="#ef4444"/>
  <rect x="329.5" y="150" width="3" height="140" fill="#ef4444"/>

  <!-- Labels & Callouts -->
  <path d="M 190,260 L 120,260" stroke="#0284c7" stroke-width="1.5"/>
  <text x="70" y="264" font-size="14" font-weight="bold" fill="#0369a1">Nước</text>

  <path d="M 270,305 L 270,370 L 140,370" stroke="#dc2626" stroke-width="1.5" fill="none"/>
  <text x="60" y="374" font-size="14" font-weight="bold" fill="#b91c1c">Dây điện trở</text>

  <path d="M 331,110 L 331,60 L 220,60" stroke="#0f172a" stroke-width="1.5" fill="none"/>
  <text x="160" y="64" font-size="14" font-weight="bold" fill="#0f172a">Nhiệt kế</text>

  <text x="210" y="150" font-size="13" font-weight="bold" fill="#4f46e5">Nguồn điện U, I</text>
</svg>`,
    tikz: `% Sơ đồ thí nghiệm Nhiệt lượng kế xác định nhiệt dung riêng của nước
\\begin{tikzpicture}[scale=0.9, >=stealth, font=\\footnotesize]
  % Bàn và giá đỡ
  \\draw[thick] (0,0) -- (8,0);
  \\draw[thick] (2,0) -- (2.5,1.5) -- (4.5,1.5) -- (5,0);
  \\draw[thick] (3.5,1.5) -- (3.5,0);
  
  % Bình nhiệt lượng kế
  \\draw[thick, rounded corners=4pt, fill=blue!5] (2.7,1.5) rectangle (4.7,4);
  \\fill[blue!20] (2.8,1.6) rectangle (4.6,3.2);
  \\node at (2.2, 2.5) {Nước};
  \\draw[->] (2.5, 2.5) -- (2.8, 2.5);

  % Dây điện trở xoắn
  \\draw[thick, red] (3.2, 4.3) -- (3.2, 2.3);
  \\draw[thick, red, decorate, decoration={coil,aspect=0.4,segment length=3mm,amplitude=3mm}] (3.2,2.3) -- (4.2,2.3);
  \\draw[thick, red] (4.2, 2.3) -- (4.2, 4.3);
  \\node[red, font=\\bfseries] at (1.5, 1.2) {Dây điện trở};
  \\draw[->, red] (2.2, 1.2) -- (3.5, 2.1);

  % Nhiệt kế và giá kẹp
  \\draw[fill=gray!30] (5.8,0) rectangle (6,5.5);
  \\draw[thick] (6,4.5) -- (4.5,4.5);
  \\draw[thick, fill=white] (4.4,2.2) rectangle (4.6,5.2);
  \\fill[red] (4.5,2.4) circle (2.5pt);
  \\draw[very thick, red] (4.5,2.4) -- (4.5,4.2);
  \\node at (5, 5.4) {Nhiệt kế};
\\end{tikzpicture}`
  },
  rails: {
    title: "Thanh Dẫn Kim Loại Trượt Trên Ray Từ Trường Đều",
    svg: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
  <polygon points="120,320 580,320 500,160 180,160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="120" y1="320" x2="580" y2="320" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="180" y1="160" x2="500" y2="160" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="120" y1="320" x2="180" y2="160" stroke="#334155" stroke-width="4"/>
  <rect x="135" y="215" width="30" height="50" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
  <text x="142" y="245" font-size="14" font-weight="bold" fill="#fff">R</text>
  <polygon points="340,325 360,325 320,155 300,155" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/>
  <text x="355" y="345" font-size="16" font-weight="bold" font-style="italic" fill="#1e3a8a">M</text>
  <text x="295" y="145" font-size="16" font-weight="bold" font-style="italic" fill="#1e3a8a">N</text>
  <line x1="350" y1="240" x2="450" y2="240" stroke="#dc2626" stroke-width="4"/>
  <polygon points="450,233 465,240 450,247" fill="#dc2626"/>
  <text x="440" y="225" font-size="16" font-weight="bold" font-style="italic" fill="#dc2626">v →</text>
  <g fill="#0284c7" font-size="18" font-weight="bold">
    <text x="260" y="210">⊗</text><text x="320" y="210">⊗</text><text x="380" y="210">⊗</text><text x="440" y="210">⊗</text>
    <text x="240" y="270">⊗</text><text x="300" y="270">⊗</text><text x="380" y="270">⊗</text><text x="460" y="270">⊗</text>
  </g>
  <text x="490" y="200" font-size="16" font-weight="bold" font-style="italic" fill="#0284c7">B →</text>
</svg>`,
    tikz: `% Thanh MN trượt trên ray trong từ trường
\\begin{tikzpicture}[scale=1, >=stealth, font=\\footnotesize]
  \\draw[thick] (0,0) -- (6,0);
  \\draw[thick] (0.8,2) -- (6.8,2);
  \\draw[thick] (0,0) -- (0.8,2);
  \\draw[fill=orange!30] (0.3, 0.7) rectangle (0.6, 1.3) node[midway] {$R$};
  \\draw[ultra thick, blue] (3.5,0) -- (4.3,2) node[above] {$N$} node[below] {$M$};
  \\draw[->, ultra thick, red] (3.9,1) -- (5.2,1) node[right] {$\\vec{v}$};
  \\foreach \\x in {1.5, 2.5, 3.5, 4.5, 5.5} {
    \\foreach \\y in {0.5, 1.5} {
      \\node[blue!80] at (\\x,\\y) {$\\otimes$};
    }
  }
  \\node[blue!80, right] at (6, 1.5) {$\\vec{B}$};
\\end{tikzpicture}`
  },
  titration: {
    title: "Sơ Đồ Thí Nghiệm Chuẩn Độ Axit - Bazơ",
    svg: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
  <rect x="250" y="410" width="160" height="15" rx="3" fill="#334155"/>
  <rect x="380" y="40" width="12" height="370" fill="#64748b" rx="2"/>
  <rect x="330" y="140" width="55" height="10" fill="#475569"/>
  <rect x="330" y="260" width="55" height="10" fill="#475569"/>
  <rect x="315" y="60" width="16" height="240" fill="#f8fafc" stroke="#1e293b" stroke-width="2" rx="2"/>
  <line x1="315" y1="90" x2="322" y2="90" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="120" x2="325" y2="120" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="150" x2="322" y2="150" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="180" x2="325" y2="180" stroke="#64748b" stroke-width="1.5"/>
  <polygon points="318,300 328,300 323,320" fill="#38bdf8" stroke="#1e293b" stroke-width="1.5"/>
  <circle cx="323" cy="308" r="5" fill="#ef4444"/>
  <path d="M 310,345 L 336,345 L 336,355 L 365,405 C 367,408 365,410 360,410 L 286,410 C 281,410 279,408 281,405 L 310,355 Z" fill="#fce7f3" stroke="#1e293b" stroke-width="2.5"/>
  <path d="M 293,390 L 353,390 L 363,408 L 283,408 Z" fill="#f43f5e" opacity="0.75"/>
  <text x="200" y="100" font-size="14" font-weight="bold" fill="#0f172a">Buret (NaOH)</text>
  <text x="140" y="380" font-size="14" font-weight="bold" fill="#be123c">Bình tam giác</text>
  <text x="140" y="398" font-size="12" fill="#64748b">(HCl + phenolphtalein)</text>
</svg>`,
    tikz: `% Sơ đồ chuẩn độ
\\begin{tikzpicture}[scale=0.9, >=stealth, font=\\footnotesize]
  \\draw[fill=gray!40] (1,0) rectangle (5,0.3);
  \\draw[fill=gray!60] (4.5,0.3) rectangle (4.7,6);
  \\draw[fill=gray!50] (3.2, 4.5) rectangle (4.5, 4.7);
  \\draw[thick, fill=white] (3, 1.8) rectangle (3.4, 5.5);
  \\node[left] at (3, 5) {Buret (NaOH)};
  \\draw[thick] (2.8, 1.2) -- (3.6, 1.2) -- (4, 0.4) -- (2.4, 0.4) -- cycle;
  \\node[left] at (2.4, 0.8) {Bình tam giác};
\\end{tikzpicture}`
  },
  pyramid: {
    title: "Hình Chóp Tứ Giác Đều S.ABCD Đáy Vuông",
    svg: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Times New Roman',serif;">
  <polygon points="350,80 160,320 480,320" fill="rgba(99,102,241,0.08)"/>
  <polygon points="350,80 480,320 540,240" fill="rgba(59,130,246,0.12)"/>
  <!-- Base lines -->
  <line x1="160" y1="320" x2="480" y2="320" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="480" y1="320" x2="540" y2="240" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="160" y1="320" x2="220" y2="240" stroke="#64748b" stroke-width="1.8" stroke-dasharray="6,5"/>
  <line x1="220" y1="240" x2="540" y2="240" stroke="#64748b" stroke-width="1.8" stroke-dasharray="6,5"/>
  <!-- Lateral edges -->
  <line x1="350" y1="80" x2="160" y2="320" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="350" y1="80" x2="480" y2="320" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="350" y1="80" x2="540" y2="240" stroke="#1e293b" stroke-width="2.5"/>
  <line x1="350" y1="80" x2="220" y2="240" stroke="#64748b" stroke-width="1.8" stroke-dasharray="6,5"/>
  <!-- Height SO -->
  <line x1="350" y1="80" x2="350" y2="280" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,5"/>
  <line x1="160" y1="320" x2="540" y2="240" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,5"/>
  <line x1="220" y1="240" x2="480" y2="320" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,5"/>
  <!-- Vertices and labels -->
  <circle cx="350" cy="80" r="4" fill="#dc2626"/>
  <text x="350" y="65" font-size="18" font-weight="bold" font-style="italic" text-anchor="middle">S</text>
  <circle cx="160" cy="320" r="4" fill="#1e293b"/>
  <text x="145" y="335" font-size="18" font-weight="bold" font-style="italic">A</text>
  <circle cx="480" cy="320" r="4" fill="#1e293b"/>
  <text x="495" y="335" font-size="18" font-weight="bold" font-style="italic">B</text>
  <circle cx="540" cy="240" r="4" fill="#1e293b"/>
  <text x="555" y="245" font-size="18" font-weight="bold" font-style="italic">C</text>
  <circle cx="220" cy="240" r="4" fill="#64748b"/>
  <text x="200" y="245" font-size="18" font-weight="bold" font-style="italic">D</text>
  <circle cx="350" cy="280" r="3.5" fill="#ef4444"/>
  <text x="360" y="295" font-size="16" font-weight="bold" font-style="italic" fill="#dc2626">O</text>
</svg>`,
    tikz: `% Hình chóp tứ giác đều S.ABCD
\\begin{tikzpicture}[scale=0.9, >=stealth, font=\\footnotesize]
  \\coordinate (A) at (0,0);
  \\coordinate (B) at (4,0);
  \\coordinate (D) at (1.5,1.5);
  \\coordinate (C) at (5.5,1.5);
  \\coordinate (O) at (2.75,0.75);
  \\coordinate (S) at (2.75,4.5);
  
  \\draw[thick] (A) -- (B) -- (C);
  \\draw[dashed] (A) -- (D) -- (C);
  \\draw[dashed] (A) -- (C) (B) -- (D);
  \\draw[thick] (S) -- (A) (S) -- (B) (S) -- (C);
  \\draw[dashed] (S) -- (D) (S) -- (O);
  
  \\fill (A) circle (1.5pt) node[below left] {$A$};
  \\fill (B) circle (1.5pt) node[below right] {$B$};
  \\fill (C) circle (1.5pt) node[above right] {$C$};
  \\fill (D) circle (1.5pt) node[above left] {$D$};
  \\fill (S) circle (1.5pt) node[above] {$S$};
  \\fill (O) circle (1.5pt) node[below] {$O$};
\\end{tikzpicture}`
  }
,
  bridge_parabola: {
    title: "Cầu Treo Dây Võng Parabol Ngoài Đời Thật (Toán 10-12 & Kỹ Thuật)",
    svg: `<svg width="860" height="540" viewBox="0 0 860 540" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="60%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#0369a1" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
    <linearGradient id="towerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <marker id="arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a"/>
    </marker>
  </defs>

  <!-- BẦU TRỜI & NƯỚC BIỂN -->
  <rect width="860" height="380" fill="url(#skyGrad)"/>
  <rect y="380" width="860" height="160" fill="url(#waterGrad)"/>
  <!-- Gợn sóng nước -->
  <path d="M 50,420 Q 200,410 350,420 T 650,420 T 820,420" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.4"/>
  <path d="M 100,460 Q 250,450 400,460 T 700,460 T 800,460" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.3"/>

  <!-- HAI THÁP CẦU ĐỎ CAM SỪNG SỮNG -->
  <!-- Tháp Trái: x=180 -->
  <rect x="165" y="100" width="30" height="310" rx="3" fill="url(#towerGrad)" stroke="#7f1d1d" stroke-width="1.8"/>
  <line x1="165" y1="210" x2="195" y2="210" stroke="#7f1d1d" stroke-width="3"/>
  <line x1="165" y1="310" x2="195" y2="310" stroke="#7f1d1d" stroke-width="3"/>
  <!-- Tháp Phải: x=680 -->
  <rect x="665" y="100" width="30" height="310" rx="3" fill="url(#towerGrad)" stroke="#7f1d1d" stroke-width="1.8"/>
  <line x1="665" y1="210" x2="695" y2="210" stroke="#7f1d1d" stroke-width="3"/>
  <line x1="665" y1="310" x2="695" y2="310" stroke="#7f1d1d" stroke-width="3"/>

  <!-- DÂY CÁP CHỦ PARABOL: Đỉnh cực tiểu tại (430, 340), đỉnh tháp tại (180, 100) và (680, 100) -->
  <!-- Phương trình: y - 340 = a*(x - 430)^2, với a = 240 / 250^2 = 0.00384 -->
  <path d="M 40,240 Q 110,170 180,100 Q 430,420 680,100 Q 750,170 820,240" fill="none" stroke="#b91c1c" stroke-width="5" stroke-linecap="round"/>

  <!-- DÂY CÁP TREO THẲNG ĐỨNG CÁCH ĐỀU -->
  <g stroke="#334155" stroke-width="1.5" opacity="0.85">
    <line x1="230" y1="160" x2="230" y2="340"/>
    <line x1="280" y1="225" x2="280" y2="340"/>
    <line x1="330" y1="278" x2="330" y2="340"/>
    <line x1="380" y1="318" x2="380" y2="340"/>
    <line x1="430" y1="340" x2="430" y2="340"/>
    <line x1="480" y1="318" x2="480" y2="340"/>
    <line x1="530" y1="278" x2="530" y2="340"/>
    <line x1="580" y1="225" x2="580" y2="340"/>
    <line x1="630" y1="160" x2="630" y2="340"/>
  </g>

  <!-- MẶT ĐƯỜNG CẦU BÊ TÔNG BẮC NGANG -->
  <rect x="20" y="340" width="820" height="24" fill="#334155" stroke="#0f172a" stroke-width="2"/>
  <!-- Dải phân cách vàng -->
  <line x1="20" y1="352" x2="840" y2="352" stroke="#facc15" stroke-width="2" stroke-dasharray="14,10"/>

  <!-- Ô TÔ CON CHẠY TRÊN CẦU -->
  <g transform="translate(340, 325)">
    <rect x="0" y="5" width="40" height="12" rx="3" fill="#2563eb"/>
    <polygon points="8,5 15,-2 28,-2 34,5" fill="#38bdf8"/>
    <circle cx="9" cy="17" r="3.5" fill="#0f172a"/>
    <circle cx="31" cy="17" r="3.5" fill="#0f172a"/>
  </g>

  <!-- HỆ TRỤC TỌA ĐỘ Oxy: Gốc O(430, 340) tại đỉnh thấp nhất của dây cáp -->
  <line x1="80" y1="340" x2="800" y2="340" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arr)"/>
  <text x="805" y="345" font-size="18" font-weight="bold" font-style="italic" fill="#0f172a">x</text>
  <line x1="430" y1="390" x2="430" y2="50" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arr)"/>
  <text x="438" y="55" font-size="18" font-weight="bold" font-style="italic" fill="#0f172a">y</text>
  <text x="415" y="365" font-size="19" font-weight="bold" font-style="italic" fill="#0f172a">O</text>

  <!-- KÍCH THƯỚC ĐO ĐẠC THỰC TẾ -->
  <!-- Chiều rộng nhịp cầu: 120m -->
  <line x1="180" y1="375" x2="680" y2="375" stroke="#0f172a" stroke-width="1.3" marker-start="url(#arr)" marker-end="url(#arr)"/>
  <text x="430" y="398" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">Khoảng cách giữa hai tháp d = 120 m</text>
  <!-- Chiều cao tháp cầu: 36m -->
  <line x1="715" y1="100" x2="715" y2="340" stroke="#0f172a" stroke-width="1.3" marker-start="url(#arr)" marker-end="url(#arr)"/>
  <text x="725" y="225" font-size="16" font-weight="bold" fill="#0f172a">h = 36 m</text>

  <!-- PHƯƠNG TRÌNH PARABOL TOÁN HỌC -->
  <g transform="translate(480, 85)">
    <rect width="260" height="42" rx="8" fill="rgba(255,255,255,0.95)" stroke="#cbd5e1"/>
    <text x="130" y="26" font-size="15" font-weight="bold" fill="#b91c1c" text-anchor="middle">Dây cáp: y = a.x² (a = 0,01)</text>
  </g>
</svg>`,
    tikz: `% Mô hình cầu treo Parabol
\\\\begin{tikzpicture}[scale=1, >=stealth]
  \\\\draw[->, thick] (-5,0) -- (5,0) node[right] {$x$};
  \\\\draw[->, thick] (0,-0.5) -- (0,4) node[above] {$y$};
  \\\\node[below left] at (0,0) {$O$};
  % Dây cáp Parabol
  \\\\draw[ultra thick, red!80!black, domain=-4:4, samples=100] plot (\\\\x, {0.1875*\\\\x*\\\\x});
  % Tháp cầu
  \\\\fill[orange!80!black] (-4.1,0) rectangle (-3.9,3.5);
  \\\\fill[orange!80!black] (3.9,0) rectangle (4.1,3.5);
  % Mặt cầu
  \\\\draw[line width=3pt, gray!80!black] (-4.8,0) -- (4.8,0);
  % Dây treo thẳng đứng
  \\\\foreach \\\\x in {-3,-2,-1,1,2,3} {
    \\\\draw[thin, black] (\\\\x,0) -- (\\\\x, {0.1875*\\\\x*\\\\x});
  }
  \\\\node at (0,3.5) [fill=white, draw=slate!40, rounded corners] {$\\\\text{Cáp treo: } y = 0.01x^2$};
\\\\end{tikzpicture}`
  },
  roller_coaster: {
    title: "Tàu Lượn Siêu Tốc & Bảo Toàn Cơ Năng Đời Sống (Vật lí 10)",
    svg: `<svg width="860" height="540" viewBox="0 0 860 540" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <linearGradient id="skyRc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <marker id="arrV" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626"/>
    </marker>
    <marker id="arrN" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb"/>
    </marker>
  </defs>

  <!-- BẦU TRỜI & MẶT ĐẤT -->
  <rect width="860" height="540" fill="url(#skyRc)"/>
  <rect y="460" width="860" height="80" fill="#a7f3d0" stroke="#059669" stroke-width="2"/>
  <line x1="30" y1="460" x2="830" y2="460" stroke="#059669" stroke-width="3"/>
  <text x="830" y="485" font-size="14" font-weight="bold" fill="#047857">Mặt đất (Mốc thế năng Wt = 0)</text>

  <!-- KHUNG GIÁ ĐỠ THÉP CỦA TÀU LƯỢN -->
  <g stroke="#94a3b8" stroke-width="1.8" opacity="0.6">
    <line x1="120" y1="120" x2="120" y2="460"/>
    <line x1="200" y1="210" x2="200" y2="460"/>
    <line x1="300" y1="340" x2="300" y2="460"/>
    <line x1="560" y1="230" x2="560" y2="460"/>
    <line x1="720" y1="360" x2="720" y2="460"/>
    <!-- Thanh chéo gia cố kết cấu giàn thép -->
    <line x1="120" y1="280" x2="200" y2="460"/>
    <line x1="200" y1="280" x2="120" y2="460"/>
    <line x1="200" y1="340" x2="300" y2="460"/>
    <line x1="300" y1="340" x2="200" y2="460"/>
  </g>

  <!-- ĐƯỜNG RAY UỐN LƯỢN & VÒNG LỘN THẲNG ĐỨNG (VERTICAL LOOP) -->
  <!-- Đỉnh A(120, 120) -> Đáy B(340, 440) -> Vòng tròn tâm (500, 300) bán kính R=120 -> Thoát ra C(660, 420) -> Đồi nhỏ D(760, 360) -->
  <path d="M 60,110 L 120,120 Q 220,150 290,320 L 340,440 C 390,440 430,420 470,360 C 530,270 560,180 500,180 C 440,180 430,270 470,360 C 510,440 580,450 660,420 Q 720,380 760,360 T 840,400" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
  <!-- Ray phụ song song -->
  <path d="M 60,118 L 120,128 Q 220,158 290,328 L 340,448 C 390,448 430,428 470,368 C 530,278 560,188 500,188 C 440,188 430,278 470,368 C 510,448 580,458 660,428 Q 720,388 760,368 T 840,408" fill="none" stroke="#991b1b" stroke-width="2.5"/>

  <!-- TOA TÀU ĐANG LAO DỐC TẠI ĐIỂM GIỮA (250, 240) -->
  <g transform="translate(250, 230) rotate(52)">
    <rect x="-24" y="-14" width="48" height="26" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
    <circle cx="-12" cy="14" r="5" fill="#1e293b"/>
    <circle cx="12" cy="14" r="5" fill="#1e293b"/>
    <!-- Vectơ vận tốc v -->
    <line x1="20" y1="0" x2="65" y2="0" stroke="#dc2626" stroke-width="3" marker-end="url(#arrV)"/>
    <text x="68" y="-5" font-size="16" font-weight="bold" fill="#dc2626">v</text>
  </g>

  <!-- CÁC ĐIỂM ĐẶC BIỆT A, B, C TRÊN ĐƯỜNG RAY -->
  <!-- Điểm A (Đỉnh dốc cao nhất) -->
  <circle cx="120" cy="120" r="6" fill="#1e293b"/>
  <text x="100" y="105" font-size="22" font-weight="bold" font-style="italic">A (h₁ = 34 m)</text>
  <text x="75" y="145" font-size="13" fill="#334155">vA = 0 (Thế năng Max)</text>

  <!-- Điểm B (Đáy trũng dốc) -->
  <circle cx="340" cy="440" r="6" fill="#1e293b"/>
  <text x="315" y="480" font-size="22" font-weight="bold" font-style="italic">B (Đáy dốc)</text>
  <text x="290" y="500" font-size="13" font-weight="bold" fill="#dc2626">vB = v_max (Động năng Max)</text>

  <!-- Điểm C (Đỉnh vòng lượn tròn) -->
  <circle cx="500" cy="180" r="6" fill="#1e293b"/>
  <text x="515" y="175" font-size="22" font-weight="bold" font-style="italic">C (Đỉnh vòng tròn R)</text>
  <!-- Trọng lực P và Lực hướng tâm N tại đỉnh vòng lộn -->
  <line x1="500" y1="180" x2="500" y2="240" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arrN)"/>
  <text x="508" y="235" font-size="15" font-weight="bold" fill="#2563eb">P + N = F_ht</text>

  <!-- KHUNG CÔNG THỨC VẬT LÍ BẢO TOÀN CƠ NĂNG -->
  <g transform="translate(620, 40)">
    <rect width="220" height="90" rx="8" fill="rgba(255,255,255,0.96)" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="15" y="25" font-size="14" font-weight="bold" fill="#0f172a">ĐỊNH LUẬT BẢO TOÀN:</text>
    <text x="15" y="48" font-size="13" fill="#2563eb" font-weight="bold">W = Wt + Wđ = const</text>
    <text x="15" y="68" font-size="12" fill="#334155">mgh_A = ½mv_B² = mgh_C + ½mv_C²</text>
    <text x="15" y="85" font-size="12" fill="#dc2626" font-weight="bold">Điều kiện qua đỉnh C: v_C ≥ √(g.R)</text>
  </g>
</svg>`,
    tikz: `% Tàu lượn siêu tốc bảo toàn cơ năng
\\\\begin{tikzpicture}[scale=0.9, >=stealth]
  \\\\draw[thick, fill=green!10] (-1,0) rectangle (9,-0.3);
  \\\\node[below] at (4,0) {Mốc thế năng $W_t = 0$};
  % Đường ray
  \\\\draw[ultra thick, red!80!black] (0,4) .. controls (2,3.5) and (2.5,0.3) .. (3.5,0.3)
    .. controls (4.5,0.3) and (5.5,2.5) .. (5,2.5)
    .. controls (4.5,2.5) and (4.5,0.3) .. (5.5,0.3) -- (8,0.3);
  \\\\fill (0,4) circle (2pt) node[above left] {$A(h_1)$};
  \\\\fill (3.5,0.3) circle (2pt) node[below] {$B(v_{\\\\max})$};
  \\\\fill (5,2.5) circle (2pt) node[above] {$C(2R)$};
  \\\\draw[->, thick, blue] (5,2.5) -- (5,1.5) node[right] {$\\\\vec{P} + \\\\vec{N}$};
\\\\end{tikzpicture}`
  },
  lemon_battery: {
    title: "Pin Quả Chanh & Dòng Điện Hóa Học Đời Sống (Hóa học 11-12 & KHTN)",
    svg: `<svg width="860" height="540" viewBox="0 0 860 540" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <radialGradient id="lemonBody" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#facc15"/>
      <stop offset="90%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </radialGradient>
    <radialGradient id="ledGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="40%" stop-color="#f87171"/>
      <stop offset="70%" stop-color="#fca5a5" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <marker id="arrI" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626"/>
    </marker>
  </defs>

  <!-- MẶT BÀN GỖ THÍ NGHIỆM -->
  <rect width="860" height="540" fill="#f8fafc"/>
  <rect y="380" width="860" height="160" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  <text x="730" y="415" font-size="13" font-style="italic" fill="#94a3b8">Bàn thí nghiệm</text>

  <!-- QUẢ CHANH MỌNG NƯỚC (HÌNH ELIP 3D) -->
  <!-- Thân chanh -->
  <ellipse cx="430" cy="360" rx="190" ry="110" fill="url(#lemonBody)" stroke="#ca8a04" stroke-width="3"/>
  <!-- Núm chanh hai bên -->
  <path d="M 240,360 Q 225,355 220,360 Q 225,365 240,360 Z" fill="#65a30d"/>
  <path d="M 620,360 Q 635,355 640,360 Q 635,365 620,360 Z" fill="#65a30d"/>
  <!-- Lỗ chân lông vỏ chanh chân thực -->
  <circle cx="340" cy="340" r="1.5" fill="#a16207" opacity="0.4"/>
  <circle cx="480" cy="330" r="1.5" fill="#a16207" opacity="0.4"/>
  <circle cx="400" cy="390" r="1.5" fill="#a16207" opacity="0.4"/>
  <circle cx="530" cy="380" r="1.5" fill="#a16207" opacity="0.4"/>

  <!-- BẢN ĐIỆN CỰC KẼM (Zn) - BÊN TRÁI (ANODE CỰC ÂM) -->
  <rect x="310" y="220" width="22" height="130" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
  <text x="321" y="210" font-size="20" font-weight="bold" fill="#334155" text-anchor="middle">Zn (-)</text>
  <text x="321" y="190" font-size="13" font-weight="bold" fill="#dc2626" text-anchor="middle">Anode (Cực âm)</text>

  <!-- BẢN ĐIỆN CỰC ĐỒNG (Cu) - BÊN PHẢI (CATHODE CỰC DƯƠNG) -->
  <rect x="528" y="220" width="22" height="130" rx="2" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
  <text x="539" y="210" font-size="20" font-weight="bold" fill="#c2410c" text-anchor="middle">Cu (+)</text>
  <text x="539" y="190" font-size="13" font-weight="bold" fill="#0284c7" text-anchor="middle">Cathode (Cực dương)</text>

  <!-- BỌT KHÍ H2 SỦI TĂM LI TI QUANH CỰC ĐỒNG -->
  <circle cx="522" cy="320" r="3" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.8"/>
  <circle cx="524" cy="305" r="4" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.8"/>
  <circle cx="520" cy="285" r="3.5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.8"/>
  <text x="560" y="315" font-size="13" font-weight="bold" fill="#0284c7">2H⁺ + 2e⁻ → H₂↑</text>

  <!-- DÂY DẪN ĐIỆN NỐI TỪ 2 CỰC LÊN BÓNG ĐÈN LED -->
  <!-- Dây Đen nối cực âm Zn -->
  <path d="M 321,220 C 321,120 400,100 422,95" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
  <!-- Dây Đỏ nối cực dương Cu -->
  <path d="M 539,220 C 539,120 460,100 438,95" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>

  <!-- CHIỀU DÒNG ĐIỆN VÀ ELECTRON -->
  <line x1="510" y1="130" x2="480" y2="108" stroke="#dc2626" stroke-width="2.5" marker-end="url(#arrI)"/>
  <text x="515" y="115" font-size="14" font-weight="bold" fill="#dc2626">Dòng điện I</text>
  <line x1="350" y1="130" x2="380" y2="108" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arrI)"/>
  <text x="325" y="115" font-size="14" font-weight="bold" fill="#2563eb">Dòng e⁻</text>

  <!-- BÓNG ĐÈN LED ĐANG PHÁT SÁNG RỰC RỠ TRÊN CAO -->
  <circle cx="430" cy="85" r="38" fill="url(#ledGlow)"/>
  <!-- Thân đèn LED -->
  <path d="M 423,92 L 423,75 C 423,65 437,65 437,75 L 437,92 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.8"/>
  <rect x="421" y="92" width="18" height="4" fill="#94a3b8"/>
  <!-- Tia sáng phát quang -->
  <line x1="430" y1="42" x2="430" y2="28" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="400" y1="55" x2="388" y2="45" stroke="#f59e0b" stroke-width="2.5"/>
  <line x1="460" y1="55" x2="472" y2="45" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="430" y="22" font-size="16" font-weight="bold" fill="#dc2626" text-anchor="middle">ĐÈN LED PHÁT SÁNG</text>

  <!-- GIẢI THÍCH BẢN CHẤT HÓA HỌC -->
  <g transform="translate(60, 410)">
    <rect width="320" height="95" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="15" y="24" font-size="13" font-weight="bold" fill="#0f172a">BẢN CHẤT PIN ĐIỆN HÓA CHANH:</text>
    <text x="15" y="46" font-size="12" fill="#334155">• Nước chanh chứa axit citric (H⁺) đóng vai trò chất điện phân.</text>
    <text x="15" y="66" font-size="12" fill="#334155">• Tại cực Zn (Anode): Zn → Zn²⁺ + 2e⁻ (Kẽm bị oxi hóa tan dần).</text>
    <text x="15" y="86" font-size="12" fill="#334155">• Suất điện động của 1 quả chanh tạo ra khoảng 0,9 V - 1,0 V.</text>
  </g>
</svg>`,
    tikz: `% Pin quả chanh điện hóa
\\\\begin{tikzpicture}[scale=1, >=stealth]
  % Quả chanh
  \\\\draw[ultra thick, fill=yellow!80!orange, rounded corners=30pt] (-2.5,0) rectangle (2.5,2.2);
  \\\\node at (0,0.8) [font=\\\\bfseries] {Nước chanh (H$^+$)};
  % Điện cực
  \\\\fill[gray!70] (-1.5,1) rectangle (-1.1,3);
  \\\\node[above] at (-1.3,3) {Zn (-)};
  \\\\fill[orange!80!black] (1.1,1) rectangle (1.5,3);
  \\\\node[above] at (1.3,3) {Cu (+)};
  % Dây dẫn & Đèn LED
  \\\\draw[thick, black] (-1.3,3) |- (0,4.2);
  \\\\draw[thick, red] (1.3,3) |- (0,4.2);
  \\\\fill[red] (0,4.2) circle (4pt);
  \\\\node[above=4pt, red, font=\\\\bfseries] at (0,4.2) {Đèn LED Sáng};
\\\\end{tikzpicture}`
  },
  water_cycle: {
    title: "Vòng Tuần Hoàn Nước & Môi Trường Tự Nhiên (KHTN, Địa Lí & Sinh Học)",
    svg: `<svg width="860" height="540" viewBox="0 0 860 540" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <linearGradient id="skyWc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="50%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="sunWc" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </radialGradient>
    <marker id="arrW" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7"/>
    </marker>
    <marker id="arrRain" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb"/>
    </marker>
  </defs>

  <!-- BẦU TRỜI XANH -->
  <rect width="860" height="540" fill="url(#skyWc)"/>

  <!-- ÔNG MẶT TRỜI TỎA NẮNG (NGUỒN NĂNG LƯỢNG CHÍNH) -->
  <circle cx="110" cy="90" r="35" fill="url(#sunWc)"/>
  <g stroke="#f59e0b" stroke-width="2.5" opacity="0.8">
    <line x1="110" y1="42" x2="110" y2="28"/>
    <line x1="110" y1="138" x2="110" y2="152"/>
    <line x1="62" y1="90" x2="48" y2="90"/>
    <line x1="158" y1="90" x2="172" y2="90"/>
    <line x1="75" y1="55" x2="62" y2="42"/>
    <line x1="145" y1="125" x2="158" y2="138"/>
    <line x1="75" y1="125" x2="62" y2="138"/>
    <line x1="145" y1="55" x2="158" y2="42"/>
  </g>
  <text x="110" y="150" font-size="14" font-weight="bold" fill="#b45309" text-anchor="middle">Năng lượng Mặt trời</text>

  <!-- ĐẠI DƯƠNG / BIỂN CẢ (BÊN TRÁI) -->
  <path d="M 0,380 Q 150,370 280,390 L 280,540 L 0,540 Z" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
  <text x="130" y="470" font-size="20" font-weight="bold" fill="#ffffff">ĐẠI DƯƠNG / BIỂN</text>

  <!-- DÃY NÚI CAO & ĐẤT LIỀN (BÊN PHẢI) -->
  <path d="M 280,390 Q 380,370 480,280 Q 560,180 640,240 Q 720,160 860,260 L 860,540 L 280,540 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <!-- Núi đá xám phía sau -->
  <polygon points="520,320 640,210 740,320" fill="#94a3b8" stroke="#475569" stroke-width="1.8"/>
  <polygon points="680,290 760,160 840,300" fill="#64748b" stroke="#334155" stroke-width="1.8"/>

  <!-- RỪNG CÂY XANH QUANG HỢP VÀ THOÁT HƠI NƯỚC -->
  <g fill="#15803d">
    <polygon points="460,340 450,365 470,365"/>
    <polygon points="485,330 475,355 495,355"/>
    <polygon points="510,340 500,365 520,365"/>
  </g>

  <!-- 1. QUÁ TRÌNH BỐC HƠI NƯỚC TỪ BIỂN & THOÁT HƠI TỪ CÂY -->
  <path d="M 120,370 Q 140,280 160,200" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="8,6" marker-end="url(#arrW)"/>
  <text x="70" y="270" font-size="14" font-weight="bold" fill="#0369a1">1. BỐC HƠI NƯỚC</text>
  <path d="M 490,320 Q 510,260 520,210" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6,5" marker-end="url(#arrW)"/>
  <text x="440" y="250" font-size="12" font-weight="bold" fill="#15803d">Thoát hơi nước</text>

  <!-- 2. MÂY TRẮNG NGƯNG TỤ TRÊN CAO -->
  <!-- Đám mây 1 -->
  <g fill="#f8fafc" stroke="#94a3b8" stroke-width="1.8">
    <circle cx="280" cy="140" r="28"/>
    <circle cx="315" cy="130" r="32"/>
    <circle cx="350" cy="140" r="28"/>
    <rect x="280" y="135" width="70" height="30" stroke="none"/>
  </g>
  <text x="315" y="105" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">2. NGƯNG TỤ (MÂY)</text>

  <!-- MÂY ĐEN MƯA RÀO TRÊN ĐỈNH NÚI -->
  <g fill="#475569" stroke="#1e293b" stroke-width="1.8" transform="translate(380, 20)">
    <circle cx="280" cy="140" r="30"/>
    <circle cx="320" cy="125" r="36"/>
    <circle cx="360" cy="140" r="30"/>
    <rect x="280" y="135" width="80" height="32" stroke="none"/>
  </g>
  <text x="690" y="130" font-size="14" font-weight="bold" fill="#1e293b">3. MƯA (GIÁNG THỦY)</text>

  <!-- HẠT MƯA RƠI XUỐNG SƯỜN NÚI -->
  <g stroke="#2563eb" stroke-width="2" stroke-linecap="round">
    <line x1="660" y1="190" x2="650" y2="215"/>
    <line x1="680" y1="200" x2="670" y2="225"/>
    <line x1="700" y1="190" x2="690" y2="215"/>
    <line x1="720" y1="200" x2="710" y2="225"/>
  </g>

  <!-- 4. DÒNG SÔNG SUỐI CHẢY TRÀN VÀ NƯỚC NGẦM ĐỔ VỀ BIỂN -->
  <path d="M 640,320 Q 520,380 420,410 Q 340,420 280,415" fill="none" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
  <path d="M 640,320 Q 520,380 420,410 Q 340,420 280,415" fill="none" stroke="#bae6fd" stroke-width="4" stroke-linecap="round"/>
  <text x="440" y="440" font-size="14" font-weight="bold" fill="#0369a1">4. DÒNG CHẢY MẶT (SÔNG SUỐI)</text>

  <!-- MẠCH NƯỚC NGẦM THẤM DƯỚI LÒNG ĐẤT -->
  <path d="M 600,480 Q 450,510 270,500" fill="none" stroke="#0284c7" stroke-width="4" stroke-dasharray="10,6" marker-end="url(#arrW)"/>
  <text x="430" y="525" font-size="13" font-weight="bold" fill="#1e293b">Nước ngầm thấm về biển</text>
</svg>`,
    tikz: `% Vòng tuần hoàn nước
\\\\begin{tikzpicture}[scale=1, >=stealth]
  \\\\fill[blue!40] (0,0) rectangle (3,1.5);
  \\\\node at (1.5,0.7) {Biển / Đại dương};
  \\\\draw[thick, fill=green!40] (3,0) -- (6,2.5) -- (8,0) -- cycle;
  \\\\node at (5.5,1) {Đất liền & Núi};
  % Bốc hơi
  \\\\draw[->, ultra thick, blue, dashed] (1.5,1.5) -- (1.5,3.5) node[midway, left] {Bốc hơi};
  % Mây
  \\\\fill[gray!30] (3.5,3.8) circle (0.8);
  \\\\node at (3.5,3.8) {Mây ngưng tụ};
  % Mưa
  \\\\draw[->, ultra thick, blue] (5.5,3.5) -- (5.5,2.6) node[midway, right] {Mưa};
  % Dòng sông
  \\\\draw[->, ultra thick, cyan] (5.5,1.8) .. controls (4,1.2) .. (3,1) node[midway, below] {Sông suối};
\\\\end{tikzpicture}`
  }
};

function getActiveApiKeys() {
  const raw = (localStorage.getItem('gemini_api_key') || localStorage.getItem('gemini_api_keys') || localStorage.getItem('smartedu_gemini_key') || AppState.apiKey || '').trim();
  if (!raw) return [];
  return raw.split(/[\n,;]+/).map(k => k.trim()).filter(k => k.length > 5);
}

async function callAiSvgGeneration(promptText, base64Image, subject, onProgress) {
  const selectedModel = document.getElementById('model-select').value || '';
  const subjectName = { math: 'Toán học', physics: 'Vật lí', chemistry: 'Hóa học' }[subject] || subject;

  // 1. Kiểm tra nhanh các bài toán kinh điển chuẩn SGK để trả về vector 3D chi tiết chuẩn xác 100%
  const lower = (promptText || '').toLowerCase();
  const isHouse = lower.includes('ngôi nhà') || lower.includes('mái nhà') || lower.includes('vật thể ab') || (lower.includes('nhà') && (lower.includes('8m') || lower.includes('4m') || lower.includes('2m') || lower.includes('mặt trời')));
  const isAirship = lower.includes('khinh khí cầu') || lower.includes('trực thăng') || lower.includes('sương mù') || lower.includes('câu 43') || lower.includes('l(24; 52; 0)') || lower.includes('l(24;52;0)') || lower.includes('f(20; -8; 0)') || lower.includes('f(20;-8;0)');

  if (isHouse && SAMPLE_DATA.house3d) {
    return {
      title: SAMPLE_DATA.house3d.title,
      svg: SAMPLE_DATA.house3d.svg,
      tikz: SAMPLE_DATA.house3d.tikz,
      model: "Smart 3D Geometry Engine (Toán 12 SGK)"
    };
  }
  if (isAirship && SAMPLE_DATA.airship43) {
    return {
      title: SAMPLE_DATA.airship43.title,
      svg: SAMPLE_DATA.airship43.svg,
      tikz: SAMPLE_DATA.airship43.tikz,
      model: "Smart 3D Geometry Engine (Toán 12 SGK - Câu 43)"
    };
  }

  // Nhận diện Đồ thị Thủ môn bắt bóng (Vật lí 10)
      // Nhận diện Đồ thị Rơi tự do (Hình 4 & Hình 5)
    const isFreeFall = lower.includes('rơi tự do') || (lower.includes('hình 4') && lower.includes('hình 5')) || (lower.includes('vận tốc') && lower.includes('độ dịch chuyển'));
    if (isFreeFall && SAMPLE_DATA.free_fall_graphs) {
      return {
        title: SAMPLE_DATA.free_fall_graphs.title,
        svg: SAMPLE_DATA.free_fall_graphs.svg,
        tikz: SAMPLE_DATA.free_fall_graphs.tikz,
        model: 'Smart Physics Engine (Đồ thị rơi tự do v-t & d-t chuẩn đề thi)'
      };
    }

    const isGoalkeeper = lower.includes('thủ môn') || lower.includes('bắt bóng') || (lower.includes('độ dịch chuyển') && (lower.includes('parabol') || lower.includes('câu 3') || lower.includes('đoạn ab')));
  if (isGoalkeeper && SAMPLE_DATA.goalkeeper_graph) {
    return {
      title: SAMPLE_DATA.goalkeeper_graph.title,
      svg: SAMPLE_DATA.goalkeeper_graph.svg,
      tikz: SAMPLE_DATA.goalkeeper_graph.tikz,
      model: 'Smart Physics Engine (Đồ thị độ dịch chuyển thủ môn bắt bóng)'
    };
  }

  // Nhận diện Băng Giấy Thí Nghiệm (Vật lí 10)
  const isTape = lower.includes('băng giấy') || lower.includes('tạo ra các chấm trên một băng') || (lower.includes('chấm') && (lower.includes('hình 1') || lower.includes('0,02') || lower.includes('mốc thời gian')));
  if (isTape && SAMPLE_DATA.paper_tape) {
    return {
      title: SAMPLE_DATA.paper_tape.title,
      svg: SAMPLE_DATA.paper_tape.svg,
      tikz: SAMPLE_DATA.paper_tape.tikz,
      model: 'Smart Physics Engine (Băng giấy thí nghiệm chuyển động thẳng)'
    };
  }

  // Nhận diện Cầu Treo Parabol thực tế
  const isBridge = lower.includes('cầu treo') || (lower.includes('parabol') && (lower.includes('cầu') || lower.includes('dây võng') || lower.includes('dây cáp')));
  if (isBridge && SAMPLE_DATA.bridge_parabola) {
    return {
      title: SAMPLE_DATA.bridge_parabola.title,
      svg: SAMPLE_DATA.bridge_parabola.svg,
      tikz: SAMPLE_DATA.bridge_parabola.tikz,
      model: 'Smart Real-World Math Engine (Cầu treo Parabol đời thật)'
    };
  }

  // Nhận diện Tàu Lượn Siêu Tốc Roller Coaster
  const isRoller = lower.includes('tàu lượn') || lower.includes('roller coaster') || (lower.includes('bảo toàn cơ năng') && lower.includes('vòng'));
  if (isRoller && SAMPLE_DATA.roller_coaster) {
    return {
      title: SAMPLE_DATA.roller_coaster.title,
      svg: SAMPLE_DATA.roller_coaster.svg,
      tikz: SAMPLE_DATA.roller_coaster.tikz,
      model: 'Smart Real-World Physics Engine (Tàu lượn siêu tốc)'
    };
  }

  // Nhận diện Pin quả chanh điện hóa
  const isLemon = lower.includes('pin chanh') || (lower.includes('chanh') && (lower.includes('pin') || lower.includes('kẽm') || lower.includes('đồng') || lower.includes('led')));
  if (isLemon && SAMPLE_DATA.lemon_battery) {
    return {
      title: SAMPLE_DATA.lemon_battery.title,
      svg: SAMPLE_DATA.lemon_battery.svg,
      tikz: SAMPLE_DATA.lemon_battery.tikz,
      model: 'Smart Chemistry Engine (Pin quả chanh đời sống)'
    };
  }

  // Nhận diện Vòng tuần hoàn nước
  const isWaterCycle = lower.includes('vòng tuần hoàn nước') || (lower.includes('nước') && lower.includes('bốc hơi') && lower.includes('mưa'));
  if (isWaterCycle && SAMPLE_DATA.water_cycle) {
    return {
      title: SAMPLE_DATA.water_cycle.title,
      svg: SAMPLE_DATA.water_cycle.svg,
      tikz: SAMPLE_DATA.water_cycle.tikz,
      model: 'Smart Natural Science Engine (Vòng tuần hoàn nước)'
    };
  }

  const systemInstruction = `Bạn là chuyên gia đồ họa khoa học và giáo dục THPT Việt Nam (Toán, Vật lí, Hóa học - GDPT 2018).
Nhiệm vụ: Từ đề bài và/hoặc ảnh chụp, vẽ lại hình minh họa ĐÚNG NỘI DUNG của đề (đúng vật thể, đúng tên điểm, đúng quan hệ hình học), không dùng hình mẫu khác.

QUY TẮC BẮT BUỘC CHO CÁC BÀI TOÁN KINH ĐIỂN THI THPT:
1. BĂNG GIẤY THÍ NGHIỆM GHI CHẤM (Vật lí 10 - Thiết bị tạo chấm trên băng giấy):
   - BẮT BUỘC vẽ 3 băng giấy nằm ngang xếp dọc từ trên xuống (Hình 1, Hình 2, Hình 3).
   - HAI ĐẦU (trái và phải) của MỖI băng giấy BẮT BUỘC LÀ NÉT RĂNG CƯA ZIGZAG (như vết rách xé rời của giấy, dùng path zigzag ví dụ d="M 60,30 L 55,35 L 65,40 L 55,45..."). TUYỆT ĐỐI KHÔNG vẽ đầu phẳng hay hình chữ nhật trơn!
   - Đầu bên trái có một vạch thẳng đứng kẻ cắt ngang thân băng giấy. Bên trái vạch đứng là số 0 và chấm mốc 0.
   - Vị trí các chấm đen chuẩn xác:
     * Hình 1 (chuyển động thẳng đều): Các chấm cách ĐỀU nhau.
     * Hình 2 (nhanh dần đều): Các chấm CÁCH XA DẦN NHAU.
     * Hình 3: Các chấm ban đầu cách xa, sau đó CÀNG VỀ PHÍA PHẢI CÀNG DỒN SÁT NHAU (khoảng cách giảm dần).
     * Dưới mỗi băng giấy có chữ in đậm: "Hình 1", "Hình 2", "Hình 3".
     * MỌI chấm đen phải là thẻ <circle class="draggable-dot" cx="..." cy="..." r="4.2" fill="#000000" /> và các nhãn chữ phải là <text class="draggable-text" x="..." y="..." ...> để người dùng có thể nhấp chuột kéo thả di chuyển tùy ý trên màn hình!

2. ĐỒ THỊ ĐỘ DỊCH CHUYỂN - THỜI GIAN CỦA THỦ MÔN (Vật lí 10):
   - Hệ trục tọa độ d(m) thẳng đứng và t(s) nằm ngang có mũi tên và gốc 0.
   - Trục d(m) có mốc: 10, 20. Trục t(s) có mốc: 1, 2, 3, 4, 5, 6.
   - BẮT BUỘC CÓ ĐẦY ĐỦ CÁC ĐƯỜNG DÓNG NÉT ĐỨT (stroke-dasharray="4,4"):
     * Từ d=10 sang ngang gặp B và dóng thẳng đứng xuống t=2.
     * Từ d=20 sang ngang gặp C, D và dóng từ C thẳng đứng xuống t=3, dóng từ D thẳng đứng xuống t=4.
   - Đồ thị gồm: Đoạn AB là đường cong Parabol từ gốc A(0,0) dốc cong lên B(2, 10); Đoạn BC là đoạn thẳng dốc lên C(3, 20); Đoạn CD là đoạn thẳng nằm ngang đến D(4, 20); Đoạn DE là đoạn thẳng dốc xuống E(6, 0).
   - Nhãn A, B, C, D, E và các mốc số có class "draggable-label" hoặc "draggable-text".

3. ĐỒ THỊ RƠI TỰ DO (Hình 4 và Hình 5):
   - TRUNG THỰC TUYỆT ĐỐI VỚI HÌNH VẼ ĐỀ THI GỐC: CẢ HÌNH 4 (v - t) VÀ HÌNH 5 (d - t) ĐỀU LÀ ĐƯỜNG THẲNG DỐC LÊN TỪ GỐC 0!
   - TUYỆT ĐỐI KHÔNG vẽ đường cong hay parabol cho Hình 5 vì đây là hình bẫy câu hỏi trắc nghiệm Đúng/Sai!
   - Nhãn 'Hình 4' và 'Hình 5' đặt cách mép đáy viewBox ít nhất 40px, không để sát mép gây cắt cụt chữ.

Yêu cầu hình:
- Nếu là bài toán thực tế 3D (ngôi nhà, mái nhà, ánh sáng mặt trời, hệ trục Oxyz - chuẩn SGK Toán 12):
  + Mặt tiền (mặt trước) là hình chữ nhật rộng 8m, cao 4m, có cửa chính ở giữa và các cửa sổ.
  + Mái dốc trước nhìn thấy toàn bộ diện tích là hình bình hành E-H-G-F (có vân ngói lượn sóng màu nâu đỏ gạch). Sống mái HG nằm ngang trên cùng.
  + Mặt bên phải là đầu hồi ngũ giác với 4 cửa sổ xiên theo phối cảnh, đỉnh G dóng đường thẳng đứng xuống trần ghi 2m, tường phải cao 4m, sâu 8m.
  + Hệ tọa độ Oxyz tại gốc O góc dưới trái mặt tiền: Ox sang phải, Oz thẳng đứng lên trên, Oy xiên chúc xuống trái.
  + Cột AB trắng viền đen dựng thẳng đứng trên mái từ A lên B, vệt bóng đen đổ chéo xuống phải trên mái dốc.
  + Mặt trời vàng 3D và vectơ tia sáng v chỉ hướng chiếu.
- Nếu là bài toán khinh khí cầu, trực thăng, đỉnh núi, bức tường sương mù (Câu 43 Oxyz):
  + Phải vẽ dãy núi 3D hùng vĩ ở phía sau bên phải, đỉnh núi nhọn cao nhất là S(-4; 32; 16).
  + Trực thăng cứu hộ màu vàng cam (có thân tròn, buồng lái kính, cánh quạt chính, cánh quạt đuôi và càng hạ cánh) bay từ sân bay quân sự F(20; -8; 0) theo đường bay đỏ thẳng lên đỉnh núi S.
  + Khinh khí cầu dạng khí cầu thoi (blimp/airship) màu xanh da trời (có thân khí động học, gân múi 3D, cánh lái ổn định đuôi và cabin gondola) bay từ sân bay L(24; 52; 0) qua điểm P(20; 42; 2) hướng vào bức tường sương mù E_ABC tại điểm N.
  + Bức tường sương mù E_ABC là mặt phẳng tam giác dựng đứng màu xám khói bán trong suốt cắt 3 trục tọa độ tại A(16;0;0), B(0;16;0), C(0;0;16).
  + Dưới điểm P có vệt chiếu vuông góc nét đứt xuống mặt đất Oxy.
  + Hệ trục Oxyz: Oz thẳng đứng, Ox xiên chúc xuống trái, Oy nằm ngang xiên nhẹ sang phải.
- Hình không gian: dùng phép chiếu song song (trục sâu xiên 45°, rút ngắn 1/2), cạnh khuất nét đứt (stroke-dasharray), tên điểm in nghiêng, đặt nhãn không đè lên nét.
- Vật lí/Hóa học: vẽ đầy đủ dụng cụ, nhãn chú thích tiếng Việt.
- SVG: viewBox="0 0 860 540", nền trắng, có <rect width="860" height="540" fill="white"/>, font-family="Times New Roman, serif", nét vẽ thanh tú, màu sắc hài hòa.
- TikZ: mã tương ứng biên dịch được trong Overleaf.

Trả về DUY NHẤT một JSON object:
{"title": "Tên hình ngắn gọn", "svg": "<svg ...>...</svg>", "tikz": "\\\\begin{tikzpicture} ... \\\\end{tikzpicture}"}`;

  const parts = [];
  if (base64Image) {
    const m = base64Image.match(/^data:([^;]+);base64,/);
    const commaIdx = base64Image.indexOf(',');
    parts.push({ inlineData: { mimeType: m ? m[1] : 'image/jpeg', data: commaIdx > 0 ? base64Image.substring(commaIdx + 1) : base64Image } });
  }
  let userContextText = promptText;
  if (!userContextText && base64Image) {
    userContextText = "Hãy phân tích kỹ hình ảnh đề thi đính kèm:\n- Nếu trong ảnh là bài toán băng giấy tạo chấm (chuyển động của băng giấy Hình 1, 2, 3): BẮT BUỘC vẽ đủ 3 băng giấy với 2 ĐẦU NÉT RĂNG CƯA ZIGZAG (như vết xé rời của giấy), vạch đứng mốc 0, vị trí các chấm đen chuẩn xác (Hình 1 cách đều, Hình 2 cách xa dần, Hình 3 sít dần về bên phải), tất cả chấm có class draggable-dot và chữ có class draggable-text.\n- Nếu trong ảnh là đồ thị độ dịch chuyển của thủ môn (Câu 3): BẮT BUỘC vẽ đường cong AB parabol và các đoạn thẳng BC, CD, DE, ĐẦY ĐỦ CÁC ĐƯỜNG DÓNG NÉT ĐỨT từ 10 và 20 xuống 2, 3, 4, các nhãn A, B, C, D, E.\n- Nếu trong ảnh là đồ thị rơi tự do (Hình 4 & Hình 5): BẮT BUỘC vẽ cả Hình 4 và Hình 5 đều là ĐƯỜNG THẲNG dốc lên từ gốc 0, nhãn chữ thông thoáng.\n- Nếu là dạng bài toán khác: Vẽ lại chính xác hình theo đúng nội dung và số liệu đề bài.";
  }
  parts.push({
    text: `${systemInstruction}\n\nMôn học: ${subjectName}\nĐề bài / Mô tả:\n${userContextText}`
  });

  const result = await window.GeminiClient.generateJson({ parts, preferredModel: selectedModel, onProgress });
  const data = result.data || {};
  let svg = typeof data.svg === 'string' ? data.svg.trim() : '';
  if (!/^<svg[\s>]/i.test(svg)) {
    const i = svg.indexOf('<svg');
    svg = i >= 0 ? svg.slice(i) : '';
  }
  if (!svg || !/<\/svg>\s*$/i.test(svg)) {
    throw new Error('AI trả về hình SVG không hoàn chỉnh. Vui lòng bấm tạo lại (hoặc mô tả đề ngắn gọn hơn).');
  }
  return { title: data.title, svg, tikz: data.tikz || '', model: result.model };
}

function loadRenderedData(title, svgCode, tikzCode) {
  AppState.currentTitle = title;
  AppState.currentSvg = svgCode;
    setTimeout(() => { 
      if (typeof window.applySvgTransform === 'function') window.applySvgTransform(); 
      if (typeof window.setupSvgInteractiveListeners === 'function') window.setupSvgInteractiveListeners(); 
    }, 50);
  AppState.currentTikz = tikzCode;

  document.getElementById('diagram-title').innerText = title;
  document.getElementById('svg-view-wrap').innerHTML = svgCode;
  document.getElementById('tikz-textarea').value = tikzCode;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.remove('translate-y-10', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-10', 'opacity-0');
  }, 2500);
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Convert SVG to PNG
function exportSvgToPng(transparent = false) {
  const svgEl = document.querySelector('#svg-view-wrap svg');
  if (!svgEl) return;

  const svgXml = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400; // 2x high resolution
    canvas.height = 920;
    const ctx = canvas.getContext('2d');

    if (!transparent) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    triggerDownload(pngUrl, `${AppState.currentTitle || 'hinh-minh-hoa'}.png`);
    showToast(`Đã tải ảnh PNG ${transparent ? 'trong suốt' : 'nền trắng'}!`);
  };
  img.src = url;
}

document.addEventListener('DOMContentLoaded', () => {
  // Load saved Key
  const savedKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('gemini_api_keys') || localStorage.getItem('smartedu_gemini_key') || '';
  if (savedKey) {
    document.getElementById('gemini-api-key').value = savedKey;
    AppState.apiKey = savedKey;
  }
  document.getElementById('btn-save-key').addEventListener('click', () => {
    const key = document.getElementById('gemini-api-key').value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      localStorage.setItem('gemini_api_keys', key);
      localStorage.setItem('smartedu_gemini_key', key);
      AppState.apiKey = key;
      if (window.GeminiClient) window.GeminiClient.clearBlocks();
      showToast("Đã lưu API Key thành công!");
    }
  });

  // Tab switching: SVG vs TikZ vs Dual-Layer Realistic vs Exam Print
  const tabSvg = document.getElementById('tab-svg-preview');
  const tabTikz = document.getElementById('tab-tikz-preview');
  const tabDual = document.getElementById('tab-dual-realistic');
  const tabExam = document.getElementById('tab-exam-print');
  const wrapSvg = document.getElementById('svg-view-wrap');
  const wrapTikz = document.getElementById('tikz-view-wrap');
  const btnDlWhitePng = document.getElementById('btn-dl-white-png');
  const btnDlTransPng = document.getElementById('btn-dl-trans-png');
  const btnDlSvg = document.getElementById('btn-dl-svg');
  const btnDlDualPng = document.getElementById('btn-dl-dual-png');
  const btnDlExamPrint = document.getElementById('btn-dl-exam-print');

  function resetTabStyles() {
    [tabSvg, tabTikz, tabDual, tabExam].forEach(t => {
      if (t) t.className = "px-3 py-1.5 rounded-lg hover:text-slate-900 transition font-bold text-slate-600";
    });
    const dualContainer = document.getElementById('dual-layer-container');
    const examContainer = document.getElementById('exam-print-container');
    if (dualContainer) dualContainer.classList.add('hidden');
    if (examContainer) examContainer.classList.add('hidden');
  }

  if (tabSvg) {
    tabSvg.addEventListener('click', () => {
      resetTabStyles();
      tabSvg.className = "px-3 py-1.5 rounded-lg bg-white text-blue-600 shadow-sm transition font-bold";
      wrapSvg.classList.remove('hidden');
      wrapTikz.classList.add('hidden');
      if (btnDlWhitePng) btnDlWhitePng.classList.remove('hidden');
      if (btnDlTransPng) btnDlTransPng.classList.remove('hidden');
      if (btnDlSvg) btnDlSvg.classList.remove('hidden');
      if (btnDlDualPng) btnDlDualPng.classList.add('hidden');
      if (btnDlExamPrint) btnDlExamPrint.classList.add('hidden');
    });
  }

  if (tabTikz) {
    tabTikz.addEventListener('click', () => {
      resetTabStyles();
      tabTikz.className = "px-3 py-1.5 rounded-lg bg-white text-blue-600 shadow-sm transition font-bold";
      wrapTikz.classList.remove('hidden');
      wrapSvg.classList.add('hidden');
    });
  }

  if (tabDual && window.RealisticModule) {
    tabDual.addEventListener('click', () => {
      resetTabStyles();
      window.RealisticModule.showRealisticTab();
      if (btnDlWhitePng) btnDlWhitePng.classList.add('hidden');
      if (btnDlTransPng) btnDlTransPng.classList.add('hidden');
      if (btnDlSvg) btnDlSvg.classList.remove('hidden');
      if (btnDlDualPng) btnDlDualPng.classList.remove('hidden');
      if (btnDlExamPrint) btnDlExamPrint.classList.add('hidden');
    });
  }

  if (tabExam && window.RealisticModule) {
    tabExam.addEventListener('click', () => {
      resetTabStyles();
      window.RealisticModule.showExamPrintTab();
      if (btnDlWhitePng) btnDlWhitePng.classList.add('hidden');
      if (btnDlTransPng) btnDlTransPng.classList.add('hidden');
      if (btnDlSvg) btnDlSvg.classList.remove('hidden');
      if (btnDlDualPng) btnDlDualPng.classList.add('hidden');
      if (btnDlExamPrint) btnDlExamPrint.classList.remove('hidden');
    });
  }

  // Image upload & paste handling
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const dropPrompt = document.getElementById('drop-prompt');
  const previewWrap = document.getElementById('preview-wrap');
  const imagePreview = document.getElementById('image-preview');
  const btnRemoveImg = document.getElementById('btn-remove-img');
  let currentBase64 = null;

  function setPreview(file) {
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) {
      showToast("Tệp không phải là ảnh hợp lệ!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentBase64 = e.target.result;
      imagePreview.src = currentBase64;
      dropPrompt.classList.add('hidden');
      previewWrap.classList.remove('hidden');
      showToast("Đã tải ảnh thành công!");
    };
    reader.readAsDataURL(file);
  }

  // 1. Chọn tệp qua hộp thoại file
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        setPreview(e.target.files[0]);
      }
    });
  }

  // 2. Kéo thả ảnh vào Drop Zone
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(evtName => {
      dropZone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-blue-500', 'bg-blue-50/60');
      });
    });

    ['dragleave', 'drop'].forEach(evtName => {
      dropZone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-blue-500', 'bg-blue-50/60');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        setPreview(e.dataTransfer.files[0]);
      }
    });
  }

  // 3. Nút xóa ảnh đã chọn
  if (btnRemoveImg) {
    btnRemoveImg.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentBase64 = null;
      imagePreview.src = "";
      previewWrap.classList.add('hidden');
      dropPrompt.classList.remove('hidden');
      if (fileInput) fileInput.value = "";
      showToast("Đã gỡ ảnh");
    });
  }

  // 4. Dán ảnh từ Clipboard (Ctrl + V) trên toàn cửa sổ và trong ô nhập đề bài
  function handlePasteImage(e) {
    const cd = e.clipboardData;
    if (!cd) return;

    // A. Kiểm tra danh sách items (Ảnh chụp màn hình, Snipping tool, Copy image web)
    const items = cd.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setPreview(file);
          return;
        }
      }
    }

    // B. Kiểm tra danh sách files (Copy file ảnh từ thư mục máy tính)
    const files = cd.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type && file.type.indexOf('image') !== -1) {
        e.preventDefault();
        setPreview(file);
        return;
      }
    }
  }

  window.addEventListener('paste', handlePasteImage);
  const promptInputEl = document.getElementById('prompt-input');
  if (promptInputEl) {
    promptInputEl.addEventListener('paste', handlePasteImage);
  }

  // Samples click
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.dataset.sample;
      const data = SAMPLE_DATA[sampleKey];
      if (data) {
        loadRenderedData(data.title, data.svg, data.tikz);
        showToast(`Đã tải mẫu: ${data.title}`);
      }
    });
  });

  // Generate Button
  const btnGen = document.getElementById('btn-generate');
  const errorBox = document.getElementById('error-box');
  const errorMsg = document.getElementById('error-msg');

  btnGen.addEventListener('click', async () => {
    const text = document.getElementById('prompt-input').value.trim();
    const subject = document.getElementById('subject-select').value;
    const isDualMode = document.getElementById('chk-dual-layer-mode')?.checked;

    if (!text && !currentBase64) {
      errorBox.classList.remove('hidden');
      errorMsg.innerText = "Vui lòng nhập mô tả hoặc dán ảnh bài toán!";
      return;
    }

    errorBox.classList.add('hidden');
    btnGen.disabled = true;
    btnGen.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>${isDualMode ? 'ĐANG TẠO HÌNH THỰC TẾ 2 LỚP & KHÓA TỌA ĐỘ...' : 'AI ĐANG VẼ VECTOR & SINH TIKZ...'}</span>
    `;

    const svgWrapEl = document.getElementById('svg-view-wrap');
    svgWrapEl.style.opacity = '0.35';
    try {
      if (isDualMode && window.RealisticModule) {
        // LUỒNG MỚI ĐỘC LẬP: Hình Thực Tế AI (2 Lớp Dual-Layer)
        const realRes = await window.RealisticModule.callRealisticImageApi(text, currentBase64, subject, AppState.apiKey);
        window.RealisticModule.updateData(realRes.backgroundImageData, realRes.svgOverlay, realRes.examPrintSvg);
        loadRenderedData(realRes.title || "Hình Thực Tế 2 Lớp (Dual-Layer)", realRes.svgOverlay, "");
        if (tabDual) tabDual.click();
        showToast(`Tạo hình thực tế 2 lớp thành công (${realRes.modelUsed})!`);
      } else {
        // LUỒNG CŨ BẢO TOÀN NGUYÊN VẸN 100%: Sinh TikZ & SVG
        const res = await callAiSvgGeneration(text, currentBase64, subject, (msg) => {
          const sp = btnGen.querySelector('span');
          if (sp) sp.innerText = msg;
        });
        loadRenderedData(res.title || "Hình Vẽ Minh Họa AI", res.svg, res.tikz);
        showToast("Tạo ảnh minh họa thành công (" + res.model + ")!");
      }
    } catch (err) {
      errorBox.classList.remove('hidden');
      errorMsg.innerText = err.message || "Đã xảy ra lỗi.";
      document.getElementById('diagram-title').innerText = 'Chưa tạo được hình mới — xem thông báo lỗi bên trái';
    } finally {
      svgWrapEl.style.opacity = '1';
      btnGen.disabled = false;
      btnGen.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        <span>TẠO ẢNH MINH HỌA AI (SVG &amp; TIKZ)</span>
      `;
    }
  });

  // Downloads
  document.getElementById('btn-dl-white-png').addEventListener('click', () => exportSvgToPng(false));
  document.getElementById('btn-dl-trans-png').addEventListener('click', () => exportSvgToPng(true));
  if (btnDlDualPng && window.RealisticModule) {
    btnDlDualPng.addEventListener('click', () => window.RealisticModule.exportMergedPng());
  }
  if (btnDlExamPrint && window.RealisticModule) {
    btnDlExamPrint.addEventListener('click', () => window.RealisticModule.exportExamPrintPng());
  }
  document.getElementById('btn-dl-svg').addEventListener('click', () => {
    if (!AppState.currentSvg) return;
    const blob = new Blob([AppState.currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), `${AppState.currentTitle || 'hinh-ve'}.svg`);
    showToast("Đã tải tệp .SVG vector!");
  });

  document.getElementById('btn-copy-tikz').addEventListener('click', () => {
    const val = document.getElementById('tikz-textarea').value;
    if (val) {
      navigator.clipboard.writeText(val);
      showToast("Đã sao chép TikZ LaTeX vào clipboard!");
    }
  });

  // Subject change listener to update hints & placeholders
  const subjectSelectEl = document.getElementById('subject-select');
  if (subjectSelectEl && promptInputEl) {
    const hints = {
      math: 'Nhập nội dung câu hỏi hình học, đồ thị hàm số...\nVí dụ: Cho hình chóp tứ giác đều S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy...',
      math_real: 'Nhập bài toán thực tế đời sống (Cầu treo Parabol, Nhà mái dốc 3D, Quỹ đạo Oxyz)...\nVí dụ: Cầu treo dây võng có 2 trụ tháp cao 30m, nhịp cầu 120m, dây cáp có dạng Parabol y = a.x^2. Tính chiều dài các thanh treo cáp đứng...',
      physics: 'Nhập đề bài thí nghiệm hoặc hiện tượng vật lí...\nVí dụ: Nhiệt lượng kế xác định nhiệt dung riêng của nước hoặc mạch điện RLC nối tiếp...',
      physics_real: 'Nhập hiện tượng vật lí ngoài đời thật (Tàu lượn siêu tốc, Thanh trượt từ, Đòn bẩy cẩu hàng)...\nVí dụ: Một toa tàu lượn siêu tốc khối lượng m bắt đầu trượt không vận tốc đầu từ đỉnh dốc cao 20m xuống vòng lộn đứng tròn bán kính R = 5m...',
      chemistry: 'Nhập dụng cụ thí nghiệm, bình phản ứng, chiết tách...\nVí dụ: Bộ dụng cụ chuẩn độ axit - bazơ gồm buret chia vạch 50ml kẹp trên giá sắt và bình tam giác...',
      chemistry_real: 'Nhập bài toán hóa học đời sống & công nghiệp (Pin chanh, Ăn mòn kim loại, Khí thải)...\nVí dụ: Thí nghiệm pin quả chanh: Cắm một bản kẽm (Zn) và một bản đồng (Cu) vào quả chanh, nối dây dẫn qua đèn LED đỏ làm đèn phát sáng...',
      nature_science: 'Nhập hiện tượng khoa học tự nhiên & sinh thái (Vòng tuần hoàn nước, Quang hợp, Tế bào)...\nVí dụ: Sơ đồ vòng tuần hoàn của nước trong tự nhiên: Nước biển bốc hơi dưới ánh nắng mặt trời, ngưng tụ thành mây, gió đẩy vào đất liền gặp lạnh tạo mưa...',
      social_science: 'Nhập sơ đồ địa lí & khoa học xã hội (Lát cắt địa hình đồi núi, Bão áp thấp, Đô thị hóa)...\nVí dụ: Sơ đồ lát cắt địa hình đồi núi Việt Nam từ vùng núi Tây Bắc qua thung lũng sông Hồng đến đồng bằng ven biển...'
    };
    subjectSelectEl.addEventListener('change', () => {
      const val = subjectSelectEl.value;
      if (hints[val]) {
        promptInputEl.placeholder = hints[val];
      }
    });
  }


  // ========================================================
  // ROBUST INTERACTIVE TRANSFORM & GRAPH ANCHOR DRAG ENGINE
  // ========================================================
  let currentZoom = 1.0;
  let currentScaleX = 1.0;
  let currentScaleY = 1.0;
  let isDragEditMode = false;
  let activeDragTarget = null;
  let dragOffset = { x: 0, y: 0 };

  const zoomValEl = document.getElementById('zoom-val');
  const scaleXValEl = document.getElementById('scale-x-val');
  const scaleYValEl = document.getElementById('scale-y-val');
  const btnToggleDrag = document.getElementById('btn-toggle-drag-mode');
  const dragModeText = document.getElementById('drag-mode-text');

  window.applySvgTransform = applySvgTransform;
  function applySvgTransform() {
    const svgEl = document.querySelector('#svg-view-wrap svg');
    if (!svgEl) return;
    svgEl.style.transformOrigin = 'center center';
    svgEl.style.transform = `scale(${(currentZoom * currentScaleX).toFixed(2)}, ${(currentZoom * currentScaleY).toFixed(2)})`;
    svgEl.style.transition = isDragEditMode ? 'none' : 'transform 0.12s ease-out';
  }

  function updateTransformLabels() {
    if (zoomValEl) zoomValEl.innerText = Math.round(currentZoom * 100) + '%';
    if (scaleXValEl) scaleXValEl.innerText = Math.round(currentScaleX * 100) + '%';
    if (scaleYValEl) scaleYValEl.innerText = Math.round(currentScaleY * 100) + '%';
    applySvgTransform();
  }

  // Zoom buttons
  document.getElementById('btn-zoom-in')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentZoom = Math.min(2.5, +(currentZoom + 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Phóng to: " + Math.round(currentZoom * 100) + "%");
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentZoom = Math.max(0.4, +(currentZoom - 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Thu nhỏ: " + Math.round(currentZoom * 100) + "%");
  });

  // Scale X (Rộng)
  document.getElementById('btn-scale-x-inc')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentScaleX = Math.min(2.0, +(currentScaleX + 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Chiều rộng: " + Math.round(currentScaleX * 100) + "%");
  });
  document.getElementById('btn-scale-x-dec')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentScaleX = Math.max(0.4, +(currentScaleX - 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Chiều rộng: " + Math.round(currentScaleX * 100) + "%");
  });

  // Scale Y (Cao)
  document.getElementById('btn-scale-y-inc')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentScaleY = Math.min(2.0, +(currentScaleY + 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Chiều cao: " + Math.round(currentScaleY * 100) + "%");
  });
  document.getElementById('btn-scale-y-dec')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentScaleY = Math.max(0.4, +(currentScaleY - 0.1).toFixed(2));
    updateTransformLabels();
    showToast("Chiều cao: " + Math.round(currentScaleY * 100) + "%");
  });

  // Reset transform
  document.getElementById('btn-reset-transform')?.addEventListener('click', (e) => {
    e.preventDefault();
    currentZoom = 1.0;
    currentScaleX = 1.0;
    currentScaleY = 1.0;
    updateTransformLabels();
    showToast("Đã đặt lại kích thước hình vẽ 100%!");
  });

  // Toggle Drag & Edit Mode
  if (btnToggleDrag) {
    btnToggleDrag.addEventListener('click', () => {
      isDragEditMode = !isDragEditMode;
      if (isDragEditMode) {
        btnToggleDrag.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
        btnToggleDrag.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600', 'ring-2', 'ring-indigo-300');
        if (dragModeText) dragModeText.innerText = "Đang Kéo Thả (Bấm Tắt)";
        showToast("Đã BẬT Kéo Thả: Hãy bấm chuột vào đỉnh hoặc chữ để kéo!");
      } else {
        btnToggleDrag.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600', 'ring-2', 'ring-indigo-300');
        btnToggleDrag.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
        if (dragModeText) dragModeText.innerText = "Bật Kéo Điểm / Chữ";
        showToast("Đã TẮT chế độ kéo thả");
      }
      setupSvgInteractiveListeners();
    });
  }

  function getSvgPoint(svg, evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      return pt.matrixTransform(ctm.inverse());
    }
    // Fallback if CTM is null
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal || { width: 740, height: 480 };
    return {
      x: ((evt.clientX - rect.left) / rect.width) * viewBox.width,
      y: ((evt.clientY - rect.top) / rect.height) * viewBox.height
    };
  }

  // Dynamic Graph Anchor Update for Goalkeeper & General Functions
  function updateGraphAnchorRelations(svgEl, pointId, nx, ny) {
    if (pointId === 'B') {
      // Đỉnh B(nx, ny)
      const curveAb = svgEl.querySelector('#curve-ab');
      if (curveAb) {
        const cpx = ((100 + nx) / 2).toFixed(1);
        curveAb.setAttribute('d', `M 100 390 Q ${cpx} 390 ${nx} ${ny}`);
      }
      const lineBc = svgEl.querySelector('#line-bc');
      if (lineBc) {
        lineBc.setAttribute('x1', nx);
        lineBc.setAttribute('y1', ny);
      }
      const projBh = svgEl.querySelector('#proj-b-h');
      if (projBh) {
        projBh.setAttribute('y1', ny);
        projBh.setAttribute('x2', nx);
        projBh.setAttribute('y2', ny);
      }
      const projBv = svgEl.querySelector('#proj-b-v');
      if (projBv) {
        projBv.setAttribute('x1', nx);
        projBv.setAttribute('y1', ny);
        projBv.setAttribute('x2', nx);
      }
      const labelB = svgEl.querySelector('#label-B');
      if (labelB) {
        labelB.setAttribute('x', nx - 22);
        labelB.setAttribute('y', ny - 10);
      }
    } else if (pointId === 'C') {
      // Đỉnh C(nx, ny)
      const lineBc = svgEl.querySelector('#line-bc');
      if (lineBc) {
        lineBc.setAttribute('x2', nx);
        lineBc.setAttribute('y2', ny);
      }
      const lineCd = svgEl.querySelector('#line-cd');
      if (lineCd) {
        lineCd.setAttribute('x1', nx);
        lineCd.setAttribute('y1', ny);
      }
      const projCh = svgEl.querySelector('#proj-c-h');
      if (projCh) {
        projCh.setAttribute('y1', ny);
        projCh.setAttribute('x2', nx);
        projCh.setAttribute('y2', ny);
      }
      const projCv = svgEl.querySelector('#proj-c-v');
      if (projCv) {
        projCv.setAttribute('x1', nx);
        projCv.setAttribute('y1', ny);
        projCv.setAttribute('x2', nx);
      }
      const labelC = svgEl.querySelector('#label-C');
      if (labelC) {
        labelC.setAttribute('x', nx - 10);
        labelC.setAttribute('y', ny - 18);
      }
    } else if (pointId === 'D') {
      // Đỉnh D(nx, ny)
      const lineCd = svgEl.querySelector('#line-cd');
      if (lineCd) {
        lineCd.setAttribute('x2', nx);
        lineCd.setAttribute('y2', ny);
      }
      const lineDe = svgEl.querySelector('#line-de');
      if (lineDe) {
        lineDe.setAttribute('x1', nx);
        lineDe.setAttribute('y1', ny);
      }
      const projDv = svgEl.querySelector('#proj-d-v');
      if (projDv) {
        projDv.setAttribute('x1', nx);
        projDv.setAttribute('y1', ny);
        projDv.setAttribute('x2', nx);
      }
      const labelD = svgEl.querySelector('#label-D');
      if (labelD) {
        labelD.setAttribute('x', nx + 5);
        labelD.setAttribute('y', ny - 18);
      }
    } else if (pointId === 'E') {
      // Đỉnh E(nx, 390) trên trục hoành
      const lineDe = svgEl.querySelector('#line-de');
      if (lineDe) {
        lineDe.setAttribute('x2', nx);
        lineDe.setAttribute('y2', 390);
      }
      const labelE = svgEl.querySelector('#label-E');
      if (labelE) {
        labelE.setAttribute('x', nx + 5);
        labelE.setAttribute('y', 380);
      }
    }
  }

  window.setupSvgInteractiveListeners = setupSvgInteractiveListeners;
  function setupSvgInteractiveListeners() {
    const svgEl = document.querySelector('#svg-view-wrap svg');
    if (!svgEl) return;

    // Tìm tất cả các đối tượng có thể kéo: circles, texts, tspans, anchors
    const draggables = svgEl.querySelectorAll('circle, text, tspan, .graph-anchor, .draggable-dot, .draggable-label');
    
    draggables.forEach(target => {
      // Nếu là tspan thì trỏ lên thẻ text cha
      const el = target.tagName.toLowerCase() === 'tspan' ? (target.parentElement || target) : target;

      if (isDragEditMode) {
        el.style.cursor = 'grab';
        el.setAttribute('pointer-events', 'all');
      } else {
        el.style.cursor = '';
      }

      el.onpointerdown = null;
      el.ondblclick = null;

      if (isDragEditMode) {
        el.onpointerdown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeDragTarget = el;
          el.style.cursor = 'grabbing';
          const pt = getSvgPoint(svgEl, e);

          if (el.tagName.toLowerCase() === 'circle') {
            dragOffset.x = pt.x - parseFloat(el.getAttribute('cx') || 0);
            dragOffset.y = pt.y - parseFloat(el.getAttribute('cy') || 0);
          } else if (el.tagName.toLowerCase() === 'text') {
            dragOffset.x = pt.x - parseFloat(el.getAttribute('x') || 0);
            dragOffset.y = pt.y - parseFloat(el.getAttribute('y') || 0);
          }
        };

        // Nhấp đúp vào text để sửa chữ trực tiếp
        if (el.tagName.toLowerCase() === 'text' || target.tagName.toLowerCase() === 'tspan') {
          target.ondblclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const oldText = (target.textContent || '').trim();
            const newText = prompt('Sửa nội dung văn bản:', oldText);
            if (newText !== null && newText.trim() !== '') {
              target.textContent = newText.trim();
              AppState.currentSvg = svgEl.outerHTML;
              showToast("Đã cập nhật chữ: " + newText.trim());
            }
          };
        }
      }
    });
  }

  // GLOBAL POINTER LISTENERS: Bắt chuyển động trên toàn cửa sổ (chống tuột chuột)
  window.addEventListener('pointermove', (e) => {
    if (!isDragEditMode || !activeDragTarget) return;
    const svgEl = document.querySelector('#svg-view-wrap svg');
    if (!svgEl) return;

    const pt = getSvgPoint(svgEl, e);
    const tag = activeDragTarget.tagName.toLowerCase();

    if (tag === 'circle') {
      const nx = +(pt.x - dragOffset.x).toFixed(1);
      const ny = +(pt.y - dragOffset.y).toFixed(1);
      activeDragTarget.setAttribute('cx', nx);
      activeDragTarget.setAttribute('cy', ny);

      // Nếu là anchor của đồ thị
      const pointId = activeDragTarget.getAttribute('data-point');
      if (pointId) {
        updateGraphAnchorRelations(svgEl, pointId, nx, ny);
      }
    } else if (tag === 'text') {
      const nx = +(pt.x - dragOffset.x).toFixed(1);
      const ny = +(pt.y - dragOffset.y).toFixed(1);
      activeDragTarget.setAttribute('x', nx);
      activeDragTarget.setAttribute('y', ny);
    }
  });

  window.addEventListener('pointerup', () => {
    if (activeDragTarget) {
      activeDragTarget.style.cursor = isDragEditMode ? 'grab' : '';
      activeDragTarget = null;
      const svgEl = document.querySelector('#svg-view-wrap svg');
      if (svgEl) AppState.currentSvg = svgEl.outerHTML;
    }
  });

    // Load default sample
  const init = SAMPLE_DATA.calorimeter;
  loadRenderedData(init.title, init.svg, init.tikz);
});
