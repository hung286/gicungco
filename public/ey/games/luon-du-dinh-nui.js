// =============================================================================
// NHẢY DÙ ĐẢO HOANG (LƯỢN DÙ ĐỈNH NÚI)
// Trò chơi gọi tên học sinh chuẩn 100% cơ chế video tham khảo PomyAI
// Tác giả: Thầy Nguyễn Mạnh Hùng - MHEdu (0965.908.084)
// Phân phối: EY - Trí Tuệ Nhân Tạo & Trò Chơi Giáo Dục
// =============================================================================

(function (global) {
  'use strict';

  // =========================================================================
  // 1. SYNTHESIZED WEB AUDIO ENGINE (CHUẨN POMYAI SOUND FX)
  // =========================================================================
  class SkydiveAudio {
    constructor() {
      this.ctx = null;
      this.tong = null;
      this.on = null;
      this.nen = null;
      this.henNhac = null;
      this.nhipTiep = 0;
      this.buoc = 0;
      this.enabled = true;
    }

    c() {
      if (!this.enabled) return null;
      try {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return null;
          this.ctx = new AudioContext();
          this.tong = this.ctx.createGain();
          this.tong.gain.value = 0.8;
          this.tong.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      } catch (e) {
        return null;
      }
    }

    nhieu(ctx) {
      if (!this.on) {
        const buffer = ctx.createBuffer(1, 2 * ctx.sampleRate, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = 2 * Math.random() - 1;
        this.on = buffer;
      }
      return this.on;
    }

    nguonOn(ctx, loop = false) {
      const src = ctx.createBufferSource();
      src.buffer = this.nhieu(ctx);
      src.loop = loop;
      return src;
    }

    batNen() {
      const ctx = this.c();
      if (!ctx || this.nen) return;
      const t = ctx.currentTime;
      const makeGain = (maxVal) => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(maxVal, t + 1.5);
        g.connect(this.tong);
        return g;
      };
      const gWind = makeGain(0.07);
      const gMusic = makeGain(0.34);
      const nSrc = this.nguonOn(ctx, true);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 500;
      filter.Q.value = 0.7;

      const osc = ctx.createOscillator();
      osc.frequency.value = 0.13;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 260;
      osc.connect(oscGain).connect(filter.frequency);
      nSrc.connect(filter).connect(gWind);

      nSrc.start();
      osc.start();

      this.nen = { gio: gWind, nhac: gMusic, nSrc, osc };
      this.nhipTiep = ctx.currentTime + 0.2;
      this.henNhac = window.setInterval(() => this.lichNhac(), 120);
    }

    tatNen() {
      if (this.henNhac !== null) {
        window.clearInterval(this.henNhac);
        this.henNhac = null;
      }
      if (this.ctx && this.nen) {
        const t = this.ctx.currentTime;
        if (this.nen.gio) {
          this.nen.gio.gain.cancelScheduledValues(t);
          this.nen.gio.gain.setTargetAtTime(0, t, 0.15);
        }
        if (this.nen.nhac) {
          this.nen.nhac.gain.cancelScheduledValues(t);
          this.nen.nhac.gain.setTargetAtTime(0, t, 0.15);
        }
        const oldNen = this.nen;
        window.setTimeout(() => {
          try {
            oldNen.nSrc?.stop();
            oldNen.osc?.stop();
            oldNen.gio?.disconnect();
            oldNen.nhac?.disconnect();
          } catch (e) {}
        }, 900);
      }
      this.nen = null;
    }

    lichNhac() {
      const ctx = this.ctx;
      if (!ctx || !this.nen) return;
      const spb = 60 / 140 / 4;
      const chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
      const bassNotes = [36, 31, 33, 29];
      const melody = [72, -1, 76, 79, -1, 76, 74, 72, 74, -1, 76, -1, 79, 81, 79, 76];
      const bassPattern = [0, -1, 12, 0, -1, 0, 12, -1, 0, -1, 12, 0, 7, -1, 12, -1];

      while (this.nhipTiep < ctx.currentTime + 0.4) {
        const t = this.nhipTiep;
        const step = this.buoc % 64;
        const step16 = step % 16;
        const bar = Math.floor(step / 16);

        if (step16 % 4 === 0) this.kick(t);
        if (step16 === 4 || step16 === 12) this.snare(t);
        if (step16 % 2 === 0) this.hiHat(t, step16 % 4 === 2 ? 0.16 : 0.08);
        if (bassPattern[step16] >= 0) this.notBass(bassNotes[bar] + bassPattern[step16], t, 1.6 * spb);

        const mNote = melody[step16];
        if (mNote > 0) {
          this.notMarimba(mNote + (bar === 2 ? -3 : bar === 3 ? -5 : bar === 1 ? -1 : 0), t, 0.55);
        }
        if (step16 === 0 || step16 === 8) {
          chords[bar].forEach(p => this.notMarimba(p + 12, t, 0.18));
        }

        this.nhipTiep += spb;
        this.buoc++;
      }
    }

    kick(t) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(g).connect(this.nen.nhac);
      osc.start(t);
      osc.stop(t + 0.22);
    }

    snare(t) {
      const ctx = this.ctx;
      const nSrc = this.nguonOn(ctx);
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 0.8;
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      nSrc.connect(filter).connect(g).connect(this.nen.nhac);
      nSrc.start(t);
      nSrc.stop(t + 0.18);

      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
      og.gain.setValueAtTime(0.3, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(og).connect(this.nen.nhac);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    hiHat(t, vol) {
      const ctx = this.ctx;
      const nSrc = this.nguonOn(ctx);
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      nSrc.connect(filter).connect(g).connect(this.nen.nhac);
      nSrc.start(t);
      nSrc.stop(t + 0.06);
    }

    notBass(pitch, t, dur) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + dur);
      g.gain.setValueAtTime(0.32, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(filter).connect(g).connect(this.nen.nhac);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    notMarimba(pitch, t, dur) {
      const ctx = this.ctx;
      const freq = 440 * Math.pow(2, (pitch - 69) / 12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35 * dur, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = freq;

      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = 4 * freq;

      const og2 = ctx.createGain();
      og2.gain.setValueAtTime(0.25, t);
      og2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      o1.connect(g);
      o2.connect(og2).connect(g);
      g.connect(this.nen.nhac);
      o1.start(t);
      o2.start(t);
      o1.stop(t + 0.35);
      o2.stop(t + 0.35);
    }

    onNgan(ctx, t, dur, fType, fStart, fEnd, gainVal) {
      const src = this.nguonOn(ctx);
      const f = ctx.createBiquadFilter();
      f.type = fType;
      f.frequency.setValueAtTime(fStart, t);
      f.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gainVal, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f).connect(g).connect(this.tong);
      src.start(t);
      src.stop(t + dur + 0.05);
    }

    am(ctx, t, type, fStart, fEnd, dur, gainVal) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(fStart, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gainVal, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g).connect(this.tong);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }

    phat(ten) {
      const ctx = this.c();
      if (!ctx || !this.tong) return;
      const t = ctx.currentTime;
      switch (ten) {
        case 'nhay':
          this.onNgan(ctx, t, 0.9, 'bandpass', 300, 2400, 0.8);
          [60, 64, 67, 72, 76].forEach((n, i) =>
            this.am(ctx, t + 0.06 * i, 'square', 440 * Math.pow(2, (n - 57) / 12), 440 * Math.pow(2, (n - 57) / 12), 0.12, 0.16)
          );
          break;
        case 'bung':
          this.onNgan(ctx, t, 0.3, 'lowpass', 1400, 150, 1);
          this.am(ctx, t, 'sine', 160, 60, 0.35, 0.8);
          break;
        case 'set':
          this.onNgan(ctx, t, 0.12, 'highpass', 4000, 2000, 0.9);
          for (let i = 0; i < 6; i++) {
            this.am(ctx, t + 0.05 * i, 'square', 1200 + 800 * Math.random(), 300, 0.05, 0.12);
          }
          this.onNgan(ctx, t + 0.15, 2.4, 'lowpass', 400, 40, 1);
          break;
        case 'chim':
          for (let i = 0; i < 3; i++) {
            this.am(ctx, t + 0.16 * i, 'sawtooth', 1500, 700, 0.13, 0.14);
          }
          this.onNgan(ctx, t + 0.45, 0.18, 'lowpass', 1200, 200, 0.8);
          break;
        case 'dem':
          this.am(ctx, t, 'square', 988, 988, 0.12, 0.28);
          this.am(ctx, t, 'sine', 494, 494, 0.2, 0.4);
          break;
        case 'xep':
          this.am(ctx, t, 'triangle', 900, 120, 0.9, 0.3);
          this.am(ctx, t + 0.9, 'sine', 300, 600, 0.25, 0.25);
          break;
        case 'cop':
          this.am(ctx, t, 'square', 880, 700, 0.07, 0.35);
          this.am(ctx, t + 0.08, 'triangle', 300, 900, 0.35, 0.3);
          break;
        case 'mung':
          [72, 76, 79, 84].forEach((n, i) =>
            this.am(ctx, t + 0.09 * i, 'triangle', 440 * Math.pow(2, (n - 69) / 12), 440 * Math.pow(2, (n - 69) / 12), 0.3, 0.2)
          );
          break;
        case 'trong':
          for (let i = 0; i < 14; i++) {
            this.onNgan(ctx, t + 0.07 * i, 0.06, 'lowpass', 900, 200, 0.18 + 0.03 * i);
          }
          break;
        case 'keng':
          [84, 88, 91].forEach((n, i) =>
            this.am(ctx, t + 0.12 * i, 'sine', 440 * Math.pow(2, (n - 69) / 12), 440 * Math.pow(2, (n - 69) / 12), 0.8, 0.25)
          );
          break;
      }
    }
  }

  // =========================================================================
  // 2. SIMULATION & PHYSICS ENGINE (MODULE 69674 & 54407)
  // =========================================================================
  const clamp01 = e => Math.max(0, Math.min(1, e));
  const smoothstep = e => {
    const a = clamp01(e);
    return a * a * (3 - 2 * a);
  };
  const THE_GIOI = { rong: 2964, cao: 1024 };
  const DINH = { x0: 110, x1: 1110, yXa: 403, yGan: 413 };
  const T_NHAY = 3;
  const T_HA = 6;
  const T_THE = 32;

  const SPECIAL_LANDING = [
    { noi: 'mai', x: 2402, y: 541 },
    { noi: 'mai', x: 2824, y: 561 },
    { noi: 'rom', x: 2440, y: 669 },
    { noi: 'rom', x: 2494, y: 694 },
    { noi: 'ho', x: 2724, y: 690 },
    { noi: 'ho', x: 2888, y: 700 },
    { noi: 'ho', x: 2762, y: 706 }
  ];

  const midDinhX = (DINH.x0 + DINH.x1) / 2;
  const lCliffEnd = 2423;
  const oLandedTimes = [21.2, 23.6, 25.4];
  const uDurations = { set: 3.2, chim: 2.6, xep: 2.2 };
  const cEventTimes = [7.4, 9.6, 11.8, 14];
  const dMajorEvents = new Set(['set', 'chim']);
  const flightStyles = ['S', 'S', 'thang', 'cung', 'banNguyet', 'vong', 'chiChi'];

  function shuffle(arr, rng = Math.random) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.min(i, Math.floor(rng() * (i + 1)));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const randRange = (rng, min, max) => min + (max - min) * rng();

  function getTrajectoryOffset(e, t) {
    const r = e.wS * t + e.pha;
    const i = Math.max(0, t - e.tCat - 4);
    switch (e.kieu) {
      case 'S':
        return { x: e.aS * Math.sin(r), y: 0.18 * e.aS * Math.cos(2 * r) };
      case 'thang':
        return { x: 12 * Math.sin(r), y: 0 };
      case 'cung':
        return { x: 20 * Math.sin(r), y: -130 * Math.sin(Math.PI * clamp01(i / 12)) };
      case 'banNguyet': {
        const p = Math.PI * smoothstep((t - e.tKieu) / 4.5);
        return { x: -120 * Math.sin(p) + 18 * Math.sin(r), y: 55 * (1 - Math.cos(p)) };
      }
      case 'vong': {
        const p = 4 * Math.PI * smoothstep((t - e.tKieu) / 5.5);
        return { x: 85 * Math.sin(p) + 18 * Math.sin(r), y: -34 * (1 - Math.cos(p)) };
      }
      case 'chiChi':
        return { x: 75 * (4 * Math.abs((((0.33 * t + e.pha) % 1 + 1) % 1) - 0.5) - 1), y: 10 * Math.sin(r) };
      default:
        return { x: 0, y: 0 };
    }
  }

  function getGliderPosition(e, t, startX, startY) {
    const u = e.tCat + 4;
    const c = e.tDap - 6;

    const calcH = (time) => {
      let iEvt;
      const oCur = getTrajectoryOffset(e, time);
      const oNext = getTrajectoryOffset(e, time + 0.05);
      const oPrev = getTrajectoryOffset(e, time - 0.05);
      const major = e.suCo.find(s => dMajorEvents.has(s.loai));
      const p = major && time > major.t ? major.t + (time - major.t) * 0.25 : time;
      let fX = midDinhX + (lCliffEnd - midDinhX) * Math.pow(clamp01((p - 3 - 1) / 16), 0.85) + e.dx + e.vTien * Math.max(0, p - e.tCat) + oCur.x;
      let fY = e.yBay + 5 * Math.max(0, time - u) + oCur.y;
      let tilt = 2 * clamp01(((oNext.x - oPrev.x) / 0.1 + 45) / 90) - 1;

      if (e.tNhiet > 0 && time > e.tNhiet) {
        const tN = Math.min(1, (time - e.tNhiet) / 4);
        const ang = 2 * Math.PI * tN;
        fX += 90 * Math.sin(ang);
        fY += -36 * (1 - Math.cos(ang)) - 60 * smoothstep(tN);
        if (tN < 1) tilt = Math.cos(ang);
      }
      return { x: Math.max(70, Math.min(THE_GIOI.rong - 70, fX)), y: fY, re: tilt };
    };

    if (t < u) {
      const progress = (t - e.tCat) / 4;
      const curve = 1 - Math.pow(1 - progress, 2.5);
      const hPos = calcH(t);
      return {
        x: startX + (hPos.x - startX) * curve,
        y: startY + (hPos.y - startY) * curve + 30 * Math.sin(Math.PI * Math.min(1, 1.6 * progress)),
        re: hPos.re * curve
      };
    }
    if (t < c) return calcH(t);

    const pAtC = calcH(c);
    const landingProgress = smoothstep((t - c) / 6);
    return {
      x: pAtC.x + (e.xDap - pAtC.x) * landingProgress,
      y: pAtC.y + (e.yDap - pAtC.y) * landingProgress,
      re: pAtC.re * (1 - landingProgress)
    };
  }

  function isCharred(e, t) {
    return e.suCo.some(s => s.loai === 'set' && t >= s.t + 0.22 * s.dai);
  }

  function hasBirdHit(e, t) {
    return e.suCo.some(s => s.loai === 'chim' && t >= s.t + 0.4 * s.dai);
  }

  function getCharacterFrameState(e, t, withCollisions = false) {
    const activeEvt = e.suCo.find(s => t >= s.t && t < s.t + s.dai) || null;
    const baseState = { va: null, nuoc: false };

    // 1. Standing idle on cliff
    if (t < e.tChay) {
      return {
        ...baseState,
        x: e.xDung,
        y: e.yDung,
        khung: `luon-${Math.floor(2.2 * t + e.pha) % 2}`,
        lac: 0,
        dat: true,
        bay: false,
        suCo: null
      };
    }

    const cX = e.xDung + 28;
    const cY = e.yDung;

    // 2. Running off cliff
    if (t < e.tCat) {
      const rProg = (t - e.tChay) / (e.tCat - e.tChay);
      return {
        ...baseState,
        x: e.xDung + (cX - e.xDung) * rProg,
        y: e.yDung,
        khung: rProg < 0.45 ? 'luon-2' : 'luon-3',
        lac: 0,
        dat: true,
        bay: false,
        suCo: null
      };
    }

    // 3. Landed
    if (t >= e.tDap) {
      const aTime = t - e.tDap;
      const lState = { lac: 0, dat: true, bay: false, suCo: null, va: null };
      switch (e.noiDap) {
        case 'mai':
          return { ...lState, x: e.xDap, y: e.yDap, khung: aTime < 0.7 ? 'troll-11' : 'troll-10', nuoc: false };
        case 'rom':
          return { ...lState, x: e.xDap, y: e.yDap, khung: 'troll-11', lac: 0.12 * Math.sin(3 * t + e.pha) * clamp01(2 - aTime), nuoc: false };
        case 'ho':
          return { ...lState, x: e.xDap, y: e.yDap + 4 * Math.sin(2.4 * t + e.pha), khung: 'troll-10', nuoc: true };
        case 'dat':
        default: {
          const kFrame = aTime < 0.8 ? (e.lan ? 'troll-11' : 'luon-10') : 'luon-11';
          return { ...lState, x: e.xDap + 22 * Math.min(1, aTime / 0.8), y: e.yDap, khung: kFrame, nuoc: false };
        }
      }
    }

    // 4. Gliding in the air
    const gProg = (t - e.tCat) / (e.tDap - e.tCat);
    const bPos = getGliderPosition(e, t, cX, cY);
    const kSin = Math.sin(Math.PI * Math.min(1, 1.08 * gProg));
    let curX = bPos.x;
    let curY = bPos.y + 6 * Math.sin(1.3 * t + 1.7 * e.pha) * kSin;
    let curTilt = 0.16 * bPos.re * kSin;

    if (activeEvt) {
      const eFrac = (t - activeEvt.t) / activeEvt.dai;
      if (activeEvt.loai === 'set') curY -= 12 * Math.sin(Math.min(1, 8 * eFrac) * Math.PI);
      if (activeEvt.loai === 'xep') {
        curY += 85 * Math.sin(Math.min(1, eFrac / 0.6) * Math.PI * 0.5) * (eFrac < 0.6 ? 1 : 1 - (eFrac - 0.6) / 0.4);
        curTilt = (eFrac < 0.6 ? 0.25 : 0.25 * (1 - (eFrac - 0.6) / 0.4)) * Math.sin(9 * t);
      }
    }

    const collision = withCollisions ? e.va.find(v => t >= v.t && t < v.t + v.dai) || null : null;
    if (collision) {
      const cFrac = (t - collision.t) / collision.dai;
      const cSin = Math.sin(Math.PI * cFrac);
      curX += collision.dx * cSin;
      curY += collision.dy * cSin;
      curTilt += 0.32 * Math.sin((t - collision.t) * 16) * (1 - cFrac);
    }

    curY = Math.min(curY, e.yDap - 8 - 60 * clamp01((e.tDap - t) / 1.2));
    const smoothT = smoothstep((t - e.tCat) / 3);
    const lY = 140 + (curY - 140) * (DINH.yXa - 25 - 140) / 760;
    curY = curY + (lY - curY) * (1 - smoothstep((curX - 1130) / 260)) * smoothT;

    const nearEvt = e.suCo.find(s => t >= s.t - 0.7 && t < s.t);
    let chosenKhung = 'luon-5';

    if (t < e.tCat + 0.55) {
      chosenKhung = 'luon-4';
    } else if (activeEvt) {
      const nRatio = (t - activeEvt.t) / activeEvt.dai;
      switch (activeEvt.loai) {
        case 'set':
          chosenKhung = `troll-${nRatio < 0.11 ? 0 : nRatio < 0.22 ? 1 : nRatio < 0.62 ? 2 : 3}`;
          break;
        case 'chim':
          chosenKhung = nRatio < 0.4 ? 'troll-4' : 'troll-5';
          break;
        case 'xep':
          chosenKhung = nRatio < 0.6 ? 'troll-8' : 'troll-9';
          break;
      }
    } else if (isCharred(e, t)) {
      chosenKhung = 'troll-3';
    } else if (hasBirdHit(e, t)) {
      chosenKhung = 'troll-5';
    } else if (nearEvt || (collision && (t - collision.t) / collision.dai < 0.6)) {
      chosenKhung = 'troll-10';
    } else if (e.tDap - t < 1.1) {
      chosenKhung = e.noiDap === 'dat' ? 'luon-9' : 'troll-10';
    } else if (bPos.re > 0.6) {
      chosenKhung = 'luon-8';
    } else if (bPos.re < -0.6) {
      chosenKhung = 'luon-7';
    } else {
      chosenKhung = `luon-${5 + Math.floor(0.8 * t + e.pha) % 2}`;
    }

    return {
      ...baseState,
      va: collision,
      x: curX,
      y: curY,
      khung: chosenKhung,
      lac: curTilt,
      dat: false,
      bay: true,
      suCo: activeEvt
    };
  }

  const interpolateBox = (e, t, a) => ({
    x0: e.x0 + (t.x0 - e.x0) * a,
    y0: e.y0 + (t.y0 - e.y0) * a,
    x1: e.x1 + (t.x1 - e.x1) * a,
    y1: e.y1 + (t.y1 - e.y1) * a
  });

  function getCameraView(groupData, t, positions) {
    const num = groupData.nhom.length;
    const xList = groupData.nhom.map(e => e.xDung);
    const startBox = {
      x0: Math.min(...xList) - 90,
      x1: Math.max(...xList) + 90,
      y0: DINH.yXa - 360,
      y1: DINH.yGan + 160
    };

    let avgX = 0;
    let avgY = 0;
    for (const p of positions) {
      avgX += p.x;
      avgY += p.y;
    }
    avgX /= num;
    avgY /= num;

    let varX = 0;
    let varY = 0;
    for (const p of positions) {
      varX += (p.x - avgX) ** 2;
      varY += (p.y - avgY) ** 2;
    }
    const spreadX = Math.max(720, 2 * Math.sqrt(varX / num) + 220);
    const spreadY = Math.max(380, 2 * Math.sqrt(varY / num) + 130);

    let view = interpolateBox(
      startBox,
      { x0: avgX - spreadX, x1: avgX + spreadX, y0: avgY - spreadY - 130, y1: avgY + spreadY + 60 },
      smoothstep((t - 3 - 1.2) / 3)
    );

    view = interpolateBox(view, { x0: 1070, x1: 2843, y0: 330, y1: 960 }, smoothstep((t - 22 + 6) / 5));

    // Follow the chosen student(s) at landing
    const chosenOne = groupData.nhom.find(e => groupData.chon.includes(e.ten));
    if (chosenOne) {
      view = interpolateBox(
        view,
        { x0: chosenOne.xDap - 420, x1: chosenOne.xDap + 420, y0: chosenOne.yDap - 330, y1: chosenOne.yDap + 110 },
        smoothstep((t - 32 + 3) / 1.5)
      );
    }

    return view;
  }

  function createRound(roster, calledSet, bannedSet, rng = Math.random, countToPick = 1) {
    const uncalled = [...new Set(roster)].filter(e => !bannedSet.has(e));
    if (!uncalled.length) return null;

    const remaining = uncalled.filter(e => !calledSet.has(e));
    const pool = remaining.length > 0 ? remaining : uncalled;
    const isReset = remaining.length === 0;

    const actualCount = Math.max(1, Math.min(pool.length, countToPick));
    const shuffledPool = shuffle(pool, rng);
    const chosenStudents = shuffledPool.slice(0, actualCount);

    const totalStudents = uncalled.length;
    const kWidth = Math.min(DINH.x1 - DINH.x0, 60 * Math.max(0, totalStudents - 1));
    const startX = DINH.x1 - kWidth;
    const cliffPositions = Array.from({ length: totalStudents }, (_, i) => ({
      x: totalStudents === 1 ? startX : startX + (kWidth * i) / (totalStudents - 1),
      y: totalStudents === 1 || i % 2 ? DINH.yGan : DINH.yXa
    }));

    const flightHeights = shuffle(
      Array.from({ length: totalStudents }, (_, i) => 150 + (490 * (i + randRange(rng, 0.15, 0.85))) / totalStudents),
      rng
    );
    const shuffledOrder = shuffle(uncalled, rng);
    const nonChosen = shuffle(uncalled.filter(e => !chosenStudents.includes(e)), rng);
    const earlyLandingSet = new Set(nonChosen.slice(0, oLandedTimes.length));

    const specialAssignments = new Map(
      shuffle(nonChosen.filter(e => !earlyLandingSet.has(e)), rng)
        .slice(0, SPECIAL_LANDING.length)
        .map((e, idx) => [e, SPECIAL_LANDING[idx]])
    );

    const members = uncalled.map(name => {
      const orderIdx = shuffledOrder.indexOf(name);
      const cliffPos = cliffPositions[orderIdx];
      const runTime = 3 + randRange(rng, 0, 0.35);
      const isChosen = chosenStudents.includes(name);
      const nonIdx = nonChosen.indexOf(name);
      const special = specialAssignments.get(name);

      let targetLanding;
      if (isChosen) {
        // Losers land closest to the mountain! (Around x: 1300 - 1500)
        const chosenSlot = chosenStudents.indexOf(name);
        targetLanding = { x: 1330 + chosenSlot * 55, y: randRange(rng, 795, 855) };
      } else if (earlyLandingSet.has(name)) {
        targetLanding = { x: 1400 + 45 * nonIdx + randRange(rng, 0, 25), y: randRange(rng, 795, 855) };
      } else if (special) {
        targetLanding = { x: special.x, y: special.y };
      } else {
        targetLanding = { x: randRange(rng, 1640, 2920), y: randRange(rng, 738, 880) };
      }

      let landingTime;
      if (isChosen) {
        landingTime = 22; // Land earliest / closest!
      } else if (earlyLandingSet.has(name)) {
        landingTime = oLandedTimes[nonIdx] || 23.6;
      } else {
        landingTime = randRange(rng, 23.5, 27.5);
      }

      return {
        ten: name,
        mau: Math.abs(hashCode(name)) % 6,
        pha: rng() * Math.PI * 2,
        oHang: orderIdx,
        xDung: cliffPos.x,
        yDung: cliffPos.y,
        tChay: runTime,
        tCat: runTime + 1,
        dx: cliffPos.x - midDinhX + randRange(rng, -60, 60),
        yBay: flightHeights[uncalled.indexOf(name)],
        vTien: randRange(rng, -6, 16),
        aS: randRange(rng, 60, 120),
        wS: (2 * Math.PI) / randRange(rng, 7, 11),
        tNhiet: rng() < 0.3 ? randRange(rng, 7, 15) : -1,
        kieu: flightStyles[Math.floor(rng() * flightStyles.length)],
        tKieu: randRange(rng, 7, 14),
        xDap: targetLanding.x,
        yDap: targetLanding.y,
        noiDap: special?.noi || 'dat',
        tDap: landingTime,
        lan: !isChosen && rng() < 0.22,
        suCo: [],
        va: []
      };
    });

    // Schedule comedic obstacles & incidents
    const numIncidents = members.length < 2 ? 0 : Math.min(members.length, 2 + Math.floor(3 * rng()));
    const incidentPool = shuffle(['set', 'chim', ...Array.from({ length: Math.max(0, numIncidents - 2) }, () => rng() < 0.5 ? 'set' : 'chim')], rng);
    const incidentTargets = [];

    if (numIncidents > 0 && rng() < 0.65) {
      const chosenMember = members.find(m => m.ten === chosenStudents[0]);
      if (chosenMember) incidentTargets.push(chosenMember);
    }
    for (const m of members) {
      if (incidentTargets.length >= numIncidents) break;
      if (!incidentTargets.includes(m)) incidentTargets.push(m);
    }

    incidentTargets.forEach((target, idx) => {
      const type = incidentPool[idx] || 'set';
      target.suCo.push({
        loai: type,
        t: (cEventTimes[idx] || 10) + randRange(rng, 0, 0.6),
        dai: uDurations[type] || 2.5
      });
    });

    // Schedule collapse for someone
    const collapseCand = members.find(m => !incidentTargets.includes(m));
    if (collapseCand) {
      collapseCand.suCo.push({ loai: 'xep', t: 15.6 + randRange(rng, 0, 0.6), dai: uDurations.xep });
    }

    return {
      chon: chosenStudents,
      nhom: members,
      lamLai: isReset
    };
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function getShortDisplayName(fullName) {
    if (!fullName) return '';
    const clean = fullName.normalize('NFC').trim();
    const parts = clean.split(/\s+/);
    if (parts.length <= 1) return clean;
    const lastTwo = parts.slice(-2).join(' ');
    if (lastTwo.length <= 14) return lastTwo;
    return parts[parts.length - 1];
  }

  // =========================================================================
  // 3. CANVAS STAGE RENDERER (CANHLUONDU IMPLEMENTATION)
  // =========================================================================
  class CanhLuonDu {
    constructor(cv, options, nenImg, characterSheets, fxSheet, sanhRound) {
      this.cv = cv;
      this.o = options;
      this.nen = nenImg;
      this.nv = characterSheets;
      this.fx = fxSheet;
      this.sanh = sanhRound;
      this.onMoc = () => {};
      this.luot = null;
      this.t = 0;
      this.tNen = 0;
      this.dung = false;
      this.dpr = 1;
      this.moc = [];

      const ctx = cv.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D');
      this.ctx = ctx;
    }

    static async tao(canvas, sanhRound) {
      const assetBase = '/ey/games/skydive/luon/';
      const loadImage = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Không tải được ảnh ${url}`));
        img.src = url;
      });

      const loadSheet = async (cfg) => {
        const [img, dataResp] = await Promise.all([
          loadImage(assetBase + cfg.image),
          fetch(assetBase + cfg.data)
        ]);
        if (!dataResp.ok) throw new Error('Không tải được dải hoạt cảnh');
        const json = await dataResp.json();
        return { img, frames: json.frames };
      };

      const manifestResp = await fetch(assetBase + 'hoat-canh.json');
      if (!manifestResp.ok) throw new Error('Chưa có cấu hình hoat-canh.json');
      const manifest = await manifestResp.json();

      const [nenImg, characterSheets, fxSheet] = await Promise.all([
        loadImage(assetBase + manifest.nen),
        Promise.all(manifest.characters.map(loadSheet)),
        loadSheet(manifest.fx)
      ]);

      return new CanhLuonDu(canvas, manifest.o, nenImg, characterSheets, fxSheet, sanhRound);
    }

    doiCo(w, h, dpr) {
      this.dpr = dpr;
      this.cv.width = Math.round(w * dpr);
      this.cv.height = Math.round(h * dpr);
    }

    datTamDung(paused) {
      this.dung = paused;
    }

    batDauLuot(round) {
      this.luot = round;
      this.t = 0;
      this.dung = false;
      this.moc = [
        { t: 0.02, ten: 'dem' },
        { t: 1.0, ten: 'dem' },
        { t: 2.0, ten: 'dem' },
        { t: T_NHAY, ten: 'nhay' },
        { t: T_NHAY + 1.7, ten: 'bung' },
        { t: T_THE - 3.2, ten: 'trong' },
        { t: T_THE - 1.4, ten: 'cop' },
        { t: T_THE - 1.2, ten: 'mung' },
        { t: T_THE, ten: 'the' },
        { t: T_THE, ten: 'keng' }
      ];

      for (const m of round.nhom) {
        for (const s of m.suCo) {
          this.moc.push({
            t: s.loai === 'chim' ? s.t - 0.25 : s.t,
            ten: s.loai
          });
        }
      }
    }

    tua() {
      if (this.luot) {
        this.t = Math.max(this.t, T_THE + 0.01);
        this.onMoc('the');
      }
    }

    ve(sheet, frameName, x, y, w, h, angle = 0, alpha = 1) {
      const frame = sheet.frames[frameName];
      if (!frame || alpha <= 0.01) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      if (angle) ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sheet.img, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    khungHinh(dt, viewW, viewH) {
      const delta = Math.min(0.06, Math.max(0, dt));
      if (!this.dung) {
        this.tNen += delta;
        if (this.luot) {
          const prevT = this.t;
          this.t += delta;
          for (const m of this.moc) {
            if (prevT < m.t && this.t >= m.t) {
              this.onMoc(m.ten);
            }
          }
        }
      }

      const ctx = this.ctx;
      const activeGroup = this.luot || this.sanh;
      const curTime = this.luot ? this.t : this.tNen % 2;
      const hudData = { ten: [], chu: [], chop: 0 };

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';

      const positions = activeGroup.nhom.map(m => ({
        e: m,
        p: getCharacterFrameState(m, curTime, true),
        scaleMul: this.phongTo(m, curTime)
      }));

      const cam = getCameraView(activeGroup, curTime, positions.map(p => p.p));
      const camZoom = Math.max(
        Math.max(viewW / THE_GIOI.rong, viewH / THE_GIOI.cao),
        Math.min((2.2 * viewH) / THE_GIOI.cao, viewW / (cam.x1 - cam.x0), viewH / (cam.y1 - cam.y0))
      );
      const camX = Math.max(0, Math.min(THE_GIOI.rong - viewW / camZoom, (cam.x0 + cam.x1) / 2 - viewW / camZoom / 2));
      const camY = Math.max(0, Math.min(THE_GIOI.cao - viewH / camZoom, (cam.y0 + cam.y1) / 2 - viewH / camZoom / 2));

      // 1. Draw 2964x1024 Background
      ctx.drawImage(this.nen, -camX * camZoom, -camY * camZoom, THE_GIOI.rong * camZoom, THE_GIOI.cao * camZoom);

      const toScreenX = x => (x - camX) * camZoom;
      const toScreenY = y => (y - camY) * camZoom;

      const numMembers = activeGroup.nhom.length;
      const xVals = activeGroup.nhom.map(e => e.xDung);
      const baseSpan = Math.max(30, Math.min(50, 1.9 * (numMembers > 1 ? Math.max(10, (Math.max(...xVals) - Math.min(...xVals)) / (numMembers - 1)) : (DINH.x1 - DINH.x0) / 10))) * camZoom;
      const charH = baseSpan / this.o.than;
      const charW = charH * (this.o.w / this.o.h);

      positions.sort((a, b) => a.scaleMul - b.scaleMul || !!a.p.bay - !!b.p.bay || a.p.y - b.p.y);

      const nameTags = [];

      // 2. Draw Characters & Effects
      for (const item of positions) {
        const m = item.e;
        const p = item.p;
        const sX = toScreenX(p.x);
        const sY = toScreenY(p.y);

        const cliffScale = 0.94 + 0.08 * clamp01((m.yDung - DINH.yXa) / (DINH.yGan - DINH.yXa));
        const landingScale = 0.3 + 0.32 * clamp01((m.yDap - 520) / 380);
        const landFactor = clamp01((curTime - (m.tDap - T_HA)) / T_HA);
        const cliffFactor = 1 + (cliffScale - 1) * (1 - clamp01((curTime - m.tCat) / 1.5));
        const finalScale = (curTime < m.tCat ? cliffScale : p.bay ? cliffFactor + (landingScale - cliffFactor) * landFactor : landingScale) * item.scaleMul;

        const drawW = charW * finalScale;
        const drawH = charH * finalScale;

        // Ground shadow
        if (!p.bay && !p.nuoc) {
          if (curTime >= m.tDap) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = '#c9dc7a';
            ctx.beginPath();
            ctx.ellipse(sX - 0.15 * baseSpan * finalScale, sY, 0.75 * baseSpan * finalScale, 0.16 * baseSpan * finalScale, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
          }
          ctx.save();
          ctx.fillStyle = '#1f2a12';
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.ellipse(sX + 0.32 * baseSpan * finalScale, sY + 0.01 * baseSpan * finalScale, 0.62 * baseSpan * finalScale, 0.1 * baseSpan * finalScale, -0.06, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.ellipse(sX, sY, 0.3 * baseSpan * finalScale, 0.06 * baseSpan * finalScale, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
        }

        const charSheet = this.nv[m.mau % 6];
        const frameInfo = charSheet.frames[p.khung];
        const anchorY = sY - drawH * ((!p.bay && frameInfo?.chan ? frameInfo.chan : this.o.chan) - 0.5);

        // Pre-draw effects (e.g. lightning strike from sky)
        this.veTruoc(m, curTime, sX, sY, drawH);

        const isChosenLoser = !!this.luot && activeGroup.chon.includes(m.ten) && curTime >= T_THE - 1.4;
        const frameToDraw = isChosenLoser ? 'troll-11' : p.khung;
        const isBurned = !p.bay && isCharred(m, curTime);

        if (isBurned) ctx.filter = 'brightness(0.32) saturate(0.35)';

        if (p.nuoc) {
          this.veNuoc(m, curTime, sX, sY, drawW, drawH, anchorY, frameToDraw);
        } else {
          this.ve(charSheet, frameToDraw, sX, anchorY, drawW, drawH, p.lac);
        }

        if (isBurned) ctx.filter = 'none';

        if (!p.bay && !p.nuoc) {
          this.veCoChan(m, curTime, sX, sY, baseSpan * finalScale);
        }

        // Bird perched on head
        if (!p.bay && hasBirdHit(m, curTime)) {
          this.ve(this.fx, '1', sX + 0.02 * drawH, anchorY - 0.26 * drawH + Math.sin(5 * curTime) * drawH * 0.015, 0.24 * drawH, 0.22 * drawH, 0.1 * Math.sin(3 * curTime));
        }

        // Post-draw effects (e.g. dust, birds flying away)
        this.veSau(m, curTime, sX, sY, drawH);

        // Name tag positioning
        nameTags.push({
          id: m.ten,
          ten: getShortDisplayName(m.ten),
          x: sX,
          y: curTime < m.tCat ? toScreenY(DINH.yGan) : sY,
          chon: isChosenLoser,
          nguy: !!p.suCo,
          mo: +(sX > -40 && sX < viewW + 40 && sY > 0 && sY < viewH + 20),
          rongToiDa: 400,
          nho: curTime < m.tCat,
          tang: curTime < m.tCat ? m.oHang % (numMembers > 30 ? 4 : 3) : 0
        });

        // Comedic speech / impact balloon
        const eventTextMap = { set: 'XẸT!', chim: 'BỘP!', xep: 'ÚI!' };
        if (p.suCo && curTime - p.suCo.t < 1) {
          hudData.chu.push({
            id: `${m.ten}-${p.suCo.loai}`,
            chu: eventTextMap[p.suCo.loai] || 'ỐI!',
            x: sX + 0.3 * drawH,
            y: Math.max(80, sY - 0.95 * drawH),
            k: curTime - p.suCo.t
          });
        }
        for (const s of m.suCo) {
          if ((s.loai === 'set' || s.loai === 'chim') && curTime >= s.t + 0.35 && curTime < s.t + 2.6) {
            hudData.chu.push({
              id: `${m.ten}-giam-${s.t}`,
              chu: 'GIẢM TỐC ĐỘ!',
              x: sX + 0.1 * drawH,
              y: Math.max(130, sY - 0.35 * drawH),
              k: Math.min(0.99, (curTime - s.t - 0.35) / 2.25),
              kieu: 'giam'
            });
          }
        }
        if (p.va && curTime - p.va.t < 0.8) {
          hudData.chu.push({
            id: `${m.ten}-va-${p.va.t}`,
            chu: p.va.loai === 'dung' ? 'BỐP!' : 'ỐI!',
            x: sX - 0.25 * drawH,
            y: Math.max(80, sY - 0.9 * drawH),
            k: (curTime - p.va.t) / 0.8
          });
        }
        if (!p.bay && curTime >= m.tDap && curTime - m.tDap < 1.2 && m.noiDap !== 'dat') {
          const landWord = { mai: 'TRÊN NÓC NHÀ!', rom: 'ĐỐNG RƠM!', ho: 'TÕM!' }[m.noiDap];
          hudData.chu.push({
            id: `${m.ten}-dap`,
            chu: landWord || 'BỘP!',
            x: sX,
            y: Math.max(80, sY - 0.9 * drawH),
            k: (curTime - m.tDap) / 1.2
          });
        }
        if (isChosenLoser && curTime < T_THE) {
          hudData.chu.push({
            id: 've-nhat',
            chu: 'BAY GẦN NHẤT, THUA RỒI!',
            x: sX,
            y: Math.max(90, sY - 1.6 * drawH),
            k: Math.min(0.79, (curTime - T_THE + 1.4) / 1.6)
          });
        }
      }

      // Countdown callouts
      if (this.luot && curTime < T_NHAY + 0.9) {
        hudData.chu.push({
          id: 'luat',
          chu: 'AI BAY GẦN NHẤT LÀ THUA!',
          x: viewW / 2,
          y: Math.max(190, 0.36 * viewH),
          k: 0.3
        });

        const intSec = Math.floor(curTime);
        const subSec = curTime - intSec;
        hudData.chu.push({
          id: `dem-${intSec}`,
          chu: intSec < 3 ? String(3 - intSec) : 'NHẢY!',
          x: viewW / 2,
          y: Math.max(110, 0.2 * viewH),
          k: Math.min(0.99, subSec / (intSec < 3 ? 1 : 0.9)),
          lon: true
        });
      }

      // Lightning screen flash
      for (const item of positions) {
        for (const s of item.e.suCo) {
          if (s.loai === 'set' && curTime >= s.t && curTime < s.t + 0.18) {
            hudData.chop = Math.max(hudData.chop, 0.35 * (1 - (curTime - s.t) / 0.18));
          }
        }
      }

      // Format name tags
      const baseFontSize = viewW < 600 ? 10 : Math.min(15, Math.max(11, viewH / 72));
      hudData.ten = nameTags
        .filter(t => t.mo > 0.08)
        .map(t => {
          const fSize = baseFontSize + (t.chon ? 3 : t.nguy ? 1 : t.nho ? -2 : 0);
          const pillW = Math.max(28, Math.min(t.chon ? 260 : t.rongToiDa, t.ten.length * fSize * 0.56 + 12));
          const pillH = fSize + 7;
          const posX = Math.max(8 + pillW / 2, Math.min(viewW - 8 - pillW / 2, t.x));
          const posY = Math.min(viewH - 8 - pillH, t.y + 3 + (t.tang || 0) * (pillH + 2));
          return {
            ...t,
            x: posX,
            y: posY,
            coChu: fSize
          };
        });

      return hudData;
    }

    veCoChan(m, t, sX, sY, span) {
      const ctx = this.ctx;
      ctx.save();
      const grad = ctx.createLinearGradient(0, sY - 0.16 * span, 0, sY + 0.02 * span);
      grad.addColorStop(0, 'rgba(31,42,18,0)');
      grad.addColorStop(1, 'rgba(31,42,18,0.4)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(sX, sY - 0.05 * span, 0.34 * span, 0.12 * span, 0, 0, 2 * Math.PI);
      ctx.fill();

      const grassColors = ['#4f7d22', '#6b9e2c', '#87b83a', '#a3cc4f'];
      const gWidth = 0.62 * span;
      const sway = 0.08 * Math.sin(1.7 * t + m.pha);
      ctx.lineCap = 'round';
      for (let i = 0; i < 11; i++) {
        const n1 = Math.abs(Math.sin(13.7 * m.pha + 7.31 * i));
        const n2 = Math.abs(Math.sin(5.3 * m.pha + 3.17 * i));
        const uX = sX - gWidth / 2 + (gWidth * (i + 0.6 * n1)) / 11;
        const bladeH = span * (0.07 + 0.09 * n2);
        const fAng = (n1 - 0.5) * 0.7 + sway;
        ctx.strokeStyle = grassColors[(i + Math.floor(4 * n2)) % 4];
        ctx.lineWidth = Math.max(1, 0.022 * span);
        ctx.beginPath();
        ctx.moveTo(uX, sY + 0.015 * span);
        ctx.quadraticCurveTo(uX + Math.sin(fAng) * bladeH * 0.3, sY - 0.6 * bladeH, uX + Math.sin(fAng) * bladeH, sY - bladeH);
        ctx.stroke();
      }
      ctx.restore();
    }

    veNuoc(m, t, sX, sY, drawW, drawH, anchorY, frameName) {
      const ctx = this.ctx;
      const waterY = sY - 0.2 * drawH;
      const splashAge = t - m.tDap;

      ctx.save();
      ctx.beginPath();
      ctx.rect(sX - drawW, waterY - 2 * drawH, 2 * drawW, 2 * drawH);
      ctx.clip();
      this.ve(this.nv[m.mau % 6], frameName, sX, anchorY + 0.12 * drawH, drawW, drawH, 0.06 * Math.sin(2.4 * t + m.pha));
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(1, 0.012 * drawH);
      for (let i = 0; i < 3; i++) {
        const ringProg = (0.7 * t + i / 3) % 1;
        ctx.globalAlpha = 0.8 * (1 - ringProg);
        ctx.beginPath();
        ctx.ellipse(sX, waterY, drawW * (0.2 + 0.35 * ringProg), drawH * (0.03 + 0.05 * ringProg), 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      if (splashAge < 0.9) {
        ctx.fillStyle = 'rgba(225,245,255,0.95)';
        for (let i = 0; i < 9; i++) {
          const ang = Math.PI * (0.1 + (0.8 * i) / 8);
          const dropDist = (0.45 * drawH * splashAge) / 0.9;
          ctx.globalAlpha = 1 - splashAge / 0.9;
          ctx.beginPath();
          ctx.arc(sX + Math.cos(ang) * dropDist * 1.2, waterY - Math.sin(ang) * dropDist + 0.5 * drawH * Math.pow(splashAge / 0.9, 2), 0.025 * drawH, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    phongTo(m, t) {
      let zoom = 1;
      for (const s of m.suCo) {
        const pIn = clamp01((t - s.t + 0.8) / 0.5);
        const pOut = 1 - clamp01((t - s.t - s.dai - 0.3) / 0.6);
        zoom = Math.max(zoom, 1 + (s.loai === 'set' || s.loai === 'chim' ? 0.12 : 0.45) * pIn * pOut);
      }
      return zoom;
    }

    veTruoc(m, t, sX, sY, drawH) {
      for (const s of m.suCo) {
        const relT = t - s.t;
        if (s.loai === 'set' && relT > -0.9 && relT < 1.1) {
          const flashAlpha = clamp01((relT + 0.9) / 0.35) * (1 - clamp01((relT - 0.6) / 0.5));
          const topBoltY = Math.max(0.36 * drawH, sY - 1.08 * drawH);
          this.ve(this.fx, '3', sX, topBoltY, 0.95 * drawH, 0.62 * drawH, 0, flashAlpha);
          if (relT >= 0 && relT < 0.42) {
            this.ve(this.fx, Math.floor(20 * relT) % 2 ? '5' : '4', sX, (topBoltY + sY - 0.5 * drawH) / 2, 0.42 * drawH, Math.max(0.3 * drawH, sY - 0.5 * drawH - topBoltY), 0, 0.95);
          }
        }
      }

      if (this.luot && this.luot.chon.includes(m.ten) && t >= T_THE - 1.4) {
        const dtLoss = t - T_THE + 1.4;
        const pulse = 1 + 0.12 * Math.sin(9 * dtLoss);
        this.ve(this.fx, '10', sX, sY - 0.35 * drawH, 0.9 * drawH * pulse, 0.8 * drawH * pulse, 0.6 * dtLoss, 1 - clamp01((dtLoss - 1.8) / 0.8));
      }
    }

    veSau(m, t, sX, sY, drawH) {
      for (const s of m.suCo) {
        const relT = t - s.t;
        if (s.loai === 'chim' && relT > -0.8 && relT < 0) {
          const flightP = (relT + 0.8) / 0.8;
          this.ve(this.fx, String(Math.floor(12 * t) % 3), sX + 1.9 * drawH * (1 - flightP), sY - 0.45 * drawH - 0.35 * drawH * (1 - flightP), 0.4 * drawH, 0.36 * drawH, -0.15);
        }
        if (s.loai === 'set' && relT > 0.6 * s.dai) {
          const smokeProg = (1.4 * relT) % 1;
          this.ve(this.fx, smokeProg < 0.5 ? '6' : '7', sX + 0.12 * drawH, sY - 0.55 * drawH - smokeProg * drawH * 0.4, 0.22 * drawH, 0.2 * drawH, 0, 0.8 * (1 - smokeProg));
        }
      }
      const landOffset = t - m.tDap;
      if (this.luot && landOffset >= 0 && landOffset < 0.7) {
        this.ve(this.fx, landOffset < 0.3 ? '8' : '9', sX, sY - 0.06 * drawH, 0.62 * drawH, 0.32 * drawH, 0, 0.9 * (1 - landOffset / 0.7));
      }
    }

    huy() {
      this.moc = [];
      this.luot = null;
    }
  }

  // =========================================================================
  // 4. MAIN ENTRY POINT & LIFECYCLE (WINDOW.LAUNCHNHAYDUDAOHOANG)
  // =========================================================================
  global.launchNhayDuDaoHoang = function (container, options = {}) {
    const rawRoster = options.classRoster && options.classRoster.length > 0
      ? options.classRoster
      : [
          'Trần Tuấn Minh', 'Nguyễn Gia Bảo', 'Lê Khánh Vy', 'Phạm Quốc Bảo',
          'Hoàng Minh Khôi', 'Vũ Thảo Linh', 'Đặng Tuấn Kiệt', 'Bùi Ngọc Mai',
          'Đỗ Đức Huy', 'Ngô Diệp Anh', 'Dương Gia Hưng', 'Trịnh Hải Đăng',
          'Mai Bảo Trâm', 'Lý Quang Vinh', 'Đoàn Phương Linh', 'Hà Đăng Khoa'
        ];

    const roster = rawRoster.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean);
    const onExit = typeof options.onExit === 'function' ? options.onExit : () => {};

    const calledStudents = new Set();
    let currentRound = 1;
    let selectedStudentCount = 1;
    let gameState = 'tai'; // 'tai' | 'sanh' | 'luot' | 'the' | 'het'
    let isPaused = false;
    let scene = null;
    let animFrameId = 0;
    const audio = new SkydiveAudio();

    container.innerHTML = `
      <div class="nd-shell" style="position: absolute; inset: 0; overflow: hidden; font-family: 'Be Vietnam Pro', system-ui, sans-serif; user-select: none; background: #8ec9e8;">
        <!-- Canvas Viewport -->
        <canvas id="skydive-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block;"></canvas>

        <!-- Dynamic Floating Layers for Name Tags and Speech Callouts -->
        <div id="skydive-layer-ten" class="nd-lop" aria-hidden="true"></div>
        <div id="skydive-layer-chu" class="nd-lop" aria-hidden="true"></div>
        <div id="skydive-flash" class="nd-chop" aria-hidden="true"></div>

        <!-- Top Right Header Controls -->
        <header style="position: absolute; top: 16px; right: 20px; z-index: 50; display: flex; align-items: center; gap: 10px;">
          <button id="btn-skydive-fs" title="Toàn màn hình" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 38px; height: 38px; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            ⛶
          </button>
          <button id="btn-skydive-sound" title="Bật/Tắt âm thanh" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 38px; height: 38px; font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            🔊
          </button>
          <button id="btn-skydive-pause" style="background: rgba(255, 255, 255, 0.95); color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 0 16px; height: 38px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            Tạm dừng
          </button>
          <button id="btn-skydive-exit" style="background: #ffffff; color: #0f172a; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 0 18px; height: 38px; font-size: 13.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.15s;">
            Thoát
          </button>
        </header>

        <!-- Loading Screen (tai) -->
        <div id="skydive-loading" class="nd-tai" style="display: flex;">
          <div class="nd-tai__vong"></div>
          <p>Đang leo lên đỉnh núi…</p>
        </div>

        <!-- Lobby Controls (sanh): Student Count Selector & Start Button -->
        <div id="skydive-lobby" class="nd-sanh" style="display: none;">
          <!-- Count Selector Bar -->
          <div style="display: flex; align-items: center; gap: 8px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 999px; border: 1.5px solid #38bdf8; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
            <span style="color: #f8fafc; font-size: 14px; font-weight: 800; margin-right: 4px;">Số lượng gọi:</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn-skydive-count" data-count="1" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #fde047; background: #ea580c; color: #fff; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 0 10px rgba(253, 224, 71, 0.6); transition: all 0.15s;">1</button>
              <button class="btn-skydive-count" data-count="2" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s;">2</button>
              <button class="btn-skydive-count" data-count="3" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s;">3</button>
              <button class="btn-skydive-count" data-count="4" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s;">4</button>
              <button class="btn-skydive-count" data-count="5" style="width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s;">5</button>
            </div>
          </div>

          <button id="btn-skydive-start" type="button" class="nd-nut nd-nut--lon">
            ▶ Bắt đầu lượn dù
          </button>
        </div>

        <!-- Fast Forward / Key Hint during flight -->
        <div id="skydive-hint" class="nd-goi-y" style="display: none; cursor: pointer;">
          Enter: xem ngay kết quả ⏩
        </div>

        <!-- Result Modal Card (the) -->
        <div id="skydive-card-modal" class="nd-the-nen" style="display: none;">
          <div class="nd-the-khung">
            <div class="nd-the__du" aria-hidden="true">
              <span class="nd-the__nhan">BAY GẦN NHẤT LÀ THUA</span>
            </div>
            <div class="nd-the">
              <div id="skydive-result-names" class="nd-the__ds"></div>
              <div class="nd-the__nut">
                <button id="btn-skydive-next" type="button" class="nd-nut nd-nut--lon">
                  Gọi tiếp
                </button>
              </div>
              <div class="nd-the__co" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <!-- Exhausted Modal (het) -->
        <div id="skydive-exhausted-modal" class="nd-the-nen" style="display: none;">
          <div class="nd-the-khung">
            <div class="nd-the__du" aria-hidden="true">
              <span class="nd-the__nhan">HẾT LƯỢT</span>
            </div>
            <div class="nd-the">
              <div class="nd-the__loi">Tất cả các em trong lớp đã được gọi!</div>
              <div class="nd-the__nut">
                <button id="btn-skydive-reset" type="button" class="nd-nut">
                  Chơi lại từ đầu
                </button>
                <button id="btn-skydive-finish" type="button" class="nd-nut" style="background: #0284c7; border-color: #38bdf8;">
                  Về danh sách
                </button>
              </div>
              <div class="nd-the__co" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <!-- Exit Confirmation Dialog -->
        <div id="skydive-exit-dialog" style="position: absolute; inset: 0; z-index: 95; background: rgba(5, 3, 15, 0.82); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center;">
          <div style="background: #0f172a; border: 2.5px solid #38bdf8; border-radius: 14px; padding: 28px 42px; text-align: center; max-width: 440px; box-shadow: 0 10px 35px rgba(0,0,0,0.85); color: #fff;">
            <div style="font-size: 24px; font-weight: 900; color: #fde047; margin-bottom: 8px;">
              Kết thúc lượn dù?
            </div>
            <div style="font-size: 14.5px; color: #cbd5e1; margin-bottom: 24px;">
              Các em chưa được gọi sẽ chờ ván sau.
            </div>
            <div style="display: flex; justify-content: center; gap: 16px;">
              <button id="btn-exit-cancel" style="background: #334155; color: #ffffff; border: 1.5px solid #64748b; border-radius: 999px; padding: 8px 26px; font-size: 14px; font-weight: 700; cursor: pointer;">
                Chơi tiếp
              </button>
              <button id="btn-exit-confirm" style="background: #ea580c; color: #ffffff; border: 2px solid #fde047; border-radius: 999px; padding: 8px 28px; font-size: 14px; font-weight: 900; cursor: pointer;">
                Kết thúc
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        .nd-shell { background: #8ec9e8; }
        .nd-lop { pointer-events: none; z-index: 20; position: absolute; inset: 0; overflow: hidden; }
        .nd-ten {
          color: #0f172a; white-space: nowrap; box-sizing: border-box; will-change: transform;
          background: rgba(255, 255, 255, 0.9); border: 1.5px solid rgba(14, 116, 144, 0.5);
          border-radius: 7px; justify-content: center; align-items: center; padding: 1px 6px;
          font-size: clamp(11px, 0.95vw, 14px); font-weight: 700; display: flex; position: absolute; top: 0; left: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .nd-ten__chu { white-space: nowrap; display: block; }
        .nd-ten.is-nguy {
          color: #9f1239; background: #fff1f2; border-color: #e11d48;
          font-size: clamp(14px, 1.25vw, 21px); animation: 0.85s ease-in-out infinite nd-tim;
        }
        .nd-ten.is-chon {
          color: #fff; background: #087f86; border-color: #fde047;
          font-size: clamp(16px, 1.5vw, 26px); animation: none;
        }
        @keyframes nd-tim { 0%, 100% { box-shadow: 0 0 0 rgba(225, 29, 72, 0.5); } 30% { box-shadow: 0 0 0 7px rgba(225, 29, 72, 0); } }
        .nd-chu {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          color: #fde047; -webkit-text-stroke: 3px #7c2d12; paint-order: stroke fill;
          text-shadow: 0 5px #7c2d12; white-space: nowrap; will-change: transform, opacity;
          font-size: clamp(22px, 2.4vw, 38px); font-weight: 900; position: absolute; top: 0; left: 0;
        }
        .nd-chu--giam {
          color: #fff; -webkit-text-stroke: 0; text-shadow: none;
          background: #dc2626; border: 3px solid #fff; border-radius: 999px;
          padding: 2px 12px; font-size: clamp(16px, 1.6vw, 26px); box-shadow: 0 4px #7f1d1d;
        }
        .nd-chu--lon {
          -webkit-text-stroke: 5px #7c2d12; text-shadow: 0 8px #7c2d12;
          font-size: clamp(56px, 8vw, 120px);
        }
        .nd-chop { opacity: 0; pointer-events: none; z-index: 25; background: #f8fbff; position: absolute; inset: 0; }
        .nd-tai {
          z-index: 30; color: #083344; text-align: center; background: #7cc3e6;
          flex-direction: column; justify-content: center; align-items: center; gap: 16px;
          padding: 24px; font-size: 20px; font-weight: 800; display: flex; position: absolute; inset: 0;
        }
        .nd-tai__vong {
          border: 6px solid rgba(8, 51, 68, 0.2); border-top-color: #083344;
          border-radius: 50%; width: 54px; height: 54px; animation: 0.9s linear infinite nd-quay;
        }
        @keyframes nd-quay { to { transform: rotate(360deg); } }
        .nd-sanh {
          z-index: 30; pointer-events: none; justify-content: flex-end;
          align-items: center; padding-bottom: 28px; display: flex; position: absolute; inset: 0;
          flex-direction: column; gap: 14px;
        }
        .nd-sanh > * { pointer-events: auto; }
        .nd-nut {
          appearance: none; cursor: pointer; color: #fff; background: #ea580c;
          border: 3px solid #fde047; border-radius: 18px; padding: 12px 34px;
          font-size: clamp(17px, 1.5vw, 24px); font-weight: 900; transition: transform 0.12s;
          box-shadow: 0 6px #7c2d12; text-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
        .nd-nut:hover { transform: translateY(-2px); }
        .nd-nut:active { transform: translateY(4px); box-shadow: 0 2px #7c2d12; }
        .nd-nut--lon { padding: 14px 56px; font-size: clamp(20px, 1.8vw, 28px); border-radius: 999px; }
        .nd-goi-y {
          z-index: 30; color: #e2e8f0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
          border-radius: 999px; padding: 6px 16px; font-size: 13.5px; font-weight: 700;
          position: absolute; bottom: 16px; right: 20px; transition: transform 0.15s;
        }
        .nd-goi-y:hover { transform: scale(1.05); }
        .nd-the-nen {
          z-index: 40; background: radial-gradient(rgba(3, 37, 58, 0.4), rgba(3, 37, 58, 0.88));
          backdrop-filter: blur(4px); justify-content: center; align-items: center;
          padding: 16px; display: flex; position: absolute; inset: 0;
        }
        .nd-the-khung { flex-direction: column; align-items: center; width: min(820px, 92vw); display: flex; animation: dropCard 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        @keyframes dropCard { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .nd-the__du {
          z-index: 1; aspect-ratio: 3.4; transform-origin: 50% 100%;
          background: repeating-linear-gradient(90deg, #f97316 0 12.5%, #fde68a 12.5% 25%);
          border: 5px solid #7c2d12; border-radius: 50% 50% 18% 18%/100% 100% 22% 22%;
          justify-content: center; align-items: flex-end; width: min(440px, 78%);
          padding-bottom: 5%; animation: 3.2s ease-in-out infinite nd-lac; display: flex; position: relative;
          box-shadow: inset 0 -12px rgba(124, 45, 18, 0.2), 0 6px rgba(124, 45, 18, 0.25);
        }
        .nd-the__du:before, .nd-the__du:after { content: ""; background: #7c2d12; border-radius: 2px; width: 3px; height: 32px; position: absolute; top: 92%; }
        .nd-the__du:before { transform-origin: top; left: 14%; transform: rotate(-16deg); }
        .nd-the__du:after { transform-origin: top; right: 14%; transform: rotate(16deg); }
        @keyframes nd-lac { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        .nd-the__nhan {
          color: #fff7ed; letter-spacing: 0.1em; white-space: nowrap; background: #b91c1c;
          border: 3px solid #fffbeb; border-radius: 999px; padding: 6px 20px;
          font-size: clamp(13px, 1.2vw, 18px); font-weight: 900; box-shadow: 0 3px #7f1d1d;
        }
        .nd-the {
          color: #0f172a; text-align: center; background: linear-gradient(#e0f2fe 0%, #fffbeb 46%);
          border: 5px solid #0e7490; border-radius: 32px; width: 100%; margin-top: 20px;
          padding: 24px 28px 52px; position: relative; overflow: hidden;
          box-shadow: 0 10px #083344, 0 24px 56px rgba(2, 6, 23, 0.5);
        }
        .nd-the__ds { flex-direction: column; align-items: center; gap: 4px; display: flex; }
        .nd-the__ten {
          color: #b91c1c; white-space: nowrap; max-width: 100%; font-weight: 900; line-height: 1.2;
          font-size: clamp(26px, 3.5vw, 44px); text-shadow: 0 4px #fecaca, 0 0 18px rgba(255, 255, 255, 0.9);
          font-family: 'Times New Roman', 'Be Vietnam Pro', serif;
        }
        .nd-the__loi { color: #155e75; margin-top: 10px; font-size: clamp(18px, 1.7vw, 24px); font-weight: 800; }
        .nd-the__nut { flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 20px; display: flex; }
        .nd-the__co {
          pointer-events: none; background: radial-gradient(19px 13px at 19px 15px, #a3be60 96%, transparent 100%) 0 0/38px 18px repeat-x, linear-gradient(#a3be60, #7e9c47) 0 14px/100% 16px no-repeat;
          height: 30px; position: absolute; bottom: 0; left: 0; right: 0;
        }
      </style>
    `;

    const canvas = container.querySelector('#skydive-canvas');
    const layerTen = container.querySelector('#skydive-layer-ten');
    const layerChu = container.querySelector('#skydive-layer-chu');
    const flashEl = container.querySelector('#skydive-flash');

    const btnFs = container.querySelector('#btn-skydive-fs');
    const btnSound = container.querySelector('#btn-skydive-sound');
    const btnPause = container.querySelector('#btn-skydive-pause');
    const btnExit = container.querySelector('#btn-skydive-exit');

    const loadingEl = container.querySelector('#skydive-loading');
    const lobbyEl = container.querySelector('#skydive-lobby');
    const btnStart = container.querySelector('#btn-skydive-start');
    const countBtns = container.querySelectorAll('.btn-skydive-count');

    const hintEl = container.querySelector('#skydive-hint');
    const cardModal = container.querySelector('#skydive-card-modal');
    const resultNamesEl = container.querySelector('#skydive-result-names');
    const btnNext = container.querySelector('#btn-skydive-next');

    const exhaustedModal = container.querySelector('#skydive-exhausted-modal');
    const btnReset = container.querySelector('#btn-skydive-reset');
    const btnFinish = container.querySelector('#btn-skydive-finish');

    const exitDialog = container.querySelector('#skydive-exit-dialog');
    const btnExitCancel = container.querySelector('#btn-exit-cancel');
    const btnExitConfirm = container.querySelector('#btn-exit-confirm');

    // Controls Handling
    btnSound.onclick = () => {
      audio.enabled = !audio.enabled;
      btnSound.textContent = audio.enabled ? '🔊' : '🔇';
      if (!audio.enabled) audio.tatNen();
      else if (gameState === 'luot') audio.batNen();
    };

    btnFs.onclick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    };

    function togglePause() {
      if (gameState !== 'luot') return;
      isPaused = !isPaused;
      if (scene) scene.datTamDung(isPaused);
      btnPause.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
      btnPause.style.background = isPaused ? '#8b5cf6' : 'rgba(255, 255, 255, 0.95)';
      btnPause.style.color = isPaused ? '#ffffff' : '#0f172a';
      if (isPaused) audio.tatNen();
      else audio.batNen();
    }
    btnPause.onclick = togglePause;

    btnExit.onclick = () => {
      exitDialog.style.display = 'flex';
    };
    btnExitCancel.onclick = () => {
      exitDialog.style.display = 'none';
    };
    btnExitConfirm.onclick = () => {
      exitDialog.style.display = 'none';
      cleanup();
      onExit();
    };

    // Student Count Selector (1-2-3-4-5)
    countBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedStudentCount = parseInt(btn.dataset.count, 10) || 1;
        countBtns.forEach(b => {
          const isActive = parseInt(b.dataset.count, 10) === selectedStudentCount;
          b.style.background = isActive ? '#ea580c' : 'rgba(255,255,255,0.15)';
          b.style.border = isActive ? '1.5px solid #fde047' : '1.5px solid rgba(255,255,255,0.4)';
          b.style.boxShadow = isActive ? '0 0 10px rgba(253, 224, 71, 0.6)' : 'none';
          b.style.fontWeight = isActive ? '900' : '700';
        });
      };
    });

    // Keyboard Shortcuts
    function onKeyDown(e) {
      if (e.code === 'Space') {
        if (gameState === 'sanh') {
          e.preventDefault();
          startRound();
        } else if (gameState === 'luot') {
          e.preventDefault();
          togglePause();
        } else if (gameState === 'the') {
          e.preventDefault();
          callNext();
        }
      } else if (e.code === 'Enter') {
        if (gameState === 'luot') {
          e.preventDefault();
          fastForward();
        } else if (gameState === 'the') {
          e.preventDefault();
          callNext();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);

    // Fast forward button click
    hintEl.onclick = fastForward;

    function fastForward() {
      if (gameState === 'luot' && scene) {
        scene.tua();
      }
    }

    // Start Round
    function startRound() {
      const round = createRound(roster, calledStudents, new Set(), Math.random, selectedStudentCount);
      if (!round) {
        gameState = 'het';
        exhaustedModal.style.display = 'flex';
        return;
      }

      gameState = 'luot';
      isPaused = false;
      lobbyEl.style.display = 'none';
      btnPause.style.display = 'flex';
      btnPause.textContent = 'Tạm dừng';
      btnPause.style.background = 'rgba(255, 255, 255, 0.95)';
      btnPause.style.color = '#0f172a';
      hintEl.style.display = 'block';

      audio.c();
      audio.batNen();

      scene.batDauLuot(round);
    }

    // Trigger next round seamlessly (Matches Frame 0058s)
    function callNext() {
      cardModal.style.display = 'none';
      if (scene && scene.luot) {
        scene.luot.chon.forEach(name => calledStudents.add(name));
      }
      currentRound++;

      // Check if all called
      const remaining = roster.filter(name => !calledStudents.has(name));
      if (remaining.length === 0) {
        audio.tatNen();
        gameState = 'het';
        exhaustedModal.style.display = 'flex';
        return;
      }

      startRound();
    }

    btnStart.onclick = startRound;
    btnNext.onclick = callNext;

    btnReset.onclick = () => {
      exhaustedModal.style.display = 'none';
      calledStudents.clear();
      currentRound = 1;
      gameState = 'sanh';
      lobbyEl.style.display = 'flex';
    };
    btnFinish.onclick = () => {
      exhaustedModal.style.display = 'none';
      cleanup();
      onExit();
    };

    // DOM Overlays Update
    function renderDomHud(hud) {
      if (!hud) return;

      // 1. Floating Name Tags
      const activeIds = new Set();
      for (const t of hud.ten) {
        activeIds.add(t.id);
        let el = layerTen.querySelector(`[data-id="${CSS.escape(t.id)}"]`);
        if (!el) {
          el = document.createElement('div');
          el.className = 'nd-ten';
          el.dataset.id = t.id;
          const span = document.createElement('span');
          span.className = 'nd-ten__chu';
          span.textContent = t.ten;
          el.appendChild(span);
          layerTen.appendChild(el);
        }
        el.classList.toggle('is-nguy', t.nguy);
        el.classList.toggle('is-chon', t.chon);
        el.style.opacity = t.mo.toFixed(2);
        el.style.fontSize = `${t.coChu}px`;
        el.style.transform = `translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px) translate(-50%, 0)`;
      }
      for (const el of Array.from(layerTen.children)) {
        if (!activeIds.has(el.dataset.id)) el.remove();
      }

      // 2. Comedic Speech Callouts & Countdowns
      const activeTextIds = new Set();
      for (const c of hud.chu) {
        activeTextIds.add(c.id);
        let el = layerChu.querySelector(`[data-id="${CSS.escape(c.id)}"]`);
        if (!el) {
          el = document.createElement('div');
          el.className = c.lon ? 'nd-chu nd-chu--lon' : c.kieu === 'giam' ? 'nd-chu nd-chu--giam' : 'nd-chu';
          el.dataset.id = c.id;
          el.textContent = c.chu;
          layerChu.appendChild(el);
        }
        const scale = c.k < 0.15 ? 0.4 + (c.k / 0.15) * 0.8 : 1.2 - Math.min(0.2, (c.k - 0.15) * 0.4);
        el.style.opacity = String(c.k > 0.8 ? (1 - c.k) / 0.2 : 1);
        el.style.transform = `translate(${c.x.toFixed(1)}px, ${(c.y - 40 * c.k).toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(3)}) rotate(-6deg)`;
      }
      for (const el of Array.from(layerChu.children)) {
        if (!activeTextIds.has(el.dataset.id)) el.remove();
      }

      // 3. Lightning Flash
      flashEl.style.opacity = hud.chop.toFixed(3);
    }

    // Resize Handler
    function onResize() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (scene) scene.doiCo(w, h, dpr);
    }
    window.addEventListener('resize', onResize);

    // Initialize Canvas & Game Scene
    (async () => {
      try {
        const sanhRound = createRound(roster, calledStudents, new Set(), Math.random, 1);
        scene = await CanhLuonDu.tao(canvas, sanhRound);
        onResize();

        scene.onMoc = (marker) => {
          if (marker === 'the') {
            audio.tatNen();
            gameState = 'the';
            hintEl.style.display = 'none';
            btnPause.style.display = 'none';

            const chosen = scene.luot ? scene.luot.chon : [];
            resultNamesEl.innerHTML = chosen.map(name => `
              <div class="nd-the__ten">
                ${name}
              </div>
            `).join('');

            cardModal.style.display = 'flex';
          } else {
            audio.phat(marker);
          }
        };

        loadingEl.style.display = 'none';
        lobbyEl.style.display = 'flex';
        gameState = 'sanh';

        // Render loop
        let lastTime = performance.now();
        const renderLoop = (now) => {
          animFrameId = requestAnimationFrame(renderLoop);
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          if (scene) {
            const hud = scene.khungHinh(dt, container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
            renderDomHud(hud);
          }
        };
        animFrameId = requestAnimationFrame(renderLoop);
      } catch (err) {
        console.error('Lỗi khởi tạo Nhảy Dù Đảo Hoang:', err);
        loadingEl.innerHTML = '<p style="color:#ef4444;">Không thể tải tài nguyên lượn dù. Vui lòng tải lại trang.</p>';
      }
    })();

    function cleanup() {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      audio.tatNen();
      if (scene) scene.huy();
      scene = null;
      container.innerHTML = '';
      if (window.__currentSkydiveInstance === instance) {
        window.__currentSkydiveInstance = null;
      }
    }

    const instance = {
      cleanup,
      startRound,
      fastForward,
      callNext,
      setCount: (n) => {
        selectedStudentCount = n;
        countBtns.forEach(b => {
          const isActive = parseInt(b.dataset.count, 10) === n;
          b.style.background = isActive ? '#ea580c' : 'rgba(255,255,255,0.15)';
        });
      },
      getState: () => gameState,
      getScene: () => scene
    };

    window.__currentSkydiveInstance = instance;
    return cleanup;
  };

  // Aliases
  global.launchSkydive = global.launchNhayDuDaoHoang;
  global.launchLuonDuDinhNui = global.launchNhayDuDaoHoang;

})(typeof window !== 'undefined' ? window : this);
