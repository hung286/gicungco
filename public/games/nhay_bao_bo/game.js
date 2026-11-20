
function compareShortAnswer(userAns, correctAns) {
    if (userAns === undefined || userAns === null || correctAns === undefined || correctAns === null) return false;
    const clean = s => String(s || '')
        .replace(/\$/g, '')
        .replace(/^[a-zA-Z_]\s*=\s*/i, '')
        .replace(/[(){}[\]\s\u00a0]/g, '')
        .trim();
    const u = clean(userAns), c = clean(correctAns);
    if (!u || !c) return false;
    if (u.toLowerCase() === c.toLowerCase()) return true;
    const uDot = u.replace(/,/g, '.'), cDot = c.replace(/,/g, '.');
    if (uDot.toLowerCase() === cDot.toLowerCase()) return true;
    const numU = parseFloat(uDot), numC = parseFloat(cDot);
    if (!isNaN(numU) && !isNaN(numC) && Math.abs(numU - numC) < 0.005) return true;
    return false;
}

// ===================================================
// GAME ENGINE - NHẢY BAO BỐ (SACK RACE)
// Logic điều khiển 2 người chơi thi đấu trực tiếp
// Hỗ trợ: Khóa lượt đối thủ khi trả lời, KaTeX LaTeX, Kho bộ đề GV
// ===================================================

class SackRaceGame {
    constructor() {
        this.questionBank = [];
        this.questionType = 'tnkq'; // 'tnkq' hoặc 'tuluan'
        this.winningHops = 10;
        
        // Cấu hình chế độ chơi: 'mode_class' | 'mode_2teams_remote' | 'mode_multiteam_remote'
        this.gameMode = 'mode_class';
        this.teamCount = 4;
        this.timeLimitSeconds = 0; // 0 = Không giới hạn
        this.remainingSeconds = 0;
        this.timerInterval = null;

        // Cấu hình 6 đội chơi sắc màu nổi bật
        this.defaultTeamConfigs = [
            { id: 'team_1', name: 'Đội 1 (Xanh Dương)', color: '#2563eb', bgLight: '#eff6ff', icon: '🔵', character: 'player-left' },
            { id: 'team_2', name: 'Đội 2 (Đỏ Rực)', color: '#dc2626', bgLight: '#fef2f2', icon: '🔴', character: 'player-right' },
            { id: 'team_3', name: 'Đội 3 (Xanh Lá)', color: '#16a34a', bgLight: '#f0fdf4', icon: '🟢', character: 'player-green' },
            { id: 'team_4', name: 'Đội 4 (Cam Vàng)', color: '#ea580c', bgLight: '#fff7ed', icon: '🟡', character: 'player-orange' },
            { id: 'team_5', name: 'Đội 5 (Tím Mộng)', color: '#9333ea', bgLight: '#faf5ff', icon: '🟣', character: 'player-purple' },
            { id: 'team_6', name: 'Đội 6 (Lam Ngọc)', color: '#0891b2', bgLight: '#ecfeff', icon: '🩵', character: 'player-teal' }
        ];

        this.teams = [];
        this.initTeams(this.teamCount);

        this.isGameStarted = false;
        this.isGameOver = false;
        this.isCountingDown = false;
        this.activeAnsweringPlayer = null; // Quản lý khóa lượt: khi đội này trả lời thì đội kia mờ đi
        
        // Khởi tạo bộ câu hỏi mặc định hấp dẫn
        this.initDefaultQuestions();

        // Khởi tạo hệ thống kết nối di động thời gian thực (Mobile Remote Sync)
        if (typeof window.RemoteSyncHost !== 'undefined') {
            this.remoteSyncHost = new window.RemoteSyncHost();
            this.remoteSyncHost.init(this);
        } else {
            this.remoteSyncHost = null;
        }
    }

    initTeams(count = 4) {
        this.teamCount = Math.min(6, Math.max(2, parseInt(count) || 4));
        this.teams = [];
        for (let i = 0; i < this.teamCount; i++) {
            const cfg = this.defaultTeamConfigs[i];
            this.teams.push({
                id: `team_${i + 1}`,
                alias: (i === 0) ? 'left' : (i === 1) ? 'right' : null,
                index: i,
                name: cfg.name,
                customName: '',
                color: cfg.color,
                bgLight: cfg.bgLight,
                icon: cfg.icon,
                character: cfg.character,
                racePosition: 0,
                qIndex: i,
                currentQuestion: null,
                inputAnswer: '',
                finishedRank: null,
                finishTime: null
            });
        }
        // Giữ tương thích 100% với code 2 đội cũ
        this.leftPlayer = this.teams[0];
        this.rightPlayer = this.teams[1];
    }

    getTeamById(teamId) {
        if (!teamId) return this.teams[0];
        const t = teamId.toString().trim().toLowerCase();
        if (t === 'left' || t === 'team_1' || t === '1') return this.teams[0];
        if (t === 'right' || t === 'team_2' || t === '2') return this.teams[1];
        const found = this.teams.find(tm => tm.id.toLowerCase() === t);
        return found || this.teams[0];
    }

    setTeamName(teamId, customName) {
        if (!customName) return;
        const team = this.getTeamById(teamId);
        if (team) {
            team.customName = customName.trim();
            team.name = customName.trim();
            const badgeName = document.querySelector(`#lane_${team.id} .lane-team-name`);
            if (badgeName) badgeName.textContent = team.name;
            const racerTag = document.querySelector(`#racerContainer_${team.id} .multi-racer-tag`);
            if (racerTag) racerTag.textContent = team.name;
            this.updateLiveLeaderboard();
        }
    }

    setGameMode(mode) {
        this.gameMode = mode || 'mode_class';
    }

    setTeamCount(count) {
        this.initTeams(count);
    }

    setTimeLimit(seconds) {
        this.timeLimitSeconds = parseInt(seconds) || 0;
    }

    initDefaultQuestions() {
        this.questionBank = [
            { id: 1, question: "Este no, đơn chức, mạch hở có công thức phân tử tổng quát là gì?", type: "tnkq", options: ["A. $C_n H_{2n} O_2$ $(n \\ge 2)$", "B. $C_n H_{2n-2} O_2$ $(n \\ge 3)$", "C. $C_n H_{2n} O$ $(n \\ge 1)$", "D. $C_n H_{2n+2} O_2$ $(n \\ge 2)$"], answer: "A" },
            { id: 2, question: "Chất nào sau đây là một este có mùi thơm của chuối chín?", type: "tnkq", options: ["A. Isoamyl axetat", "B. Etyl fomat", "C. Benzyl axetat", "D. Etyl butirat"], answer: "A" },
            { id: 3, question: "Công thức hóa học của amin bậc 1 etylamin là gì?", type: "tnkq", options: ["A. $C_2H_5NH_2$", "B. $CH_3NHCH_3$", "C. $(CH_3)_3N$", "D. $C_6H_5NH_2$"], answer: "A" },
            { id: 4, question: "Trong các kim loại sau, kim loại nào có tính dẫn điện tốt nhất?", type: "tnkq", options: ["A. Bạc ($Ag$)", "B. Đồng ($Cu$)", "C. Vàng ($Au$)", "D. Nhôm ($Al$)"], answer: "A" },
            { id: 5, question: "Thủy phân hoàn toàn tinh bột trong môi trường axit thu được chất nào?", type: "tnkq", options: ["A. Glucozơ", "B. Fructozơ", "C. Saccarozơ", "D. Mantozơ"], answer: "A" },
            { id: 6, question: "Kim loại nào sau đây có nhiệt độ nóng chảy cao nhất, dùng làm dây tóc bóng đèn?", type: "tnkq", options: ["A. Vonfram ($W$)", "B. Sắt ($Fe$)", "C. Crôm ($Cr$)", "D. Thủy ngân ($Hg$)"], answer: "A" },
            { id: 7, question: "Anilin ($C_6H_5NH_2$) tác dụng với nước brom ($Br_2$) tạo kết tủa màu gì?", type: "tnkq", options: ["A. Màu trắng", "B. Màu vàng", "C. Màu xanh lam", "D. Màu đỏ nâu"], answer: "A" },
            { id: 8, question: "Kim loại nào sau đây có tính cứng nhất trong tất cả các kim loại?", type: "tnkq", options: ["A. Crôm ($Cr$)", "B. Sắt ($Fe$)", "C. Kim cương", "D. Titan ($Ti$)"], answer: "A" },
            { id: 9, question: "Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh?", type: "tnkq", options: ["A. Metylamin ($CH_3NH_2$)", "B. Axit axetic ($CH_3COOH$)", "C. Anilin ($C_6H_5NH_2$)", "D. Glucozơ ($C_6H_{12}O_6$)"], answer: "A" },
            { id: 10, question: "Số nguyên tử hiđro trong một phân tử axit axetic ($CH_3COOH$) là bao nhiêu?", type: "tnkq", options: ["A. 4", "B. 2", "C. 3", "D. 6"], answer: "A" }
        ];
        this.questionType = 'tnkq';
        this.winningHops = 10;
    }

    setQuestionBank(bank, type = 'tnkq', hops = 10) {
        if (!bank || bank.length === 0) return;
        this.questionBank = bank;
        this.questionType = type;
        this.winningHops = Math.max(3, parseInt(hops) || Math.min(10, bank.length));
        this.isGameStarted = true;
        this.renderQuestionBankEditor();
        
        // Cập nhật lại câu hỏi đầu tiên lên giao diện cho 2 đội
        if (this.teams && this.teams.length >= 2) {
            this.teams[0].qIndex = 0;
            this.teams[1].qIndex = 1 % bank.length;
            this.leftPlayer = this.teams[0];
            this.rightPlayer = this.teams[1];
            this.loadNextQuestion('left');
            this.loadNextQuestion('right');
        }

        if (this.remoteSyncHost) {
            this.remoteSyncHost.broadcastFullState();
        }
    }

    // Tiền xử lý công thức LaTeX đứng trần (chưa có $) trước khi KaTeX quét
    preprocessLatexNodes(element) {
        if (!element) return;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const bareLatexRegex = /(\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\])*(?:[\^_](?:\{[^{}]*\}|[a-zA-Z0-9]))*)/g;
        
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent || parent.closest('.katex') || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
                continue;
            }
            const text = node.nodeValue;
            if (text && !text.includes('$') && bareLatexRegex.test(text)) {
                if (/\\(frac|sqrt|vec|overline|bar|hat|sum|int|lim|alpha|beta|gamma|theta|pi|le|ge|ne|times|pm)/.test(text)) {
                    node.nodeValue = text.replace(bareLatexRegex, (match) => {
                        return `$${match}$`;
                    });
                }
            }
        }
    }

    // Hiển thị công thức Toán/Hóa qua KaTeX
    renderMath(element) {
        if (!element) return;
        this.preprocessLatexNodes(element);
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(element, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false }
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.warn('KaTeX render error:', e);
            }
        }
    }

    // Khởi động trận đấu mới (Giáo viên bấm BẮT ĐẦU)
    startNewGame() {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.activeAnsweringPlayer = null;
        this.clearTurnLock();
        this.stopTimer();

        // Reset trạng thái các đội
        this.teams.forEach((t, idx) => {
            t.racePosition = 0;
            t.qIndex = idx;
            t.finishedRank = null;
            t.finishTime = null;
            t.inputAnswer = '';
            if (this.questionBank.length > 0) {
                t.currentQuestion = this.questionBank[idx % this.questionBank.length];
            }
        });

        this.leftPlayer = this.teams[0];
        this.rightPlayer = this.teams[1];
        
        // Đóng các modal
        const setupScreen = document.getElementById('setupScreen');
        if (setupScreen) setupScreen.style.display = 'none';
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        const winnerModal = document.getElementById('winnerModal');
        if (winnerModal) winnerModal.style.display = 'none';
        const podiumModal = document.getElementById('multiTeamLeaderboardModal');
        if (podiumModal) podiumModal.style.display = 'none';

        const gameScreen = document.getElementById('gameScreen');
        const standardTrack = document.querySelector('.center-section .balap-karung-field .race-track');
        const multiLaneField = document.getElementById('multiLaneField');
        const liveLeaderboardBar = document.getElementById('liveLeaderboardBar');

        if (this.gameMode === 'mode_multiteam_remote') {
            // Chế độ 3: Đại hội đa đội
            if (gameScreen) gameScreen.classList.add('multi-team-mode');
            if (standardTrack) standardTrack.style.display = 'none';
            if (multiLaneField) multiLaneField.style.display = 'flex';
            if (liveLeaderboardBar) liveLeaderboardBar.style.display = 'flex';

            this.renderMultiLaneTrack();
            this.updateLiveLeaderboard();
            this.initTimer();
        } else {
            // Chế độ 1 & Chế độ 2: 2 đội
            if (gameScreen) gameScreen.classList.remove('multi-team-mode');
            if (standardTrack) standardTrack.style.display = 'block';
            if (multiLaneField) multiLaneField.style.display = 'none';
            if (liveLeaderboardBar) liveLeaderboardBar.style.display = 'none';

            // Reset vị trí vận động viên về vạch xuất phát
            this.resetRacerPositions();
            
            // Cập nhật giao diện bàn phím hoặc 4 lựa chọn A, B, C, D
            this.updatePlayerInputModes();
            
            // Nạp câu hỏi đầu tiên
            this.loadNextQuestion('left');
            this.loadNextQuestion('right');
            
            // Cập nhật điểm số
            this.updateScoreDisplay('left');
            this.updateScoreDisplay('right');
        }
        
        // Phát sóng trạng thái bắt đầu tới tất cả điện thoại học sinh (chuyển từ phòng chờ sang câu hỏi)
        if (this.remoteSyncHost) {
            this.remoteSyncHost.broadcastGameStart();
            this.remoteSyncHost.broadcastFullState();
        }

        // Hiển thị đếm ngược 3, 2, 1, Bắt đầu!
        this.triggerCountdown();
    }

    // Render đường đua đa đội (2 - 6 làn đua) cho Chế độ 3
    renderMultiLaneTrack() {
        const field = document.getElementById('multiLaneField');
        if (!field) return;

        field.innerHTML = '';
        const teamsToRender = this.teams.slice(0, this.teamCount);

        teamsToRender.forEach((team, idx) => {
            const lane = document.createElement('div');
            lane.className = 'multi-track-lane';
            lane.id = `lane_${team.id}`;

            const charSrc = (idx % 2 === 0) ? 'assets/balap_karung/blue_stand.png' : 'assets/balap_karung/red_stand.png';
            const hopSrc = (idx % 2 === 0) ? 'assets/balap_karung/blue_hop.png' : 'assets/balap_karung/red_hop.png';

            lane.innerHTML = `
                <div class="lane-team-badge" style="border-left: 5px solid ${team.color};">
                    <span>${team.icon}</span>
                    <span class="lane-team-name">${team.customName || team.name}</span>
                    <span class="lane-team-score" id="laneScore_${team.id}" style="color:${team.color}; font-weight:900;">0/${this.winningHops}</span>
                </div>
                <div class="lane-finish-line"></div>
                <div class="lane-finish-flag">🏁</div>
                <div class="multi-racer-container" id="racerContainer_${team.id}" style="left: 12%;">
                    <span class="multi-racer-tag" style="background:${team.color};">${team.customName || team.name}</span>
                    <img src="${charSrc}" alt="${team.name}" class="multi-racer-img stand">
                    <img src="${hopSrc}" alt="${team.name}" class="multi-racer-img hop" style="display: none;">
                </div>
            `;
            field.appendChild(lane);
        });
    }

    // Nhảy tiến lên 1 bước cho làn đa đội
    makeTeamHop(teamId) {
        const team = this.getTeamById(teamId);
        if (!team || this.isGameOver) return;

        team.racePosition++;
        const racerEl = document.getElementById(`racerContainer_${team.id}`);
        const scoreEl = document.getElementById(`laneScore_${team.id}`);
        if (scoreEl) scoreEl.textContent = `${team.racePosition}/${this.winningHops}`;

        if (racerEl) {
            const startPct = 12;
            const finishPct = 86;
            const pct = startPct + (Math.min(team.racePosition, this.winningHops) / this.winningHops) * (finishPct - startPct);
            racerEl.style.left = `${pct}%`;

            const standImg = racerEl.querySelector('.stand');
            const hopImg = racerEl.querySelector('.hop');
            if (standImg) standImg.style.display = 'none';
            if (hopImg) hopImg.style.display = 'block';
            racerEl.classList.add('hopping');

            window.soundManager.playHop();

            setTimeout(() => {
                if (hopImg) hopImg.style.display = 'none';
                if (standImg) standImg.style.display = 'block';
                racerEl.classList.remove('hopping');
            }, 450);
        }

        this.updateLiveLeaderboard();

        // Kiểm tra về đích
        if (team.racePosition >= this.winningHops && !team.finishedRank) {
            const finishedCount = this.teams.slice(0, this.teamCount).filter(t => t.finishedRank).length;
            team.finishedRank = finishedCount + 1;
            team.finishTime = Date.now();

            if (this.showToast) {
                this.showToast(`🏁 ${team.icon} ${team.customName || team.name} đã về đích (Hạng ${team.finishedRank})!`, '🏁', 3000);
            }

            // Nếu đội đầu tiên về đích
            if (team.finishedRank === 1) {
                setTimeout(() => {
                    this.handleMultiTeamVictory(false);
                }, 800);
            }
        }
    }

    makeTeamShake(teamId) {
        const team = this.getTeamById(teamId);
        if (!team) return;
        const racerEl = document.getElementById(`racerContainer_${team.id}`);
        if (racerEl) {
            racerEl.classList.add('shaking');
            window.soundManager.playWrong();
            setTimeout(() => {
                racerEl.classList.remove('shaking');
            }, 400);
        }
    }

    // Xử lý câu trả lời tập trung từ học sinh gửi qua điện thoại
    handleTeamAnswer(teamId, answer, studentName, playerId) {
        if (this.isGameOver || this.isCountingDown) return;
        const team = this.getTeamById(teamId);
        if (!team) return;

        const currentQ = team.currentQuestion;
        if (!currentQ) return;

        const isShort = (!currentQ.options || currentQ.options.length < 2 || ['tuluan', 'tln', 'sa', 'short', 'short_answer', 'dien_so'].includes(String(currentQ.type||'').toLowerCase()));
        const isTNKQ = !isShort;
        let isCorrect = false;

        if (isTNKQ) {
            isCorrect = (answer.toString().trim().toUpperCase() === currentQ.answer.toString().trim().toUpperCase());
        } else {
            const ansVal = currentQ.answer !== undefined ? currentQ.answer : (currentQ.correct_answer !== undefined ? currentQ.correct_answer : (currentQ.correctAnswer !== undefined ? currentQ.correctAnswer : currentQ.correct));
            isCorrect = compareShortAnswer(answer, ansVal);
        }

        if (this.gameMode === 'mode_multiteam_remote') {
            if (isCorrect) {
                this.makeTeamHop(team.id);
            } else {
                this.makeTeamShake(team.id);
            }

            // Chuyển sang câu hỏi tiếp theo
            team.qIndex++;
            team.currentQuestion = this.questionBank[team.qIndex % this.questionBank.length];

            // Gửi kết quả và cập nhật về điện thoại của học sinh
            if (this.remoteSyncHost) {
                if (playerId) {
                    this.remoteSyncHost.sendToTopic(`nhaybaobo/v1/${this.remoteSyncHost.roomPin}/player/${playerId}`, {
                        type: 'ANSWER_RESULT',
                        isCorrect: isCorrect,
                        answer: answer,
                        correctAnswer: currentQ.answer,
                        newScore: team.racePosition,
                        winningHops: this.winningHops
                    });
                }
                this.remoteSyncHost.broadcastQuestionUpdate(team.id);
            }
        } else {
            // Mode 1 & Mode 2 (2 đội)
            const playerAlias = (team.id === 'team_2' || teamId === 'right') ? 'right' : 'left';
            if (isTNKQ) {
                const btnEl = document.querySelector(`.${playerAlias}-player .choice-btn[data-letter="${answer.toUpperCase()}"]`);
                if (btnEl) {
                    this.handleChoiceClick(playerAlias, answer.toUpperCase(), btnEl);
                } else {
                    if (isCorrect) {
                        this.makeRacerHop(playerAlias);
                        setTimeout(() => this.loadNextQuestion(playerAlias), 600);
                    } else {
                        this.makeRacerShake(playerAlias);
                    }
                }
            } else {
                const pState = (playerAlias === 'left') ? this.leftPlayer : this.rightPlayer;
                pState.inputAnswer = answer;
                this.submitKeypadAnswer(playerAlias);
            }

            if (this.remoteSyncHost && playerId) {
                this.remoteSyncHost.sendToTopic(`nhaybaobo/v1/${this.remoteSyncHost.roomPin}/player/${playerId}`, {
                    type: 'ANSWER_RESULT',
                    isCorrect: isCorrect,
                    answer: answer,
                    correctAnswer: currentQ.answer,
                    newScore: team.racePosition + (isCorrect ? 1 : 0),
                    winningHops: this.winningHops
                });
            }
        }
    }

    // Quản lý đồng hồ thi đấu
    initTimer() {
        this.stopTimer();
        const timerPill = document.getElementById('gameTimerPill');
        if (this.timeLimitSeconds > 0) {
            if (timerPill) timerPill.style.display = 'inline-flex';
            this.remainingSeconds = this.timeLimitSeconds;
            this.updateTimerDisplay();
            this.timerInterval = setInterval(() => {
                this.remainingSeconds--;
                this.updateTimerDisplay();
                if (this.remainingSeconds <= 0) {
                    this.stopTimer();
                    this.handleMultiTeamVictory(true);
                }
            }, 1000);
        } else {
            if (timerPill) timerPill.style.display = 'none';
        }
    }

    updateTimerDisplay() {
        const m = Math.floor(Math.max(0, this.remainingSeconds) / 60);
        const s = Math.max(0, this.remainingSeconds) % 60;
        const text = `⏱️ ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        const timerPill = document.getElementById('gameTimerPill');
        if (timerPill) timerPill.textContent = text;
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Cập nhật Bảng xếp hạng trực tiếp trên thanh trạng thái
    updateLiveLeaderboard() {
        const bar = document.getElementById('liveLeadRanks');
        if (!bar) return;

        const activeTeams = this.teams.slice(0, this.teamCount);
        const sorted = [...activeTeams].sort((a, b) => {
            if (a.finishedRank && b.finishedRank) return a.finishedRank - b.finishedRank;
            if (a.finishedRank) return -1;
            if (b.finishedRank) return 1;
            return b.racePosition - a.racePosition;
        });

        bar.innerHTML = '';
        sorted.forEach((team, idx) => {
            const pill = document.createElement('span');
            pill.className = `live-lead-pill ${idx === 0 ? 'rank-1' : ''}`;
            const medal = (idx === 0) ? '🥇' : (idx === 1) ? '🥈' : (idx === 2) ? '🥉' : `${idx + 1}.`;
            pill.innerHTML = `<span>${medal}</span> <strong>${team.customName || team.name}</strong> <span>(${team.racePosition}đ)</span>`;
            bar.appendChild(pill);
        });
    }

    // Bảng vinh danh chung cuộc & Bục Podium cho Chế độ 3
    handleMultiTeamVictory(isTimeUp = false) {
        this.isGameOver = true;
        this.stopTimer();
        window.soundManager.playVictory();
        this.launchConfetti();

        const activeTeams = this.teams.slice(0, this.teamCount);
        const sorted = [...activeTeams].sort((a, b) => {
            if (a.finishedRank && b.finishedRank) return a.finishedRank - b.finishedRank;
            if (a.finishedRank) return -1;
            if (b.finishedRank) return 1;
            return b.racePosition - a.racePosition;
        });

        // Điền vào bục Podium (1st, 2nd, 3rd)
        const goldTeam = sorted[0] || null;
        const silverTeam = sorted[1] || null;
        const bronzeTeam = sorted[2] || null;

        const goldNameEl = document.getElementById('podiumGoldName');
        const goldScoreEl = document.getElementById('podiumGoldScore');
        if (goldNameEl && goldTeam) {
            goldNameEl.textContent = goldTeam.customName || goldTeam.name;
            if (goldScoreEl) goldScoreEl.textContent = `${goldTeam.racePosition} bước`;
        }

        const silverNameEl = document.getElementById('podiumSilverName');
        const silverScoreEl = document.getElementById('podiumSilverScore');
        if (silverNameEl && silverTeam) {
            silverNameEl.textContent = silverTeam.customName || silverTeam.name;
            if (silverScoreEl) silverScoreEl.textContent = `${silverTeam.racePosition} bước`;
        }

        const bronzeNameEl = document.getElementById('podiumBronzeName');
        const bronzeScoreEl = document.getElementById('podiumBronzeScore');
        if (bronzeNameEl && bronzeTeam) {
            bronzeNameEl.textContent = bronzeTeam.customName || bronzeTeam.name;
            if (bronzeScoreEl) bronzeScoreEl.textContent = `${bronzeTeam.racePosition} bước`;
        }

        // Bảng chi tiết thứ hạng
        const tableBody = document.getElementById('podiumTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            sorted.forEach((team, idx) => {
                const tr = document.createElement('tr');
                const medal = (idx === 0) ? '🥇 Quán quân' : (idx === 1) ? '🥈 Á quân' : (idx === 2) ? '🥉 Hạng ba' : `Hạng ${idx + 1}`;
                tr.innerHTML = `
                    <td style="font-weight:900;">${medal}</td>
                    <td style="color:${team.color}; font-weight:800;">${team.icon} ${team.customName || team.name}</td>
                    <td><strong>${team.racePosition}</strong>/${this.winningHops} bước</td>
                    <td>${team.racePosition >= this.winningHops ? '🏁 Đã về đích' : '⏳ Đang đua'}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        const titleEl = document.getElementById('podiumModalTitle');
        if (titleEl) {
            titleEl.textContent = isTimeUp ? '⏰ HẾT THỜI GIAN THI ĐẤU - BẢNG XẾP HẠNG CHUNG CUỘC' : '🏆 ĐẠI HỘI KẾT THÚC - BẢNG VINH DANH CHUNG CUỘC';
        }

        const modal = document.getElementById('multiTeamLeaderboardModal');
        if (modal) modal.style.display = 'flex';

        // Phát sóng kết quả xếp hạng tới tất cả điện thoại học sinh
        if (this.remoteSyncHost) {
            this.remoteSyncHost.sendToTopic(`nhaybaobo/v1/${this.remoteSyncHost.roomPin}/host`, {
                type: 'MULTI_TEAM_GAME_OVER',
                isTimeUp: isTimeUp,
                winner: goldTeam?.id,
                winnerName: goldTeam?.customName || goldTeam?.name,
                leaderboard: sorted.map((t, idx) => ({
                    rank: idx + 1,
                    teamId: t.id,
                    name: t.customName || t.name,
                    score: t.racePosition,
                    finished: t.racePosition >= this.winningHops
                }))
            });
        }
    }

    // Đếm ngược 3 - 2 - 1 - Bắt đầu!
    triggerCountdown() {
        const overlay = document.getElementById('countdownOverlay');
        const numEl = document.getElementById('countdownNumber');
        const textEl = document.getElementById('countdownText');
        
        this.isCountingDown = true;
        overlay.classList.add('show');
        
        const steps = [
            { num: '3', text: 'Chuẩn bị...' },
            { num: '2', text: 'Sẵn sàng...' },
            { num: '1', text: 'Tập trung...' },
            { num: 'Bắt đầu!', text: 'Gasskan!!! 🚀', isStart: true }
        ];
        
        let index = 0;
        
        const nextStep = () => {
            if (index >= steps.length) {
                setTimeout(() => {
                    overlay.classList.remove('show');
                    this.isCountingDown = false;
                }, 500);
                return;
            }
            
            const current = steps[index];
            numEl.textContent = current.num;
            textEl.textContent = current.text;
            
            if (current.isStart) {
                numEl.classList.add('start');
                window.soundManager.playCountdownBeep(true);
            } else {
                numEl.classList.remove('start');
                window.soundManager.playCountdownBeep(false);
            }
            
            numEl.style.animation = 'none';
            void numEl.offsetHeight;
            numEl.style.animation = '';
            
            index++;
            setTimeout(nextStep, current.isStart ? 900 : 800);
        };
        
        nextStep();
    }

    // Chuyển đổi giao diện người chơi tùy theo câu hỏi TNKQ hay Tự luận
    updatePlayerInputModes(targetPlayer) {
        const players = targetPlayer ? [targetPlayer] : ['left', 'right'];
        
        players.forEach(player => {
            const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
            const currentQ = pState ? pState.currentQuestion : null;
            
            // Ưu tiên: nếu câu hỏi hiện tại có options hoặc là tnkq -> hiển thị A, B, C, D
            const isShort = currentQ && (!currentQ.options || currentQ.options.length < 2 || ['tuluan', 'tln', 'sa', 'short', 'short_answer', 'dien_so'].includes(String(currentQ.type||'').toLowerCase()));
            const isTNKQ = !isShort;
            
            const choicesEl = document.querySelector(`.${player}-player .choices-container`);
            const keypadEl = document.querySelector(`.${player}-player .keypad`);
            const answerBoxEl = document.querySelector(`.${player}-player .answer-box`);
            
            if (isTNKQ) {
                if (choicesEl) choicesEl.style.display = 'flex';
                if (keypadEl) keypadEl.style.display = 'none';
                if (answerBoxEl) answerBoxEl.style.display = 'none';
            } else {
                if (choicesEl) choicesEl.style.display = 'none';
                if (keypadEl) keypadEl.style.display = 'flex';
                if (answerBoxEl) answerBoxEl.style.display = 'flex';
            }
        });
    }

    // Tự thu nhỏ cỡ chữ khi câu hỏi dài để hiển thị vừa khung (tối thiểu 14px), tránh phải cuộn
    fitQuestionText(qBox) {
        if (!qBox) return;
        qBox.style.fontSize = '';
        const fit = () => {
            let size = parseFloat(getComputedStyle(qBox).fontSize) || 20;
            let guard = 0;
            while (qBox.scrollHeight > qBox.clientHeight + 2 && size > 14 && guard++ < 30) {
                size -= 1;
                qBox.style.fontSize = size + 'px';
            }
        };
        fit();
        // bố cục có thể chưa xong ở lần đo đầu (màn hình vừa hiện) -> đo lại sau khi trình duyệt dựng xong
        requestAnimationFrame(() => requestAnimationFrame(() => { if (qBox.scrollHeight > qBox.clientHeight + 2) fit(); }));
        // ảnh trong câu hỏi tải xong mới biết chiều cao thật
        qBox.querySelectorAll('img').forEach(img => {
            if (!img.complete) img.addEventListener('load', () => { qBox.style.fontSize = ''; fit(); }, { once: true });
        });
    }

    // Nạp câu hỏi tiếp theo cho từng người chơi
    loadNextQuestion(player) {
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        if (pState) pState.isRetry = false;
        if (this.questionBank.length === 0) return;
        
        // Chọn câu hỏi tuần tự theo vòng tròn
        const q = this.questionBank[pState.qIndex % this.questionBank.length];
        pState.currentQuestion = q;
        pState.qIndex++;
        pState.inputAnswer = '';
        
        // Render lên màn hình
        const qBox = document.querySelector(`.${player}-player .question-box`);
        if (qBox) {
            qBox.innerHTML = `<div class="question-text">${q.question}</div>`;
            this.renderMath(qBox);
            this.fitQuestionText(qBox);

            // Bấm vào ảnh trong câu hỏi để phóng to xem rõ nét
            qBox.querySelectorAll('img').forEach(img => {
                img.title = 'Bấm để phóng to hình ảnh';
                img.onclick = (e) => {
                    e.stopPropagation();
                    this.showImageModal(img.src);
                };
            });
        }
        
        // Cập nhật giao diện: Tự động chuyển đổi Trắc nghiệm A,B,C,D hoặc Bàn phím số tương ứng cho câu hỏi này
        this.updatePlayerInputModes(player);
        
        const isTNKQ = (q.options && q.options.length >= 2) || (q.type === 'tnkq') || (this.questionType === 'tnkq');
        if (isTNKQ) {
            // Render 4 nút lựa chọn
            const choicesContainer = document.querySelector(`.${player}-player .choices-container`);
            if (choicesContainer) {
                choicesContainer.innerHTML = '';
                const opts = q.options && q.options.length ? q.options : ['A. Đúng', 'B. Sai', 'C. Khác', 'D. Không rõ'];
                
                ['A', 'B', 'C', 'D'].forEach((letter, idx) => {
                    const optText = opts[idx] || `${letter}. Phương án`;
                    let cleanText = optText.replace(/^[A-D][\.\)\:\-]\s*/i, '').trim();
                    // Loại bỏ triệt để các dấu chấm câu thừa ở đầu phương án (như ". <img ...>") nhưng bảo lưu dấu âm -
                    cleanText = cleanText.replace(/^[\.\:\)\s]+/, '').replace(/^-(?!\d)/, '').trim();
                    if (!cleanText || cleanText === '.') {
                        cleanText = `Phương án ${letter}`;
                    }
                    if (cleanText.endsWith('.') && !cleanText.endsWith('..')) {
                        if (cleanText.endsWith('$.')) {
                            cleanText = cleanText.slice(0, -2) + '$';
                        } else if (!cleanText.endsWith('}$')) {
                            cleanText = cleanText.slice(0, -1).trim();
                        }
                    }
                    
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.dataset.letter = letter;
                    btn.innerHTML = `<span class="choice-letter">${letter}</span><span class="choice-text">${cleanText}</span>`;
                    btn.onclick = () => this.handleChoiceClick(player, letter, btn);
                    choicesContainer.appendChild(btn);
                });

                this.renderMath(choicesContainer);
            }
        } else {
            const answerBox = document.querySelector(`.${player}-player .answer-box`);
            if (answerBox) answerBox.textContent = '';
        }

        // Phát sóng câu hỏi mới tới điện thoại của đội tương ứng
        if (this.remoteSyncHost) {
            this.remoteSyncHost.broadcastQuestionUpdate(player);
        }
    }

    // CƠ CHẾ KHÓA LƯỢT: ĐỘI NÀY TRẢ LỜI THÌ ĐỘI KIA MỜ ĐI VÀ BỊ KHÓA
    applyTurnLock(activePlayer) {
        this.activeAnsweringPlayer = activePlayer;
        const otherPlayer = (activePlayer === 'left') ? 'right' : 'left';

        const activeSection = document.querySelector(`.${activePlayer}-player`);
        const otherSection = document.querySelector(`.${otherPlayer}-player`);

        // Đội đang trả lời: viền vàng nổi bật
        if (activeSection) {
            activeSection.classList.add('active-turn');
            activeSection.classList.remove('locked');
            const oldShield = activeSection.querySelector('.turn-lock-shield');
            if (oldShield) oldShield.remove();
        }

        // Đội bị khóa: mờ tối hoàn toàn + phủ lớp chắn chống gian lận
        if (otherSection) {
            otherSection.classList.add('locked');
            otherSection.classList.remove('active-turn');

            if (!otherSection.querySelector('.turn-lock-shield')) {
                const shield = document.createElement('div');
                shield.className = 'turn-lock-shield';
                shield.innerHTML = `
                    <div class="turn-lock-content">
                        <div class="turn-lock-icon">🔒</div>
                        <h4 class="turn-lock-title">ĐỐI THỦ ĐANG TRẢ LỜI!</h4>
                        <p class="turn-lock-subtitle">Câu hỏi đang tạm ẩn để chống gian lận.<br>Vui lòng chờ lượt kế tiếp...</p>
                    </div>
                `;
                otherSection.appendChild(shield);
            }
        }
    }

    clearTurnLock() {
        this.activeAnsweringPlayer = null;
        if (this.keypadLockTimer) {
            clearTimeout(this.keypadLockTimer);
            this.keypadLockTimer = null;
        }
        document.querySelectorAll('.player-section').forEach(sec => {
            sec.classList.remove('locked');
            sec.classList.remove('active-turn');
            const shield = sec.querySelector('.turn-lock-shield');
            if (shield) shield.remove();
            const badge = sec.querySelector('.turn-lock-badge');
            if (badge) badge.remove();
        });
    }

    // Xử lý khi bấm nút trắc nghiệm A, B, C, D
    
    // Hiển thị modal gợi ý / hướng dẫn giải khi trả lời sai
    showQuestionHint(player, q) {
        const modal = document.getElementById('hintModal');
        if (!modal) return;
        const titleEl = document.getElementById('hintModalTitle');
        const qEl = document.getElementById('hintModalQuestion');
        const contentEl = document.getElementById('hintModalContent');
        
        const teamName = (player === 'left') ? 'ĐỘI XANH' : 'ĐỘI ĐỎ';
        if (titleEl) {
            titleEl.textContent = `💡 GỢI Ý / HƯỚNG DẪN GIẢI (${teamName})`;
        }
        if (qEl) {
            const rawQ = q.question || 'Câu hỏi';
            qEl.innerHTML = `<div style="font-weight:700; margin-bottom:4px; color:#0369a1;">📌 Câu hỏi:</div><div>${rawQ}</div>`;
            this.preprocessLatexNodes(qEl);
            if (typeof renderMathInElement !== 'undefined') {
                try {
                    renderMathInElement(qEl, {
                        delimiters: [
                            { left: "$", right: "$", display: true },
                            { left: "$", right: "$", display: false }
                        ],
                        throwOnError: false
                    });
                } catch(e) {}
            }
        }
        if (contentEl) {
            const hint = q.explanation || "Hãy đọc kỹ đề bài, kiểm tra lại công thức và các bước tính toán để chọn lại phương án chính xác nhé!";
            contentEl.innerHTML = `<div style="font-weight:700; margin-bottom:6px; color:#b45309;">📝 Hướng dẫn giải chi tiết:</div><div>${hint}</div>`;
            this.preprocessLatexNodes(contentEl);
            if (typeof renderMathInElement !== 'undefined') {
                try {
                    renderMathInElement(contentEl, {
                        delimiters: [
                            { left: "$", right: "$", display: true },
                            { left: "$", right: "$", display: false }
                        ],
                        throwOnError: false
                    });
                } catch(e) {}
            }
        }
        const scrollArea = document.getElementById('hintModalScrollArea');
        if (scrollArea) scrollArea.scrollTop = 0;
        modal.style.display = 'flex';
    }

    closeQuestionHintModal() {
        const modal = document.getElementById('hintModal');
        if (modal) modal.style.display = 'none';
    }

    handleChoiceClick(player, chosenLetter, btnEl) {
        if (this.isGameOver || this.isCountingDown) return;
        
        // Nếu bất kỳ ai đang trong lượt trả lời -> Khóa, không cho bấm tiếp để chống spam/click trùng!
        if (this.activeAnsweringPlayer) {
            return;
        }

        // Kích hoạt khóa lượt: Đội đối thủ lập tức mờ đi hoàn toàn
        this.applyTurnLock(player);
        
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        const currentQ = pState.currentQuestion;
        if (!currentQ) {
            this.clearTurnLock();
            return;
        }
        
        const isCorrect = (chosenLetter.trim().toUpperCase() === currentQ.answer.trim().toUpperCase());
        
        if (isCorrect) {
            btnEl.classList.add('correct');
            window.soundManager.playCorrect();
            
            // Nếu đây là lần trả lời lại sau khi sai:
            if (pState.isRetry) {
                // KHÔNG CỘNG ĐIỂM (không nhảy tiến lên)
                pState.isRetry = false;
                if (this.showToast) {
                    this.showToast(`✅ ${player === 'left' ? 'Đội Xanh' : 'Đội Đỏ'} đã sửa đúng! Tiếp tục câu mới.`, '🎉', 2200);
                }
            } else {
                // Lần đầu trả lời đúng: nhảy tiến lên!
                this.makeRacerHop(player);
            }
            
            setTimeout(() => {
                btnEl.classList.remove('correct');
                if (!this.isGameOver) {
                    this.loadNextQuestion(player);
                }
                this.clearTurnLock();
            }, 600);
        } else {
            btnEl.classList.add('wrong');
            window.soundManager.playWrong();
            this.makeRacerShake(player);
            
            // Đánh dấu học sinh đang trả lời lại câu hỏi này (không cộng điểm khi đúng)
            pState.isRetry = true;
            
            // Hiện bảng gợi ý / hướng dẫn giải chi tiết
            setTimeout(() => {
                this.showQuestionHint(player, currentQ);
            }, 350);
            
            setTimeout(() => {
                btnEl.classList.remove('wrong');
                this.clearTurnLock();
            }, 550);
        }
    }

    // Xử lý phím số trong chế độ Tự luận / Toán
    handleKeypadInput(player, key) {
        if (this.isGameOver || this.isCountingDown) return;
        
        // Khóa nếu đội kia đang trả lời
        if (this.activeAnsweringPlayer && this.activeAnsweringPlayer !== player) {
            return;
        }

        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        const answerBox = document.querySelector(`.${player}-player .answer-box`);
        
        if (key === 'C') {
            pState.inputAnswer = '';
            this.clearTurnLock();
        } else if (key === 'Go') {
            if (this.keypadLockTimer) {
                clearTimeout(this.keypadLockTimer);
                this.keypadLockTimer = null;
            }
            this.submitKeypadAnswer(player);
            return;
        } else {
            // Khi đội bắt đầu nhập số, khóa đội kia
            this.applyTurnLock(player);
            
            // Tự động giải phóng khóa sau 4.5s không bấm phím để tránh trường hợp người chơi bỏ dở
            if (this.keypadLockTimer) clearTimeout(this.keypadLockTimer);
            this.keypadLockTimer = setTimeout(() => {
                this.clearTurnLock();
            }, 4500);
            
            if (key === '-') {
                if (pState.inputAnswer.startsWith('-')) {
                    pState.inputAnswer = pState.inputAnswer.substring(1);
                } else {
                    pState.inputAnswer = '-' + pState.inputAnswer;
                }
            } else if (key === '.') {
                if (!pState.inputAnswer.includes('.')) {
                    pState.inputAnswer += '.';
                }
            } else {
                if (pState.inputAnswer.length < 10) {
                    pState.inputAnswer += key;
                }
            }
        }
        
        if (answerBox) answerBox.textContent = pState.inputAnswer;
    }

    // Kiểm tra câu trả lời tự luận khi nhấn Go
    submitKeypadAnswer(player) {
        if (this.keypadLockTimer) {
            clearTimeout(this.keypadLockTimer);
            this.keypadLockTimer = null;
        }
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        const currentQ = pState.currentQuestion;
        const answerBox = document.querySelector(`.${player}-player .answer-box`);
        if (!currentQ) {
            this.clearTurnLock();
            return;
        }
        
        const userAns = pState.inputAnswer.trim().toLowerCase();
        const correctAns = currentQ.answer.toString().trim().toLowerCase();
        
        const isCorrect = compareShortAnswer(pState.inputAnswer, currentQ.answer);
        
        if (isCorrect) {
            if (answerBox) answerBox.classList.add('correct');
            window.soundManager.playCorrect();
            
            if (pState.isRetry) {
                // KHÔNG CỘNG ĐIỂM
                pState.isRetry = false;
                if (this.showToast) {
                    this.showToast(`✅ ${player === 'left' ? 'Đội Xanh' : 'Đội Đỏ'} đã sửa đúng! Tiếp tục câu mới.`, '🎉', 2200);
                }
            } else {
                this.makeRacerHop(player);
            }
            
            setTimeout(() => {
                if (answerBox) answerBox.classList.remove('correct');
                if (!this.isGameOver) {
                    this.loadNextQuestion(player);
                }
                this.clearTurnLock();
            }, 600);
        } else {
            if (answerBox) answerBox.classList.add('wrong');
            window.soundManager.playWrong();
            this.makeRacerShake(player);
            
            pState.isRetry = true;
            setTimeout(() => {
                this.showQuestionHint(player, currentQ);
            }, 350);
            
            setTimeout(() => {
                if (answerBox) answerBox.classList.remove('wrong');
                this.clearTurnLock();
            }, 550);
        }
    }

    // Vận động viên nhảy tiến lên 1 bước (Parabolic Hop)
    makeRacerHop(player) {
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        pState.racePosition++;
        
        const racerClass = player === 'left' ? '.left-racer' : '.right-racer';
        const racerContainer = document.querySelector(racerClass);
        if (!racerContainer) return;
        
        const standImg = racerContainer.querySelector('.stand');
        const hopImg = racerContainer.querySelector('.hop');
        
        if (standImg) standImg.style.display = 'none';
        if (hopImg) hopImg.style.display = 'block';
        racerContainer.classList.add('hopping');
        
        window.soundManager.playHop();
        
        this.updateRacerPosition(player);
        this.updateScoreDisplay(player);
        
        setTimeout(() => {
            if (hopImg) hopImg.style.display = 'none';
            if (standImg) standImg.style.display = 'block';
            racerContainer.classList.remove('hopping');
            
            racerContainer.style.transform = (player === 'left') ? 'scale(1)' : 'scale(0.88)';
            
            if (pState.racePosition >= this.winningHops && !this.isGameOver) {
                this.handleVictory(player);
            }
        }, 500);
    }

    makeRacerShake(player) {
        const racerClass = player === 'left' ? '.left-racer' : '.right-racer';
        const racerContainer = document.querySelector(racerClass);
        if (!racerContainer) return;
        
        racerContainer.classList.add('shaking');
        setTimeout(() => {
            racerContainer.classList.remove('shaking');
        }, 400);
    }

    updateRacerPosition(player) {
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        const racerClass = player === 'left' ? '.left-racer' : '.right-racer';
        const racerContainer = document.querySelector(racerClass);
        const raceTrack = document.querySelector('.race-track');
        if (!racerContainer || !raceTrack) return;
        
        const trackWidth = raceTrack.offsetWidth || 850;
        
        let startPx, finishPx;
        if (player === 'left') {
            startPx = trackWidth * 0.035;
            finishPx = trackWidth * 0.82;
        } else {
            startPx = trackWidth * 0.065;
            finishPx = trackWidth * 0.78;
        }
        
        const hopDistance = (finishPx - startPx) / this.winningHops;
        const currentPx = startPx + (Math.min(pState.racePosition, this.winningHops) * hopDistance);
        
        racerContainer.style.left = `${currentPx}px`;
    }

    resetRacerPositions() {
        const raceTrack = document.querySelector('.race-track');
        const trackWidth = raceTrack ? raceTrack.offsetWidth : 850;
        
        const leftRacer = document.querySelector('.left-racer');
        const rightRacer = document.querySelector('.right-racer');
        
        if (leftRacer) {
            leftRacer.style.left = `${trackWidth * 0.035}px`;
            leftRacer.style.transform = 'scale(1)';
            leftRacer.classList.remove('hopping', 'shaking');
            const s = leftRacer.querySelector('.stand');
            const h = leftRacer.querySelector('.hop');
            if (s) s.style.display = 'block';
            if (h) h.style.display = 'none';
        }
        
        if (rightRacer) {
            rightRacer.style.left = `${trackWidth * 0.065}px`;
            rightRacer.style.transform = 'scale(0.88)';
            rightRacer.classList.remove('hopping', 'shaking');
            const s = rightRacer.querySelector('.stand');
            const h = rightRacer.querySelector('.hop');
            if (s) s.style.display = 'block';
            if (h) h.style.display = 'none';
        }
    }

    updateScoreDisplay(player) {
        const pState = player === 'left' ? this.leftPlayer : this.rightPlayer;
        const scoreVal = document.querySelector(`.${player}-player .score-value`);
        if (scoreVal) {
            scoreVal.textContent = `${pState.racePosition}/${this.winningHops}`;
        }
    }

    handleVictory(winnerPlayer) {
        this.isGameOver = true;
        this.clearTurnLock();

        const winnerName = (winnerPlayer === 'left') ? 'ĐỘI XANH' : 'ĐỘI ĐỎ';
        const winnerColor = (winnerPlayer === 'left') ? '#1a237e' : '#b71c1c';
        
        // Phát sóng kết quả chiến thắng tới tất cả điện thoại học sinh
        if (this.remoteSyncHost) {
            this.remoteSyncHost.broadcastGameOver(winnerPlayer, winnerName);
        }

        window.soundManager.playVictory();
        this.launchConfetti();
        
        const modal = document.getElementById('winnerModal');
        const titleEl = document.getElementById('winnerTitle');
        const msgEl = document.getElementById('winnerMsg');
        
        if (titleEl) {
            titleEl.textContent = `🎉 ${winnerName} CHIẾN THẮNG! 🎉`;
            titleEl.style.color = winnerColor;
        }
        if (msgEl) {
            msgEl.textContent = `Xuất sắc! ${winnerName} đã hoàn thành ${this.winningHops} bước nhảy và về đích đầu tiên!`;
        }
        
        modal.style.display = 'flex';
    }

    launchConfetti() {
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#fde047'];
        for (let i = 0; i < 90; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
            conf.style.opacity = Math.random() + 0.5;
            conf.style.transform = `scale(${Math.random() * 0.8 + 0.6})`;
            document.body.appendChild(conf);
            
            setTimeout(() => conf.remove(), 4500);
        }
    }

    // Hiển thị danh sách câu hỏi trong bảng chỉnh sửa của GV
    renderQuestionBankEditor() {
        const listContainer = document.getElementById('qEditorList');
        const badge = document.getElementById('qCountBadge');
        if (!listContainer) return;
        
        if (badge) badge.textContent = `${this.questionBank.length} câu hỏi`;
        listContainer.innerHTML = '';
        
        if (this.questionBank.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">Chưa có câu hỏi nào. Hãy dùng AI sinh câu hỏi hoặc tải file lên.</p>';
            return;
        }
        
        this.questionBank.forEach((q, idx) => {
            const item = document.createElement('div');
            item.className = 'q-item';
            
            const isTNKQ = (q.type === 'tnkq');
            let optionsHTML = '';
            
            if (isTNKQ) {
                const opts = q.options && q.options.length ? q.options : ['A.', 'B.', 'C.', 'D.'];
                optionsHTML = `
                    <div class="q-options-grid">
                        ${['A', 'B', 'C', 'D'].map((letter, oIdx) => {
                            const isChecked = (q.answer.toUpperCase() === letter) ? 'checked' : '';
                            const optVal = (opts[oIdx] || '').replace(/^[A-D][\.\)\:\-]\s*/i, '');
                            const safeOptVal = optVal.replace(/"/g, '&quot;');
                            return `
                                <div class="q-opt-row" style="display:flex; flex-direction:column; align-items:flex-start; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; width:100%; gap:6px;">
                                        <input type="radio" name="correct_q_${idx}" value="${letter}" ${isChecked} title="Chọn làm đáp án đúng" onchange="window.gameEngine.updateCorrectAnswer(${idx}, '${letter}')">
                                        <strong>${letter}.</strong>
                                        <input type="text" value="${safeOptVal}" style="flex:1;" onchange="window.gameEngine.updateOptionText(${idx}, ${oIdx}, '${letter}', this.value)">
                                    </div>
                                    ${optVal ? `<div class="opt-preview-box" style="margin-left:28px; margin-top:2px; font-size:0.85rem; color:#1e3a8a; font-weight:600;">Xem: <span>${optVal}</span></div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                const safeAnswer = (q.answer || '').toString().replace(/"/g, '&quot;');
                optionsHTML = `
                    <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                        <span style="font-weight:700; color:#16a34a;">Đáp án chuẩn:</span>
                        <input type="text" class="form-control" style="width:200px; padding:6px 10px;" value="${safeAnswer}" onchange="window.gameEngine.updateCorrectAnswer(${idx}, this.value)">
                    </div>
                `;
            }
            
            const safeQuestion = (q.question || '').replace(/"/g, '&quot;');
            item.innerHTML = `
                <div class="q-item-header">
                    <span class="q-number-title">Câu ${idx + 1} (${isTNKQ ? 'Trắc nghiệm' : 'Tự luận'})</span>
                    <button class="q-delete-btn" onclick="window.gameEngine.deleteQuestion(${idx})">🗑️ Xóa</button>
                </div>
                <input type="text" class="form-control q-edit-input" value="${safeQuestion}" placeholder="Nội dung câu hỏi..." onchange="window.gameEngine.updateQuestionTitle(${idx}, this.value)">
                <div class="q-math-preview" style="font-size:0.95rem; color:#1e3a8a; margin:-4px 0 10px 4px; font-weight:700;">Hiển thị: ${q.question}</div>
                ${optionsHTML}
            `;
            listContainer.appendChild(item);
        });

        // Kích hoạt render KaTeX trên bảng xem trước
        this.renderMath(listContainer);
    }

    updateQuestionTitle(idx, val) {
        if (this.questionBank[idx]) this.questionBank[idx].question = val.trim();
    }

    updateOptionText(qIdx, optIdx, letter, val) {
        if (this.questionBank[qIdx] && this.questionBank[qIdx].options) {
            this.questionBank[qIdx].options[optIdx] = `${letter}. ${val.trim()}`;
        }
    }

    updateCorrectAnswer(qIdx, letterOrVal) {
        if (this.questionBank[qIdx]) this.questionBank[qIdx].answer = letterOrVal.trim();
    }

    deleteQuestion(idx) {
        if (confirm(`Bạn có chắc muốn xóa câu ${idx + 1}?`)) {
            this.questionBank.splice(idx, 1);
            this.renderQuestionBankEditor();
        }
    }

    addNewBlankQuestion() {
        const isTNKQ = (this.questionType === 'tnkq');
        const newQ = {
            id: this.questionBank.length + 1,
            question: "Nội dung câu hỏi mới?",
            type: this.questionType,
            options: isTNKQ ? ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"] : [],
            answer: isTNKQ ? "A" : "10",
            explanation: ""
        };
        this.questionBank.push(newQ);
        this.renderQuestionBankEditor();
    }

    // ===================================================
    // QUẢN LÝ KHO BỘ ĐỀ CỦA GIÁO VIÊN & TÊN ĐĂNG NHẬP
    // ===================================================

    getTeacherName() {
        return localStorage.getItem('teacher_name') || 'Thầy/Cô Giáo';
    }

    setTeacherName(name) {
        const cleanName = name.trim() || 'Thầy/Cô Giáo';
        localStorage.setItem('teacher_name', cleanName);
        const nameEl = document.getElementById('teacherDisplayName');
        if (nameEl) nameEl.textContent = cleanName;
        return cleanName;
    }

    getSavedGames() {
        try {
            return JSON.parse(localStorage.getItem('teacher_saved_games') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Tính mã băm đồng bộ (Sync Hash) để hỗ trợ tích hợp Google Drive sau này
    calculateSyncHash(questions) {
        try {
            const str = JSON.stringify(questions || []);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return `sb_hash_${Math.abs(hash).toString(16)}`;
        } catch (e) {
            return `sb_hash_${Date.now()}`;
        }
    }

    // Hiển thị thông báo Toast nổi trên đầu màn hình
    showToast(message, icon = '🎉', duration = 3200) {
        let toast = document.getElementById('gameToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'gameToast';
            toast.className = 'game-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="font-size:1.4rem;">${icon}</span><span>${message}</span>`;
        toast.classList.add('show');
        if (this._toastTimer) clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // Tạo gói dữ liệu trò chơi chuẩn hóa (Extensible Package - Sẵn sàng cho Google Drive & Google Auth)
    createGamePackage(title, gradeLevel, subject, options = {}) {
        const questionsCopy = JSON.parse(JSON.stringify(this.questionBank || []));
        const nowIso = new Date().toISOString();
        const cleanTitle = (title || options.title || `Trò chơi Nhảy Bao Bố - ${new Date().toLocaleDateString('vi-VN')}`).trim();
        
        return {
            app: "Antigravity Sack Race Game",
            appId: "nhay_bao_bo_game",
            schemaVersion: "2.0.0",
            gameId: options.gameId || `sbgame_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            metadata: {
                title: cleanTitle,
                author: this.getTeacherName(),
                gradeLevel: gradeLevel || options.gradeLevel || 'cap3',
                subject: subject || options.subject || 'Tổng hợp',
                createdAt: options.createdAt || nowIso,
                updatedAt: nowIso,
                totalQuestions: questionsCopy.length,
                tags: ["nhay_bao_bo", "giao_duc", gradeLevel || 'cap3']
            },
            gameConfig: {
                questionType: this.questionType || 'tnkq',
                winningHops: this.winningHops || 10,
                gameMode: this.gameMode || 'mode_class',
                teamCount: this.teamCount || 4,
                timeLimitSeconds: this.timeLimitSeconds || 0,
                soundEnabled: !window.soundManager?.isMuted,
                turnLockAntiCheat: true,
                layout: this.gameMode === 'mode_multiteam_remote' ? 'multi_lane' : 'split_2_players'
            },
            questions: questionsCopy,
            // Cấu trúc chuẩn hóa sẵn sàng đồng bộ Google Drive & tài khoản Google
            cloudSync: {
                provider: "google_drive",
                driveFileId: options.driveFileId || null,
                syncHash: this.calculateSyncHash(questionsCopy),
                lastSyncedAt: null,
                ownerEmail: options.ownerEmail || null,
                isCloudBacked: false,
                googleAuthReady: true
            }
        };
    }

    // Lưu trò chơi ra file dữ liệu (.sbgame) và tải về máy tính
    saveGameToFile(customTitle) {
        if (!this.questionBank || this.questionBank.length === 0) {
            alert('Chưa có câu hỏi nào để lưu. Vui lòng tải đề Word hoặc tạo câu hỏi trước!');
            return;
        }

        let title = customTitle;
        if (!title) {
            const defaultTitle = `Bộ đề ${this.questionBank.length} câu - ${new Date().toLocaleDateString('vi-VN')}`;
            const input = prompt('Nhập tên cho trò chơi / bộ đề này:', defaultTitle);
            if (input === null) return;
            title = input.trim() || defaultTitle;
        }

        const grade = document.querySelector('input[name="gradeLevel"]:checked')?.value || 'cap3';
        const topic = document.getElementById('aiTopic')?.value || 'Tổng hợp';
        const gamePkg = this.createGamePackage(title, grade, topic);

        // 1. Lưu vào kho bộ đề local (localStorage)
        const savedList = this.getSavedGames();
        savedList.unshift({
            id: Date.now(),
            title: gamePkg.metadata.title,
            gradeLevel: gamePkg.metadata.gradeLevel,
            subject: gamePkg.metadata.subject,
            questionCount: gamePkg.questions.length,
            type: gamePkg.gameConfig.questionType,
            questions: gamePkg.questions,
            package: gamePkg,
            createdAt: new Date().toLocaleString('vi-VN')
        });
        localStorage.setItem('teacher_saved_games', JSON.stringify(savedList));
        this.renderSavedGamesLibrary();

        // 2. Tải xuống file .sbgame về máy tính
        const jsonStr = JSON.stringify(gamePkg, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeFileName = title.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_');
        link.download = `${safeFileName}.sbgame`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast(`💾 Đã lưu trò chơi "${title}" và tải file .sbgame thành công!`, '💾', 3500);
    }

    // Tương thích ngược: Lưu từ nút bấm cũ
    saveCurrentGame(title, gradeLevel, subject) {
        return this.saveGameToFile(title);
    }

    // Tải file backup JSON về máy
    downloadBackupJSON(gameData) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        const safeName = (gameData.title || 'de_thi').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_');
        dlAnchor.setAttribute("download", `${safeName}.sbgame`);
        dlAnchor.click();
    }

    // Nạp bộ đề từ kho vào chơi ngay
    loadGameFromLibrary(gameId, directPlay = false) {
        const savedList = this.getSavedGames();
        const game = savedList.find(g => g.id === gameId);
        if (!game) return;

        this.setQuestionBank(game.questions, game.type || 'tnkq', Math.min(10, game.questions.length));
        
        if (directPlay) {
            this.startNewGame();
            this.showToast(`🚀 Đã nạp "${game.title}" (${game.questions.length} câu) và sẵn sàng thi đấu!`, '🎉');
        } else {
            if (window.switchTab) {
                const editorTabBtn = document.querySelectorAll('.tab-btn')[1];
                window.switchTab('editorTab', editorTabBtn);
            }
            this.showToast(`✅ Đã nạp thành công bộ đề "${game.title}" (${game.questions.length} câu)!`, '✅');
        }
    }

    // Xóa bộ đề khỏi kho
    deleteGameFromLibrary(gameId) {
        if (!confirm('Bạn có chắc muốn xóa bộ đề này khỏi kho?')) return;
        let savedList = this.getSavedGames();
        savedList = savedList.filter(g => g.id !== gameId);
        localStorage.setItem('teacher_saved_games', JSON.stringify(savedList));
        this.renderSavedGamesLibrary();
    }

    // Nạp gói trò chơi từ file .sbgame hoặc .json
    loadGamePackage(pkgData, directPlay = true) {
        if (!pkgData) throw new Error('Dữ liệu gói trò chơi rỗng.');

        let questions = [];
        let title = 'Bộ đề đã lưu';
        let type = 'tnkq';
        let hops = 10;
        let gradeLevel = 'cap3';
        let subject = 'Tổng hợp';

        if (pkgData.schemaVersion && pkgData.questions) {
            questions = pkgData.questions;
            title = pkgData.metadata?.title || title;
            type = pkgData.gameConfig?.questionType || type;
            hops = pkgData.gameConfig?.winningHops || hops;
            gradeLevel = pkgData.metadata?.gradeLevel || gradeLevel;
            subject = pkgData.metadata?.subject || subject;
            if (pkgData.gameConfig?.gameMode) {
                this.setGameMode(pkgData.gameConfig.gameMode);
            }
            if (pkgData.gameConfig?.teamCount) {
                this.setTeamCount(pkgData.gameConfig.teamCount);
            }
            if (typeof pkgData.gameConfig?.timeLimitSeconds !== 'undefined') {
                this.setTimeLimit(pkgData.gameConfig.timeLimitSeconds);
            }
        } else if (pkgData.questions && Array.isArray(pkgData.questions)) {
            questions = pkgData.questions;
            title = pkgData.title || title;
            type = pkgData.type || type;
            hops = pkgData.winningHops || pkgData.hops || Math.min(10, questions.length);
            gradeLevel = pkgData.gradeLevel || gradeLevel;
            subject = pkgData.subject || subject;
        } else if (Array.isArray(pkgData)) {
            questions = pkgData;
            hops = Math.min(10, questions.length);
        }

        if (!questions || questions.length === 0) {
            throw new Error('File không chứa danh sách câu hỏi hợp lệ.');
        }

        // Cập nhật ngân hàng câu hỏi
        this.setQuestionBank(questions, type, hops);

        // Đồng bộ form control giao diện
        const hopsEl = document.getElementById('hopsSetting');
        if (hopsEl) {
            let opt = hopsEl.querySelector(`option[value="${hops}"]`);
            if (!opt) {
                opt = document.createElement('option');
                opt.value = hops;
                opt.textContent = `${hops} bước`;
                hopsEl.appendChild(opt);
            }
            hopsEl.value = hops;
        }

        const fileQTypeRadio = document.querySelector(`input[name="fileQType"][value="${type}"]`);
        if (fileQTypeRadio) fileQTypeRadio.checked = true;

        // Lưu vào kho nếu chưa có
        const savedList = this.getSavedGames();
        const existingIdx = savedList.findIndex(g => g.title === title && g.questionCount === questions.length);
        if (existingIdx === -1) {
            savedList.unshift({
                id: Date.now(),
                title: title,
                gradeLevel: gradeLevel,
                subject: subject,
                questionCount: questions.length,
                type: type,
                questions: questions,
                createdAt: new Date().toLocaleString('vi-VN')
            });
            localStorage.setItem('teacher_saved_games', JSON.stringify(savedList));
            this.renderSavedGamesLibrary();
        }

        if (directPlay) {
            this.startNewGame();
            this.showToast(`🚀 Đã khôi phục "${title}" (${questions.length} câu) thành công!`, '🎉', 3500);
        } else {
            this.showToast(`✅ Đã nạp thành công bộ đề "${title}" (${questions.length} câu)!`, '✅', 3000);
        }
    }

    // Nhập file backup .sbgame hoặc .json từ máy tính vào trò chơi
    importGameFromJSONFile(file, directPlay = true) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadGamePackage(data, directPlay);
            } catch (err) {
                alert('Lỗi khi đọc file trò chơi (.sbgame / .json): ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // Chơi lại với lớp mới: Xóa toàn bộ điểm số và tiến trình nhưng giữ nguyên 100% câu hỏi, đưa học sinh về phòng chờ
    replayWithNewClass(promptConfirm = false) {
        if (!this.questionBank || this.questionBank.length === 0) {
            alert('Chưa có câu hỏi nào trong trò chơi. Vui lòng thiết lập hoặc mở đề trước!');
            return;
        }

        if (promptConfirm && !this.isGameOver) {
            if (!confirm('Thầy/Cô có muốn đặt lại đường đua cho lớp mới không?\n\nĐiểm số sẽ về 0 và học sinh trên điện thoại sẽ quay về phòng chờ cho đến khi Thầy/Cô bấm Bắt đầu.')) {
                return;
            }
        }

        // Đặt lại trạng thái chưa bắt đầu
        this.isGameStarted = false;
        this.isGameOver = false;
        this.activeAnsweringPlayer = null;
        this.clearTurnLock();
        this.stopTimer();

        // Reset điểm số các đội
        this.teams.forEach((t, idx) => {
            t.racePosition = 0;
            t.qIndex = idx;
            t.finishedRank = null;
            t.finishTime = null;
            t.inputAnswer = '';
            if (this.questionBank.length > 0) {
                t.currentQuestion = this.questionBank[idx % this.questionBank.length];
            }
        });

        // Reset vị trí hiển thị
        this.resetRacerPositions();
        this.updateScoreDisplay('left');
        this.updateScoreDisplay('right');

        // Đóng các modal kết quả
        const winnerModal = document.getElementById('winnerModal');
        if (winnerModal) winnerModal.style.display = 'none';
        const podiumModal = document.getElementById('multiTeamLeaderboardModal');
        if (podiumModal) podiumModal.style.display = 'none';

        if (this.gameMode === 'mode_multiteam_remote') {
            this.renderMultiLaneTrack();
            this.updateLiveLeaderboard();
        }

        // Phát sóng đặt lại tới tất cả điện thoại để học sinh quay về phòng chờ
        if (this.remoteSyncHost) {
            this.remoteSyncHost.broadcastReset();
            this.remoteSyncHost.broadcastFullState();
        }

        // Hiển thị thông báo Toast
        this.showToast('👥 Đã đặt lại đường đua cho lớp mới! Học sinh đang ở phòng chờ, sẵn sàng khi Thầy/Cô bấm Bắt đầu.', '👥', 3500);

        if (typeof openQRModalByCurrentMode === 'function') {
            openQRModalByCurrentMode();
        }
    }

    // Render danh sách các bộ đề trong kho
    renderSavedGamesLibrary() {
        const container = document.getElementById('savedGamesList');
        if (!container) return;

        const list = this.getSavedGames();
        container.innerHTML = '';

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:35px 20px; color:#64748b;">
                    <div style="font-size:2.5rem; margin-bottom:8px;">📚</div>
                    <p style="font-weight:700; font-size:1.05rem;">Chưa có bộ đề nào trong kho của bạn.</p>
                    <p style="font-size:0.88rem;">Sau khi tạo hoặc tải đề, hãy nhấn <strong>"💾 Lưu Bộ Đề Này"</strong> để lưu lại dùng nhiều lần!</p>
                </div>
            `;
            return;
        }

        list.forEach(item => {
            const gradeName = (item.gradeLevel === 'cap1') ? 'Cấp 1' : (item.gradeLevel === 'cap2') ? 'Cấp 2' : 'Cấp 3';
            const card = document.createElement('div');
            card.className = 'saved-game-card';
            card.innerHTML = `
                <div class="saved-game-info">
                    <h4>${item.title}</h4>
                    <div class="saved-game-tags">
                        <span class="tag-badge grade">${gradeName}</span>
                        <span class="tag-badge">${item.subject || 'Đa môn'}</span>
                        <span class="tag-badge count">${item.questionCount || (item.questions ? item.questions.length : 0)} câu</span>
                        <span class="tag-badge" style="background:#f8fafc; color:#94a3b8;">📅 ${item.createdAt || ''}</span>
                    </div>
                </div>
                <div class="saved-game-actions">
                    <button type="button" class="btn-primary btn-success" style="padding:8px 14px; font-size:0.9rem;" onclick="window.gameEngine.loadGameFromLibrary(${item.id}, true)">
                        🚀 Chơi
                    </button>
                    <button type="button" class="btn-secondary" style="padding:8px 12px; font-size:0.9rem;" onclick="window.gameEngine.loadGameFromLibrary(${item.id}, false)">
                        ✏️ Sửa
                    </button>
                    <button type="button" class="btn-secondary" style="padding:8px 10px; font-size:0.9rem;" title="Tải file .json về máy" onclick="window.gameEngine.downloadBackupJSON(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        💾
                    </button>
                    <button type="button" class="q-delete-btn" style="padding:8px 10px;" title="Xóa" onclick="window.gameEngine.deleteGameFromLibrary(${item.id})">
                        🗑️
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Modal phóng to ảnh minh họa khi bấm vào
    showImageModal(src) {
        if (!src) return;
        let modal = document.getElementById('imageZoomModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'imageZoomModal';
            modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px;backdrop-filter:blur(8px);';
            modal.innerHTML = `
                <div style="position:relative; max-width:92vw; max-height:92vh; display:flex; flex-direction:column; align-items:center;">
                    <img id="imageZoomImg" style="max-width:90vw; max-height:85vh; border-radius:12px; box-shadow:0 16px 40px rgba(0,0,0,0.6); background:#ffffff; padding:12px; object-fit:contain;" src="">
                    <span style="color:#ffffff; font-size:0.95rem; font-weight:700; margin-top:10px; background:rgba(0,0,0,0.6); padding:4px 14px; border-radius:20px;">Bấm ra ngoài để đóng</span>
                </div>
            `;
            modal.onclick = () => { modal.style.display = 'none'; };
            document.body.appendChild(modal);
        }
        const img = document.getElementById('imageZoomImg');
        if (img) img.src = src;
        modal.style.display = 'flex';
    }
}

const gameEngine = new SackRaceGame();
window.gameEngine = gameEngine;

// Đảm bảo responsive tọa độ khi resize trình duyệt
window.addEventListener('resize', () => {
    if (window.gameEngine) {
        window.gameEngine.updateRacerPosition('left');
        window.gameEngine.updateRacerPosition('right');
    }
});
