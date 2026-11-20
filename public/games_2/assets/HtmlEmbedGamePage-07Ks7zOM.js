import{r as l,j as e}from"./vendor-react-Cg7KvPel.js";/* empty css                           *//* empty css                     */import{S as ie}from"./Save-3zotkkeq.js";import{P as se}from"./Visibility-BYk1gwv_.js";import{A as le}from"./AutoAwesome-Cmbb--Xb.js";import{T as ce,O as de}from"./OpenInNew-GD0iLTIW.js";import{an as me,ao as pe,ap as ue,ar as he,aW as U,as as fe,at as xe,s as ne,au as ge,b4 as be,al as ye,c as te,a as re,q as S,a5 as Z,a2 as ve,T as k,U as ae,D as we,e as ke,ak as Ce,a7 as Te,ay as Ee,H as Se,aE as je,w as K,B as H,r as Ie,C as Be}from"./index-DnvAnRgE.js";import{T as Ae,F as Le}from"./TeacherShareModal-R8H5GL6j.js";import{H as Fe}from"./HelpVideoModal-C7Z0lRLX.js";import"./vendor-firebase-CDwhJuH3.js";import{u as Me}from"./useFeaturePage-BIlcXIgD.js";import{b as Ne}from"./aiStudioStatus-C62U-Ivf.js";import{D as De}from"./Download-DSW1OcfO.js";import{a as Oe,G as qe}from"./GameHeaderButtons-uB7MPitg.js";import{u as Ge}from"./useFullscreen-Bd4hbbw8.js";import{u as Re}from"./useFeatureAccess-BtTw-79Y.js";import{F as ze}from"./FeatureContentHeader-DYxiUIBO.js";import{F as X}from"./FeatureItemCard-B5CPkd_A.js";import{A as He}from"./AssignGameModal-CpSFs4m2.js";import{g as Ue,d as _e,u as Ve,c as Pe}from"./htmlEmbedGameService-Cpf7o_P0.js";import{T as We}from"./Tooltip-DCB9cXjh.js";import"./vendor-3d-BEYLZICz.js";import"./vendor-katex-DqEyuLHo.js";import"./teacherShareService-Bv-P7ySx.js";import"./classShareLessons-BLKX0ZJ_.js";import"./surveyScales-BPALTy85.js";import"./FormControlLabel-B7CFE27I.js";import"./Checkbox-nzrVy8Qr.js";import"./Tabs-XM3E6LHx.js";import"./CardContent-oAGfsUwU.js";import"./Edit-CQ4NWq8l.js";import"./Delete-DEBs_UM6.js";import"./PlayArrow-BVbPsDOV.js";import"./index-CrNIjAPa.js";import"./assignmentService-CVYFAa4v.js";import"./joinCodeService-DZVtGwtI.js";import"./gameTypes-DIWVrjT3.js";import"./useShuffleQuestions-DU0E0NOy.js";import"./Cancel-D6EO8yIc.js";import"./HelpOutline-8ipt_9Db.js";import"./EmojiEvents-D1UYrchf.js";import"./questionSizing-x4siNrIB.js";import"./youtube-CL3k1rS8.js";import"./versusSessionService-CH-kVtuA.js";import"./InputAdornment-CNRtNYTU.js";import"./Link-lmSr9m2D.js";import"./WarningAmber-CIEs0qID.js";import"./RadioGroup-Brp2BJxJ.js";import"./Radio-CRc6E8oP.js";function $e(n){return me("MuiAppBar",n)}pe("MuiAppBar",["root","positionFixed","positionAbsolute","positionSticky","positionStatic","positionRelative","colorDefault","colorPrimary","colorSecondary","colorInherit","colorTransparent","colorError","colorInfo","colorSuccess","colorWarning"]);const Qe=n=>{const{color:o,position:d,classes:r}=n,h={root:["root",`color${U(o)}`,`position${U(d)}`]};return fe(h,$e,r)},Y=(n,o)=>n?`${n==null?void 0:n.replace(")","")}, ${o})`:o,Je=xe(ne,{name:"MuiAppBar",slot:"Root",overridesResolver:(n,o)=>{const{ownerState:d}=n;return[o.root,o[`position${U(d.position)}`],o[`color${U(d.color)}`]]}})(ge(({theme:n})=>({display:"flex",flexDirection:"column",width:"100%",boxSizing:"border-box",flexShrink:0,variants:[{props:{position:"fixed"},style:{position:"fixed",zIndex:(n.vars||n).zIndex.appBar,top:0,left:"auto",right:0,"@media print":{position:"absolute"}}},{props:{position:"absolute"},style:{position:"absolute",zIndex:(n.vars||n).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"sticky"},style:{position:"sticky",zIndex:(n.vars||n).zIndex.appBar,top:0,left:"auto",right:0}},{props:{position:"static"},style:{position:"static"}},{props:{position:"relative"},style:{position:"relative"}},{props:{color:"inherit"},style:{"--AppBar-color":"inherit"}},{props:{color:"default"},style:{"--AppBar-background":n.vars?n.vars.palette.AppBar.defaultBg:n.palette.grey[100],"--AppBar-color":n.vars?n.vars.palette.text.primary:n.palette.getContrastText(n.palette.grey[100]),...n.applyStyles("dark",{"--AppBar-background":n.vars?n.vars.palette.AppBar.defaultBg:n.palette.grey[900],"--AppBar-color":n.vars?n.vars.palette.text.primary:n.palette.getContrastText(n.palette.grey[900])})}},...Object.entries(n.palette).filter(be(["contrastText"])).map(([o])=>({props:{color:o},style:{"--AppBar-background":(n.vars??n).palette[o].main,"--AppBar-color":(n.vars??n).palette[o].contrastText}})),{props:o=>o.enableColorOnDark===!0&&!["inherit","transparent"].includes(o.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)"}},{props:o=>o.enableColorOnDark===!1&&!["inherit","transparent"].includes(o.color),style:{backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...n.applyStyles("dark",{backgroundColor:n.vars?Y(n.vars.palette.AppBar.darkBg,"var(--AppBar-background)"):null,color:n.vars?Y(n.vars.palette.AppBar.darkColor,"var(--AppBar-color)"):null})}},{props:{color:"transparent"},style:{"--AppBar-background":"transparent","--AppBar-color":"inherit",backgroundColor:"var(--AppBar-background)",color:"var(--AppBar-color)",...n.applyStyles("dark",{backgroundImage:"none"})}}]}))),Ze=l.forwardRef(function(o,d){const r=ue({props:o,name:"MuiAppBar"}),{className:h,color:m="primary",enableColorOnDark:c=!1,position:j="fixed",...I}=r,B={...r,color:m,position:j,enableColorOnDark:c},f=Qe(B);return e.jsx(Je,{square:!0,component:"header",ownerState:B,elevation:4,className:he(f.root,h,j==="fixed"&&"mui-fixed"),ref:d,...I})}),Ke=ye(e.jsx("path",{d:"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"})),Xe=`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hành Trình Tin Học Lớp 9</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { inter: ['Inter', 'sans-serif'] },
                    colors: {
                        cyan: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63' }
                    },
                    animation: {
                        'bounce-short': 'bounce 0.5s ease-in-out 2',
                        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    },
                    keyframes: {
                        shake: {
                            '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                            '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                            '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                            '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
                        },
                        pop: {
                            '0%': { transform: 'scale(0.8)', opacity: '0' },
                            '100%': { transform: 'scale(1)', opacity: '1' }
                        }
                    }
                }
            }
        }
    <\/script>

    <!-- Canvas Confetti -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"><\/script>

    <style>
        body { font-family: 'Inter', sans-serif; user-select: none; -webkit-tap-highlight-color: transparent; }
        .glass-panel { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.5); }
        .btn-game { transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.2), 0 2px 4px -1px rgba(6, 182, 212, 0.1); border-bottom: 4px solid transparent; }
        .btn-game:active:not(:disabled) { transform: translateY(4px); border-bottom-width: 0px; }
        .btn-cyan { background-color: #06b6d4; color: white; border-bottom-color: #0891b2; }
        .btn-cyan:hover:not(:disabled) { background-color: #0891b2; }
        .btn-outline { background-color: white; color: #0891b2; border: 2px solid #06b6d4; border-bottom: 6px solid #06b6d4; }
        .btn-outline:hover:not(:disabled) { background-color: #ecfeff; }
        .btn-outline:active:not(:disabled) { border-bottom-width: 2px; transform: translateY(4px); }
        
        .match-item { transition: all 0.3s; cursor: pointer; }
        .match-selected { background-color: #cffafe; border-color: #06b6d4; transform: scale(1.05); }
        .match-correct { background-color: #dcfce7; border-color: #22c55e; color: #166534; pointer-events: none; opacity: 0.7; }
        .match-wrong { background-color: #fee2e2; border-color: #ef4444; animation: shake 0.5s; }
        
        #feedback-overlay { pointer-events: none; }
        
        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #ecfeff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #06b6d4; border-radius: 10px; }
    </style>
</head>
<body class="bg-gradient-to-br from-cyan-100 via-cyan-300 to-blue-200 min-h-screen flex items-center justify-center p-4 overflow-hidden">

    <!-- Audio Elements -->
    <audio id="sndCorrect" src="/sounds/sfx/correct.mp3"></audio>
    <audio id="sndWrong" src="/sounds/sfx/incorrect.mp3"></audio>

    <!-- Main App Container -->
    <div id="app" class="relative w-full max-w-3xl h-[85vh] md:h-[80vh] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        <!-- Top Bar -->
        <div class="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
            <button onclick="toggleFullscreen()" class="text-cyan-800 hover:text-cyan-600 transition-transform hover:scale-110 p-2 bg-white/50 rounded-full backdrop-blur-sm" title="Toàn màn hình">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
            <div id="scoreDisplay" class="hidden font-bold text-cyan-900 bg-white/80 px-4 py-1 rounded-full shadow-sm text-lg">
                ⭐ <span id="scoreVal">0</span>
            </div>
        </div>

        <!-- 1. Start Screen -->
        <div id="screen-start" class="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pop">
            <div class="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg mb-6 text-5xl">
                💻
            </div>
            <h1 class="text-3xl md:text-4xl font-extrabold text-cyan-900 mb-4 drop-shadow-sm">Thử Thách Tin Học 9</h1>
            <p class="text-cyan-800 text-lg mb-8 max-w-md">Vượt qua 15 thử thách đa dạng để chứng tỏ kiến thức Tin học của bạn. Sẵn sàng chưa?</p>
            <button onclick="startGame()" class="btn-game btn-cyan text-xl font-bold py-4 px-10 rounded-2xl w-full max-w-xs flex items-center justify-center gap-2">
                Bắt Đầu Ngay 🚀
            </button>
        </div>

        <!-- 2. Game Screen -->
        <div id="screen-game" class="hidden flex-1 flex flex-col h-full relative">
            <!-- Progress Bar -->
            <div class="w-full h-3 bg-cyan-100">
                <div id="progressBar" class="h-full bg-cyan-500 transition-all duration-500 w-0 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            </div>

            <!-- Question Area -->
            <div class="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col relative" id="questionContainer">
                <!-- Content injected by JS -->
            </div>

            <!-- Footer / Skip -->
            <div class="p-4 bg-white/50 border-t border-cyan-100 flex justify-between items-center">
                <span id="questionCounter" class="text-cyan-700 font-semibold text-sm">Câu 1/15</span>
                <button onclick="skipQuestion()" class="text-cyan-600 hover:text-cyan-800 font-bold px-4 py-2 rounded-xl hover:bg-cyan-100 transition-colors flex items-center gap-1">
                    Bỏ qua ⏭️
                </button>
            </div>

            <!-- Feedback Overlay -->
            <div id="feedback-overlay" class="absolute inset-0 flex items-center justify-center hidden z-50 bg-white/40 backdrop-blur-sm">
                <div id="feedback-card" class="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center transform scale-0 transition-transform duration-300">
                    <div id="feedback-icon" class="text-7xl mb-4"></div>
                    <h2 id="feedback-text" class="text-3xl font-extrabold"></h2>
                </div>
            </div>
        </div>

        <!-- 3. Result Screen -->
        <div id="screen-result" class="hidden flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div id="result-emoji" class="text-8xl mb-6 animate-bounce-short"></div>
            <h1 id="result-title" class="text-4xl font-extrabold text-cyan-900 mb-2"></h1>
            <p id="result-message" class="text-cyan-700 text-lg mb-6"></p>
            
            <div class="bg-cyan-50 border-2 border-cyan-200 rounded-3xl p-6 mb-8 w-full max-w-sm shadow-inner">
                <p class="text-cyan-800 font-semibold mb-1">Điểm của bạn</p>
                <div class="text-5xl font-black text-cyan-600 flex justify-center items-baseline gap-1">
                    <span id="finalScore">0</span><span class="text-2xl text-cyan-400">/15</span>
                </div>
            </div>

            <button onclick="resetGame()" class="btn-game btn-cyan text-xl font-bold py-4 px-10 rounded-2xl w-full max-w-xs flex items-center justify-center gap-2">
                Chơi Lại 🔄
            </button>
        </div>

    </div>

    <script>
        // --- DATA ---
        const rawGameData = [
            {
                type: 'MC',
                question: 'Công cụ xác thực dữ liệu trong phần mềm bảng tính có tên là gì?',
                options: ['Get Data', 'Sort Data', 'Data Validation', 'Data Filter'],
                answer: 2
            },
            {
                type: 'TF',
                question: 'Hàm IF kiểm tra điều kiện và trả về một giá trị khi điều kiện đúng và một giá trị khác nếu điều kiện sai.',
                answer: true
            },
            {
                type: 'FIB',
                question: 'Hàm COUNTIF [___] trong vùng dữ liệu thoả mãn điều kiện.',
                options: ['tăng số ô tính', 'đếm số ô tính', 'tính tổng giá trị', 'sắp xếp ô tính'],
                answer: 1
            },
            {
                type: 'MAT',
                question: 'Nối các hàm Excel với chức năng tương ứng:',
                pairs: [
                    { left: 'COUNTIF', right: 'Đếm theo điều kiện' },
                    { left: 'SUMIF', right: 'Tính tổng theo điều kiện' },
                    { left: 'IF', right: 'Rẽ nhánh có điều kiện' }
                ]
            },
            {
                type: 'ORD',
                question: 'Sắp xếp các bước giải một bài toán tin học theo thứ tự đúng:',
                items: ['Xác định bài toán', 'Xây dựng thuật toán', 'Cài đặt thuật toán']
            },
            {
                type: 'MC',
                question: 'Công cụ Data Validation (xác thực dữ liệu) có tác dụng gì?',
                options: ['Kiểm tra chính tả', 'Quy định độ dài dữ liệu', 'Sắp xếp dữ liệu', 'Hạn chế kiểu hoặc giá trị nhập vào'],
                answer: 3
            },
            {
                type: 'TF',
                question: 'Chỉ nam giới mới có thể làm những nghề như lập trình ứng dụng hay phân tích thiết kế hệ thống.',
                answer: false
            },
            {
                type: 'FIB',
                question: 'Bài toán được xác định bởi dữ liệu [___] (đầu vào) và dữ liệu cần tìm (đầu ra).',
                options: ['không thể', 'chưa biết', 'đã biết', 'có thể'],
                answer: 2
            },
            {
                type: 'MAT',
                question: 'Nối sở thích/công việc với nghề nghiệp phù hợp trong lĩnh vực Tin học:',
                pairs: [
                    { left: 'Tạo hình ảnh nhân vật', right: 'Thiết kế đồ họa' },
                    { left: 'Lập trình ứng dụng', right: 'Phát triển phần mềm' },
                    { left: 'Bảo vệ hệ thống mạng', right: 'Bảo mật máy tính' }
                ]
            },
            {
                type: 'MC',
                question: 'Đâu là một công ty hoạt động chủ yếu trong lĩnh vực tin học?',
                options: ['Công ty âm nhạc', 'Công ty phát triển trí tuệ nhân tạo', 'Công ty giao hàng', 'Công ty truyền hình'],
                answer: 1
            },
            {
                type: 'ORD',
                question: 'Sắp xếp các bước để giải quyết một vấn đề (theo sách giáo khoa):',
                items: ['Tìm hiểu vấn đề', 'Phân tích vấn đề', 'Đánh giá kết quả']
            },
            {
                type: 'TF',
                question: 'Đầu vào của bài toán "Sắp xếp một dãy số theo thứ tự tăng dần" là dãy số chưa sắp xếp.',
                answer: true
            },
            {
                type: 'FIB',
                question: 'Để in ra họ tên học sinh có ĐTB > 8.0, ta cần dùng cấu trúc tuần tự và cấu trúc [___].',
                options: ['lặp', 'rẽ nhánh', 'dữ liệu', 'mảng'],
                answer: 1
            },
            {
                type: 'MC',
                question: 'Công thức chung của hàm IF là gì?',
                options: [
                    '=IF(logical_test, [value_if_true], [value_if_false])',
                    '=IF(logical_test, [value_if_true])',
                    '=IF(logical_test, [true], [false])',
                    '=IF(logical_test, [value1], [value2])'
                ],
                answer: 0
            },
            {
                type: 'TF',
                question: 'Không chỉ doanh nghiệp tin học mà nhiều doanh nghiệp khác cũng cần lao động tin học.',
                answer: true
            }
        ];

        // --- STATE ---
        let gameData = [];
        let currentQIndex = 0;
        let score = 0;
        let isAnswering = false;

        // Specific states for mini-games
        let matState = { left: null, right: null, matched: 0, pairs: [], elements: {} };
        let ordState = { currentOrder: [], correctOrder: [] };

        // --- DOM ELEMENTS ---
        const screens = {
            start: document.getElementById('screen-start'),
            game: document.getElementById('screen-game'),
            result: document.getElementById('screen-result')
        };
        const container = document.getElementById('questionContainer');
        const progressBar = document.getElementById('progressBar');
        const qCounter = document.getElementById('questionCounter');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const scoreVal = document.getElementById('scoreVal');
        const feedbackOverlay = document.getElementById('feedback-overlay');
        const feedbackCard = document.getElementById('feedback-card');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');
        
        // Audio
        const sndCorrect = document.getElementById('sndCorrect');
        const sndWrong = document.getElementById('sndWrong');

        // --- CORE LOGIC ---
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function showScreen(screenName) {
            Object.values(screens).forEach(s => s.classList.add('hidden'));
            screens[screenName].classList.remove('hidden');
        }

        function startGame() {
            gameData = [...rawGameData]; // Use fixed order to ensure diverse mix
            currentQIndex = 0;
            score = 0;
            scoreVal.innerText = score;
            scoreDisplay.classList.remove('hidden');
            showScreen('game');
            renderQuestion();
        }

        function resetGame() {
            startGame();
        }

        function updateUI() {
            const progress = ((currentQIndex) / gameData.length) * 100;
            progressBar.style.width = \`\${progress}%\`;
            qCounter.innerText = \`Câu \${currentQIndex + 1}/\${gameData.length}\`;
            scoreVal.innerText = score;
        }

        function renderQuestion() {
            if (currentQIndex >= gameData.length) {
                endGame();
                return;
            }
            isAnswering = false;
            updateUI();
            container.innerHTML = '';
            container.classList.add('animate-pop');
            setTimeout(() => container.classList.remove('animate-pop'), 300);

            const q = gameData[currentQIndex];
            
            // Question Title
            const title = document.createElement('h2');
            title.className = 'text-2xl md:text-3xl font-bold text-cyan-900 mb-6 drop-shadow-sm leading-snug';
            
            // Handle FIB title specially
            if (q.type === 'FIB') {
                title.innerHTML = q.question.replace('[___]', '<span id="fib-blank" class="inline-block w-32 border-b-4 border-cyan-500 bg-cyan-50 rounded mx-2 text-center text-cyan-700 h-10 align-bottom transition-all"></span>');
            } else {
                title.innerText = q.question;
            }
            container.appendChild(title);

            // Render specific game type
            const wrapper = document.createElement('div');
            wrapper.className = 'flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto';
            
            switch (q.type) {
                case 'MC': renderMC(q, wrapper); break;
                case 'TF': renderTF(q, wrapper); break;
                case 'FIB': renderFIB(q, wrapper); break;
                case 'MAT': renderMAT(q, wrapper); break;
                case 'ORD': renderORD(q, wrapper); break;
            }
            container.appendChild(wrapper);
        }

        function processAnswer(isCorrect, targetElement = null) {
            if (isAnswering) return;
            isAnswering = true;

            if (isCorrect) {
                score++;
                scoreVal.innerText = score;
                sndCorrect.currentTime = 0; sndCorrect.play().catch(e=>{});
                showFeedback(true);
                if (targetElement) {
                    targetElement.classList.remove('btn-outline', 'btn-cyan');
                    targetElement.classList.add('bg-green-500', 'text-white', 'border-green-600');
                }
            } else {
                sndWrong.currentTime = 0; sndWrong.play().catch(e=>{});
                showFeedback(false);
                if (targetElement) {
                    targetElement.classList.remove('btn-outline', 'btn-cyan');
                    targetElement.classList.add('bg-red-500', 'text-white', 'border-red-600', 'animate-shake');
                }
            }

            setTimeout(() => {
                currentQIndex++;
                renderQuestion();
            }, 1500);
        }

        function skipQuestion() {
            if (isAnswering) return;
            currentQIndex++;
            renderQuestion();
        }

        function showFeedback(isCorrect) {
            feedbackOverlay.classList.remove('hidden');
            feedbackCard.classList.remove('scale-0');
            feedbackCard.classList.add('scale-100');
            
            if (isCorrect) {
                feedbackIcon.innerText = ['🤩','🎉','👏','🥳'][Math.floor(Math.random()*4)];
                feedbackText.innerText = "Tuyệt vời!";
                feedbackText.className = "text-3xl font-extrabold text-green-500";
            } else {
                feedbackIcon.innerText = ['😢','❌','💔','🥺'][Math.floor(Math.random()*4)];
                feedbackText.innerText = "Sai rồi!";
                feedbackText.className = "text-3xl font-extrabold text-red-500";
            }

            setTimeout(() => {
                feedbackCard.classList.remove('scale-100');
                feedbackCard.classList.add('scale-0');
                setTimeout(() => feedbackOverlay.classList.add('hidden'), 300);
            }, 1200);
        }

        function endGame() {
            progressBar.style.width = '100%';
            scoreDisplay.classList.add('hidden');
            showScreen('result');
            
            document.getElementById('finalScore').innerText = score;
            const max = gameData.length;
            const ratio = score / max;
            
            const titleEl = document.getElementById('result-title');
            const msgEl = document.getElementById('result-message');
            const emojiEl = document.getElementById('result-emoji');

            if (ratio >= 0.8) {
                titleEl.innerText = "Xuất Sắc!";
                titleEl.className = "text-4xl font-extrabold text-green-500 mb-2";
                msgEl.innerText = "Bạn có kiến thức Tin học cực kỳ vững vàng!";
                emojiEl.innerText = "🏆";
                triggerConfetti();
            } else if (ratio >= 0.5) {
                titleEl.innerText = "Làm Tốt Lắm!";
                titleEl.className = "text-4xl font-extrabold text-cyan-500 mb-2";
                msgEl.innerText = "Chỉ cần ôn tập thêm một chút là hoàn hảo!";
                emojiEl.innerText = "👍";
            } else {
                titleEl.innerText = "Cố Gắng Lên!";
                titleEl.className = "text-4xl font-extrabold text-orange-500 mb-2";
                msgEl.innerText = "Hãy xem lại bài giảng và thử sức lần nữa nhé!";
                emojiEl.innerText = "💪";
            }

            // PostMessage Integration
            try {
                window.parent.postMessage({ type: 'GAME_COMPLETE', score: score, maxScore: max }, '*');
            } catch (e) { console.log("Not in iframe or postMessage failed"); }
        }

        function triggerConfetti() {
            var duration = 3 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            function randomInRange(min, max) { return Math.random() * (max - min) + min; }

            var interval = setInterval(function() {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                var particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        // --- MINI-GAME RENDERERS ---

        // 1. Multiple Choice
        function renderMC(q, wrapper) {
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
            
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn-game btn-outline text-left p-4 rounded-2xl text-lg font-semibold flex items-center min-h-[80px]';
                btn.innerHTML = \`<span class="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mr-3 shrink-0">\${String.fromCharCode(65+idx)}</span> <span>\${opt}</span>\`;
                btn.onclick = () => {
                    if(isAnswering) return;
                    Array.from(grid.children).forEach(b => b.disabled = true);
                    processAnswer(idx === q.answer, btn);
                };
                grid.appendChild(btn);
            });
            wrapper.appendChild(grid);
        }

        // 2. True / False
        function renderTF(q, wrapper) {
            const flex = document.createElement('div');
            flex.className = 'flex flex-col md:flex-row gap-6 justify-center items-center mt-4';
            
            const btnTrue = document.createElement('button');
            btnTrue.className = 'btn-game btn-outline w-full md:w-48 h-48 rounded-3xl text-3xl font-bold flex flex-col items-center justify-center gap-4 hover:bg-green-50 hover:text-green-600 hover:border-green-400';
            btnTrue.innerHTML = \`<span class="text-6xl text-green-500">✅</span> Đúng\`;
            btnTrue.onclick = () => { if(!isAnswering) processAnswer(q.answer === true, btnTrue); };

            const btnFalse = document.createElement('button');
            btnFalse.className = 'btn-game btn-outline w-full md:w-48 h-48 rounded-3xl text-3xl font-bold flex flex-col items-center justify-center gap-4 hover:bg-red-50 hover:text-red-600 hover:border-red-400';
            btnFalse.innerHTML = \`<span class="text-6xl text-red-500">❌</span> Sai\`;
            btnFalse.onclick = () => { if(!isAnswering) processAnswer(q.answer === false, btnFalse); };

            flex.appendChild(btnTrue);
            flex.appendChild(btnFalse);
            wrapper.appendChild(flex);
        }

        // 3. Fill in the Blank (Click to select)
        function renderFIB(q, wrapper) {
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 gap-4 mt-8';
            
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn-game btn-outline p-4 rounded-xl text-lg font-semibold text-center';
                btn.innerText = opt;
                btn.onclick = () => {
                    if(isAnswering) return;
                    document.getElementById('fib-blank').innerText = opt;
                    document.getElementById('fib-blank').classList.add('bg-cyan-500', 'text-white', 'border-cyan-600');
                    Array.from(grid.children).forEach(b => b.disabled = true);
                    processAnswer(idx === q.answer, btn);
                };
                grid.appendChild(btn);
            });
            wrapper.appendChild(grid);
        }

        // 4. Matching
        function renderMAT(q, wrapper) {
            matState = { left: null, right: null, matched: 0, pairs: q.pairs, elements: { left: [], right: [] } };
            
            const container = document.createElement('div');
            container.className = 'flex gap-4 md:gap-8 justify-between w-full h-full';
            
            const colLeft = document.createElement('div'); colLeft.className = 'flex-1 flex flex-col gap-3';
            const colRight = document.createElement('div'); colRight.className = 'flex-1 flex flex-col gap-3';

            let leftItems = q.pairs.map((p, i) => ({ text: p.left, id: i }));
            let rightItems = q.pairs.map((p, i) => ({ text: p.right, id: i }));
            
            shuffleArray(leftItems);
            shuffleArray(rightItems);

            const handleMatchClick = (side, item, el) => {
                if (isAnswering || el.classList.contains('match-correct')) return;
                
                // Deselect current side
                matState.elements[side].forEach(e => {
                    if(!e.classList.contains('match-correct')) e.className = 'match-item bg-white border-2 border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-sm text-center font-medium flex items-center justify-center min-h-[80px]';
                });

                // Select new
                matState[side] = { id: item.id, el: el };
                el.classList.add('match-selected');

                // Check match
                if (matState.left && matState.right) {
                    const l = matState.left;
                    const r = matState.right;
                    
                    if (l.id === r.id) {
                        // Correct match
                        sndCorrect.currentTime = 0; sndCorrect.play().catch(e=>{});
                        l.el.className = 'match-item match-correct p-4 rounded-xl text-center font-medium flex items-center justify-center min-h-[80px]';
                        r.el.className = 'match-item match-correct p-4 rounded-xl text-center font-medium flex items-center justify-center min-h-[80px]';
                        matState.matched++;
                        matState.left = null; matState.right = null;
                        
                        if (matState.matched === q.pairs.length) {
                            setTimeout(() => processAnswer(true), 500);
                        }
                    } else {
                        // Wrong match
                        sndWrong.currentTime = 0; sndWrong.play().catch(e=>{});
                        l.el.classList.add('match-wrong');
                        r.el.classList.add('match-wrong');
                        setTimeout(() => {
                            if(!l.el.classList.contains('match-correct')) l.el.className = 'match-item bg-white border-2 border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-sm text-center font-medium flex items-center justify-center min-h-[80px]';
                            if(!r.el.classList.contains('match-correct')) r.el.className = 'match-item bg-white border-2 border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-sm text-center font-medium flex items-center justify-center min-h-[80px]';
                        }, 500);
                        matState.left = null; matState.right = null;
                    }
                }
            };

            leftItems.forEach(item => {
                const el = document.createElement('div');
                el.className = 'match-item bg-white border-2 border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-sm text-center font-medium flex items-center justify-center min-h-[80px] text-sm md:text-base';
                el.innerText = item.text;
                el.onclick = () => handleMatchClick('left', item, el);
                matState.elements.left.push(el);
                colLeft.appendChild(el);
            });

            rightItems.forEach(item => {
                const el = document.createElement('div');
                el.className = 'match-item bg-white border-2 border-cyan-200 text-cyan-800 p-4 rounded-xl shadow-sm text-center font-medium flex items-center justify-center min-h-[80px] text-sm md:text-base';
                el.innerText = item.text;
                el.onclick = () => handleMatchClick('right', item, el);
                matState.elements.right.push(el);
                colRight.appendChild(el);
            });

            container.appendChild(colLeft);
            container.appendChild(colRight);
            wrapper.appendChild(container);
        }

        // 5. Ordering
        function renderORD(q, wrapper) {
            ordState.correctOrder = [...q.items];
            ordState.currentOrder = [...q.items];
            shuffleArray(ordState.currentOrder);
            // Ensure it's not accidentally correct initially
            if (JSON.stringify(ordState.currentOrder) === JSON.stringify(ordState.correctOrder)) {
                ordState.currentOrder.push(ordState.currentOrder.shift());
            }

            const listContainer = document.createElement('div');
            listContainer.className = 'flex flex-col gap-3 w-full max-w-md mx-auto';

            const renderList = () => {
                listContainer.innerHTML = '';
                ordState.currentOrder.forEach((item, idx) => {
                    const row = document.createElement('div');
                    row.className = 'bg-white border-2 border-cyan-200 rounded-xl p-3 flex items-center shadow-sm';
                    
                    const num = document.createElement('div');
                    num.className = 'w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center mr-3 shrink-0';
                    num.innerText = idx + 1;
                    
                    const text = document.createElement('div');
                    text.className = 'flex-1 font-medium text-cyan-900';
                    text.innerText = item;
                    
                    const ctrls = document.createElement('div');
                    ctrls.className = 'flex flex-col gap-1 ml-2';
                    
                    const btnUp = document.createElement('button');
                    btnUp.innerHTML = '▲'; btnUp.className = 'text-cyan-400 hover:text-cyan-700 disabled:opacity-30';
                    btnUp.disabled = idx === 0;
                    btnUp.onclick = () => {
                        if(isAnswering) return;
                        [ordState.currentOrder[idx-1], ordState.currentOrder[idx]] = [ordState.currentOrder[idx], ordState.currentOrder[idx-1]];
                        renderList();
                    };

                    const btnDown = document.createElement('button');
                    btnDown.innerHTML = '▼'; btnDown.className = 'text-cyan-400 hover:text-cyan-700 disabled:opacity-30';
                    btnDown.disabled = idx === ordState.currentOrder.length - 1;
                    btnDown.onclick = () => {
                        if(isAnswering) return;
                        [ordState.currentOrder[idx+1], ordState.currentOrder[idx]] = [ordState.currentOrder[idx], ordState.currentOrder[idx+1]];
                        renderList();
                    };

                    ctrls.appendChild(btnUp);
                    ctrls.appendChild(btnDown);
                    
                    row.appendChild(num);
                    row.appendChild(text);
                    row.appendChild(ctrls);
                    listContainer.appendChild(row);
                });
            };

            renderList();
            wrapper.appendChild(listContainer);

            const submitBtn = document.createElement('button');
            submitBtn.className = 'btn-game btn-cyan text-lg font-bold py-3 px-8 rounded-xl mx-auto mt-6 block';
            submitBtn.innerText = 'Kiểm Tra Thứ Tự';
            submitBtn.onclick = () => {
                if(isAnswering) return;
                const isCorrect = JSON.stringify(ordState.currentOrder) === JSON.stringify(ordState.correctOrder);
                processAnswer(isCorrect, submitBtn);
            };
            wrapper.appendChild(submitBtn);
        }

        // --- UTILS ---
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log(\`Error attempting to enable fullscreen: \${err.message}\`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }

    <\/script>
</body>
</html>
`,Ye={id:"__demo__",title:"Hành Trình Tin Học Lớp 9",isDemo:!0,htmlContent:Xe};function en({onEditGame:n,onCreateNew:o,toast:d}){const{t:r}=te("htmlEmbedGame"),{currentUser:h}=re(),[m,c]=l.useState([]),[j,I]=l.useState(!0),[B,f]=l.useState(!1),[g,F]=l.useState(null),[q,M]=l.useState(!1),[A,x]=l.useState(!1),[L,N]=l.useState(null),[b,y]=l.useState(null),{isFullscreen:v,toggle:C}=Ge(),{accessInfo:i,isPinned:w,canAccessById:G,handleTogglePin:T,pinLimitReached:D,pinLimit:R}=Re("htmlEmbedGame",m);l.useEffect(()=>{h!=null&&h.uid&&O()},[h]);const O=async()=>{try{I(!0);const t=await Ue(h.uid);c(t)}catch(t){console.error("loadGames error:",t),d.error(r("errorLoading"))}finally{I(!1)}},p=async t=>{if(await Ce(r("deleteConfirm"),{variant:"danger"}))try{await _e(h.uid,t),d.success(r("deleteSuccess")),O()}catch{d.error(r("deleteError"))}},z=t=>{F(t),f(!0)},_=t=>{N({id:t.id,title:t.title,featureId:"html-embed-game",data:{title:t.title,htmlGameId:t.id,htmlContent:t.htmlContent}}),x(!0)},E=async t=>{const u=await T(t);u!=null&&u.limitReached?d.warning(r("common:pin.limitReached",{limit:u.limit,item:r("common:pin.lesson")})):d.success(w(t)?r("common:pin.unpinned"):r("common:pin.pinned"))},V=t=>{const u=new Blob([t.htmlContent],{type:"text/html;charset=utf-8"}),a=URL.createObjectURL(u),s=document.createElement("a");s.href=a,s.download=`${t.title.replace(/[^a-z0-9À-ɏ\s]/gi,"_")}.html`,s.click(),URL.revokeObjectURL(a)},P=t=>{if(!t)return"";try{return(t.toDate?t.toDate():new Date(t)).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})}catch{return""}};return j?e.jsx("div",{className:"loading",children:r("loadingGames")}):e.jsxs("div",{className:"my-html-games",children:[e.jsx(ze,{title:`${r("myGames")} (${m.length})`}),m.length>0&&e.jsxs("div",{style:{background:i!=null&&i.isExpired?"#fff3e0":"#fffde7",border:`1px solid ${i!=null&&i.isExpired?"#ff9800":"#fdd835"}`,borderRadius:8,padding:"8px 14px",marginBottom:14,fontSize:"0.85rem",color:"#5d4037",display:"flex",alignItems:"center",flexWrap:"wrap",gap:8},children:[e.jsx("span",{children:r("common:pin.note",{item:r("common:pin.lesson")})}),e.jsxs("span",{style:{color:"#78909c"},children:["(",m.filter(t=>w(t.id)).length,"/",R," ",r("common:pin.pinnedLabel"),")"]}),(i==null?void 0:i.isExpired)&&e.jsxs("span",{style:{color:"#d32f2f",fontWeight:"bold",marginLeft:"auto"},children:["⚠️ ",r("packageExpired")," ",e.jsx("button",{onClick:()=>M(!0),style:{background:"#d32f2f",color:"#fff",border:"none",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:"0.8rem"},children:r("extendSubscription")})]})]}),m.length===0?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"puzzles-grid",children:e.jsx(X,{title:r("demo.title"),thumbnail:e.jsx("span",{style:{fontSize:"2rem"},children:"</>"}),thumbnailBg:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",subtitle:e.jsx(S,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:e.jsx(Z,{label:r("demo.badge"),size:"small",sx:{bgcolor:"#ede9fe",color:"#5b21b6",fontWeight:600}})}),description:r("demo.hint"),accessible:!0,primaryAction:{label:r("playTest"),onClick:()=>y(Ye),icon:"play",color:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}})}),e.jsx("div",{style:{textAlign:"center",marginTop:16},children:e.jsx("button",{className:"btn-primary",onClick:o,children:r("createFirstGame")})})]}):e.jsx("div",{className:"puzzles-grid",children:m.map(t=>{const u=G(t.id),a=w(t.id);return P(t.createdAt),e.jsx(X,{title:t.title,thumbnail:e.jsx("span",{style:{fontSize:"2rem"},children:"</>"}),thumbnailBg:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",subtitle:e.jsx(S,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:a&&e.jsx(Z,{label:"📌 Đã ghim",size:"small",sx:{bgcolor:"#fff3e0",color:"#e65100"}})}),accessible:u,isPinned:a,onPinToggle:()=>E(t.id),pinLimitReached:D&&!a,lockedTip:u?void 0:e.jsx(k,{variant:"caption",color:"text.secondary",children:r("lockedTip")}),onUpgrade:()=>M(!0),primaryAction:{label:"Chơi ngay",onClick:()=>u&&y(t),icon:"play",color:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},onEdit:()=>n(t),onAssign:()=>z(t),onShare:()=>_(t),onDelete:()=>p(t.id),labels:{edit:r("common:actions.edit"),assign:r("assign"),share:r("common:actions.share"),delete:r("common:actions.delete")},extraActions:e.jsx(We,{title:r("downloadHtml"),children:e.jsx(ve,{size:"small",onClick:()=>V(t),sx:{color:"#667eea"},children:e.jsx(De,{fontSize:"small"})})})},t.id)})}),e.jsx(He,{open:B,onClose:()=>{f(!1),F(null)},game:g?{id:g.id,title:g.title,featureId:"html-embed-game",data:{title:g.title,htmlGameId:g.id,htmlContent:g.htmlContent}}:null,onSuccess:()=>{f(!1),F(null)}}),e.jsx(ae,{feature:"htmlEmbedGame",open:q,onClose:()=>M(!1)}),e.jsxs(we,{open:!!b,onClose:()=>y(null),fullScreen:!0,PaperProps:{sx:{bgcolor:"#000"}},children:[e.jsx(Ze,{position:"relative",sx:{bgcolor:"#1e1e2e"},children:e.jsxs(ce,{variant:"dense",sx:{gap:1},children:[e.jsx(Oe,{size:"sm",onClick:()=>{v&&C(),y(null)}}),e.jsx(k,{variant:"subtitle1",sx:{flex:1,minWidth:0,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:b==null?void 0:b.title}),e.jsx(qe,{size:"sm",isFullscreen:v,onToggle:C})]})}),e.jsx(ke,{sx:{p:0,display:"flex",flexDirection:"column"},children:b&&e.jsx("iframe",{srcDoc:b.htmlContent,sandbox:"allow-scripts allow-forms",allow:"fullscreen",style:{width:"100%",flex:1,border:"none"},title:b.title})})]}),L&&e.jsx(Ae,{open:A,onClose:()=>{x(!1),N(null)},game:L})]})}const ee=5e5;function Xn(){const{t:n}=te("htmlEmbedGame"),{currentUser:o}=re(),{toasts:d,toast:r,removeToast:h}=Te(),{verifySession:m}=Ee(),{subscriptionStatus:c,rawSub:j,showUpgradeModal:I,upgradeFeature:B,openUpgradeModal:f,closeUpgradeModal:g,showHelpModal:F,openHelpModal:q,closeHelpModal:M}=Me("htmlEmbedGame",{listenUpgradeEvent:!0}),[A,x]=l.useState("my-games"),[L,N]=l.useState(null),y=(c==null?void 0:c.mode)==="pro"||(c==null?void 0:c.mode)==="premium"||(c==null?void 0:c.mode)==="trial"&&c.remaining>0,[v,C]=l.useState(""),[i,w]=l.useState(""),[G,T]=l.useState(""),[D,R]=l.useState(!1),[O,p]=l.useState(""),z=[{id:"my-games",icon:"🎮",label:n("myGames"),view:"my-games"},{id:"create",icon:"➕",label:n("createNew"),view:"create"}],_=async a=>{if(a.view==="create"){if(!y){f("htmlEmbedGame");return}if(!await m())return;E()}x(a.view)},E=()=>{C(""),w(""),T(""),p(""),N(null)},V=async a=>{await m()&&(N(a),C(a.title),w(a.htmlContent),T(""),p(""),x("create"))},P=a=>{var $;const s=($=a.target.files)==null?void 0:$[0];if(a.target.value="",!s)return;if(!s.name.endsWith(".html")&&!s.name.endsWith(".htm")){p(n("uploadInvalidType"));return}if(s.size>ee){p(n("htmlSizeWarning"));return}const W=new FileReader;W.onload=oe=>{var J;const Q=(J=oe.target)==null?void 0:J.result;w(Q),T(Q),p(""),v.trim()||C(s.name.replace(/\.(html|htm)$/i,""))},W.readAsText(s,"utf-8")},t=()=>{i.trim()&&T(i)},u=async()=>{if(!v.trim()){p(n("titleRequired"));return}if(!i.trim()){p(n("htmlRequired"));return}if(new Blob([i]).size>ee){p(n("htmlSizeWarning"));return}if(await m()){R(!0),p("");try{L?await Ve(o.uid,L.id,{title:v.trim(),htmlContent:i}):await Pe(o.uid,{title:v.trim(),htmlContent:i}),r.success(n("saveSuccess")),E(),x("my-games")}catch(s){if((s==null?void 0:s.message)==="LIMIT_REACHED"){f();return}r.error(n("saveError"))}finally{R(!1)}}};return e.jsxs("div",{className:"flip-puzzle-page with-header",children:[e.jsx(Se,{}),e.jsx(je,{toasts:d,removeToast:h}),e.jsxs("div",{className:"fp-container",children:[e.jsx(Le,{bugReportUrl:"https://docs.google.com/document/d/1EZFCwLi5-uJd2IXZ5tlgZ4j9cOI2TxZU/edit?tab=t.0",className:"fp-sidebar",title:n("pageTitle"),subscriptionStatus:c,rawSub:j,featureKey:"htmlEmbedGame",navItems:z,activeView:A,onNavClick:_,onUpgradeClick:()=>f("htmlEmbedGame"),onHelpClick:q,helpLabel:n("guide")}),e.jsxs("div",{className:"fp-content",children:[A==="my-games"&&e.jsx(en,{onEditGame:V,onCreateNew:async()=>{if(!y){f("htmlEmbedGame");return}await m()&&(E(),x("create"))},toast:r}),A==="create"&&e.jsxs(ne,{sx:{p:3,maxWidth:900,mx:"auto"},children:[e.jsx(k,{variant:"h5",fontWeight:"bold",sx:{mb:3},children:n(L?"editGame":"createNew")}),e.jsx(K,{fullWidth:!0,label:n("titleLabel"),placeholder:n("titlePlaceholder"),value:v,onChange:a=>{C(a.target.value),p("")},sx:{mb:2}}),e.jsxs(S,{component:"a",href:"https://ai.studio/apps/0cc86c53-7050-44df-a446-671a77359cb7?fullscreenApplet=true",target:"_blank",rel:"noopener noreferrer",onClick:a=>Ne(a),sx:{display:"flex",alignItems:"center",gap:1.5,p:2,mb:2,borderRadius:2,textDecoration:"none",cursor:"pointer",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"#fff",transition:"opacity 0.2s, transform 0.15s","&:hover":{opacity:.92,transform:"translateY(-1px)"}},children:[e.jsx(le,{sx:{fontSize:28}}),e.jsxs(S,{sx:{flex:1},children:[e.jsx(k,{fontWeight:"bold",fontSize:"0.95rem",lineHeight:1.3,children:n("aiCreateBtn")}),e.jsx(k,{fontSize:"0.78rem",sx:{opacity:.85},children:n("aiCreateHint")})]}),e.jsx(de,{sx:{fontSize:18,opacity:.8}})]}),e.jsxs(S,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[e.jsx(k,{variant:"subtitle2",color:"text.secondary",children:n("htmlLabel")}),e.jsxs(H,{component:"label",size:"small",variant:"outlined",startIcon:e.jsx(Ke,{}),sx:{borderRadius:2,textTransform:"none",borderColor:"#667eea",color:"#667eea","&:hover":{borderColor:"#764ba2",color:"#764ba2",bgcolor:"rgba(102,126,234,0.06)"}},children:[n("uploadHtmlBtn"),e.jsx("input",{type:"file",accept:".html,.htm",hidden:!0,onChange:P})]})]}),e.jsx(K,{fullWidth:!0,multiline:!0,minRows:10,maxRows:20,placeholder:n("htmlPlaceholder"),value:i,onChange:a=>{w(a.target.value),T(""),p("")},sx:{mb:1,fontFamily:"monospace"},inputProps:{style:{fontFamily:"monospace",fontSize:"0.85rem"}}}),e.jsx(k,{variant:"caption",color:"text.secondary",sx:{mb:2,display:"block"},children:n("securityNote")}),O&&e.jsx(Ie,{severity:"error",sx:{mb:2},children:O}),e.jsxs(S,{sx:{display:"flex",gap:2,mb:3,flexWrap:"wrap"},children:[e.jsx(H,{variant:"outlined",startIcon:e.jsx(se,{}),onClick:t,disabled:!i.trim(),children:n("previewBtn")}),e.jsx(H,{variant:"contained",startIcon:D?e.jsx(Be,{size:18,color:"inherit"}):e.jsx(ie,{}),onClick:u,disabled:D,sx:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},children:n(D?"saving":"saveBtn")}),e.jsx(H,{variant:"text",onClick:()=>{E(),x("my-games")},children:n("cancel")})]}),G&&e.jsxs(S,{children:[e.jsxs(k,{variant:"subtitle2",fontWeight:"bold",sx:{mb:1},children:[n("previewLabel"),":"]}),e.jsx("iframe",{sandbox:"allow-scripts allow-forms",srcDoc:G,style:{width:"100%",height:"60vh",border:"1px solid #e0e0e0",borderRadius:8},title:"preview"})]})]})]})]}),e.jsxs("nav",{className:"mobile-bottom-nav",children:[z.map(a=>e.jsxs("button",{className:`mobile-nav-item ${A===a.view?"active":""}`,onClick:async()=>{if(a.view==="create"){if(!y){f("htmlEmbedGame");return}if(!await m())return;E()}x(a.view)},children:[e.jsx("span",{className:"mobile-nav-icon",children:a.icon}),e.jsx("span",{className:"mobile-nav-label",children:a.id==="my-games"?n("myGames"):n("createNew")})]},a.id)),e.jsxs("button",{className:"mobile-nav-item",onClick:q,children:[e.jsx("span",{className:"mobile-nav-icon",children:"❓"}),e.jsx("span",{className:"mobile-nav-label",children:"HD"})]})]}),e.jsx(ae,{feature:B,open:I,onClose:g}),e.jsx(Fe,{isOpen:F,onClose:M,videoId:"TU5JZUDkgEk",title:n("guide"),description:n("guideDesc")})]})}export{Xn as default};
