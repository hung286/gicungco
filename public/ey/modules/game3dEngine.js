// 3D Game Client Engine: "Mực ơi, Đừng dậy!" (Green Light - Red Light 3D)
// Built with Three.js / WebGL, Optimized for Mobile & Old Devices
// Features: 180° Monster Head Turn, Anti-cheat Trap isMonsterAwake, KaTeX Math & iMath Zoom/Pan
// Author: Thầy Nguyễn Mạnh Hùng - MHEdu (0965908084)

(function(global) {
  class Game3DClient {
    constructor() {
      this.container = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.rafId = null;

      // Game States
      this.isMonsterAwake = false; // Core Flag
      this.phase = 'WAITING'; // 'WAITING' | 'GREEN' | 'RED' | 'VIOLATION' | 'WON'
      this.score = 0;
      this.playerProgress = 0; // 0 to 100
      this.currentQIndex = 0;
      this.room = null;
      this.studentName = "Học sinh";
      this.violationsCount = 0;

      // 3D Objects
      this.monsterGroup = null;
      this.monsterHead = null;
      this.monsterEyes = [];
      this.studentMesh = null;
      this.trackLength = 60;
      this.targetHeadRotation = Math.PI; // Face away initially
      this.currentHeadRotation = Math.PI;
      this.signalLightMesh = null;

      // Web Audio
      this.audioCtx = null;
      this.soundEnabled = true;
    }

    initAudio() {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    }

    playTone(freq, type = 'sine', dur = 0.2, gainVal = 0.2, delay = 0) {
      if (!this.soundEnabled) return;
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime + delay;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(gainVal, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }

    playGreenSignal() {
      // Pleasant chime
      this.playTone(523.25, 'triangle', 0.25, 0.2, 0);
      this.playTone(659.25, 'triangle', 0.35, 0.2, 0.12);
    }

    playRedSignal() {
      // Sharp alert buzzer
      this.playTone(220, 'sawtooth', 0.4, 0.35, 0);
      this.playTone(180, 'sawtooth', 0.5, 0.4, 0.1);
    }

    playLaserSound() {
      if (!this.soundEnabled || !this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    }

    launch(container, roomData = null) {
      this.container = container;
      this.room = roomData || (global.EyDatabase ? new global.EyDatabase().getActiveRoom() : null);
      if (!this.room || !this.room.questions || this.room.questions.length === 0) {
        alert('Phòng chưa có câu hỏi! Vui lòng nhập câu hỏi từ trang Quản trị giáo viên.');
        return;
      }

      this.score = 0;
      this.playerProgress = 0;
      this.currentQIndex = 0;
      this.violationsCount = 0;
      this.isMonsterAwake = false;

      // Pick a random student name from roster
      const roster = this.room.roster || ["Bạn học sinh"];
      this.studentName = roster[Math.floor(Math.random() * roster.length)];

      this.buildUi();
      this.init3DScene();
      this.bindTrapListeners();
      this.startLoop();
      this.startGreenRedCycle();
    }

    buildUi() {
      this.container.innerHTML = `
        <div id="game3d-shell" style="position: relative; width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: system-ui, sans-serif; user-select: none;">
          <!-- 3D Canvas Viewport -->
          <div id="game3d-canvas-wrap" style="position: absolute; inset: 0;"></div>

          <!-- Top HUD Bar -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 56px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 20; color: white;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">🐕</span>
              <div>
                <div style="font-weight: 900; font-size: 14px; color: #fde047;">MỰC ƠI, ĐỪNG DẬY! · 3D REAL-TIME</div>
                <div style="font-size: 11px; color: #cbd5e1;">Học sinh: <b style="color: #38bdf8;">${this.studentName}</b> | Điểm: <b id="hud-score" style="color: #4ade80;">0</b></div>
              </div>
            </div>

            <!-- Signal Indicator -->
            <div id="hud-signal-pill" style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; padding: 6px 16px; border-radius: 999px; transition: all 0.3s;">
              <span id="hud-signal-dot" style="width: 14px; height: 14px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 12px #22c55e;"></span>
              <span id="hud-signal-text" style="font-weight: 900; font-size: 13px; color: #86efac; letter-spacing: 0.5px;">MỰC NGỦ · ĐÈN XANH</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="btn-3d-sound" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: white; border-radius: 8px; padding: 6px 12px; font-size: 13px; cursor: pointer;">🔊</button>
              <button id="btn-3d-exit" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; border-radius: 8px; padding: 6px 14px; font-weight: 800; font-size: 13px; cursor: pointer;">✕ Thoát</button>
            </div>
          </div>

          <!-- Question & Controls Panel (Bottom Overlay) -->
          <div id="game3d-question-panel" style="position: absolute; bottom: 12px; left: 16px; right: 16px; max-width: 760px; margin: 0 auto; background: rgba(15, 23, 42, 0.92); border: 2px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 16px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); backdrop-filter: blur(14px); z-index: 25; color: white;">
            <!-- Question Content -->
            <div id="q3d-content-box" style="margin-bottom: 12px;"></div>

            <!-- Options Grid -->
            <div id="q3d-options-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>
          </div>

          <!-- Violation Alarm Banner (Flash on screen) -->
          <div id="game3d-alarm-banner" style="position: absolute; inset: 0; background: rgba(239, 68, 68, 0.45); display: none; align-items: center; justify-content: center; z-index: 50; pointer-events: none; backdrop-filter: blur(4px);">
            <div style="background: #ef4444; border: 4px solid #fde047; padding: 24px 36px; border-radius: 20px; text-align: center; color: white; box-shadow: 0 0 50px rgba(239,68,68,0.8); animation: shake 0.4s infinite;">
              <div style="font-size: 48px; margin-bottom: 6px;">🚨🐕⚡</div>
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #fde047;">BẮT ĐƯỢC VI PHẠM!</div>
              <div style="font-size: 14px; margin-top: 6px; font-weight: 700;">Bạn đã thao tác vào khoảnh khắc Mực Tỉnh Giấc!</div>
              <div style="font-size: 13px; color: #fee2e2; margin-top: 4px;">Bị trừ 30 điểm và lùi về vạch xuất phát!</div>
            </div>
          </div>
        </div>
      `;

      // Exit button
      this.container.querySelector('#btn-3d-exit').addEventListener('click', () => {
        this.destroy();
        if (global.TeacherDashboard) {
          global.TeacherDashboard.render(this.container);
        }
      });

      // Sound toggle
      const soundBtn = this.container.querySelector('#btn-3d-sound');
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
      });

      this.displayCurrentQuestion();
    }

    displayCurrentQuestion() {
      const q = this.room.questions[this.currentQIndex];
      if (!q) {
        this.showVictoryScreen();
        return;
      }

      const contentBox = this.container.querySelector('#q3d-content-box');
      const optGrid = this.container.querySelector('#q3d-options-grid');

      contentBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="background: #ea580c; color: white; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 6px;">
            CÂU ${this.currentQIndex + 1} / ${this.room.questions.length}
          </span>
          <span style="font-size: 12px; color: #94a3b8;">Tiến độ chạy: <b>${Math.round(this.playerProgress)}%</b></span>
        </div>
        <div style="font-size: 14.5px; font-weight: 600; line-height: 1.5; color: #f8fafc;">
          ${q.content}
        </div>
        ${q.image ? `
          <div style="margin-top: 8px;">
            <button type="button" class="btn-open-diagram" style="background: rgba(37, 99, 235, 0.2); border: 1px solid #3b82f6; color: #93c5fd; padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>📐</span> Xem Sơ đồ / Đồ thị iMath (Thu phóng)
            </button>
          </div>
        ` : ''}
      `;

      // Diagram click
      const diagBtn = contentBox.querySelector('.btn-open-diagram');
      if (diagBtn) {
        diagBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (global.ZoomPanOverlay) {
            global.ZoomPanOverlay.open(q.image);
          }
        });
      }

      // Render options
      optGrid.innerHTML = q.options.map(opt => `
        <button type="button" class="q3d-opt-btn" data-key="${opt.key}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px; padding: 10px 14px; text-align: left; color: white; font-size: 13.5px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s;">
          <span style="font-weight: 900; color: #f59e0b; font-size: 14px;">${opt.key}.</span>
          <span style="flex: 1;">${opt.text}</span>
        </button>
      `).join('');

      // Option click events
      optGrid.querySelectorAll('.q3d-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAnswerSubmit(btn.dataset.key);
        });
      });

      // Render Math formulas with KaTeX
      if (global.FileParser) {
        global.FileParser.renderMath(contentBox);
        global.FileParser.renderMath(optGrid);
      }
    }

    // Anti-cheat Trap: Check violation if touching screen or buttons while isMonsterAwake
    bindTrapListeners() {
      const shell = this.container.querySelector('#game3d-shell');
      if (!shell) return;

      const triggerViolation = (e) => {
        if (this.isMonsterAwake && this.phase === 'RED') {
          this.handleViolation();
        }
      };

      shell.addEventListener('touchstart', triggerViolation, { passive: true });
      shell.addEventListener('mousedown', triggerViolation);
    }

    handleViolation() {
      if (this.phase === 'VIOLATION') return; // already handling
      this.phase = 'VIOLATION';
      this.violationsCount++;
      this.score = Math.max(0, this.score - 30);
      this.playerProgress = Math.max(0, this.playerProgress - 25);
      this.updateHud();

      this.playLaserSound();

      // Show alarm banner
      const banner = this.container.querySelector('#game3d-alarm-banner');
      if (banner) banner.style.display = 'flex';

      // Laser beam effect in 3D
      this.shootLaserAtStudent();

      setTimeout(() => {
        if (banner) banner.style.display = 'none';
        this.phase = 'RED';
      }, 1600);
    }

    handleAnswerSubmit(selectedKey) {
      // Check if monster is awake!
      if (this.isMonsterAwake) {
        this.handleViolation();
        return;
      }

      const q = this.room.questions[this.currentQIndex];
      if (!q) return;

      if (selectedKey === q.correctAnswer) {
        // Correct answer! Advance on track
        this.score += 50;
        this.playerProgress = Math.min(100, this.playerProgress + (100 / this.room.questions.length));
        this.playTone(880, 'triangle', 0.25, 0.3);
        this.updateHud();

        // Move 3D student forward
        this.advanceStudentMesh();

        // Next question
        this.currentQIndex++;
        setTimeout(() => {
          this.displayCurrentQuestion();
        }, 500);
      } else {
        // Wrong answer
        this.playTone(220, 'sawtooth', 0.2, 0.25);
        alert(`Chưa chính xác! Đáp án đúng là ${q.correctAnswer}. ${q.explanation ? q.explanation : ''}`);
      }
    }

    updateHud() {
      const scoreEl = this.container.querySelector('#hud-score');
      if (scoreEl) scoreEl.textContent = this.score;
    }

    // Green Light - Red Light Cycle
    startGreenRedCycle() {
      const cycle = () => {
        if (!this.container || this.phase === 'WON') return;

        // 1. GREEN LIGHT (Mực Ngủ): 3.5s - 6s
        this.setGreenLight();
        const greenDur = 3500 + Math.random() * 2500;

        setTimeout(() => {
          if (!this.container || this.phase === 'WON') return;

          // 2. RED LIGHT (Mực Tỉnh): 2.5s - 4.5s
          this.setRedLight();
          const redDur = 2500 + Math.random() * 2000;

          setTimeout(() => {
            cycle();
          }, redDur);
        }, greenDur);
      };

      cycle();
    }

    setGreenLight() {
      this.isMonsterAwake = false;
      this.phase = 'GREEN';
      this.targetHeadRotation = Math.PI; // Face away
      this.playGreenSignal();

      // Update UI Pill
      const pill = this.container.querySelector('#hud-signal-pill');
      const dot = this.container.querySelector('#hud-signal-dot');
      const txt = this.container.querySelector('#hud-signal-text');
      if (pill && dot && txt) {
        pill.style.background = 'rgba(34, 197, 94, 0.2)';
        pill.style.borderColor = '#22c55e';
        dot.style.background = '#22c55e';
        dot.style.boxShadow = '0 0 12px #22c55e';
        txt.style.color = '#86efac';
        txt.textContent = 'MỰC NGỦ · ĐÈN XANH (An toàn)';
      }

      // Update Eye Colors in 3D
      this.setEyesColor(0x06b6d4); // Cyan
      if (this.signalLightMesh) this.signalLightMesh.material.color.setHex(0x22c55e);
    }

    setRedLight() {
      this.isMonsterAwake = true;
      this.phase = 'RED';
      this.targetHeadRotation = 0; // Turn 180° towards student
      this.playRedSignal();

      // Update UI Pill
      const pill = this.container.querySelector('#hud-signal-pill');
      const dot = this.container.querySelector('#hud-signal-dot');
      const txt = this.container.querySelector('#hud-signal-text');
      if (pill && dot && txt) {
        pill.style.background = 'rgba(239, 68, 68, 0.25)';
        pill.style.borderColor = '#ef4444';
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 16px #ef4444';
        txt.style.color = '#fca5a5';
        txt.textContent = 'MỰC TỈNH · ĐÈN ĐỎ (DỪNG LẠI!)';
      }

      // Update Eye Colors in 3D
      this.setEyesColor(0xef4444); // Laser Red
      if (this.signalLightMesh) this.signalLightMesh.material.color.setHex(0xef4444);
    }

    setEyesColor(hexColor) {
      this.monsterEyes.forEach(mesh => {
        if (mesh && mesh.material) {
          mesh.material.color.setHex(hexColor);
          if (mesh.material.emissive) mesh.material.emissive.setHex(hexColor);
        }
      });
    }

    // 3D Scene Initialization
    init3DScene() {
      const wrap = this.container.querySelector('#game3d-canvas-wrap');
      if (!wrap || !global.THREE) return;

      const THREE = global.THREE;
      const width = wrap.clientWidth || 800;
      const height = wrap.clientHeight || 600;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x090d16);
      this.scene.fog = new THREE.FogExp2(0x090d16, 0.015);

      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
      this.camera.position.set(0, 7, 24);
      this.camera.lookAt(0, 3, -10);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      wrap.appendChild(this.renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
      dirLight.position.set(10, 20, 15);
      dirLight.castShadow = true;
      this.scene.add(dirLight);

      // Running Track Floor
      const groundGeo = new THREE.PlaneGeometry(16, this.trackLength);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, 0, -this.trackLength / 2 + 10);
      ground.receiveShadow = true;
      this.scene.add(ground);

      // Track Lanes
      const grid = new THREE.GridHelper(this.trackLength, 20, 0xf59e0b, 0x334155);
      grid.position.set(0, 0.05, -this.trackLength / 2 + 10);
      this.scene.add(grid);

      // Build 3D Monster "Mực" at Finish Line
      this.buildMonster3D(THREE);

      // Build 3D Student Mesh
      this.buildStudent3D(THREE);

      // Resize Listener
      this.onResize = () => {
        if (!wrap || !this.camera || !this.renderer) return;
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      };
      window.addEventListener('resize', this.onResize);
    }

    buildMonster3D(THREE) {
      this.monsterGroup = new THREE.Group();
      this.monsterGroup.position.set(0, 0, -32);

      // Stone Pedestal
      const pedGeo = new THREE.CylinderGeometry(3.5, 4, 1.5, 16);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.75;
      this.monsterGroup.add(pedestal);

      // Monster Body (Low-poly Stylized Dog / Squid Guard)
      const bodyGeo = new THREE.CylinderGeometry(1.4, 1.8, 3.2, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 3.1;
      this.monsterGroup.add(body);

      // Rotating Head
      this.monsterHead = new THREE.Group();
      this.monsterHead.position.set(0, 4.8, 0);

      const headGeo = new THREE.SphereGeometry(1.3, 16, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.4 });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      this.monsterHead.add(headMesh);

      // Ears
      const earGeo = new THREE.ConeGeometry(0.4, 1.0, 6);
      const earMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12 });
      const earL = new THREE.Mesh(earGeo, earMat);
      earL.position.set(-0.9, 1.1, 0);
      earL.rotation.z = 0.3;
      const earR = new THREE.Mesh(earGeo, earMat);
      earR.position.set(0.9, 1.1, 0);
      earR.rotation.z = -0.3;
      this.monsterHead.add(earL);
      this.monsterHead.add(earR);

      // Eyes with Dynamic Glow
      this.monsterEyes = [];
      const eyeGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const eyeMatL = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMatL);
      eyeL.position.set(-0.45, 0.25, 1.15);

      const eyeMatR = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4 });
      const eyeR = new THREE.Mesh(eyeGeo, eyeMatR);
      eyeR.position.set(0.45, 0.25, 1.15);

      this.monsterHead.add(eyeL);
      this.monsterHead.add(eyeR);
      this.monsterEyes.push(eyeL, eyeR);

      this.monsterHead.rotation.y = Math.PI; // Face away initially
      this.monsterGroup.add(this.monsterHead);

      // Signal Light on top of Monster Head
      const lightGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      this.signalLightMesh = new THREE.Mesh(lightGeo, lightMat);
      this.signalLightMesh.position.set(0, 1.8, 0);
      this.monsterHead.add(this.signalLightMesh);

      this.scene.add(this.monsterGroup);
    }

    buildStudent3D(THREE) {
      this.studentMesh = new THREE.Group();
      this.studentMesh.position.set(0, 0, 8); // Start line

      // Body Capsule
      const bodyGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      this.studentMesh.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.4, 12, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.9;
      this.studentMesh.add(head);

      this.scene.add(this.studentMesh);
    }

    advanceStudentMesh() {
      if (!this.studentMesh) return;
      const targetZ = 8 - (this.playerProgress / 100) * 36;
      // Animate hop forward
      const startZ = this.studentMesh.position.z;
      let step = 0;
      const hop = () => {
        step += 0.1;
        if (step <= 1) {
          this.studentMesh.position.z = startZ + (targetZ - startZ) * step;
          this.studentMesh.position.y = Math.sin(step * Math.PI) * 0.6;
          requestAnimationFrame(hop);
        } else {
          this.studentMesh.position.z = targetZ;
          this.studentMesh.position.y = 0;
        }
      };
      hop();

      if (this.playerProgress >= 100) {
        this.showVictoryScreen();
      }
    }

    shootLaserAtStudent() {
      if (!global.THREE || !this.scene || !this.studentMesh) return;
      const THREE = global.THREE;

      // Draw red laser line from monster eye to student
      const points = [
        new THREE.Vector3(0, 4.8, -32),
        new THREE.Vector3(this.studentMesh.position.x, 1.5, this.studentMesh.position.z)
      ];
      const laserGeo = new THREE.BufferGeometry().setFromPoints(points);
      const laserMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 4 });
      const laserLine = new THREE.Line(laserGeo, laserMat);
      this.scene.add(laserLine);

      setTimeout(() => {
        this.scene.remove(laserLine);
      }, 500);
    }

    // Animation Render Loop
    startLoop() {
      const animate = () => {
        this.rafId = requestAnimationFrame(animate);

        // Smooth 180° Head Turn Interpolation
        if (this.monsterHead) {
          this.currentHeadRotation += (this.targetHeadRotation - this.currentHeadRotation) * 0.18;
          this.monsterHead.rotation.y = this.currentHeadRotation;
        }

        // Camera Gentle Tracking
        if (this.camera && this.studentMesh) {
          this.camera.position.z += (this.studentMesh.position.z + 16 - this.camera.position.z) * 0.05;
        }

        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };
      animate();
    }

    showVictoryScreen() {
      this.phase = 'WON';
      this.playTone(523.25, 'triangle', 0.5, 0.4, 0);
      this.playTone(659.25, 'triangle', 0.5, 0.4, 0.15);
      this.playTone(783.99, 'triangle', 0.6, 0.4, 0.3);
      this.playTone(1046.5, 'triangle', 0.8, 0.5, 0.45);

      const panel = this.container.querySelector('#game3d-question-panel');
      if (panel) {
        panel.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 54px; margin-bottom: 8px;">🏆🐕🎉</div>
            <div style="font-size: 26px; font-weight: 900; color: #fde047;">CHIẾN THẮNG XUẤT SẮC!</div>
            <div style="font-size: 15px; color: #cbd5e1; margin: 8px 0 16px 0;">
              Chúc mừng bạn <b>${this.studentName}</b> đã về đích an toàn với tổng điểm: <b style="color: #4ade80; font-size: 20px;">${this.score}</b>!
            </div>
            <button id="btn-victory-replay" style="background: linear-gradient(180deg, #ea580c, #c2410c); border: 2px solid #fde047; color: white; padding: 12px 32px; border-radius: 14px; font-weight: 900; font-size: 16px; cursor: pointer;">
              Chơi Lại Ván Mới
            </button>
          </div>
        `;

        panel.querySelector('#btn-victory-replay').addEventListener('click', () => {
          this.launch(this.container, this.room);
        });
      }
    }

    destroy() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      if (this.onResize) window.removeEventListener('resize', this.onResize);
      if (this.renderer) {
        this.renderer.dispose();
      }
      this.container.innerHTML = '';
    }
  }

  global.Game3DClient = Game3DClient;
  global.launch3DGameClient = function(roomData) {
    const arena = document.getElementById('game-arena-content');
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.add('open');
    if (arena) {
      const client = new Game3DClient();
      client.launch(arena, roomData);
    }
  };
})(typeof window !== 'undefined' ? window : global);
