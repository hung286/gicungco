/**
 * REMOTE SYNC MODULE - TRÒ CHƠI NHẢY BAO BỐ
 * Kết nối thời gian thực giữa Màn hình Giáo viên (Big Screen) và Điện thoại Học sinh (Mobile Controllers)
 * Sử dụng Secure WebSockets MQTT Broker công cộng không cần cài đặt server riêng.
 */

(function (window) {
    'use strict';

    // Danh sách Broker MQTT WSS công cộng tốc độ cao, hoàn toàn miễn phí
    const MQTT_BROKERS = [
        { host: 'broker.emqx.io', port: 8084, path: '/mqtt', ssl: true, name: 'EMQX Cloud' },
        { host: 'broker.hivemq.com', port: 8884, path: '/mqtt', ssl: true, name: 'HiveMQ Public' }
    ];

    // =========================================================================
    // 1. HOST MANAGER (DÀNH CHO MÀN HÌNH CHÍNH / GIÁO VIÊN)
    // =========================================================================
    class RemoteSyncHost {
        constructor() {
            this.gameEngine = null;
            this.roomPin = this.loadOrGenerateRoomPin();
            this.client = null;
            this.brokerIndex = 0;
            this.isConnected = false;
            // Hỗ trợ lưu trữ người chơi cho 2 đội (left/right) và đa đội (team_1 -> team_6)
            this.players = {
                left: new Map(),
                right: new Map(),
                team_1: new Map(),
                team_2: new Map(),
                team_3: new Map(),
                team_4: new Map(),
                team_5: new Map(),
                team_6: new Map()
            };
            this.onPlayerListChange = null;
            this.customDeployUrl = localStorage.getItem('sb_custom_deploy_url') || '';
            this.lanIp = '';
            try {
                fetch('/api/server-info')
                    .then(r => r.json())
                    .then(data => {
                        if (data && (data.lanIp || data.ip)) {
                            this.lanIp = data.lanIp || data.ip;
                            console.log('✅ [RemoteSync] Sẵn sàng LAN IP:', this.lanIp);
                        }
                    }).catch(() => {});
            } catch(e) {}
        }

        // Tạo mã PIN phòng 4 chữ số (ví dụ: 6824)
        loadOrGenerateRoomPin() {
            let pin = sessionStorage.getItem('sb_room_pin');
            if (!pin) {
                pin = Math.floor(1000 + Math.random() * 9000).toString();
                sessionStorage.setItem('sb_room_pin', pin);
            }
            return pin;
        }

        generateNewRoomPin() {
            this.roomPin = Math.floor(1000 + Math.random() * 9000).toString();
            sessionStorage.setItem('sb_room_pin', this.roomPin);
            for (let k in this.players) {
                if (this.players[k]) this.players[k].clear();
            }
            if (this.isConnected) {
                this.disconnect();
                this.connect();
            }
            return this.roomPin;
        }

        init(gameEngine) {
            this.gameEngine = gameEngine;
            this.updatePlayerCountUI();
            this.connect();
        }

        // Kết nối MQTT Broker
        connect() {
            if (typeof Paho === 'undefined' || !Paho.MQTT) {
                console.warn('Paho MQTT chưa được nạp. Đang chờ thư viện...');
                setTimeout(() => this.connect(), 1000);
                return;
            }

            const broker = MQTT_BROKERS[this.brokerIndex % MQTT_BROKERS.length];
            const clientId = `sb_host_${this.roomPin}_${Date.now().toString(36)}`;

            try {
                this.client = new Paho.MQTT.Client(broker.host, broker.port, broker.path, clientId);

                this.client.onConnectionLost = (responseObject) => {
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    if (responseObject.errorCode !== 0) {
                        console.warn('MQTT Mất kết nối:', responseObject.errorMessage);
                        setTimeout(() => {
                            this.brokerIndex++;
                            this.connect();
                        }, 2500);
                    }
                };

                this.client.onMessageArrived = (message) => {
                    this.handleIncomingMessage(message.destinationName, message.payloadString);
                };

                const options = {
                    useSSL: broker.ssl,
                    timeout: 6,
                    keepAliveInterval: 30,
                    cleanSession: true,
                    onSuccess: () => {
                        this.isConnected = true;
                        this.updateConnectionStatus(true);
                        this.updatePlayerCountUI();
                        console.log(`✅ [Host] Đã kết nối Broker MQTT (${broker.name}) - Phòng PIN: ${this.roomPin}`);
                        
                        // Lắng nghe tin nhắn từ điện thoại học sinh
                        const playerTopic = `nhaybaobo/v1/${this.roomPin}/player`;
                        this.client.subscribe(playerTopic, { qos: 1 });

                        // Đồng bộ trạng thái hiện tại
                        this.broadcastFullState();
                    },
                    onFailure: (err) => {
                        console.warn(`Không thể kết nối ${broker.name}:`, err.errorMessage || err);
                        this.brokerIndex++;
                        setTimeout(() => this.connect(), 2000);
                    }
                };

                this.client.connect(options);
            } catch (err) {
                console.error('Lỗi khởi tạo MQTT Client:', err);
            }
        }

        disconnect() {
            if (this.client && this.client.isConnected()) {
                try {
                    this.client.disconnect();
                } catch (e) {}
            }
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }

        // Xử lý tin nhắn gửi từ điện thoại của học sinh
        handleIncomingMessage(topic, payloadStr) {
            try {
                const data = JSON.parse(payloadStr);
                if (!data || !data.type) return;

                switch (data.type) {
                    case 'JOIN':
                        this.handlePlayerJoin(data);
                        break;
                    case 'SUBMIT_ANSWER':
                        this.handlePlayerAnswer(data);
                        break;
                    case 'PING':
                        break;
                }
            } catch (err) {
                console.warn('Lỗi phân tích tin nhắn từ Player:', err);
            }
        }

        // Chuẩn hóa mã đội (hỗ trợ cả left/right và team_1 -> team_6)
        normalizeTeamId(teamRaw) {
            if (!teamRaw) return 'team_1';
            const t = teamRaw.toString().trim().toLowerCase();
            if (t === 'left' || t === 'team_1' || t === '1') return 'team_1';
            if (t === 'right' || t === 'team_2' || t === '2') return 'team_2';
            if (t === 'team_3' || t === '3') return 'team_3';
            if (t === 'team_4' || t === '4') return 'team_4';
            if (t === 'team_5' || t === '5') return 'team_5';
            if (t === 'team_6' || t === '6') return 'team_6';
            return t;
        }

        // Học sinh vào phòng và chọn đội
        handlePlayerJoin(data) {
            const rawTeam = data.team || 'team_1';
            const teamId = this.normalizeTeamId(rawTeam);
            const playerId = data.playerId || `p_${Date.now()}`;
            const studentName = (data.studentName || 'Học sinh').trim();
            const customTeamName = (data.teamName || studentName).trim();

            if (!this.players[teamId]) {
                this.players[teamId] = new Map();
            }

            // Xóa người chơi khỏi các đội khác nếu đổi đội
            for (let k in this.players) {
                if (k !== teamId && this.players[k]) {
                    this.players[k].delete(playerId);
                }
            }

            // Cập nhật tên đội trong GameEngine nếu người chơi nhập tên tùy chỉnh
            if (this.gameEngine && this.gameEngine.setTeamName && customTeamName) {
                this.gameEngine.setTeamName(teamId, customTeamName);
            }

            // Thêm người chơi vào đội
            this.players[teamId].set(playerId, {
                id: playerId,
                name: studentName,
                teamName: customTeamName,
                team: teamId,
                joinedAt: Date.now()
            });

            // Đồng bộ sang alias left/right cho Mode 1 & 2
            if (teamId === 'team_1') this.players.left = this.players[teamId];
            if (teamId === 'team_2') this.players.right = this.players[teamId];

            this.updatePlayerCountUI();

            // Gửi tin xác nhận và đồng bộ trạng thái riêng cho học sinh vừa vào
            this.sendToTopic(`nhaybaobo/v1/${this.roomPin}/player/${playerId}`, {
                type: 'JOIN_SUCCESS',
                roomPin: this.roomPin,
                team: teamId,
                teamName: customTeamName,
                studentName: studentName,
                gameMode: this.gameEngine?.gameMode || 'mode_multiteam_remote',
                gameState: this.getCurrentGameState(teamId)
            });

            // Hiển thị toast thông báo trên màn hình lớn
            const teamObj = this.gameEngine?.getTeamById ? this.gameEngine.getTeamById(teamId) : null;
            const displayTeamName = teamObj ? `${teamObj.icon} ${teamObj.name}` : customTeamName;
            if (this.gameEngine && this.gameEngine.showToast) {
                this.gameEngine.showToast(`📱 "${studentName}" gia nhập ${displayTeamName}!`, '👋', 2500);
            }
        }

        // Học sinh bấm đáp án trên điện thoại
        handlePlayerAnswer(data) {
            if (!this.gameEngine) return;
            const rawTeam = data.team || 'team_1';
            const teamId = this.normalizeTeamId(rawTeam);
            const answer = (data.answer || '').toString().trim();
            const studentName = data.studentName || 'Một bạn';
            const playerId = data.playerId;

            // Xử lý câu trả lời qua hàm tập trung của GameEngine
            if (this.gameEngine.handleTeamAnswer) {
                this.gameEngine.handleTeamAnswer(teamId, answer, studentName, playerId);
            } else {
                // Fallback nếu chạy phiên bản cũ
                const pState = (teamId === 'team_2' || teamId === 'right') ? this.gameEngine.rightPlayer : this.gameEngine.leftPlayer;
                const currentQ = pState ? pState.currentQuestion : null;
                if (!currentQ || this.gameEngine.isGameOver) return;
                const isCorrect = (answer.toUpperCase() === currentQ.answer.toString().trim().toUpperCase());
                if (playerId) {
                    this.sendToTopic(`nhaybaobo/v1/${this.roomPin}/player/${playerId}`, {
                        type: 'ANSWER_RESULT',
                        isCorrect: isCorrect,
                        answer: answer,
                        correctAnswer: currentQ.answer,
                        newScore: pState.racePosition + (isCorrect ? 1 : 0),
                        winningHops: this.gameEngine.winningHops
                    });
                }
            }
        }

        // Lấy trạng thái câu hỏi & điểm hiện tại của một đội
        getCurrentGameState(teamInput) {
            if (!this.gameEngine) return null;
            const teamId = this.normalizeTeamId(teamInput);
            const team = this.gameEngine.getTeamById ? this.gameEngine.getTeamById(teamId) : (teamId === 'team_2' ? this.gameEngine.rightPlayer : this.gameEngine.leftPlayer);
            const currentQ = team ? team.currentQuestion : null;
            const isStarted = true; // Luôn sẵn sàng đồng bộ để điện thoại thấy được câu hỏi giáo viên đang mở

            const isShortAns = currentQ && (!currentQ.options || currentQ.options.length < 2 || ['tuluan', 'tln', 'sa', 'short', 'short_answer', 'dien_so'].includes(String(currentQ.type||'').toLowerCase()));
            const qType = isShortAns ? 'tuluan' : 'tnkq';

            return {
                isGameStarted: isStarted,
                isGameOver: !!this.gameEngine.isGameOver,
                isCountingDown: !!this.gameEngine.isCountingDown,
                winningHops: this.gameEngine.winningHops || 10,
                score: team ? team.racePosition : 0,
                teamId: teamId,
                teamName: team?.name || 'Đội',
                rank: team?.rank || 1,
                questionType: qType,
                // Luôn nạp câu hỏi cho điện thoại ngay khi đã có câu hỏi trên màn hình giáo viên
                currentQuestion: currentQ ? {
                    id: currentQ.id,
                    question: currentQ.question,
                    type: qType,
                    options: currentQ.options || []
                } : null
            };
        }

        // Lấy danh sách trạng thái của toàn bộ các đội (Cho Mode 3)
        getAllTeamsGameState() {
            if (!this.gameEngine || !this.gameEngine.teams) return {};
            const res = {};
            this.gameEngine.teams.forEach(t => {
                res[t.id] = this.getCurrentGameState(t.id);
            });
            return res;
        }

        // Phát sóng toàn bộ trạng thái tới tất cả điện thoại
        broadcastFullState() {
            if (!this.isConnected) return;
            const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
            this.sendToTopic(hostTopic, {
                type: 'SYNC_FULL_STATE',
                roomPin: this.roomPin,
                isGameStarted: !!this.gameEngine?.isGameStarted,
                gameMode: this.gameEngine?.gameMode || 'mode_multiteam_remote',
                teamCount: this.gameEngine?.teamCount || 4,
                winningHops: this.gameEngine?.winningHops || 10,
                leftState: this.getCurrentGameState('team_1'),
                rightState: this.getCurrentGameState('team_2'),
                multiTeamsState: this.getAllTeamsGameState(),
                isGameOver: this.gameEngine?.isGameOver || false
            });
        }

        // Phát sóng khi giáo viên bấm BẮT ĐẦU trận đấu
        broadcastGameStart() {
            if (!this.isConnected) return;
            const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
            this.sendToTopic(hostTopic, {
                type: 'GAME_START',
                roomPin: this.roomPin,
                isGameStarted: true,
                gameMode: this.gameEngine?.gameMode || 'mode_multiteam_remote',
                teamCount: this.gameEngine?.teamCount || 4,
                winningHops: this.gameEngine?.winningHops || 10,
                leftState: this.getCurrentGameState('team_1'),
                rightState: this.getCurrentGameState('team_2'),
                multiTeamsState: this.getAllTeamsGameState()
            });
        }

        // Phát sóng câu hỏi mới cho một đội khi vừa nhảy xong
        broadcastQuestionUpdate(teamInput) {
            if (!this.isConnected || !this.gameEngine) return;
            const teamId = this.normalizeTeamId(teamInput);
            const team = this.gameEngine.getTeamById ? this.gameEngine.getTeamById(teamId) : (teamId === 'team_2' ? this.gameEngine.rightPlayer : this.gameEngine.leftPlayer);
            const currentQ = team ? team.currentQuestion : null;
            if (!currentQ) return;

            const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
            this.sendToTopic(hostTopic, {
                type: 'QUESTION_UPDATE',
                team: teamId,
                isGameStarted: !!this.gameEngine.isGameStarted,
                score: team.racePosition,
                teamName: team.name,
                rank: team.rank || 1,
                winningHops: this.gameEngine.winningHops,
                question: {
                    id: currentQ.id,
                    question: currentQ.question,
                    type: (currentQ && (!currentQ.options || currentQ.options.length < 2 || ['tuluan', 'tln', 'sa', 'short', 'short_answer', 'dien_so'].includes(String(currentQ.type||'').toLowerCase()))) ? 'tuluan' : 'tnkq',
                    options: currentQ.options || []
                }
            });
        }

        // Phát sóng chiến thắng / Bảng xếp hạng kết thúc vòng đua
        broadcastGameOver(winnerPlayer, winnerName, podiumList = []) {
            if (!this.isConnected) return;
            const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
            this.sendToTopic(hostTopic, {
                type: 'GAME_OVER',
                winner: winnerPlayer,
                winnerName: winnerName,
                podium: podiumList,
                gameMode: this.gameEngine?.gameMode || 'mode_multiteam_remote'
            });
        }

        // Phát sóng đặt lại ván đấu (học sinh quay về phòng chờ)
        broadcastReset() {
            if (!this.isConnected) return;
            const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
            this.sendToTopic(hostTopic, {
                type: 'GAME_RESET',
                isGameStarted: false,
                winningHops: this.gameEngine?.winningHops || 10,
                gameMode: this.gameEngine?.gameMode || 'mode_multiteam_remote',
                multiTeamsState: this.getAllTeamsGameState()
            });
        }

        sendToTopic(topic, dataObj) {
            if (!this.client || !this.isConnected) return;
            try {
                const message = new Paho.MQTT.Message(JSON.stringify(dataObj));
                message.destinationName = topic;
                message.qos = 1;
                this.client.send(message);
            } catch (err) {
                console.warn('Lỗi gửi MQTT:', err);
            }
        }

        // Cập nhật số lượng người chơi hiển thị trên thanh trạng thái (Tối ưu cho cả 2 máy và đa đội 2 - 6 đội)
        updatePlayerCountUI() {
            const statusPinEl = document.getElementById('statusRoomPin');
            if (statusPinEl) statusPinEl.textContent = this.roomPin;

            // Cập nhật Mode 2
            const bluePlayerArr = Array.from(this.players.team_1?.values() || this.players.left?.values() || []);
            const redPlayerArr = Array.from(this.players.team_2?.values() || this.players.right?.values() || []);
            const blueLastPlayer = bluePlayerArr.length ? bluePlayerArr[bluePlayerArr.length - 1] : null;
            const redLastPlayer = redPlayerArr.length ? redPlayerArr[redPlayerArr.length - 1] : null;

            const blueEl = document.getElementById('bluePlayerCount');
            const redEl = document.getElementById('redPlayerCount');
            if (blueEl) {
                blueEl.textContent = bluePlayerArr.length > 0 ? (blueLastPlayer ? `📱 ${blueLastPlayer.teamName || blueLastPlayer.name}` : '1 máy') : 'Chờ máy';
            }
            if (redEl) {
                redEl.textContent = redPlayerArr.length > 0 ? (redLastPlayer ? `📱 ${redLastPlayer.teamName || redLastPlayer.name}` : '1 máy') : 'Chờ máy';
            }

            const statusBlueEl = document.getElementById('qrStatusBlue');
            const statusRedEl = document.getElementById('qrStatusRed');
            if (statusBlueEl) {
                if (bluePlayerArr.length > 0) {
                    statusBlueEl.className = 'team-qr-status connected';
                    statusBlueEl.innerHTML = `🟢 Đã kết nối: <strong>${blueLastPlayer?.teamName || blueLastPlayer?.name || 'Máy Đội Xanh'}</strong>`;
                } else {
                    statusBlueEl.className = 'team-qr-status waiting';
                    statusBlueEl.innerHTML = `⚪ Đang chờ máy Đội Xanh quét...`;
                }
            }
            if (statusRedEl) {
                if (redPlayerArr.length > 0) {
                    statusRedEl.className = 'team-qr-status connected';
                    statusRedEl.innerHTML = `🟢 Đã kết nối: <strong>${redLastPlayer?.teamName || redLastPlayer?.name || 'Máy Đội Đỏ'}</strong>`;
                } else {
                    statusRedEl.className = 'team-qr-status waiting';
                    statusRedEl.innerHTML = `⚪ Đang chờ máy Đội Đỏ quét...`;
                }
            }

            // Cập nhật Mode 3: Danh sách các đội đã gia nhập trong Modal Mã QR Đa Đội
            const multiTeamsContainer = document.getElementById('joinedTeamsListContainer');
            if (multiTeamsContainer && this.gameEngine && this.gameEngine.teams) {
                multiTeamsContainer.innerHTML = '';
                this.gameEngine.teams.forEach(t => {
                    const teamPlayers = Array.from(this.players[t.id]?.values() || []);
                    const isConnected = teamPlayers.length > 0;
                    const lastP = isConnected ? teamPlayers[teamPlayers.length - 1] : null;
                    const chip = document.createElement('div');
                    chip.className = `joined-team-chip ${isConnected ? 'connected' : 'waiting'}`;
                    chip.style.cssText = `display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:14px; font-weight:800; font-size:0.88rem; background:${isConnected ? t.bg : '#f1f5f9'}; border:1.5px solid ${isConnected ? t.color : '#cbd5e1'}; color:${isConnected ? t.color : '#64748b'};`;
                    chip.innerHTML = `
                        <span>${t.icon}</span>
                        <span><strong>${t.name}</strong></span>
                        <span style="font-size:0.78rem; margin-left:auto;">${isConnected ? `🟢 Đã vào (${lastP?.name || '1 máy'})` : '⚪ Chờ quét...'}</span>
                    `;
                    multiTeamsContainer.appendChild(chip);
                });
            }

            if (typeof this.onPlayerListChange === 'function') {
                this.onPlayerListChange();
            }
        }

        updateConnectionStatus(connected) {
            const dot = document.getElementById('remoteStatusDot');
            const text = document.getElementById('remoteStatusText');
            if (dot) {
                dot.style.background = connected ? '#22c55e' : '#f59e0b';
                dot.classList.toggle('live-pulse', connected);
            }
            if (text) {
                text.textContent = connected ? 'Trực tiếp' : 'Đang kết nối...';
            }
        }

        // Tạo đường link tham gia cho học sinh
        getJoinUrl(team = '', mode = '') {
            let baseUrl = '';

            if (this.customDeployUrl && this.customDeployUrl.trim()) {
                baseUrl = this.customDeployUrl.trim().replace(/\/+$/, '');
            } else if (window.location.protocol.startsWith('http')) {
                let hostPart = window.location.host;
                if (this.lanIp && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                    const port = window.location.port ? `:${window.location.port}` : '';
                    hostPart = `${this.lanIp}${port}`;
                }
                const pathname = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
                baseUrl = `${window.location.protocol}//${hostPart}${pathname}`;
            } else {
                baseUrl = 'https://nhay-bao-bo.netlify.app';
            }

            const currentMode = mode || this.gameEngine?.gameMode || 'mode_multiteam_remote';
            let mobileUrl = `${baseUrl}/mobile.html?room=${this.roomPin}`;
            if (team) mobileUrl += `&team=${team}`;
            if (currentMode) mobileUrl += `&mode=${currentMode}`;
            if (!team && this.gameEngine && this.gameEngine.teamCount) mobileUrl += `&teams=${this.gameEngine.teamCount}`;
            return mobileUrl;
        }

        // Sinh mã QR trực quan vào container DOM
        renderQRCode(containerEl, team = '', size = 220, mode = '') {
            if (!containerEl) return;
            containerEl.innerHTML = '';

            const url = this.getJoinUrl(team, mode);

            let darkColor = '#0f172a';
            if (team === 'left' || team === 'team_1') darkColor = '#1e40af';
            else if (team === 'right' || team === 'team_2') darkColor = '#b91c1c';
            else if (team === 'team_3') darkColor = '#15803d';
            else if (team === 'team_4') darkColor = '#ca8a04';
            else if (team === 'team_5') darkColor = '#7e22ce';
            else if (team === 'team_6') darkColor = '#0e7490';

            // Ưu tiên 1: Thư viện QRCode.js tạo SVG/Canvas offline
            if (typeof QRCode !== 'undefined') {
                try {
                    new QRCode(containerEl, {
                        text: url,
                        width: size,
                        height: size,
                        colorDark: darkColor,
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    return url;
                } catch (e) {
                    console.warn('Lỗi tạo QRCode JS, dùng fallback API:', e);
                }
            }

            // Ưu tiên 2: Fallback qua API tạo QR chuẩn quốc tế
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
            img.alt = `Mã QR phòng ${this.roomPin}`;
            img.style.width = `${size}px`;
            img.style.height = `${size}px`;
            img.style.borderRadius = '12px';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            containerEl.appendChild(img);
            return url;
        }

        setCustomDeployUrl(url) {
            this.customDeployUrl = (url || '').trim();
            localStorage.setItem('sb_custom_deploy_url', this.customDeployUrl);
        }
    }

    // =========================================================================
    // 2. CLIENT CONTROLLER (DÀNH CHO ĐIỆN THOẠI HỌC SINH - MOBILE.HTML)
    // =========================================================================
    class RemoteSyncClient {
        constructor(config = {}) {
            this.roomPin = config.roomPin || '';
            this.team = config.team || 'left';
            this.studentName = config.studentName || 'Học sinh';
            this.teamName = config.teamName || this.studentName;
            this.playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            this.client = null;
            this.brokerIndex = 0;
            this.isConnected = false;

            this.onGameStart = config.onGameStart || null;
            this.onStateSync = config.onStateSync || null;
            this.onQuestionUpdate = config.onQuestionUpdate || null;
            this.onAnswerResult = config.onAnswerResult || null;
            this.onGameOver = config.onGameOver || null;
            this.onGameReset = config.onGameReset || null;
            this.onConnectionStatus = config.onConnectionStatus || null;
        }

        connect() {
            if (typeof Paho === 'undefined' || !Paho.MQTT) {
                console.warn('Paho MQTT chưa nạp. Đợi...');
                setTimeout(() => this.connect(), 1000);
                return;
            }

            const broker = MQTT_BROKERS[this.brokerIndex % MQTT_BROKERS.length];
            const clientId = `sb_m_${this.playerId}`;

            try {
                this.client = new Paho.MQTT.Client(broker.host, broker.port, broker.path, clientId);

                this.client.onConnectionLost = (responseObject) => {
                    this.isConnected = false;
                    if (this.onConnectionStatus) this.onConnectionStatus(false);
                    if (responseObject.errorCode !== 0) {
                        setTimeout(() => {
                            this.brokerIndex++;
                            this.connect();
                        }, 2000);
                    }
                };

                this.client.onMessageArrived = (message) => {
                    this.handleIncomingMessage(message.destinationName, message.payloadString);
                };

                this.client.connect({
                    useSSL: broker.ssl,
                    timeout: 6,
                    keepAliveInterval: 30,
                    cleanSession: true,
                    onSuccess: () => {
                        this.isConnected = true;
                        if (this.onConnectionStatus) this.onConnectionStatus(true);
                        console.log(`✅ [Mobile] Đã kết nối Broker (${broker.name})`);

                        // 1. Đăng ký nhận tin nhắn chung từ Host
                        const hostTopic = `nhaybaobo/v1/${this.roomPin}/host`;
                        this.client.subscribe(hostTopic, { qos: 1 });

                        // 2. Đăng ký nhận tin nhắn riêng gửi cho mình
                        const privateTopic = `nhaybaobo/v1/${this.roomPin}/player/${this.playerId}`;
                        this.client.subscribe(privateTopic, { qos: 1 });

                        // 3. Gửi thông báo gia nhập phòng đấu
                        this.sendJoinRoom();
                    },
                    onFailure: (err) => {
                        if (this.onConnectionStatus) this.onConnectionStatus(false);
                        this.brokerIndex++;
                        setTimeout(() => this.connect(), 2000);
                    }
                });
            } catch (err) {
                console.error('Lỗi kết nối MQTT Client:', err);
            }
        }

        sendJoinRoom() {
            this.sendToHost({
                type: 'JOIN',
                playerId: this.playerId,
                studentName: this.studentName,
                teamName: this.teamName || this.studentName,
                team: this.team
            });
        }

        submitAnswer(answerStr) {
            this.sendToHost({
                type: 'SUBMIT_ANSWER',
                playerId: this.playerId,
                studentName: this.studentName,
                teamName: this.teamName || this.studentName,
                team: this.team,
                answer: answerStr,
                timestamp: Date.now()
            });
        }

        sendToHost(dataObj) {
            if (!this.client || !this.isConnected) return;
            try {
                const topic = `nhaybaobo/v1/${this.roomPin}/player`;
                const message = new Paho.MQTT.Message(JSON.stringify(dataObj));
                message.destinationName = topic;
                message.qos = 1;
                this.client.send(message);
            } catch (e) {
                console.warn('Lỗi gửi câu trả lời lên Host:', e);
            }
        }

        handleIncomingMessage(topic, payloadStr) {
            try {
                const data = JSON.parse(payloadStr);
                if (!data || !data.type) return;

                switch (data.type) {
                    case 'JOIN_SUCCESS':
                        if (this.onStateSync && data.gameState) {
                            this.onStateSync(data.gameState);
                        }
                        break;

                    case 'GAME_START':
                        if (this.onGameStart) {
                            this.onGameStart(data);
                        } else if (this.onStateSync) {
                            let myTeamState = null;
                            if (data.multiTeamsState && data.multiTeamsState[this.team]) {
                                myTeamState = data.multiTeamsState[this.team];
                            } else if (this.team === 'left' || this.team === 'team_1') {
                                myTeamState = data.leftState || (data.multiTeamsState ? data.multiTeamsState['team_1'] : null);
                            } else if (this.team === 'right' || this.team === 'team_2') {
                                myTeamState = data.rightState || (data.multiTeamsState ? data.multiTeamsState['team_2'] : null);
                            }
                            if (myTeamState) {
                                myTeamState.isGameStarted = true;
                                this.onStateSync(myTeamState);
                            }
                        }
                        break;

                    case 'SYNC_FULL_STATE':
                        if (this.onStateSync) {
                            let myTeamState = null;
                            if (data.multiTeamsState && data.multiTeamsState[this.team]) {
                                myTeamState = data.multiTeamsState[this.team];
                            } else if (this.team === 'left' || this.team === 'team_1') {
                                myTeamState = data.leftState || (data.multiTeamsState ? data.multiTeamsState['team_1'] : null);
                            } else if (this.team === 'right' || this.team === 'team_2') {
                                myTeamState = data.rightState || (data.multiTeamsState ? data.multiTeamsState['team_2'] : null);
                            }
                            if (myTeamState) {
                                if (typeof data.isGameStarted !== 'undefined') {
                                    myTeamState.isGameStarted = data.isGameStarted;
                                }
                                this.onStateSync(myTeamState);
                            }
                        }
                        break;

                    case 'QUESTION_UPDATE':
                        const isForMe = (data.team === this.team) || 
                                        (this.team === 'left' && data.team === 'team_1') || 
                                        (this.team === 'team_1' && data.team === 'left') ||
                                        (this.team === 'right' && data.team === 'team_2') ||
                                        (this.team === 'team_2' && data.team === 'right');
                        if (isForMe && this.onQuestionUpdate) {
                            this.onQuestionUpdate(data);
                        }
                        break;

                    case 'ANSWER_RESULT':
                        if (this.onAnswerResult) {
                            this.onAnswerResult(data);
                        }
                        break;

                    case 'GAME_OVER':
                    case 'MULTI_TEAM_GAME_OVER':
                        if (this.onGameOver) {
                            this.onGameOver(data);
                        }
                        break;

                    case 'GAME_RESET':
                        if (this.onGameReset) {
                            this.onGameReset(data);
                        }
                        break;
                }
            } catch (err) {
                console.warn('Lỗi phân tích tin nhắn Host:', err);
            }
        }
    }

    // Export module ra global window
    window.RemoteSyncHost = RemoteSyncHost;
    window.RemoteSyncClient = RemoteSyncClient;

})(window);
