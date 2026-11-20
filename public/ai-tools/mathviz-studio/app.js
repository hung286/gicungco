/**
 * MathViz AI Studio — Vẽ Hình & Render Toán Thực Tế 2D/3D
 * Standard Axonometric Projection (Vietnam High School Curriculum GDPT 2018)
 * Three.js Interactive 3D + Realistic Scene Overlay + Vector Lab Experiments + Gemini AI Multimodal
 */

// ==========================================
// 1. STATE & DATA MODELS
// ==========================================
const AppState = {
  activeView: '2d', // '2d' | '3d' | 'real' | 'svg'
  domain: 'math_3d', // 'math_3d' | 'physics_exp' | 'chemistry_exp' | 'math_2d'
  model: 'gemini-2.5-flash',
  apiKey: '',
  showAxes: true,
  showLabels: true,
  showOverlay: true,
  overlayOpacity: 0.85,
  isRightPanelCollapsed: false,
  zoom2D: 1.0,
  pan2D: { x: 0, y: 0 },
  isDragging2D: false,
  dragStart: { x: 0, y: 0 },
  selectedPointId: null,

  // Current Working Diagram Data
  diagram: {
    title: "Hình Chóp Tứ Giác Đều S.ABCD — Trục Oxyz Thực Tế",
    type: "math_3d",
    scale: 35,
    originOffset: { x: 0, y: 30 },
    points: [
      { id: "O", name: "O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
      { id: "A", name: "A", x: 3, y: -3, z: 0, color: "#1e293b", showLabel: true },
      { id: "B", name: "B", x: 3, y: 3, z: 0, color: "#1e293b", showLabel: true },
      { id: "C", name: "C", x: -3, y: 3, z: 0, color: "#1e293b", showLabel: true },
      { id: "D", name: "D", x: -3, y: -3, z: 0, color: "#1e293b", showLabel: true },
      { id: "S", name: "S(0,0,5)", x: 0, y: 0, z: 5, color: "#dc2626", showLabel: true }
    ],
    segments: [
      { from: "A", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "B", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "C", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "D", to: "A", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "S", to: "A", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "S", to: "O", style: "dashed", arrow: false, color: "#ef4444", width: 1.5 }
    ],
    polygons: [
      { points: ["S", "A", "B"], color: "rgba(99, 102, 241, 0.15)" },
      { points: ["S", "B", "C"], color: "rgba(59, 130, 246, 0.12)" }
    ],
    curves: [],
    svgCode: "",
    realSceneImageUrl: ""
  }
};

// ==========================================
// 2. PRESET LIBRARY (10 TYPICAL HIGH-QUALITY PROBLEMS)
// ==========================================
const PRESETS = [
  {
    id: "preset_free_fall",
    title: "13. Đồ Thị Rơi Tự Do (Vật Lí 10 - Hình 4 & Hình 5)",
    category: "physics_exp",
    badge: "Vật Lí 10",
    desc: "Hình 4 (v-t) và Hình 5 (d-t) đều là đường thẳng dốc lên từ gốc 0 chuẩn đề thi THPT.",
    data: {
      title: "Đồ Thị Vận Tốc & Độ Dịch Chuyển Rơi Tự Do (Hình 4 & Hình 5)",
      desc: "Hình 4 (v-t) và Hình 5 (d-t) đều là đường thẳng dốc lên từ gốc 0 chuẩn đề thi THPT",
      svgCode: `<svg id="main-freefall-svg" viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
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
      tikzCode: `% Đồ thị rơi tự do v-t (Hình 4) và d-t (Hình 5)
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
    }
  },
  {
    id: "preset_goalkeeper",
    title: "12. Đồ Thị Thủ Môn Bắt Bóng (Vật Lí 10)",
    category: "physics_exp",
    badge: "Vật Lí 10",
    desc: "Đồ thị độ dịch chuyển - thời gian của thủ môn gồm đoạn parabol AB, đoạn thẳng BC, CD nằm ngang, DE dốc xuống (chuẩn SGK).",
    data: {
      title: "Đồ Thị Độ Dịch Chuyển - Thời Gian Của Thủ Môn (Vật Lí 10)",
      type: "physics_exp",
      svgCode: `<svg id="main-goalkeeper-svg" viewBox="0 0 740 480" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
  <defs>
    <marker id="arrow-axis-gk-mv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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

  <!-- Trục tung d(m) -->
  <line id="axis-d" x1="100" y1="410" x2="100" y2="60" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-gk-mv)" />
  <text class="draggable-label" id="label-axis-d" x="110" y="55" font-size="20" font-weight="bold" fill="#0f172a">d(m)</text>

  <!-- Trục hoành t(s) -->
  <line id="axis-t" x1="80" y1="390" x2="650" y2="390" stroke="#0f172a" stroke-width="2.2" marker-end="url(#arrow-axis-gk-mv)" />
  <text class="draggable-label" id="label-axis-t" x="655" y="380" font-size="20" font-weight="bold" fill="#0f172a">t(s)</text>

  <!-- Gốc 0 -->
  <text class="draggable-label" id="label-0" x="88" y="410" font-size="18" font-weight="bold">0</text>

  <!-- Vạch chia trục d -->
  <line x1="94" y1="260" x2="106" y2="260" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-val-10" x="82" y="266" font-size="18" font-weight="bold" text-anchor="end">10</text>

  <line x1="94" y1="130" x2="106" y2="130" stroke="#0f172a" stroke-width="2" />
  <text class="draggable-label" id="label-val-20" x="82" y="136" font-size="18" font-weight="bold" text-anchor="end">20</text>

  <!-- Vạch chia trục t: 1..6 -->
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

  <!-- Đường dóng nét đứt -->
  <line id="proj-b-h" x1="100" y1="260" x2="250" y2="260" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />
  <line id="proj-b-v" x1="250" y1="260" x2="250" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />

  <line id="proj-c-h" x1="100" y1="130" x2="325" y2="130" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />
  <line id="proj-c-v" x1="325" y1="130" x2="325" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />

  <line id="proj-d-v" x1="400" y1="130" x2="400" y2="390" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,4" />

  <!-- Đồ thị chính -->
  <path id="curve-ab" d="M 100 390 Q 175 390 250 260" fill="none" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />
  <line id="line-bc" x1="250" y1="260" x2="325" y2="130" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />
  <line id="line-cd" x1="325" y1="130" x2="400" y2="130" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />
  <line id="line-de" x1="400" y1="130" x2="550" y2="390" stroke="#0f172a" stroke-width="3.2" stroke-linecap="round" />

  <!-- Điểm chốt tương tác & tên điểm -->
  <circle class="graph-anchor" id="anchor-A" cx="100" cy="390" r="5" data-point="A" />
  <text class="draggable-label" id="label-A" x="78" y="385" font-size="22" font-weight="bold">A</text>

  <circle class="graph-anchor" id="anchor-B" cx="250" cy="260" r="5" data-point="B" />
  <text class="draggable-label" id="label-B" x="228" y="250" font-size="22" font-weight="bold">B</text>

  <circle class="graph-anchor" id="anchor-C" cx="325" cy="130" r="5" data-point="C" />
  <text class="draggable-label" id="label-C" x="315" y="112" font-size="22" font-weight="bold">C</text>

  <circle class="graph-anchor" id="anchor-D" cx="400" cy="130" r="5" data-point="D" />
  <text class="draggable-label" id="label-D" x="405" y="112" font-size="22" font-weight="bold">D</text>

  <circle class="graph-anchor" id="anchor-E" cx="550" cy="390" r="5" data-point="E" />
  <text class="draggable-label" id="label-E" x="555" y="380" font-size="22" font-weight="bold">E</text>
</svg>`
    }
  },

  {
    id: "preset_paper_tape",
    title: "11. Băng Giấy Thí Nghiệm Chuyển Động (Vật Lí 10)",
    category: "physics_exp",
    badge: "Vật Lí 10",
    desc: "Phân tích 3 kết quả chuyển động của băng giấy qua máy dập chấm (nét răng cưa 2 đầu chuẩn SGK).",
    data: {
      title: "Phân Tích Chuyển Động Của Băng Giấy (Vật Lí 10)",
      type: "physics_exp",
      svgCode: `<svg id="main-paper-tape-svg" viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:'Times New Roman', serif;">
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
    <path d="M 60,30 L 55,34.6 L 65,39.2 L 55,43.8 L 65,48.4 L 55,53 L 65,57.6 L 55,62.2 L 65,66.8 L 55,71.4 L 60,76 L 690,76 L 685,71.4 L 695,66.8 L 685,62.2 L 695,57.6 L 685,53 L 695,48.4 L 685,43.8 L 695,39.2 L 685,34.6 L 690,30 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <line x1="100" y1="18" x2="100" y2="88" stroke="#000000" stroke-width="2.2" />
    <text class="draggable-text" x="86" y="58" font-size="19" font-weight="bold" text-anchor="end">0</text>
    <circle class="draggable-dot" cx="100" cy="53" r="4.5" fill="#000000" />
    <circle class="draggable-dot" cx="185" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="270" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="355" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="440" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="525" cy="53" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="610" cy="53" r="4.2" fill="#000000" />
    <text class="draggable-text" x="375" y="105" font-size="16" font-weight="bold" text-anchor="middle">Hình 1</text>
  </g>

  <!-- ================= BĂNG 2 (HÌNH 2: CHUYỂN ĐỘNG NHANH DẦN ĐỀU) ================= -->
  <g id="tape-2-group">
    <path d="M 60,135 L 55,139.6 L 65,144.2 L 55,148.8 L 65,153.4 L 55,158 L 65,162.6 L 55,167.2 L 65,171.8 L 55,176.4 L 60,181 L 690,181 L 685,176.4 L 695,171.8 L 685,167.2 L 695,162.6 L 685,158 L 695,153.4 L 685,148.8 L 695,144.2 L 685,139.6 L 690,135 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <line x1="100" y1="123" x2="100" y2="193" stroke="#000000" stroke-width="2.2" />
    <text class="draggable-text" x="86" y="163" font-size="19" font-weight="bold" text-anchor="end">0</text>
    <circle class="draggable-dot" cx="100" cy="158" r="4.5" fill="#000000" />
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
    <circle class="draggable-dot" cx="260" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="390" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="490" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="560" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="610" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="640" cy="263" r="4.2" fill="#000000" />
    <circle class="draggable-dot" cx="660" cy="263" r="4.2" fill="#000000" />
    <text class="draggable-text" x="375" y="315" font-size="16" font-weight="bold" text-anchor="middle">Hình 3</text>
  </g>
</svg>`
    }
  },

  {
    id: "preset_pyramid",
    title: "1. Lều Chóp Tứ Giác Đều S.ABCD (Oxyz)",
    category: "math_3d",
    badge: "Toán 12",
    desc: "Mô hình lều chóp dã ngoại đáy hình vuông trên mặt đất Oxy, đỉnh S trên trục Oz.",
    data: {
      title: "Lều Chóp Tứ Giác Đều S.ABCD (Oxyz)",
      type: "math_3d",
      scale: 35,
      points: [
        { id: "O", name: "O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "A", name: "A", x: 3, y: -3, z: 0, color: "#1e293b", showLabel: true },
        { id: "B", name: "B", x: 3, y: 3, z: 0, color: "#1e293b", showLabel: true },
        { id: "C", name: "C", x: -3, y: 3, z: 0, color: "#1e293b", showLabel: true },
        { id: "D", name: "D", x: -3, y: -3, z: 0, color: "#1e293b", showLabel: true },
        { id: "S", name: "S(0,0,5)", x: 0, y: 0, z: 5, color: "#dc2626", showLabel: true }
      ],
      segments: [
        { from: "A", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "B", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "C", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "D", to: "A", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "S", to: "A", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "S", to: "O", style: "dashed", arrow: false, color: "#ef4444", width: 1.5 }
      ],
      polygons: [
        { points: ["S", "A", "B"], color: "rgba(99, 102, 241, 0.15)" },
        { points: ["S", "B", "C"], color: "rgba(59, 130, 246, 0.12)" }
      ]
    }
  },
  {
    id: "preset_roof",
    title: "2. Mái Nhà & Cột Ăng-ten (Toán Thực Tế Oxyz)",
    category: "math_3d",
    badge: "Toán 12 Cánh Diều",
    desc: "Mái nhà hình lăng trụ tam giác, cột ăng-ten thẳng đứng và véc-tơ thu sóng.",
    data: {
      title: "Mái Nhà & Cột Ăng-ten (Oxyz)",
      type: "math_3d",
      scale: 30,
      points: [
        { id: "O", name: "O", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "A", name: "A", x: 4, y: 0, z: 0, color: "#1e293b", showLabel: true },
        { id: "B", name: "B", x: 4, y: 6, z: 0, color: "#1e293b", showLabel: true },
        { id: "C", name: "C", x: 0, y: 6, z: 0, color: "#1e293b", showLabel: true },
        { id: "E", name: "E", x: 2, y: 0, z: 3, color: "#dc2626", showLabel: true },
        { id: "F", name: "F", x: 2, y: 6, z: 3, color: "#dc2626", showLabel: true },
        { id: "M", name: "M", x: 2, y: 3, z: 3, color: "#059669", showLabel: true },
        { id: "N", name: "N(Ăng-ten)", x: 2, y: 3, z: 5.5, color: "#d97706", showLabel: true }
      ],
      segments: [
        { from: "O", to: "A", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "A", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "B", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "C", to: "O", style: "dashed", arrow: false, color: "#94a3b8", width: 1.5 },
        { from: "O", to: "E", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "A", to: "E", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "C", to: "F", style: "dashed", arrow: false, color: "#94a3b8", width: 1.5 },
        { from: "B", to: "F", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "E", to: "F", style: "solid", arrow: false, color: "#2563eb", width: 2.5 },
        { from: "M", to: "N", style: "solid", arrow: true, color: "#dc2626", width: 3 }
      ],
      polygons: [
        { points: ["A", "B", "F", "E"], color: "rgba(239, 68, 68, 0.15)" },
        { points: ["O", "C", "F", "E"], color: "rgba(59, 130, 246, 0.12)" }
      ]
    }
  },
  {
    id: "preset_tennis",
    title: "3. Quỹ Đạo Bóng Sân Tennis Oxyz",
    category: "math_3d",
    badge: "Toán 12 KNTT",
    desc: "Mặt sân Oxy, lưới tennis và quỹ đạo bóng parabol từ vị trí giao bóng.",
    data: {
      title: "Quỹ Đạo Bóng Giao Trên Sân Tennis Oxyz",
      type: "math_3d",
      scale: 25,
      points: [
        { id: "O", name: "O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "NetL", name: "Lưới 1", x: 0, y: -4, z: 1, color: "#059669", showLabel: false },
        { id: "NetR", name: "Lưới 2", x: 0, y: 4, z: 1, color: "#059669", showLabel: false },
        { id: "Serve", name: "Vị trí đánh(A)", x: -10, y: 2, z: 2.5, color: "#dc2626", showLabel: true },
        { id: "Bounce", name: "Điểm rơi(B)", x: 6, y: -1.5, z: 0, color: "#d97706", showLabel: true }
      ],
      segments: [
        { from: "NetL", to: "NetR", style: "solid", arrow: false, color: "#059669", width: 3 }
      ],
      curves: [
        {
          style: "solid",
          color: "#e11d48",
          width: 2.5,
          points: [
            [-10, 2, 2.5],
            [-6, 1.3, 2.3],
            [-2, 0.5, 1.8],
            [0, 0, 1.4],
            [3, -0.8, 0.8],
            [6, -1.5, 0]
          ]
        }
      ]
    }
  },
  {
    id: "preset_balloon",
    title: "4. Khinh Khí Cầu & Tường Sương Mù",
    category: "math_3d",
    badge: "Toán 12 Chân Trời",
    desc: "Tọa độ khinh khí cầu di chuyển trong không gian và khoảng cách tới mặt phẳng sương mù.",
    data: {
      title: "Khinh Khí Cầu & Tường Sương Mù Oxyz",
      type: "math_3d",
      scale: 28,
      points: [
        { id: "O", name: "Trạm mặt đất O", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "B1", name: "B1(Khí cầu)", x: 2, y: 3, z: 6, color: "#ea580c", showLabel: true },
        { id: "B2", name: "B2", x: 5, y: 7, z: 8, color: "#ea580c", showLabel: true },
        { id: "P1", name: "M1", x: -2, y: 2, z: 0, color: "#64748b", showLabel: false },
        { id: "P2", name: "M2", x: -2, y: 8, z: 0, color: "#64748b", showLabel: false },
        { id: "P3", name: "M3", x: -2, y: 8, z: 10, color: "#64748b", showLabel: false },
        { id: "P4", name: "M4", x: -2, y: 2, z: 10, color: "#64748b", showLabel: false }
      ],
      segments: [
        { from: "B1", to: "B2", style: "solid", arrow: true, color: "#ea580c", width: 3 },
        { from: "O", to: "B1", style: "dashed", arrow: false, color: "#94a3b8", width: 1.5 }
      ],
      polygons: [
        { points: ["P1", "P2", "P3", "P4"], color: "rgba(56, 189, 248, 0.25)" }
      ]
    }
  },
  {
    id: "preset_pyramid_pq",
    title: "5. Kim Tự Tháp Kê-ốp & Đoạn Thẳng PQ",
    category: "math_3d",
    badge: "Toán 12 Đề Thi 2025",
    desc: "Hình chóp tứ giác đều mô phỏng Đại Kim tự tháp Giza và thanh đỡ PQ.",
    data: {
      title: "Kim Tự Tháp Kê-ốp & Thanh PQ",
      type: "math_3d",
      scale: 32,
      points: [
        { id: "O", name: "O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "A", name: "A", x: 4, y: -4, z: 0, color: "#1e293b", showLabel: true },
        { id: "B", name: "B", x: 4, y: 4, z: 0, color: "#1e293b", showLabel: true },
        { id: "C", name: "C", x: -4, y: 4, z: 0, color: "#1e293b", showLabel: true },
        { id: "D", name: "D", x: -4, y: -4, z: 0, color: "#1e293b", showLabel: true },
        { id: "S", name: "S(Đỉnh)", x: 0, y: 0, z: 6, color: "#dc2626", showLabel: true },
        { id: "P", name: "P", x: 2, y: -4, z: 0, color: "#059669", showLabel: true },
        { id: "Q", name: "Q", x: 0, y: 2, z: 3, color: "#059669", showLabel: true }
      ],
      segments: [
        { from: "A", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "B", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "C", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "D", to: "A", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "S", to: "A", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
        { from: "S", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
        { from: "P", to: "Q", style: "solid", arrow: true, color: "#16a34a", width: 3 }
      ],
      polygons: [
        { points: ["S", "A", "B"], color: "rgba(234, 179, 8, 0.2)" },
        { points: ["S", "B", "C"], color: "rgba(217, 119, 6, 0.15)" }
      ]
    }
  },
  {
    id: "preset_calorimeter",
    title: "6. Thí Nghiệm Nhiệt Dung Riêng (Vật Lí 12)",
    category: "physics_exp",
    badge: "Vật Lí 12",
    desc: "Sơ đồ bình nhiệt lượng kế, que khuấy, nhiệt kế và cuộn dây điện trở đun nước.",
    data: {
      title: "Sơ Đồ Thí Nghiệm Xác Định Nhiệt Dung Riêng Của Nước",
      type: "physics_exp",
      svgCode: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
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
  <path d="M 190,260 L 120,260" stroke="#0284c7" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="70" y="264" font-size="14" font-weight="bold" fill="#0369a1">Nước</text>

  <path d="M 270,305 L 270,370 L 140,370" stroke="#dc2626" stroke-width="1.5" fill="none"/>
  <text x="60" y="374" font-size="14" font-weight="bold" fill="#b91c1c">Dây điện trở</text>

  <path d="M 331,110 L 331,60 L 220,60" stroke="#0f172a" stroke-width="1.5" fill="none"/>
  <text x="160" y="64" font-size="14" font-weight="bold" fill="#0f172a">Nhiệt kế</text>

  <text x="210" y="150" font-size="13" font-weight="bold" fill="#4f46e5">Nguồn điện U, I</text>
  <line x1="240" y1="170" x2="225" y2="155" stroke="#4f46e5" stroke-width="1.5"/>
  <line x1="300" y1="170" x2="315" y2="155" stroke="#4f46e5" stroke-width="1.5"/>
</svg>`
    }
  },
  {
    id: "preset_rails",
    title: "7. Thanh Kim Loại Trượt Trên Ray Từ Trường",
    category: "physics_exp",
    badge: "Vật Lí 11 & 12",
    desc: "Hiện tượng cảm ứng điện từ: thanh ray kim loại trong từ trường đều B.",
    data: {
      title: "Thanh Dẫn MN Chuyển Động Trong Từ Trường Đều B",
      type: "physics_exp",
      svgCode: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
  <!-- Rails in 3D perspective -->
  <polygon points="120,320 580,320 500,160 180,160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="120" y1="320" x2="580" y2="320" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <line x1="180" y1="160" x2="500" y2="160" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
  <!-- Connecting Resistor R -->
  <line x1="120" y1="320" x2="180" y2="160" stroke="#334155" stroke-width="4"/>
  <rect x="135" y="215" width="30" height="50" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
  <text x="142" y="245" font-size="14" font-weight="bold" fill="#fff">R</text>

  <!-- Sliding Bar MN -->
  <polygon points="340,325 360,325 320,155 300,155" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/>
  <text x="355" y="345" font-size="16" font-weight="bold" font-style="italic" fill="#1e3a8a">M</text>
  <text x="295" y="145" font-size="16" font-weight="bold" font-style="italic" fill="#1e3a8a">N</text>

  <!-- Velocity Vector v -->
  <line x1="350" y1="240" x2="450" y2="240" stroke="#dc2626" stroke-width="4"/>
  <polygon points="450,233 465,240 450,247" fill="#dc2626"/>
  <text x="440" y="225" font-size="16" font-weight="bold" font-style="italic" fill="#dc2626">v →</text>

  <!-- Magnetic Field B (dots or crosses) -->
  <g fill="#0284c7" font-size="18" font-weight="bold">
    <text x="260" y="210">⊗</text><text x="320" y="210">⊗</text><text x="380" y="210">⊗</text><text x="440" y="210">⊗</text>
    <text x="240" y="270">⊗</text><text x="300" y="270">⊗</text><text x="380" y="270">⊗</text><text x="460" y="270">⊗</text>
  </g>
  <text x="490" y="200" font-size="16" font-weight="bold" font-style="italic" fill="#0284c7">B →</text>
</svg>`
    }
  },
  {
    id: "preset_chem_titration",
    title: "8. Thí Nghiệm Chuẩn Độ Axit - Bazơ (Hóa 11 & 12)",
    category: "chemistry_exp",
    badge: "Hóa Học",
    desc: "Buret chia vạch, bình tam giác Erlenmeyer chứa dung dịch và chất chỉ thị màu.",
    data: {
      title: "Sơ Đồ Thí Nghiệm Chuẩn Độ Dung Dịch Axit - Bazơ",
      type: "chemistry_exp",
      svgCode: `<svg viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" style="background:#fff; font-family:'Segoe UI',sans-serif;">
  <!-- Stand base and rod -->
  <rect x="250" y="410" width="160" height="15" rx="3" fill="#334155"/>
  <rect x="380" y="40" width="12" height="370" fill="#64748b" rx="2"/>
  <rect x="330" y="140" width="55" height="10" fill="#475569"/>
  <rect x="330" y="260" width="55" height="10" fill="#475569"/>

  <!-- Burette Tube -->
  <rect x="315" y="60" width="16" height="240" fill="#f8fafc" stroke="#1e293b" stroke-width="2" rx="2"/>
  <line x1="315" y1="90" x2="322" y2="90" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="120" x2="325" y2="120" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="150" x2="322" y2="150" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="180" x2="325" y2="180" stroke="#64748b" stroke-width="1.5"/>
  <line x1="315" y1="210" x2="322" y2="210" stroke="#64748b" stroke-width="1.5"/>
  <!-- Stopcock Valve -->
  <polygon points="318,300 328,300 323,320" fill="#38bdf8" stroke="#1e293b" stroke-width="1.5"/>
  <circle cx="323" cy="308" r="5" fill="#ef4444"/>

  <!-- Erlenmeyer Flask Below -->
  <path d="M 310,345 L 336,345 L 336,355 L 365,405 C 367,408 365,410 360,410 L 286,410 C 281,410 279,408 281,405 L 310,355 Z" fill="#fce7f3" stroke="#1e293b" stroke-width="2.5"/>
  <path d="M 293,390 L 353,390 L 363,408 L 283,408 Z" fill="#f43f5e" opacity="0.75"/>

  <!-- Droplet -->
  <circle cx="323" cy="333" r="2.5" fill="#38bdf8"/>

  <!-- Labels -->
  <text x="210" y="100" font-size="14" font-weight="bold" fill="#0f172a">Buret (chứa NaOH)</text>
  <line x1="270" y1="105" x2="310" y2="115" stroke="#64748b" stroke-width="1.5"/>

  <text x="140" y="380" font-size="14" font-weight="bold" fill="#be123c">Bình tam giác</text>
  <text x="140" y="398" font-size="12" fill="#64748b">(HCl + phenolphtalein)</text>
  <line x1="230" y1="385" x2="290" y2="385" stroke="#64748b" stroke-width="1.5"/>
</svg>`
    }
  },
  {
    id: "preset_plane",
    title: "9. Máy Bay Cất Cánh & Hướng Gió (Véc-tơ Oxyz)",
    category: "math_3d",
    badge: "Toán 12 Chuyên Đề",
    desc: "Vận tốc riêng máy bay, vận tốc gió và véc-tơ vận tốc tổng hợp so với mặt đất.",
    data: {
      title: "Vận Tốc Máy Bay Cất Cánh & Hướng Gió Oxyz",
      type: "math_3d",
      scale: 30,
      points: [
        { id: "O", name: "Sân bay O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "V_air", name: "v_riêng", x: 5, y: 5, z: 4, color: "#2563eb", showLabel: true },
        { id: "V_wind", name: "v_gió", x: 2, y: -2, z: 0, color: "#059669", showLabel: true },
        { id: "V_ground", name: "v_thực tế", x: 7, y: 3, z: 4, color: "#dc2626", showLabel: true }
      ],
      segments: [
        { from: "O", to: "V_air", style: "solid", arrow: true, color: "#2563eb", width: 3 },
        { from: "O", to: "V_wind", style: "solid", arrow: true, color: "#059669", width: 2.5 },
        { from: "O", to: "V_ground", style: "solid", arrow: true, color: "#dc2626", width: 3.5 },
        { from: "V_air", to: "V_ground", style: "dashed", arrow: false, color: "#94a3b8", width: 1.5 },
        { from: "V_wind", to: "V_ground", style: "dashed", arrow: false, color: "#94a3b8", width: 1.5 }
      ]
    }
  },
  {
    id: "preset_swing",
    title: "10. Trò Chơi Đu Quay Oxyz",
    category: "math_3d",
    badge: "Toán 12 Ứng Dụng",
    desc: "Mô hình xích đu công viên với trục quay cố định và quỹ đạo cung tròn của ghế ngồi.",
    data: {
      title: "Mô Hình Trò Chơi Đu Quay Oxyz",
      type: "math_3d",
      scale: 35,
      points: [
        { id: "O", name: "Gốc O", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
        { id: "T1", name: "Trục A", x: 0, y: -3, z: 5, color: "#1e293b", showLabel: true },
        { id: "T2", name: "Trục B", x: 0, y: 3, z: 5, color: "#1e293b", showLabel: true },
        { id: "Seat0", name: "Ghế cân bằng", x: 0, y: 0, z: 1.5, color: "#059669", showLabel: true },
        { id: "SeatMax", name: "Ghế cực đại", x: 3, y: 0, z: 2.5, color: "#dc2626", showLabel: true }
      ],
      segments: [
        { from: "T1", to: "T2", style: "solid", arrow: false, color: "#1e293b", width: 4 },
        { from: "T1", to: "Seat0", style: "solid", arrow: false, color: "#64748b", width: 2 },
        { from: "T2", to: "Seat0", style: "solid", arrow: false, color: "#64748b", width: 2 },
        { from: "T1", to: "SeatMax", style: "dashed", arrow: false, color: "#dc2626", width: 2 },
        { from: "T2", to: "SeatMax", style: "dashed", arrow: false, color: "#dc2626", width: 2 }
      ]
    }
  }
];

// ==========================================
// 3. THREE.JS 3D ENGINE VARIABLES & SETUP
// ==========================================
let threeScene, threeCamera, threeRenderer, threeControls, threeObjectsGroup;

function initThreeJS() {
  const container = document.getElementById('three-container');
  if (!container) return;

  // If already initialized, just trigger resize and update
  if (threeRenderer) {
    onThreeResize();
    updateThreeScene();
    return;
  }

  const w = container.clientWidth || 800;
  const h = container.clientHeight || 520;

  // Scene
  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x0a0f1d); // Deep cosmic navy

  // Camera
  threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  threeCamera.position.set(15, -18, 13);
  threeCamera.up.set(0, 0, 1); // Z is UP in mathematics standard

  // Renderer
  threeRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  threeRenderer.setSize(w, h);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(threeRenderer.domElement);

  // OrbitControls
  if (typeof THREE.OrbitControls === 'function') {
    try {
      threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
      threeControls.enableDamping = true;
      threeControls.dampingFactor = 0.05;
      threeControls.target.set(0, 0, 1.5);
    } catch (e) {
      console.warn("OrbitControls init failed:", e);
    }
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  threeScene.add(ambientLight);
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(15, 20, 25);
  threeScene.add(dirLight1);
  const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.8);
  dirLight2.position.set(-15, -15, 10);
  threeScene.add(dirLight2);

  // Grid on XY Ground Plane
  const gridHelper = new THREE.GridHelper(24, 24, 0x38bdf8, 0x1e293b);
  gridHelper.rotation.x = Math.PI / 2; // Flat on XY
  threeScene.add(gridHelper);

  // Oxyz Coordinate Axes with glowing colors
  const axes = new THREE.AxesHelper(9);
  axes.renderOrder = 1;
  threeScene.add(axes);

  // Dynamic Objects Group
  threeObjectsGroup = new THREE.Group();
  threeScene.add(threeObjectsGroup);

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (threeControls) threeControls.update();
    if (threeRenderer && threeScene && threeCamera) {
      threeRenderer.render(threeScene, threeCamera);
    }
  }
  animate();

  // Resize handler
  window.addEventListener('resize', onThreeResize);
}

function onThreeResize() {
  const container = document.getElementById('three-container');
  if (!container || !threeCamera || !threeRenderer) return;
  const rw = container.clientWidth || container.offsetWidth || 800;
  const rh = container.clientHeight || container.offsetHeight || 520;
  if (rw <= 0 || rh <= 0) return;
  threeCamera.aspect = rw / rh;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(rw, rh);
}

// Create a 3D Sprite text label always facing camera
function createTextSprite(text, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold italic 44px "Times New Roman", serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.8, 0.9, 1);
  return sprite;
}

function updateThreeScene() {
  if (!threeScene || !threeObjectsGroup) return;

  // Clear previous meshes
  while (threeObjectsGroup.children.length > 0) {
    const obj = threeObjectsGroup.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    threeObjectsGroup.remove(obj);
  }

  const diag = AppState.diagram;
  if (!diag || !diag.points) return;

  const pointMap = new Map();

  // 1. Render 3D Spheres for Points
  diag.points.forEach(p => {
    pointMap.set(p.id, p);

    const sphereGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: p.color || 0x4f46e5,
      roughness: 0.2,
      metalness: 0.3,
      emissive: p.color || 0x4f46e5,
      emissiveIntensity: 0.25
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(p.x, p.y, p.z);
    threeObjectsGroup.add(sphere);

    // 3D Point Label Sprite
    if (AppState.showLabels && p.showLabel !== false) {
      const labelSprite = createTextSprite(p.name || p.id, '#ffffff');
      labelSprite.position.set(p.x + 0.35, p.y + 0.35, p.z + 0.45);
      threeObjectsGroup.add(labelSprite);
    }
  });

  // 2. Render 3D Segments / Lines
  if (diag.segments) {
    diag.segments.forEach(seg => {
      const p1 = pointMap.get(seg.from);
      const p2 = pointMap.get(seg.to);
      if (!p1 || !p2) return;

      const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
      const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);

      if (seg.style === 'dashed') {
        // Dashed Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([v1, v2]);
        const lineMat = new THREE.LineDashedMaterial({
          color: seg.color || 0x94a3b8,
          dashSize: 0.3,
          gapSize: 0.2,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        threeObjectsGroup.add(line);
      } else {
        // Solid Cylinder Tube for premium look
        const dist = v1.distanceTo(v2);
        const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 12);
        const cylMat = new THREE.MeshStandardMaterial({
          color: seg.color || 0x1e293b,
          roughness: 0.3,
          metalness: 0.2
        });
        const cyl = new THREE.Mesh(cylGeo, cylMat);
        
        // Orient cylinder between v1 and v2
        const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
        cyl.position.copy(mid);
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
        threeObjectsGroup.add(cyl);

        // Arrow head if required
        if (seg.arrow) {
          const coneGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
          const coneMat = new THREE.MeshStandardMaterial({ color: seg.color || 0xdc2626 });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.position.copy(v2);
          cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
          threeObjectsGroup.add(cone);
        }
      }
    });
  }

  // 3. Render 3D Polygons (Translucent Faces)
  if (diag.polygons) {
    diag.polygons.forEach(poly => {
      if (!poly.points || poly.points.length < 3) return;
      const pts = poly.points.map(id => pointMap.get(id)).filter(Boolean);
      if (pts.length < 3) return;

      const vA = new THREE.Vector3(pts[0].x, pts[0].y, pts[0].z);
      for (let i = 1; i < pts.length - 1; i++) {
        const vB = new THREE.Vector3(pts[i].x, pts[i].y, pts[i].z);
        const vC = new THREE.Vector3(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);

        const triGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          vA.x, vA.y, vA.z,
          vB.x, vB.y, vB.z,
          vC.x, vC.y, vC.z
        ]);
        triGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        triGeo.computeVertexNormals();

        const triMat = new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide
        });
        const triMesh = new THREE.Mesh(triGeo, triMat);
        threeObjectsGroup.add(triMesh);
      }
    });
  }
}

// ==========================================
// 4. VIETNAMESE STANDARD 2D AXONOMETRIC PROJECTION
// ==========================================
// According to Vietnamese GDPT 2018 Textbook convention:
// - Oz is vertical (UP)
// - Oy is horizontal (RIGHT)
// - Ox is oblique (DOWN-LEFT at 135 degrees, foreshortened by 1/2)
function projectOxyz(x, y, z, originX, originY, scale = 32) {
  const foreshortening = 0.5; // Kỹ thuật hình họa SGK
  const angle = (135 * Math.PI) / 180; // 135 degrees down-left

  const px = originX + (y * scale) + (x * foreshortening * Math.cos(angle) * scale);
  const py = originY - (z * scale) - (x * foreshortening * Math.sin(angle) * scale);

  return { x: px, y: py };
}

function render2DTechnical() {
  const canvas = document.getElementById('main-2d-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const container = canvas.parentElement;
  const w = container ? (container.clientWidth || 800) : 800;
  const h = container ? (container.clientHeight || 540) : 540;

  // Make canvas stretch cleanly to 100% of container
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = w * (window.devicePixelRatio || 1);
  canvas.height = h * (window.devicePixelRatio || 1);
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  // Clear background
  ctx.clearRect(0, 0, w, h);

  const diag = AppState.diagram;
  if (!diag || !diag.points || diag.points.length === 0) return;

  // AUTO-FIT BOUNDING BOX:
  // Calculate bounding box of all 3D points projected to 2D at nominal scale=1.0
  let rawMinX = Infinity, rawMaxX = -Infinity, rawMinY = Infinity, rawMaxY = -Infinity;
  diag.points.forEach(p => {
    const pt = projectOxyz(p.x, p.y, p.z, 0, 0, 1.0);
    if (pt.x < rawMinX) rawMinX = pt.x;
    if (pt.x > rawMaxX) rawMaxX = pt.x;
    if (pt.y < rawMinY) rawMinY = pt.y;
    if (pt.y > rawMaxY) rawMaxY = pt.y;
  });

  // Include coordinate origin (0,0,0) and axes tips if enabled
  if (AppState.showAxes) {
    const oPt = projectOxyz(0, 0, 0, 0, 0, 1.0);
    const xPt = projectOxyz(4.5, 0, 0, 0, 0, 1.0);
    const yPt = projectOxyz(0, 4.5, 0, 0, 0, 1.0);
    const zPt = projectOxyz(0, 0, 4.5, 0, 0, 1.0);
    [oPt, xPt, yPt, zPt].forEach(pt => {
      if (pt.x < rawMinX) rawMinX = pt.x;
      if (pt.x > rawMaxX) rawMaxX = pt.x;
      if (pt.y < rawMinY) rawMinY = pt.y;
      if (pt.y > rawMaxY) rawMaxY = pt.y;
    });
  }

  const rawWidth = Math.max(rawMaxX - rawMinX, 1.0);
  const rawHeight = Math.max(rawMaxY - rawMinY, 1.0);

  // Fit neatly into 65% of screen to guarantee ample comfortable margins on all 4 sides
  const fitScaleX = (w * 0.65) / rawWidth;
  const fitScaleY = (h * 0.65) / rawHeight;
  const baseScale = Math.min(fitScaleX, fitScaleY, 45); // Max comfortable scale
  const scale = baseScale * AppState.zoom2D;

  // Center of bounding box
  const rawMidX = (rawMinX + rawMaxX) / 2;
  const rawMidY = (rawMinY + rawMaxY) / 2;

  // Position origin so the entire bounding box is centered in the canvas
  const originX = (w / 2) - (rawMidX * scale) + AppState.pan2D.x;
  const originY = (h / 2) - (rawMidY * scale) + AppState.pan2D.y;

  const pointCoordMap = new Map();

  // 1. Draw Oxyz Coordinate Axes if enabled
  if (AppState.showAxes) {
    const axisLen = 5.5;
    const o2d = projectOxyz(0, 0, 0, originX, originY, scale);
    const x2d = projectOxyz(axisLen, 0, 0, originX, originY, scale);
    const y2d = projectOxyz(0, axisLen, 0, originX, originY, scale);
    const z2d = projectOxyz(0, 0, axisLen, originX, originY, scale);

    ctx.save();
    ctx.lineWidth = 1.6;

    // Ox axis (Red)
    ctx.strokeStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(o2d.x, o2d.y);
    ctx.lineTo(x2d.x, x2d.y);
    ctx.stroke();
    drawCanvasArrow(ctx, o2d.x, o2d.y, x2d.x, x2d.y, '#dc2626');
    ctx.font = 'bold italic 13px "Times New Roman", serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('x', x2d.x - 14, x2d.y + 14);

    // Oy axis (Green)
    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(o2d.x, o2d.y);
    ctx.lineTo(y2d.x, y2d.y);
    ctx.stroke();
    drawCanvasArrow(ctx, o2d.x, o2d.y, y2d.x, y2d.y, '#059669');
    ctx.fillStyle = '#059669';
    ctx.fillText('y', y2d.x + 10, y2d.y + 4);

    // Oz axis (Blue)
    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(o2d.x, o2d.y);
    ctx.lineTo(z2d.x, z2d.y);
    ctx.stroke();
    drawCanvasArrow(ctx, o2d.x, o2d.y, z2d.x, z2d.y, '#2563eb');
    ctx.fillStyle = '#2563eb';
    ctx.fillText('z', z2d.x + 6, z2d.y - 6);

    ctx.restore();
  }

  // Pre-calculate 2D screen positions for all points
  diag.points.forEach(p => {
    const pt2d = projectOxyz(p.x, p.y, p.z, originX, originY, scale);
    pointCoordMap.set(p.id, { ...p, sx: pt2d.x, sy: pt2d.y });
  });

  // 2. Draw Translucent Polygons (Faces)
  if (diag.polygons) {
    diag.polygons.forEach(poly => {
      if (!poly.points || poly.points.length < 3) return;
      const pts = poly.points.map(id => pointCoordMap.get(id)).filter(Boolean);
      if (pts.length < 3) return;

      ctx.save();
      ctx.fillStyle = poly.color || 'rgba(99, 102, 241, 0.15)';
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].sx, pts[i].sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // 3. Draw Curves (Trajectories)
  if (diag.curves) {
    diag.curves.forEach(curve => {
      if (!curve.points || curve.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = curve.color || '#e11d48';
      ctx.lineWidth = curve.width || 2;
      if (curve.style === 'dashed') ctx.setLineDash([5, 4]);

      ctx.beginPath();
      const p0 = projectOxyz(curve.points[0][0], curve.points[0][1], curve.points[0][2], originX, originY, scale);
      ctx.moveTo(p0.x, p0.y);

      for (let i = 1; i < curve.points.length; i++) {
        const pt = projectOxyz(curve.points[i][0], curve.points[i][1], curve.points[i][2], originX, originY, scale);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  // 4. Draw Segments (Solid & Dashed Lines)
  if (diag.segments) {
    diag.segments.forEach(seg => {
      const p1 = pointCoordMap.get(seg.from);
      const p2 = pointCoordMap.get(seg.to);
      if (!p1 || !p2) return;

      ctx.save();
      ctx.strokeStyle = seg.color || '#1e293b';
      ctx.lineWidth = seg.width || 2;
      if (seg.style === 'dashed') {
        ctx.setLineDash([6, 5]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();

      if (seg.arrow) {
        drawCanvasArrow(ctx, p1.sx, p1.sy, p2.sx, p2.sy, seg.color || '#1e293b');
      }
      ctx.restore();
    });
  }

  // 5. Draw Points & Point Labels
  diag.points.forEach(p => {
    const pt = pointCoordMap.get(p.id);
    if (!pt) return;

    // Outer ring & dot
    ctx.save();
    ctx.fillStyle = p.color || '#1e293b';
    ctx.beginPath();
    ctx.arc(pt.sx, pt.sy, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Text Label
    if (AppState.showLabels && p.showLabel !== false) {
      ctx.font = 'bold italic 14px "Times New Roman", serif';
      ctx.fillStyle = '#0f172a';
      // Label offset
      ctx.fillText(p.name || p.id, pt.sx + 6, pt.sy - 6);
    }
    ctx.restore();
  });
}

function drawCanvasArrow(ctx, fromX, fromY, toX, toY, color) {
  const headlen = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ==========================================
// 5. 100% PERFECT-FIT REALISTIC SCENE & OVERLAY RENDERING
// ==========================================
function renderRealisticSceneWithOverlay() {
  const canvas = document.getElementById('real-scene-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const container = canvas.parentElement;
  const w = container ? (container.clientWidth || 800) : 800;
  const h = container ? (container.clientHeight || 540) : 540;

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = w * (window.devicePixelRatio || 1);
  canvas.height = h * (window.devicePixelRatio || 1);
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  const diag = AppState.diagram;
  if (!diag || !diag.points || diag.points.length === 0) return;

  // Use the exact SAME Auto-Fit Bounding Box projection as 2D Technical
  let rawMinX = Infinity, rawMaxX = -Infinity, rawMinY = Infinity, rawMaxY = -Infinity;
  diag.points.forEach(p => {
    const pt = projectOxyz(p.x, p.y, p.z, 0, 0, 1.0);
    if (pt.x < rawMinX) rawMinX = pt.x;
    if (pt.x > rawMaxX) rawMaxX = pt.x;
    if (pt.y < rawMinY) rawMinY = pt.y;
    if (pt.y > rawMaxY) rawMaxY = pt.y;
  });

  const rawWidth = Math.max(rawMaxX - rawMinX, 1.0);
  const rawHeight = Math.max(rawMaxY - rawMinY, 1.0);

  const fitScaleX = (w * 0.62) / rawWidth;
  const fitScaleY = (h * 0.62) / rawHeight;
  const baseScale = Math.min(fitScaleX, fitScaleY, 45);
  const scale = baseScale * AppState.zoom2D;

  const rawMidX = (rawMinX + rawMaxX) / 2;
  const rawMidY = (rawMinY + rawMaxY) / 2;

  const originX = (w / 2) - (rawMidX * scale) + AppState.pan2D.x;
  const originY = (h / 2) - (rawMidY * scale) + AppState.pan2D.y;

  // Calculate 2D screen positions for all vertices
  const pts = new Map();
  diag.points.forEach(p => {
    const pt = projectOxyz(p.x, p.y, p.z, originX, originY, scale);
    pts.set(p.id, { ...p, sx: pt.x, sy: pt.y });
  });

  const title = (diag.title || "").toLowerCase();

  // ----------------------------------------------------
  // STEP 1: RENDER NATURAL ENVIRONMENT BACKGROUND
  // ----------------------------------------------------
  if (AppState.customBackgroundImg) {
    ctx.drawImage(AppState.customBackgroundImg, 0, 0, w, h);
  } else if (title.includes('kim tự tháp') || title.includes('kê-ốp')) {
    // Dynamic Horizon: align smoothly with pyramid base points so it never floats
    const basePts = ['A', 'B', 'C', 'D', 'O'].map(id => pts.get(id)).filter(Boolean);
    let horizonY = h * 0.62;
    if (basePts.length > 0) {
      const minBaseY = Math.min(...basePts.map(p => p.sy));
      const maxBaseY = Math.max(...basePts.map(p => p.sy));
      // Put horizon right behind the lowest base level so pyramid firmly sits on sand
      horizonY = Math.max(h * 0.45, Math.min(minBaseY - 10, h * 0.65));
    }

    // Egyptian Desert Sky & Sun
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.65, '#38bdf8');
    skyGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Glowing Sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.85, Math.min(h * 0.22, horizonY * 0.4), 48, 0, Math.PI * 2);
    ctx.fill();

    // Desert Sand Floor stretching from horizon to canvas bottom
    const sandGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    sandGrad.addColorStop(0, '#f59e0b');
    sandGrad.addColorStop(0.35, '#d97706');
    sandGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Natural Sand Dune curves passing right under pyramid base
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(w * 0.28, horizonY - 12, w * 0.55, horizonY + 18, w, horizonY + 4);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  } else if (title.includes('mái') || title.includes('ăng-ten') || title.includes('nhà')) {
    // Suburban Blue Sky & Greenery
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.6, '#60a5fa');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.75);

    // Sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.22, 45, 0, Math.PI * 2);
    ctx.fill();

    // Grass & Garden Ground
    const grassGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    grassGrad.addColorStop(0, '#16a34a');
    grassGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  } else if (title.includes('tennis') || title.includes('bóng')) {
    // Tennis Court Environment
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.55);

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
  } else {
    // Cosmic Deep Navy High-Tech Studio
    const spaceGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w * 0.7);
    spaceGrad.addColorStop(0, '#1e1b4b');
    spaceGrad.addColorStop(1, '#020617');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // ----------------------------------------------------
  // STEP 2: RENDER 3D REALISTIC OBJECTS MATCHING 100% OF MATH COORDS
  // ----------------------------------------------------
  if (title.includes('mái') || title.includes('ăng-ten') || title.includes('nhà')) {
    // RENDER SUBURBAN ROOF & ANTENNA (O, A, B, C, E, F, M, N)
    const O = pts.get('O'), A = pts.get('A'), B = pts.get('B'), C = pts.get('C');
    const E = pts.get('E'), F = pts.get('F'), M = pts.get('M'), N = pts.get('N');

    if (A && B && C && O && E && F) {
      // 1. Lower House Wall structure under base (drop 80px down)
      const wallDrop = 80;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;

      // Front wall A - B
      ctx.beginPath();
      ctx.moveTo(A.sx, A.sy);
      ctx.lineTo(B.sx, B.sy);
      ctx.lineTo(B.sx, B.sy + wallDrop);
      ctx.lineTo(A.sx, A.sy + wallDrop);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right wall B - C
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(B.sx, B.sy);
      ctx.lineTo(C.sx, C.sy);
      ctx.lineTo(C.sx, C.sy + wallDrop);
      ctx.lineTo(B.sx, B.sy + wallDrop);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Modern Glass Windows on wall
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      const winW = (B.sx - A.sx) * 0.28;
      const winH = 35;
      const winX1 = A.sx + (B.sx - A.sx) * 0.18;
      const winY1 = A.sy + 20;
      ctx.fillRect(winX1, winY1, winW, winH);
      ctx.strokeRect(winX1, winY1, winW, winH);

      const winX2 = A.sx + (B.sx - A.sx) * 0.55;
      ctx.fillRect(winX2, winY1, winW, winH);
      ctx.strokeRect(winX2, winY1, winW, winH);

      // 2. Triangular Gable Wall (O - A - E) - Left Gable
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(O.sx, O.sy);
      ctx.lineTo(A.sx, A.sy);
      ctx.lineTo(E.sx, E.sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Gable (C - B - F)
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(C.sx, C.sy);
      ctx.lineTo(B.sx, B.sy);
      ctx.lineTo(F.sx, F.sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Main Pitched Tile Roof Face (A - B - F - E) - Terracotta Red Tiles
      const roofGrad = ctx.createLinearGradient(E.sx, E.sy, A.sx, A.sy);
      roofGrad.addColorStop(0, '#ef4444');
      roofGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(A.sx, A.sy);
      ctx.lineTo(B.sx, B.sy);
      ctx.lineTo(F.sx, F.sy);
      ctx.lineTo(E.sx, E.sy);
      ctx.closePath();
      ctx.fill();

      // Tile texture lines on roof
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.5;
      const tileSteps = 6;
      for (let i = 1; i < tileSteps; i++) {
        const t = i / tileSteps;
        const pL = { x: A.sx + (E.sx - A.sx) * t, y: A.sy + (E.sy - A.sy) * t };
        const pR = { x: B.sx + (F.sx - B.sx) * t, y: B.sy + (F.sy - B.sy) * t };
        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y);
        ctx.lineTo(pR.x, pR.y);
        ctx.stroke();
      }

      // Roof Ridge (E - F) Cap Tiles
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(E.sx, E.sy);
      ctx.lineTo(F.sx, F.sy);
      ctx.stroke();

      // 4. REALISTIC METAL ANTENNA (M -> N)
      if (M && N) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(M.sx, M.sy);
        ctx.lineTo(N.sx, N.sy);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cross elements
        const crossY1 = M.sy + (N.sy - M.sy) * 0.4;
        const crossY2 = M.sy + (N.sy - M.sy) * 0.7;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(M.sx - 16, crossY1);
        ctx.lineTo(M.sx + 16, crossY1);
        ctx.moveTo(M.sx - 12, crossY2);
        ctx.lineTo(M.sx + 12, crossY2);
        ctx.stroke();

        // Red indicator bulb on top of antenna (point N)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(N.sx, N.sy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (title.includes('kim tự tháp') || title.includes('kê-ốp')) {
    // RENDER GREAT PYRAMID OF GIZA & BEAM PQ (S, A, B, C, D, P, Q)
    const S = pts.get('S'), A = pts.get('A'), B = pts.get('B'), C = pts.get('C'), D = pts.get('D');
    const P = pts.get('P'), Q = pts.get('Q');

    if (S && A && B && C) {
      // 1. Pyramid Shadow on Desert Sand
      ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.beginPath();
      ctx.moveTo(B.sx, B.sy);
      ctx.lineTo(C.sx, C.sy);
      ctx.lineTo(C.sx + 140, C.sy + 40);
      ctx.lineTo(S.sx + 180, B.sy + 50);
      ctx.closePath();
      ctx.fill();

      // 2. Pyramid Sunny Face (S - A - B)
      const sunnyGrad = ctx.createLinearGradient(S.sx, S.sy, A.sx, A.sy);
      sunnyGrad.addColorStop(0, '#f59e0b');
      sunnyGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = sunnyGrad;
      ctx.beginPath();
      ctx.moveTo(S.sx, S.sy);
      ctx.lineTo(A.sx, A.sy);
      ctx.lineTo(B.sx, B.sy);
      ctx.closePath();
      ctx.fill();

      // Stone block layer lines on sunny face
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      const stoneLayers = 10;
      for (let i = 1; i < stoneLayers; i++) {
        const t = i / stoneLayers;
        const p1 = { x: S.sx + (A.sx - S.sx) * t, y: S.sy + (A.sy - S.sy) * t };
        const p2 = { x: S.sx + (B.sx - S.sx) * t, y: S.sy + (B.sy - S.sy) * t };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 3. Pyramid Shaded Face (S - B - C)
      const shadedGrad = ctx.createLinearGradient(S.sx, S.sy, C.sx, C.sy);
      shadedGrad.addColorStop(0, '#b45309');
      shadedGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = shadedGrad;
      ctx.beginPath();
      ctx.moveTo(S.sx, S.sy);
      ctx.lineTo(B.sx, B.sy);
      ctx.lineTo(C.sx, C.sy);
      ctx.closePath();
      ctx.fill();

      // Stone layers on shaded face
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1.2;
      for (let i = 1; i < stoneLayers; i++) {
        const t = i / stoneLayers;
        const p1 = { x: S.sx + (B.sx - S.sx) * t, y: S.sy + (B.sy - S.sy) * t };
        const p2 = { x: S.sx + (C.sx - S.sx) * t, y: S.sy + (C.sy - S.sy) * t };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 4. REALISTIC WOODEN SCAFFOLD BEAM PQ (P -> Q)
      if (P && Q) {
        ctx.save();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(P.sx, P.sy);
        ctx.lineTo(Q.sx, Q.sy);
        ctx.stroke();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(P.sx, P.sy, 5, 0, Math.PI * 2);
        ctx.arc(Q.sx, Q.sy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (title.includes('tennis') || title.includes('bóng')) {
    // TENNIS COURT HARDCOURT & NET
    const netL = pts.get('NetL'), netR = pts.get('NetR');
    const bounce = pts.get('Bounce');

    if (netL && netR) {
      // Blue US Open Hardcourt Polygon
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.85);
      ctx.lineTo(w * 0.85, h * 0.85);
      ctx.lineTo(w * 0.72, h * 0.52);
      ctx.lineTo(w * 0.28, h * 0.52);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tennis Net
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      const netH = 26;
      ctx.beginPath();
      ctx.moveTo(netL.sx, netL.sy);
      ctx.lineTo(netR.sx, netR.sy);
      ctx.lineTo(netR.sx, netR.sy - netH);
      ctx.lineTo(netL.sx, netL.sy - netH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(netL.sx, netL.sy - netH);
      ctx.lineTo(netR.sx, netR.sy - netH);
      ctx.stroke();
      ctx.restore();

      if (bounce) {
        ctx.fillStyle = '#ccff00';
        ctx.beginPath();
        ctx.arc(bounce.sx, bounce.sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // DEFAULT: Sleek Realistic Glass/Metal Polyhedron
    if (diag.polygons) {
      diag.polygons.forEach((poly, idx) => {
        if (!poly.points || poly.points.length < 3) return;
        const polyPts = poly.points.map(id => pts.get(id)).filter(Boolean);
        if (polyPts.length < 3) return;

        ctx.save();
        const faceGrad = ctx.createLinearGradient(polyPts[0].sx, polyPts[0].sy, polyPts[2].sx, polyPts[2].sy);
        faceGrad.addColorStop(0, idx % 2 === 0 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(99, 102, 241, 0.55)');
        faceGrad.addColorStop(1, idx % 2 === 0 ? 'rgba(30, 58, 138, 0.75)' : 'rgba(67, 56, 202, 0.85)');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.moveTo(polyPts[0].sx, polyPts[0].sy);
        for (let i = 1; i < polyPts.length; i++) ctx.lineTo(polyPts[i].sx, polyPts[i].sy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
    }
  }

  // ----------------------------------------------------
  // STEP 3: MATHEMATICAL OVERLAY (TRÙNG KHÍT 100% TỪNG MILIMET)
  // ----------------------------------------------------
  if (AppState.showOverlay && AppState.overlayOpacity > 0.02) {
    ctx.save();
    ctx.globalAlpha = AppState.overlayOpacity;

    // 1. Draw Oxyz Axes with bright neon glow
    if (AppState.showAxes) {
      const axisLen = 5.5;
      const o2d = projectOxyz(0, 0, 0, originX, originY, scale);
      const x2d = projectOxyz(axisLen, 0, 0, originX, originY, scale);
      const y2d = projectOxyz(0, axisLen, 0, originX, originY, scale);
      const z2d = projectOxyz(0, 0, axisLen, originX, originY, scale);

      ctx.lineWidth = 2.2;
      // Ox neon red
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(o2d.x, o2d.y); ctx.lineTo(x2d.x, x2d.y); ctx.stroke();
      drawCanvasArrow(ctx, o2d.x, o2d.y, x2d.x, x2d.y, '#ef4444');
      ctx.font = 'bold 14px "Times New Roman", serif'; ctx.fillStyle = '#f87171'; ctx.fillText('Ox', x2d.x - 18, x2d.y + 16);

      // Oy neon green
      ctx.strokeStyle = '#10b981';
      ctx.beginPath(); ctx.moveTo(o2d.x, o2d.y); ctx.lineTo(y2d.x, y2d.y); ctx.stroke();
      drawCanvasArrow(ctx, o2d.x, o2d.y, y2d.x, y2d.y, '#10b981');
      ctx.fillStyle = '#34d399'; ctx.fillText('Oy', y2d.x + 10, y2d.y + 4);

      // Oz neon blue
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath(); ctx.moveTo(o2d.x, o2d.y); ctx.lineTo(z2d.x, z2d.y); ctx.stroke();
      drawCanvasArrow(ctx, o2d.x, o2d.y, z2d.x, z2d.y, '#38bdf8');
      ctx.fillStyle = '#38bdf8'; ctx.fillText('Oz', z2d.x + 8, z2d.y - 6);
    }

    // 2. Draw Segments (Solid white & Dashed fluorescent yellow)
    if (diag.segments) {
      diag.segments.forEach(seg => {
        const p1 = pts.get(seg.from);
        const p2 = pts.get(seg.to);
        if (!p1 || !p2) return;

        ctx.save();
        ctx.strokeStyle = seg.style === 'dashed' ? '#fde047' : '#ffffff';
        ctx.lineWidth = 2.4;
        if (seg.style === 'dashed') ctx.setLineDash([6, 5]);

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();

        if (seg.arrow) {
          drawCanvasArrow(ctx, p1.sx, p1.sy, p2.sx, p2.sy, seg.style === 'dashed' ? '#fde047' : '#ffffff');
        }
        ctx.restore();
      });
    }

    // 3. Draw Curves (Trajectories)
    if (diag.curves) {
      diag.curves.forEach(curve => {
        if (!curve.points || curve.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = curve.color || '#f43f5e';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        const p0 = projectOxyz(curve.points[0][0], curve.points[0][1], curve.points[0][2], originX, originY, scale);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < curve.points.length; i++) {
          const pt = projectOxyz(curve.points[i][0], curve.points[i][1], curve.points[i][2], originX, originY, scale);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    // 4. Draw Points & Point Labels with drop shadow
    diag.points.forEach(p => {
      const pt = pts.get(p.id);
      if (!pt) return;

      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, 4.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (AppState.showLabels && p.showLabel !== false) {
        ctx.font = 'bold 15px "Times New Roman", serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(p.name || p.id, pt.sx + 7, pt.sy - 7);
      }
      ctx.restore();
    });

    ctx.restore();
  }
}

// ==========================================
// 6. VIEWPORT SWITCHING & COLLAPSIBLE PANEL
// ==========================================
function switchViewMode(mode) {
  AppState.activeView = mode;

  const btn2d = document.getElementById('view-mode-2d');
  const btn3d = document.getElementById('view-mode-3d');
  const btnReal = document.getElementById('view-mode-real');
  const btnSvg = document.getElementById('view-mode-svg');

  const c2d = document.getElementById('canvas-2d-container');
  const c3d = document.getElementById('three-container');
  const cReal = document.getElementById('real-scene-container');
  const cSvg = document.getElementById('svg-container');
  const overlayWrap = document.getElementById('overlay-toggle-wrap');

  // Reset tab button styles
  [btn2d, btn3d, btnReal, btnSvg].forEach(b => {
    b.className = "px-3 py-1.5 rounded-lg hover:text-slate-900 flex items-center gap-1.5 transition";
  });
  const activeClass = "px-3 py-1.5 rounded-lg bg-white text-indigo-600 font-bold shadow-sm flex items-center gap-1.5 transition";

  // Hide all view containers
  c2d.classList.add('hidden');
  c3d.classList.add('hidden');
  cReal.classList.add('hidden');
  cSvg.classList.add('hidden');
  overlayWrap.classList.add('hidden');

  if (mode === '2d') {
    btn2d.className = activeClass;
    c2d.classList.remove('hidden');
    render2DTechnical();
  } else if (mode === '3d') {
    btn3d.className = activeClass;
    c3d.classList.remove('hidden');
    initThreeJS();
    requestAnimationFrame(() => {
      onThreeResize();
      updateThreeScene();
      if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
      }
    });
    setTimeout(() => {
      onThreeResize();
      if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
      }
    }, 100);
  } else if (mode === 'real') {
    btnReal.className = activeClass;
    cReal.classList.remove('hidden');
    overlayWrap.classList.remove('hidden');
    renderRealisticSceneWithOverlay();
  } else if (mode === 'svg') {
    btnSvg.className = activeClass;
    cSvg.classList.remove('hidden');
    renderSvgView();
  }
}

function renderSvgView() {
  const wrap = document.getElementById('svg-render-wrap');
  if (!wrap) return;
  const diag = AppState.diagram || {};
  if (diag.svgCode) {
    wrap.innerHTML = diag.svgCode;
    setTimeout(() => { applyMvTransform(); setupMvSvgInteractiveListeners(); }, 60);
  } else {
    wrap.innerHTML = `<div class="text-center p-8 text-slate-400 text-xs">
      Chưa có sơ đồ SVG thí nghiệm cho bài toán này.<br>Nhập đề bài hoặc ảnh chụp thí nghiệm để AI sinh mã SVG chuẩn xác!
    </div>`;
  }
}

// Collapsible Right Sidebar
function toggleRightPanelCollapse() {
  const panel = document.getElementById('right-panel-wrapper');
  const center = document.getElementById('center-panel-wrapper');
  const expandBar = document.getElementById('collapsed-expand-bar');

  AppState.isRightPanelCollapsed = !AppState.isRightPanelCollapsed;

  if (AppState.isRightPanelCollapsed) {
    panel.classList.add('hidden');
    center.classList.remove('lg:col-span-6');
    center.classList.add('lg:col-span-9');
    expandBar.classList.remove('hidden');
  } else {
    panel.classList.remove('hidden');
    center.classList.remove('lg:col-span-9');
    center.classList.add('lg:col-span-6');
    expandBar.classList.add('hidden');
  }

  // Trigger resize on canvas & 3D
  setTimeout(() => {
    if (AppState.activeView === '2d') render2DTechnical();
    else if (AppState.activeView === '3d') onThreeResize();
    else if (AppState.activeView === 'real') renderRealisticSceneWithOverlay();
  }, 100);
}

// ==========================================
// 7. GEMINI 2.5 FLASH MULTIMODAL INTEGRATION (MULTI-KEY & MULTI-MODEL FALLBACK)
// ==========================================
function getActiveApiKeys() {
  const raw = (localStorage.getItem('gemini_api_key') || localStorage.getItem('gemini_api_keys') || localStorage.getItem('smartedu_gemini_key') || AppState.apiKey || '').trim();
  if (!raw) return [];
  // Split by comma, semicolon or newlines to allow multiple keys
  return raw.split(/[\n,;]+/).map(k => k.trim()).filter(k => k.length > 5);
}

// SMART LOCAL GEOMETRIC FALLBACK: Guarantees 100% uptime even if Google quota is exhausted!
function smartLocalGeometricFallback(promptText = "") {
  const text = promptText.toLowerCase();
  if (text.includes('băng giấy') || text.includes('chấm') || text.includes('0,02') || text.includes('chuyển động thẳng') || text.includes('hình 1') || text.includes('hình 2')) {
    return PRESETS.find(p => p.id === 'preset_paper_tape')?.data || PRESETS[0].data;
  }

  if (text.includes('nhiệt') || text.includes('vật lí') || text.includes('nước') || text.includes('điện trở')) {
    return PRESETS.find(p => p.id === 'preset_calorimeter')?.data || PRESETS[5].data;
  }
  if (text.includes('ray') || text.includes('từ trường') || text.includes('thanh')) {
    return PRESETS.find(p => p.id === 'preset_rails')?.data || PRESETS[6].data;
  }
  if (text.includes('chuẩn độ') || text.includes('axit') || text.includes('hóa')) {
    return PRESETS.find(p => p.id === 'preset_chem_titration')?.data || PRESETS[7].data;
  }
  if (text.includes('mái') || text.includes('ăng-ten') || text.includes('nhà')) {
    return PRESETS.find(p => p.id === 'preset_roof')?.data || PRESETS[1].data;
  }
  if (text.includes('tennis') || text.includes('bóng')) {
    return PRESETS.find(p => p.id === 'preset_tennis')?.data || PRESETS[2].data;
  }
  if (text.includes('khí cầu') || text.includes('sương mù')) {
    return PRESETS.find(p => p.id === 'preset_balloon')?.data || PRESETS[3].data;
  }
  if (text.includes('kim tự tháp') || text.includes('kê-ốp')) {
    return PRESETS.find(p => p.id === 'preset_pyramid_pq')?.data || PRESETS[4].data;
  }
  if (text.includes('máy bay') || text.includes('gió')) {
    return PRESETS.find(p => p.id === 'preset_plane')?.data || PRESETS[8].data;
  }
  if (text.includes('đu') || text.includes('xích đu')) {
    return PRESETS.find(p => p.id === 'preset_swing')?.data || PRESETS[9].data;
  }

  // General Pyramid S.ABCD
  return {
    title: "Hình Chóp S.ABCD — Tọa Độ Oxyz Chuẩn Hóa",
    type: "math_3d",
    scale: 35,
    points: [
      { id: "O", name: "O(0,0,0)", x: 0, y: 0, z: 0, color: "#4f46e5", showLabel: true },
      { id: "A", name: "A", x: 3, y: -3, z: 0, color: "#1e293b", showLabel: true },
      { id: "B", name: "B", x: 3, y: 3, z: 0, color: "#1e293b", showLabel: true },
      { id: "C", name: "C", x: -3, y: 3, z: 0, color: "#1e293b", showLabel: true },
      { id: "D", name: "D", x: -3, y: -3, z: 0, color: "#1e293b", showLabel: true },
      { id: "S", name: "S(0,0,5)", x: 0, y: 0, z: 5, color: "#dc2626", showLabel: true }
    ],
    segments: [
      { from: "A", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "B", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "C", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "D", to: "A", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "S", to: "A", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "B", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "C", style: "solid", arrow: false, color: "#1e293b", width: 2 },
      { from: "S", to: "D", style: "dashed", arrow: false, color: "#64748b", width: 1.5 },
      { from: "S", to: "O", style: "dashed", arrow: false, color: "#ef4444", width: 1.5 }
    ],
    polygons: [
      { points: ["S", "A", "B"], color: "rgba(99, 102, 241, 0.15)" },
      { points: ["S", "B", "C"], color: "rgba(59, 130, 246, 0.12)" }
    ]
  };
}

async function callGeminiMultimodal(promptText, base64Image, onProgress) {
  const selectedModel = document.getElementById('model-select').value || '';
  const category = (document.getElementById('domain-select') || {}).value || '';

  const systemInstruction = `Bạn là chuyên gia đồ họa toán học, vật lý và hóa học THPT Việt Nam (chương trình GDPT 2018).
Nhiệm vụ: Đọc kỹ ảnh chụp và/hoặc văn bản đề bài, dựng lại ĐÚNG hình/vật thể trong đề (không thay bằng hình chóp mẫu hay hình khác).

QUY ƯỚC TỌA ĐỘ BẮT BUỘC (math_3d):
- Hệ Oxyz: mặt đất là mặt phẳng z = 0, trục Oz hướng LÊN TRÊN. Mọi vật thể thực tế (ngôi nhà, mái nhà, kim tự tháp, cột, tháp...) phải có ĐÁY nằm trên z = 0 và phần cao hơn có z > 0.
- Kim tự tháp/hình chóp: đáy là đa giác trên z = 0, đỉnh có z > 0 nằm phía trên tâm đáy.
- Ngôi nhà: thân hộp chữ nhật đặt trên z = 0, mái (lăng trụ tam giác hoặc chóp) đặt lên trên thân nhà.
- Dùng đúng tên điểm như trong đề; nếu đề cho tọa độ thì dùng nguyên tọa độ đó. Giá trị tọa độ nên nằm trong khoảng -8..8 (tự co giãn nếu cần).
- Cạnh bị khuất khi nhìn từ góc (x dương, y dương, z dương) dùng "dashed".
- Chỉ thêm điểm O(0,0,0) nếu đề có gốc tọa độ.

Chỉ trả về 1 JSON object:
{
  "title": "Tên bài toán ngắn gọn",
  "type": "math_3d" | "physics_exp" | "chemistry_exp" | "math_2d",
  "scale": 32,
  "points": [ { "id": "A", "name": "A", "x": 0, "y": 0, "z": 0, "color": "#1e293b", "showLabel": true } ],
  "segments": [ { "from": "A", "to": "B", "style": "solid", "arrow": false, "color": "#1e293b", "width": 2 } ],
  "polygons": [ { "points": ["A", "B", "C"], "color": "rgba(99, 102, 241, 0.15)" } ],
  "svgCode": "Chỉ dùng cho thí nghiệm Vật lí/Hóa học hoặc đồ thị: mã SVG hoàn chỉnh viewBox 0 0 700 460, nhãn tiếng Việt. Với math_3d để chuỗi rỗng."
}`;

  const parts = [];
  if (base64Image) {
    const m = base64Image.match(/^data:([^;]+);base64,/);
    const commaIdx = base64Image.indexOf(',');
    parts.push({ inlineData: { mimeType: m ? m[1] : 'image/jpeg', data: commaIdx > 0 ? base64Image.substring(commaIdx + 1) : base64Image } });
  }
  parts.push({
    text: `${systemInstruction}\n\nLĩnh vực người dùng chọn: ${category}\nĐề bài / Yêu cầu cụ thể:\n${promptText || "Đọc kỹ hình trong ảnh, xác định vật thể/hình trong đề và dựng lại chính xác mô hình đó."}`
  });

  const result = await window.GeminiClient.generateJson({ parts, preferredModel: selectedModel, onProgress });
  const d = result.data || {};
  const pts = Array.isArray(d.points) ? d.points : [];
  const hasSvg = typeof d.svgCode === 'string' && d.svgCode.includes('<svg');
  if (!pts.length && !hasSvg) {
    throw new Error('AI chưa trích xuất được hình từ đề bài này. Hãy bổ sung mô tả (tên điểm, kích thước) rồi thử lại.');
  }
  // Chuẩn hóa dữ liệu điểm / đoạn
  d.points = pts.map((p, i) => ({
    id: String(p.id || p.name || ('P' + i)),
    name: String(p.name || p.id || ('P' + i)),
    x: Number(p.x) || 0, y: Number(p.y) || 0, z: Number(p.z) || 0,
    color: p.color || '#1e293b',
    showLabel: p.showLabel !== false
  }));
  const ids = new Set(d.points.map(p => p.id));
  d.segments = (Array.isArray(d.segments) ? d.segments : []).filter(s => ids.has(String(s.from)) && ids.has(String(s.to))).map(s => ({
    from: String(s.from), to: String(s.to),
    style: s.style === 'dashed' ? 'dashed' : 'solid',
    arrow: !!s.arrow, color: s.color || '#1e293b', width: Number(s.width) || 2
  }));
  d.polygons = (Array.isArray(d.polygons) ? d.polygons : []).filter(pg => Array.isArray(pg.points) && pg.points.every(id => ids.has(String(id))));
  if (!d.scale || isNaN(Number(d.scale))) d.scale = 32;
  if (!d.type) d.type = hasSvg && !pts.length ? 'physics_exp' : 'math_3d';
  d.__model = result.model;
  return d;
}

// ==========================================
// 8. UI DATA BINDINGS (POINTS & SEGMENTS TABLES)
// ==========================================
function updatePointsTable() {
  const container = document.getElementById('points-list');
  if (!container) return;
  container.innerHTML = '';

  const diag = AppState.diagram;
  if (!diag || !diag.points) return;

  diag.points.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = "flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs";
    row.innerHTML = `
      <input type="text" value="${p.name || p.id}" class="w-10 font-bold bg-white border border-slate-200 rounded px-1 text-center" data-idx="${idx}" data-field="name" />
      <span class="text-[10px] text-slate-400">X:</span>
      <input type="number" step="0.5" value="${p.x}" class="w-12 bg-white border border-slate-200 rounded px-1 text-center" data-idx="${idx}" data-field="x" />
      <span class="text-[10px] text-slate-400">Y:</span>
      <input type="number" step="0.5" value="${p.y}" class="w-12 bg-white border border-slate-200 rounded px-1 text-center" data-idx="${idx}" data-field="y" />
      <span class="text-[10px] text-slate-400">Z:</span>
      <input type="number" step="0.5" value="${p.z}" class="w-12 bg-white border border-slate-200 rounded px-1 text-center" data-idx="${idx}" data-field="z" />
      <button class="text-rose-500 hover:text-rose-700 font-bold px-1" data-del-pt="${idx}" title="Xóa điểm">✕</button>
    `;
    container.appendChild(row);
  });

  // Event delegation for point edits
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const field = e.target.dataset.field;
      const val = field === 'name' ? e.target.value : parseFloat(e.target.value) || 0;
      AppState.diagram.points[idx][field] = val;
      refreshCurrentView();
    });
  });

  container.querySelectorAll('[data-del-pt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.delPt, 10);
      AppState.diagram.points.splice(idx, 1);
      updatePointsTable();
      refreshCurrentView();
    });
  });
}

function updateSegmentsTable() {
  const container = document.getElementById('segments-list');
  if (!container) return;
  container.innerHTML = '';

  const diag = AppState.diagram;
  if (!diag || !diag.segments) return;

  diag.segments.forEach((seg, idx) => {
    const row = document.createElement('div');
    row.className = "flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded text-[11px]";
    row.innerHTML = `
      <div class="flex items-center gap-1 font-semibold text-slate-700">
        <span>${seg.from}</span>
        <span>→</span>
        <span>${seg.to}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <select class="bg-white border border-slate-200 rounded px-1 text-[10px]" data-seg-style="${idx}">
          <option value="solid" ${seg.style === 'solid' ? 'selected' : ''}>Nét liền</option>
          <option value="dashed" ${seg.style === 'dashed' ? 'selected' : ''}>Nét đứt</option>
        </select>
        <button class="text-rose-500 hover:text-rose-700 font-bold px-1" data-del-seg="${idx}">✕</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('[data-seg-style]').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.segStyle, 10);
      AppState.diagram.segments[idx].style = e.target.value;
      refreshCurrentView();
    });
  });

  container.querySelectorAll('[data-del-seg]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.delSeg, 10);
      AppState.diagram.segments.splice(idx, 1);
      updateSegmentsTable();
      refreshCurrentView();
    });
  });
}

function refreshCurrentView() {
  if (AppState.activeView === '2d') render2DTechnical();
  else if (AppState.activeView === '3d') updateThreeScene();
  else if (AppState.activeView === 'real') renderRealisticSceneWithOverlay();
  else if (AppState.activeView === 'svg') renderSvgView();
}

function loadDiagram(diag) {
  AppState.diagram = JSON.parse(JSON.stringify(diag));
  document.getElementById('diagram-title').innerText = diag.title || "Hình Không Gian Oxyz";
  
  const badgeEl = document.getElementById('diagram-badge');
  if (diag.type === 'physics_exp') badgeEl.innerText = "Vật Lí Thí Nghiệm";
  else if (diag.type === 'chemistry_exp') badgeEl.innerText = "Hóa Học Thí Nghiệm";
  else if (diag.type === 'math_2d') badgeEl.innerText = "Toán Phẳng Oxy";
  else badgeEl.innerText = "Toán Không Gian Oxyz";

  updatePointsTable();
  updateSegmentsTable();

  if (diag.type === 'physics_exp' || diag.type === 'chemistry_exp') {
    switchViewMode('svg');
  } else {
    switchViewMode('2d');
  }
}


function rasterizeSvgToPng(svgString, isTransparent, callback) {
  // Trích xuất viewBox để lấy chính xác tỉ lệ gốc của SVG
  let vbWidth = 760;
  let vbHeight = 380;
  const vbMatch = svgString.match(/viewBox=["']([\d.\s-]+)["']/i);
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      vbWidth = parts[2];
      vbHeight = parts[3];
    }
  }

  // Đảm bảo thẻ svg có width và height chuẩn theo viewBox
  let cleanSvg = svgString;
  if (!cleanSvg.includes('width=') || !cleanSvg.includes('height=')) {
    cleanSvg = cleanSvg.replace(/<svg\b/i, `<svg width="${vbWidth}" height="${vbHeight}" `);
  }

  const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 3.0; // Xuất chuẩn 300 DPI siêu sắc nét cho Word & In ấn
    const w = Math.round(vbWidth * scale * (typeof mvScaleX !== 'undefined' ? mvScaleX : 1.0) * (typeof mvZoom !== 'undefined' ? mvZoom : 1.0));
    const h = Math.round(vbHeight * scale * (typeof mvScaleY !== 'undefined' ? mvScaleY : 1.0) * (typeof mvZoom !== 'undefined' ? mvZoom : 1.0));
    canvas.width = Math.max(100, w);
    canvas.height = Math.max(100, h);
    const ctx = canvas.getContext('2d');
    if (!isTransparent) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    callback(canvas.toDataURL('image/png'));
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast("Lỗi khi kết xuất ảnh PNG từ SVG!");
  };
  img.src = url;
}

// ========================================================
// MATHVIZ INTERACTIVE TRANSFORM CONTROLLER & DRAG EDITING
// ========================================================
let mvZoom = 1.0;
let mvScaleX = 1.0;
let mvScaleY = 1.0;
let mvIsDragEditMode = false;
let mvActiveDragElement = null;
let mvDragOffset = { x: 0, y: 0 };

function applyMvTransform() {
  const svgEl = document.querySelector('#svg-render-wrap svg');
  if (svgEl) {
    svgEl.style.transformOrigin = 'center center';
    svgEl.style.transform = `scale(${mvZoom * mvScaleX}, ${mvZoom * mvScaleY})`;
    svgEl.style.transition = mvIsDragEditMode ? 'none' : 'transform 0.15s ease-out';
  }
}

function updateMvTransformLabels() {
  const zEl = document.getElementById('mv-zoom-val');
  const xEl = document.getElementById('mv-scale-x-val');
  const yEl = document.getElementById('mv-scale-y-val');
  if (zEl) zEl.innerText = Math.round(mvZoom * 100) + '%';
  if (xEl) xEl.innerText = Math.round(mvScaleX * 100) + '%';
  if (yEl) yEl.innerText = Math.round(mvScaleY * 100) + '%';
  applyMvTransform();
}

document.getElementById('mv-btn-zoom-in')?.addEventListener('click', () => {
  mvZoom = Math.min(2.5, +(mvZoom + 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-zoom-out')?.addEventListener('click', () => {
  mvZoom = Math.max(0.4, +(mvZoom - 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-scale-x-inc')?.addEventListener('click', () => {
  mvScaleX = Math.min(2.0, +(mvScaleX + 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-scale-x-dec')?.addEventListener('click', () => {
  mvScaleX = Math.max(0.4, +(mvScaleX - 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-scale-y-inc')?.addEventListener('click', () => {
  mvScaleY = Math.min(2.0, +(mvScaleY + 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-scale-y-dec')?.addEventListener('click', () => {
  mvScaleY = Math.max(0.4, +(mvScaleY - 0.1).toFixed(2));
  updateMvTransformLabels();
});
document.getElementById('mv-btn-reset-transform')?.addEventListener('click', () => {
  mvZoom = 1.0;
  mvScaleX = 1.0;
  mvScaleY = 1.0;
  updateMvTransformLabels();
  showToast("Đã đặt lại kích thước hình vẽ 100%!");
});

const mvBtnToggleDrag = document.getElementById('mv-btn-toggle-drag-mode');
const mvDragModeText = document.getElementById('mv-drag-mode-text');
if (mvBtnToggleDrag) {
  mvBtnToggleDrag.addEventListener('click', () => {
    mvIsDragEditMode = !mvIsDragEditMode;
    if (mvIsDragEditMode) {
      mvBtnToggleDrag.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
      mvBtnToggleDrag.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
      if (mvDragModeText) mvDragModeText.innerText = "Đang Kéo Thả (Bấm Tắt)";
      showToast("Đã bật chế độ Kéo thả: Hãy nhấp chuột vào chấm tròn hoặc chữ để kéo!");
    } else {
      mvBtnToggleDrag.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
      mvBtnToggleDrag.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
      if (mvDragModeText) mvDragModeText.innerText = "Bật Kéo Điểm / Chữ";
      showToast("Đã tắt chế độ kéo thả");
    }
    setupMvSvgInteractiveListeners();
  });
}

function setupMvSvgInteractiveListeners() {
  const svgEl = document.querySelector('#svg-render-wrap svg');
  if (!svgEl) return;

  const dotsAndTexts = svgEl.querySelectorAll('circle, text');
  dotsAndTexts.forEach(el => {
    if (mvIsDragEditMode) {
      el.style.cursor = 'move';
      el.setAttribute('pointer-events', 'all');
    } else {
      el.style.cursor = '';
    }

    el.onmousedown = null;
    el.ondblclick = null;

    if (mvIsDragEditMode) {
      el.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        mvActiveDragElement = el;
        const pt = getMvSvgPoint(svgEl, e);
        if (el.tagName.toLowerCase() === 'circle') {
          mvDragOffset.x = pt.x - parseFloat(el.getAttribute('cx') || 0);
          mvDragOffset.y = pt.y - parseFloat(el.getAttribute('cy') || 0);
        } else if (el.tagName.toLowerCase() === 'text') {
          mvDragOffset.x = pt.x - parseFloat(el.getAttribute('x') || 0);
          mvDragOffset.y = pt.y - parseFloat(el.getAttribute('y') || 0);
        }
      };

      if (el.tagName.toLowerCase() === 'text') {
        el.ondblclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const oldText = el.textContent || '';
          const newText = prompt('Sửa nội dung văn bản:', oldText);
          if (newText !== null && newText.trim() !== '') {
            el.textContent = newText.trim();
            if (AppState.diagram) AppState.diagram.svgCode = svgEl.outerHTML;
            showToast("Đã cập nhật nội dung chữ!");
          }
        };
      }
    }
  });

  svgEl.onmousemove = (e) => {
    if (!mvIsDragEditMode || !mvActiveDragElement) return;
    const pt = getMvSvgPoint(svgEl, e);
    if (mvActiveDragElement.tagName.toLowerCase() === 'circle') {
      mvActiveDragElement.setAttribute('cx', (pt.x - mvDragOffset.x).toFixed(1));
      mvActiveDragElement.setAttribute('cy', (pt.y - mvDragOffset.y).toFixed(1));
    } else if (mvActiveDragElement.tagName.toLowerCase() === 'text') {
      mvActiveDragElement.setAttribute('x', (pt.x - mvDragOffset.x).toFixed(1));
      mvActiveDragElement.setAttribute('y', (pt.y - mvDragOffset.y).toFixed(1));
    }
  };

  svgEl.onmouseup = () => {
    if (mvActiveDragElement) {
      mvActiveDragElement = null;
      if (AppState.diagram) AppState.diagram.svgCode = svgEl.outerHTML;
    }
  };

  svgEl.onmouseleave = () => {
    if (mvActiveDragElement) {
      mvActiveDragElement = null;
      if (AppState.diagram) AppState.diagram.svgCode = svgEl.outerHTML;
    }
  };
}

function getMvSvgPoint(svg, evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

// ==========================================
// 9. EXPORTS: PNG, SVG, TIKZ LATEX
// ==========================================
function downloadWhitePng() {
  if (AppState.activeView === 'real') {
    const rCanvas = document.getElementById('real-scene-canvas');
    if (rCanvas) {
      triggerDownload(rCanvas.toDataURL('image/png'), 'mathviz-thuc-te.png');
      showToast("Đã tải ảnh bối cảnh thực tế cho đề thi!");
      return;
    }
  }
  if (AppState.activeView === '3d' && threeRenderer) {
    const dataUrl = threeRenderer.domElement.toDataURL('image/png');
    triggerDownload(dataUrl, 'mathviz-3d-model.png');
    return;
  }

  // NẾU ĐANG XEM SVG HOẶC DIAGRAM CÓ SVGCODE: XUẤT TRỰC TIẾP SVG SANG 2K PNG
  if (AppState.activeView === 'svg' || (AppState.diagram && AppState.diagram.svgCode)) {
    const svgEl = document.querySelector('#svg-render-wrap svg');
    const svgString = svgEl ? svgEl.outerHTML : (AppState.diagram && AppState.diagram.svgCode);
    if (svgString) {
      rasterizeSvgToPng(svgString, false, (dataUrl) => {
        triggerDownload(dataUrl, 'mathviz-thi-nghiem.png');
        showToast("Đã tải ảnh PNG nền trắng chuẩn nét cho đề thi Word!");
      });
      return;
    }
  }

  // Create high-res white background PNG from 2D Canvas
  const canvas = document.getElementById('main-2d-canvas');
  if (!canvas) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tCtx = tempCanvas.getContext('2d');

  tCtx.fillStyle = '#ffffff';
  tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tCtx.drawImage(canvas, 0, 0);

  const dataUrl = tempCanvas.toDataURL('image/png');
  triggerDownload(dataUrl, 'mathviz-de-thi.png');
  showToast("Đã tải ảnh PNG nền trắng cho đề thi Word!");
}

function downloadTransparentPng() {
  if (AppState.activeView === 'real') {
    const rCanvas = document.getElementById('real-scene-canvas');
    if (rCanvas) {
      triggerDownload(rCanvas.toDataURL('image/png'), 'mathviz-thuc-te.png');
      showToast("Đã tải ảnh bối cảnh thực tế!");
      return;
    }
  }
  if (AppState.activeView === '3d' && threeRenderer) {
    const dataUrl = threeRenderer.domElement.toDataURL('image/png');
    triggerDownload(dataUrl, 'mathviz-3d-trans.png');
    return;
  }

  // NẾU ĐANG XEM SVG HOẶC DIAGRAM CÓ SVGCODE: XUẤT TRỰC TIẾP SVG SANG 2K PNG TRONG SUỐT
  if (AppState.activeView === 'svg' || (AppState.diagram && AppState.diagram.svgCode)) {
    const svgEl = document.querySelector('#svg-render-wrap svg');
    const svgString = svgEl ? svgEl.outerHTML : (AppState.diagram && AppState.diagram.svgCode);
    if (svgString) {
      rasterizeSvgToPng(svgString, true, (dataUrl) => {
        triggerDownload(dataUrl, 'mathviz-thi-nghiem-trans.png');
        showToast("Đã tải ảnh PNG trong suốt sắc nét cho PowerPoint!");
      });
      return;
    }
  }

  const canvas = document.getElementById('main-2d-canvas');
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  triggerDownload(dataUrl, 'mathviz-trans.png');
  showToast("Đã tải ảnh PNG trong suốt cho PowerPoint!");
}

function downloadSvgFile() {
  const diag = AppState.diagram;
  let svgContent = "";

  if (diag.svgCode) {
    svgContent = diag.svgCode;
  } else {
    // Generate SVG string from 2D points & segments
    const pts = diag.points || [];
    const segs = diag.segments || [];
    const originX = 350;
    const originY = 250;
    const scale = (diag.scale || 32);

    let segsSvg = "";
    segs.forEach(s => {
      const p1 = pts.find(p => p.id === s.from);
      const p2 = pts.find(p => p.id === s.to);
      if (!p1 || !p2) return;
      const c1 = projectOxyz(p1.x, p1.y, p1.z, originX, originY, scale);
      const c2 = projectOxyz(p2.x, p2.y, p2.z, originX, originY, scale);
      const dash = s.style === 'dashed' ? 'stroke-dasharray="5,4"' : '';
      segsSvg += `<line x1="${c1.x.toFixed(1)}" y1="${c1.y.toFixed(1)}" x2="${c2.x.toFixed(1)}" y2="${c2.y.toFixed(1)}" stroke="${s.color || '#000'}" stroke-width="${s.width || 2}" ${dash} />\n`;
    });

    let ptsSvg = "";
    pts.forEach(p => {
      const c = projectOxyz(p.x, p.y, p.z, originX, originY, scale);
      ptsSvg += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.5" fill="${p.color || '#000'}" />\n`;
      ptsSvg += `<text x="${(c.x + 6).toFixed(1)}" y="${(c.y - 6).toFixed(1)}" font-family="'Times New Roman', serif" font-weight="bold" font-style="italic" font-size="14">${p.name || p.id}</text>\n`;
    });

    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;">
  ${segsSvg}
  ${ptsSvg}
</svg>`;
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'mathviz-vector.svg');
  showToast("Đã xuất file .SVG Vector sắc nét!");
}

function generateTikZCode() {
  const diag = AppState.diagram;
  let code = `\\begin{tikzpicture}[scale=0.8, >=stealth, font=\\footnotesize]
  % Định nghĩa trục toạ độ và hệ quy chiếu Oxyz chuẩn SGK Việt Nam
  \\draw[->, red, thick] (0,0) -- (-2,-2) node[below left] {$x$};
  \\draw[->, green!60!black, thick] (0,0) -- (4,0) node[right] {$y$};
  \\draw[->, blue, thick] (0,0) -- (0,4) node[above] {$z$};\n\n`;

  // Points
  code += `  % Toạ độ các điểm:\n`;
  (diag.points || []).forEach(p => {
    // 3D coordinate mapping in tikz
    code += `  \\coordinate (${p.id}) at (${(p.y * 0.7 - p.x * 0.4).toFixed(2)}, ${(p.z * 0.7 - p.x * 0.3).toFixed(2)});\n`;
  });

  code += `\n  % Các đoạn thẳng:\n`;
  (diag.segments || []).forEach(s => {
    const dash = s.style === 'dashed' ? 'dashed' : 'thick';
    const arrow = s.arrow ? '->' : '-';
    code += `  \\draw[${dash}, ${arrow}] (${s.from}) -- (${s.to});\n`;
  });

  code += `\n  % Tên điểm:\n`;
  (diag.points || []).forEach(p => {
    code += `  \\fill (${p.id}) circle (1.5pt) node[above right] {$${p.name || p.id}$};\n`;
  });

  code += `\\end{tikzpicture}`;
  return code;
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;
  msgEl.innerText = msg;
  toast.classList.remove('translate-y-10', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-10', 'opacity-0');
  }, 2600);
}

// ==========================================
// 10. INITIALIZATION & EVENT ATTACHMENTS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved API Key (supports keys from all sister tools)
  const savedKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('gemini_api_keys') || localStorage.getItem('smartedu_gemini_key') || '';
  if (savedKey) {
    document.getElementById('gemini-api-key').value = savedKey;
    AppState.apiKey = savedKey;
  }

  // API Key save
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

  // Render presets list in sidebar
  const presetContainer = document.getElementById('presets-container');
  PRESETS.forEach(p => {
    const item = document.createElement('div');
    item.className = "p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition flex flex-col gap-1";
    item.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-800">${p.title}</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">${p.badge}</span>
      </div>
      <p class="text-[10px] text-slate-500 leading-tight">${p.desc}</p>
    `;
    item.addEventListener('click', () => {
      loadDiagram(p.data);
      showToast(`Đã tải mẫu: ${p.title}`);
    });
    presetContainer.appendChild(item);
  });

  // Tab switching between AI and Presets
  const tabBtnAi = document.getElementById('tab-btn-ai');
  const tabBtnPreset = document.getElementById('tab-btn-preset');
  const viewAi = document.getElementById('view-ai-input');
  const viewPreset = document.getElementById('view-preset-list');

  tabBtnAi.addEventListener('click', () => {
    tabBtnAi.className = "py-2 rounded-lg bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition";
    tabBtnPreset.className = "py-2 rounded-lg hover:text-slate-900 flex items-center justify-center gap-1.5 transition text-slate-600";
    viewAi.classList.remove('hidden');
    viewPreset.classList.add('hidden');
  });

  tabBtnPreset.addEventListener('click', () => {
    tabBtnPreset.className = "py-2 rounded-lg bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition";
    tabBtnAi.className = "py-2 rounded-lg hover:text-slate-900 flex items-center justify-center gap-1.5 transition text-slate-600";
    viewPreset.classList.remove('hidden');
    viewAi.classList.add('hidden');
  });

  // Image Upload & Paste
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const dropPrompt = document.getElementById('drop-prompt');
  const previewWrap = document.getElementById('preview-wrap');
  const imagePreview = document.getElementById('image-preview');
  const btnRemoveImg = document.getElementById('btn-remove-img');
  let currentImageBase64 = null;

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result;
      imagePreview.src = currentImageBase64;
      dropPrompt.classList.add('hidden');
      previewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
  });

  btnRemoveImg.addEventListener('click', (e) => {
    e.stopPropagation();
    currentImageBase64 = null;
    imagePreview.src = "";
    previewWrap.classList.add('hidden');
    dropPrompt.classList.remove('hidden');
    fileInput.value = "";
  });

  // Global Paste (Ctrl+V) handler for images
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        handleImageFile(file);
        showToast("Đã dán ảnh từ Clipboard thành công!");
        break;
      }
    }
  });

  // AI Analyze Button
  const btnAnalyze = document.getElementById('btn-analyze');
  const errorBox = document.getElementById('ai-error-box');
  const errorMsg = document.getElementById('ai-error-msg');

  btnAnalyze.addEventListener('click', async () => {
    const promptText = document.getElementById('prompt-input').value.trim();
    if (!promptText && !currentImageBase64) {
      errorBox.classList.remove('hidden');
      errorMsg.innerText = "Vui lòng nhập văn bản đề bài hoặc dán ảnh chụp bài toán.";
      return;
    }

    errorBox.classList.add('hidden');
    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>ĐANG SUY LUẬN & DỰNG HÌNH...</span>
    `;

    try {
      const result = await callGeminiMultimodal(promptText, currentImageBase64, (msg) => {
        const sp = btnAnalyze.querySelector('span');
        if (sp) sp.innerText = msg;
      });
      loadDiagram(result);
      showToast("AI đã dựng hình thành công (" + (result.__model || 'Gemini') + ")!");
    } catch (err) {
      errorBox.classList.remove('hidden');
      errorMsg.innerText = err.message || "Đã xảy ra lỗi khi phân tích.";
    } finally {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        <span>AI PHÂN TÍCH & DỰNG HÌNH (2-4S)</span>
      `;
    }
  });

  // View Mode Buttons
  document.getElementById('view-mode-2d').addEventListener('click', () => switchViewMode('2d'));
  document.getElementById('view-mode-3d').addEventListener('click', () => switchViewMode('3d'));
  document.getElementById('view-mode-real').addEventListener('click', () => switchViewMode('real'));
  document.getElementById('view-mode-svg').addEventListener('click', () => switchViewMode('svg'));

  // Toggles
  document.getElementById('toggle-axes').addEventListener('change', (e) => {
    AppState.showAxes = e.target.checked;
    refreshCurrentView();
  });
  document.getElementById('toggle-labels').addEventListener('change', (e) => {
    AppState.showLabels = e.target.checked;
    refreshCurrentView();
  });
  document.getElementById('toggle-overlay').addEventListener('change', (e) => {
    AppState.showOverlay = e.target.checked;
    renderRealisticSceneWithOverlay();
  });

  // Overlay Opacity slider
  const opacitySlider = document.getElementById('overlay-opacity-slider');
  const opacityVal = document.getElementById('opacity-val');
  opacitySlider.addEventListener('input', (e) => {
    AppState.overlayOpacity = parseFloat(e.target.value) / 100;
    opacityVal.innerText = `${e.target.value}%`;
    renderRealisticSceneWithOverlay();
  });

  // Collapsible panel toggle
  document.getElementById('btn-toggle-collapse').addEventListener('click', toggleRightPanelCollapse);
  document.getElementById('collapsed-expand-bar').addEventListener('click', toggleRightPanelCollapse);

  // Realistic scene style change / reset
  document.getElementById('btn-generate-real-scene').addEventListener('click', () => {
    AppState.customBackgroundImg = null;
    renderRealisticSceneWithOverlay();
    showToast("Đã làm mới phong cách bối cảnh thực tế!");
  });

  // Upload custom background
  const bgUpload = document.getElementById('real-bg-upload');
  document.getElementById('btn-upload-real-bg').addEventListener('click', () => bgUpload.click());
  bgUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          AppState.customBackgroundImg = img;
          renderRealisticSceneWithOverlay();
          showToast("Đã tải ảnh nền thực tế từ máy tính!");
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // Export buttons
  document.getElementById('btn-download-white-png').addEventListener('click', downloadWhitePng);
  document.getElementById('btn-download-trans-png').addEventListener('click', downloadTransparentPng);
  document.getElementById('btn-download-svg').addEventListener('click', downloadSvgFile);

  // TikZ Modal
  const tikzModal = document.getElementById('tikz-modal');
  const tikzArea = document.getElementById('tikz-code-area');
  document.getElementById('btn-show-tikz').addEventListener('click', () => {
    tikzArea.value = generateTikZCode();
    tikzModal.classList.remove('hidden');
  });
  document.getElementById('btn-copy-tikz').addEventListener('click', () => {
    tikzArea.value = generateTikZCode();
    tikzModal.classList.remove('hidden');
  });
  document.getElementById('btn-close-tikz').addEventListener('click', () => tikzModal.classList.add('hidden'));
  document.getElementById('btn-copy-tikz-modal').addEventListener('click', () => {
    navigator.clipboard.writeText(tikzArea.value);
    showToast("Đã sao chép mã TikZ vào clipboard!");
  });

  // Send to DOCX Assistant
  document.getElementById('btn-send-to-docx').addEventListener('click', () => {
    const canvas = document.getElementById('main-2d-canvas');
    if (canvas) {
      const pngData = canvas.toDataURL('image/png');
      sessionStorage.setItem('pending_mathviz_image', pngData);
      showToast("Đã lưu hình! Đang chuyển sang Trợ lý Soạn DOCX...");
      setTimeout(() => {
        window.location.href = '/ai-tools/toan-markdown-docx/index.html';
      }, 700);
    }
  });

  // Add Point & Add Segment
  document.getElementById('btn-add-point').addEventListener('click', () => {
    const diag = AppState.diagram;
    const nextChar = String.fromCharCode(65 + (diag.points.length % 26));
    diag.points.push({
      id: nextChar,
      name: nextChar,
      x: 1,
      y: 1,
      z: 2,
      color: "#1e293b",
      showLabel: true
    });
    updatePointsTable();
    refreshCurrentView();
  });

  document.getElementById('btn-add-segment').addEventListener('click', () => {
    const diag = AppState.diagram;
    if (diag.points.length < 2) return;
    diag.segments.push({
      from: diag.points[0].id,
      to: diag.points[diag.points.length - 1].id,
      style: "solid",
      arrow: false,
      color: "#1e293b",
      width: 2
    });
    updateSegmentsTable();
    refreshCurrentView();
  });

  // Reset View
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    AppState.pan2D = { x: 0, y: 0 };
    AppState.zoom2D = 1.0;
    if (threeControls) {
      threeCamera.position.set(15, -18, 13);
      threeControls.target.set(0, 0, 1.5);
      threeControls.update();
    }
    refreshCurrentView();
    showToast("Đã khôi phục góc nhìn mặc định");
  });

  // Initialize Default Preset
  loadDiagram(PRESETS[0].data);
});
