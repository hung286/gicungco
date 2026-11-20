// Mực Ơi, Đừng Dậy! - Official Engine ported for EY Portal / MHEdu
// Designed by Thầy Nguyễn Mạnh Hùng - MHEdu

(function() {
  const ASSET_BASE = '/ey/games/dog-chase';
  const u = ["nam1", "nam2", "nam3", "nu1", "nu2", "nu3"];
  const y = {
    tenGoiCua: function(goi, name) {
      if (typeof goi === 'object' && goi && name && goi[name]) return goi[name];
      const target = typeof name === 'string' ? name : (typeof goi === 'string' ? goi : '');
      if (!target) return 'Em';
      const p = target.trim().split(/\s+/);
      return p[p.length - 1] || target;
    }
  };
  
  function c(arr, rng = Math.random) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))];
  }
  
  function l(arr, rng = Math.random) {
    let res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      let j = Math.floor(rng() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }
  
  const v = ["Cây ơi cứu tui!","Mẹ ơi con sợ!","Tui ôm cây rồi nha!","Cây là của tui!"];
  const M = 60 / 124;
  const T = [
    {lech:48,nguoi:1,cho:3,phach:1},{lech:0,nguoi:0,cho:0,phach:1},
    {lech:-12,nguoi:2,cho:2,phach:.5,cha:"Cha"},{lech:-24,nguoi:0,cho:0,phach:.5,cha:"cha"},
    {lech:-36,nguoi:2,cho:2,phach:1,cha:"cha!"},{lech:-84,nguoi:3,cho:1,phach:1},
    {lech:-36,nguoi:0,cho:0,phach:1},{lech:-24,nguoi:2,cho:2,phach:.5,cha:"Cha"},
    {lech:-12,nguoi:0,cho:0,phach:.5,cha:"cha"},{lech:0,nguoi:2,cho:2,phach:1,cha:"cha!"}
  ];
  const k = ["Ơ hụt!","Lại hụt!","Trơn như lươn!","Đứng lại coi!"];
  const C = ["Hết đường rồi!","Ơ ngõ cụt!","Lách lách lách!","Quay lại mau!"];
  const D = T.reduce((t,h)=>t+h.phach,0)*M;
  const w = ["Mẹ ơiii!","Dép của tui!","Em chưa học bài!","Chạy đi chờ chi!","Cứu với!","Ổ bánh mì của tui!","Sao lại là tui?!"];
  const N = ["#ef4444","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899","#facc15"];
  const x = { nhacRonRen: 'nhacRonRen', nhacDuoi: 'nhacDuoi', nhacChaCha: 'nhacChaCha' };

  // Audio Synthesizer Class
  class MucAudio {
    constructor() {
      this.ctx = null;
      this.ra = null;
      this.noiseBuf = null;
      this.lanDepCuoi = 0;
      this.musicInterval = null;
      this.currentMusic = null;
      this.enabled = true;
    }

    getCtx() {
      if (!this.enabled) return null;
      try {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return null;
          this.ctx = new AudioContextClass();
          const masterGain = this.ctx.createGain();
          masterGain.gain.value = 1.4;
          const comp = this.ctx.createDynamicsCompressor();
          comp.threshold.value = -12;
          comp.ratio.value = 6;
          comp.attack.value = 0.003;
          comp.release.value = 0.15;
          masterGain.connect(comp);
          comp.connect(this.ctx.destination);
          this.ra = masterGain;
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return this.ctx;
      } catch (e) {
        return null;
      }
    }

    getNoiseBuffer(ctx) {
      if (!this.noiseBuf) {
        const len = Math.floor(0.8 * ctx.sampleRate);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = 2 * Math.random() - 1;
        this.noiseBuf = buf;
      }
      return this.noiseBuf;
    }

    tone(t) {
      const h = this.getCtx();
      if (!h) return;
      const start = h.currentTime + (t.delay ?? 0);
      const osc = h.createOscillator();
      const gain = h.createGain();
      osc.type = t.type ?? "sine";
      osc.frequency.setValueAtTime(Math.max(10, t.freq), start);
      if (t.to !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, t.to), start + t.dur);
      }
      if (t.rung) {
        const lfo = h.createOscillator();
        const lfoGain = h.createGain();
        lfo.frequency.value = t.rung;
        lfoGain.gain.value = 0.12 * t.freq;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(start);
        lfo.stop(start + t.dur + 0.02);
      }
      const att = t.attack ?? 0.008;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, t.gain), start + att);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
      osc.connect(gain);
      gain.connect(this.ra);
      osc.start(start);
      osc.stop(start + t.dur + 0.02);
    }

    noise(t) {
      const h = this.getCtx();
      if (!h) return;
      const start = h.currentTime + (t.delay ?? 0);
      const src = h.createBufferSource();
      src.buffer = this.getNoiseBuffer(h);
      src.loop = true;
      const filter = h.createBiquadFilter();
      filter.type = t.type ?? "bandpass";
      filter.frequency.setValueAtTime(t.freq, start);
      if (t.to !== undefined) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(30, t.to), start + t.dur);
      }
      filter.Q.value = t.q ?? 1.4;
      const gain = h.createGain();
      const att = t.attack ?? 0.005;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, t.gain), start + att);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ra);
      src.start(start, 0.25 * Math.random());
      src.stop(start + t.dur + 0.02);
    }

    tep(name, vol = 1, delay = 0) {
      // Synthesized fallbacks
    }

    ngay() {
      // Sleeping dog snore
      this.noise({ dur: 0.9, freq: 110, q: 3.5, gain: 0.22, attack: 0.35 });
      this.tone({ freq: 45, to: 55, dur: 0.9, gain: 0.18, type: "sine", attack: 0.3 });
    }

    chit() {
      // Mouse / branch snap
      this.tone({ freq: 2800, to: 1600, dur: 0.06, gain: 0.25, type: "triangle" });
      this.noise({ dur: 0.04, freq: 3500, q: 2, gain: 0.15 });
    }

    hatXi() {
      // Sneeze!
      this.tone({ freq: 650, to: 900, dur: 0.12, gain: 0.22 });
      this.noise({ dur: 0.22, freq: 1400, q: 1.2, gain: 0.45, attack: 0.02, delay: 0.1 });
    }

    bup() {
      this.tone({ freq: 900, to: 180, dur: 0.09, gain: 0.4 });
      this.noise({ dur: 0.06, freq: 2500, q: 1, gain: 0.15 });
    }

    gamGu(t = 2.2) {
      // Dog growling
      this.tone({ freq: 62, to: 78, dur: t, gain: 0.5, type: "sawtooth", attack: 0.4, rung: 24 });
      this.tone({ freq: 93, to: 110, dur: t, gain: 0.22, type: "sawtooth", attack: 0.45, rung: 19 });
      this.tone({ freq: 124, to: 150, dur: t, gain: 0.18, type: "square", attack: 0.5, rung: 31 });
      this.noise({ dur: t, freq: 320, q: 3, gain: 0.22, attack: 0.5 });
    }

    tromDon(t = 2.2) {
      // Rising tension
      let steps = Math.floor(t / 0.11);
      for (let i = 0; i < steps; i++) {
        let gain = 0.08 + (0.3 * i) / steps;
        this.noise({ dur: 0.08, freq: 180, q: 1.2, gain: gain, type: "lowpass", delay: 0.11 * i });
        this.tone({ freq: 90, to: 50, dur: 0.08, gain: 1.2 * gain, delay: 0.11 * i });
      }
    }

    gau() {
      // Dog bark!
      this.tone({ freq: 140, to: 65, dur: 0.22, gain: 0.65, type: "sawtooth" });
      this.tone({ freq: 85, to: 45, dur: 0.35, gain: 0.5, delay: 0.02 });
      this.noise({ dur: 0.18, freq: 650, q: 2, gain: 0.4, attack: 0.01 });
    }

    lepXep() {
      // Footsteps
      let now = performance.now();
      if (now - this.lanDepCuoi < 130) return;
      this.lanDepCuoi = now;
      this.noise({ dur: 0.05, freq: 500 + 400 * Math.random(), q: 1.5, gain: 0.18 });
      this.tone({ freq: 180, to: 90, dur: 0.04, gain: 0.12 });
    }

    vut() {
      // Swoosh / sprint dash
      this.noise({ dur: 0.14, freq: 1200, to: 300, q: 1.5, gain: 0.28 });
    }

    kit() {
      // Braking skid
      this.tone({ freq: 1600, to: 600, dur: 0.18, gain: 0.3, type: "sawtooth" });
      this.noise({ dur: 0.16, freq: 2200, to: 900, q: 2, gain: 0.25 });
    }

    ha() {
      // Dog panting
      this.tone({ freq: 380, to: 720, dur: 0.25, gain: 0.3, type: "triangle" });
      this.noise({ dur: 0.15, freq: 1100, q: 2, gain: 0.15 });
    }

    vot() {
      this.noise({ dur: 0.16, freq: 950, to: 250, q: 1.8, gain: 0.32 });
    }

    hit() {
      // Sniff
      this.noise({ dur: 0.07, freq: 1200, q: 3, gain: 0.2 });
      this.noise({ dur: 0.07, freq: 1500, q: 3, gain: 0.2, delay: 0.09 });
    }

    timDap() {
      // Heartbeat thumping
      this.tone({ freq: 80, to: 35, dur: 0.09, gain: 0.55 });
      this.tone({ freq: 75, to: 32, dur: 0.09, gain: 0.4, delay: 0.16 });
    }

    batDuoc() {
      this.tone({ freq: 587, to: 880, dur: 0.2, gain: 0.45, type: "triangle" });
    }

    bop() {
      // Smack
      this.tone({ freq: 700, to: 140, dur: 0.1, gain: 0.5 });
      this.noise({ dur: 0.08, freq: 2000, q: 1.2, gain: 0.25 });
    }

    phaoGiay() {
      // Confetti burst
      this.tone({ freq: 523, to: 1046, dur: 0.25, gain: 0.4, type: "triangle" });
      for (let t = 0; t < 8; t++) {
        this.noise({ dur: 0.04, freq: 3000 + 2000 * Math.random(), q: 2, gain: 0.12, delay: 0.1 + 0.5 * Math.random() });
      }
    }

    loTen() {
      // Reveal name fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        let dur = idx === notes.length - 1 ? 0.6 : 0.14;
        let delay = 0.13 * idx;
        this.tone({ freq: freq, dur: dur, gain: 0.35, type: "triangle", delay });
        this.tone({ freq: freq / 2, dur: dur, gain: 0.18, type: "square", delay });
      });
    }

    nhac(track, vol = 0.8) {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.currentMusic = track;
      if (!track || !this.enabled) return;

      const ctx = this.getCtx();
      if (!ctx) return;

      if (track === x.nhacRonRen) {
        // Suspense bass groove (100 BPM)
        let step = 0;
        const notes = [130.81, 130.81, 146.83, 155.56, 146.83, 130.81, 116.54, 123.47];
        this.musicInterval = setInterval(() => {
          if (!this.enabled || this.currentMusic !== x.nhacRonRen) return;
          const f = notes[step % notes.length];
          this.tone({ freq: f, dur: 0.18, gain: 0.18 * vol, type: "triangle" });
          if (step % 2 === 1) {
            this.noise({ dur: 0.03, freq: 2800, q: 2, gain: 0.06 * vol });
          }
          step++;
        }, 300);
      } else if (track === x.nhacDuoi) {
        // High-energy chase groove (150 BPM)
        let step = 0;
        const bassNotes = [174.61, 196.00, 220.00, 261.63];
        this.musicInterval = setInterval(() => {
          if (!this.enabled || this.currentMusic !== x.nhacDuoi) return;
          const f = bassNotes[step % bassNotes.length];
          this.tone({ freq: f, dur: 0.12, gain: 0.22 * vol, type: "sawtooth" });
          this.noise({ dur: 0.05, freq: step % 2 === 0 ? 3000 : 1500, q: 1.5, gain: 0.15 * vol });
          step++;
        }, 200);
      } else if (track === x.nhacChaCha) {
        // Cheerful Cha-cha Latin beat (124 BPM)
        let step = 0;
        const chords = [
          [261.63, 329.63, 392.00],
          [293.66, 349.23, 440.00],
          [392.00, 493.88, 587.33]
        ];
        this.musicInterval = setInterval(() => {
          if (!this.enabled || this.currentMusic !== x.nhacChaCha) return;
          const chord = chords[Math.floor(step / 4) % chords.length];
          chord.forEach(f => {
            this.tone({ freq: f, dur: 0.15, gain: 0.14 * vol, type: "triangle" });
          });
          if (step % 4 === 2 || step % 4 === 3) {
            // Cha-cha double tap
            this.noise({ dur: 0.04, freq: 3500, q: 2, gain: 0.12 * vol });
          }
          step++;
        }, Math.round((60 / 124 / 2) * 1000));
      }
    }
  }

  const b = new MucAudio();

  // Asset Loader
  async function loadMucAssets(onProgress) {
    const res = await fetch(`${ASSET_BASE}/bo-anh.json?v=5`);
    const i = await res.json();
    const a = { caoHs: i.caoHs, caoCho: i.caoCho, hs: {}, cho: {} };
    const promises = [];
    let completed = 0;

    const loadImg = (file, cb) => {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(undefined);
        img.src = `${ASSET_BASE}/${file}?v=5`;
      }).then(async img => {
        if (img) {
          try {
            if (typeof createImageBitmap === "function") return await createImageBitmap(img);
            await img.decode();
          } catch (e) {}
          return img;
        }
      }).then(img => {
        if (img) cb(img);
        onProgress?.(++completed / Math.max(1, promises.length));
      }));
    };

    for (let [t, h] of Object.entries(i.hs)) {
      for (let [act, dat] of Object.entries(h)) {
        if (act === "omcay" && h.baucay) continue;
        loadImg(dat.tep, img => {
          (a.hs[t] ??= {})[act] = { anh: img, so: dat.so, w: dat.w, h: dat.h, le: dat.le, goc: dat.goc };
        });
      }
    }

    for (let [t, h] of Object.entries(i.cho)) {
      loadImg(h.tep, img => {
        a.cho[t] = { anh: img, so: h.so, w: h.w, h: h.h, le: h.le };
      });
    }

    if (i.nen_hem) loadImg(i.nen_hem.tep, img => { a.nen = img; });
    if (i.nen_hem_noi) loadImg(i.nen_hem_noi.tep, img => { a.nenNoi = img; });
    if (i.tiencanh) loadImg(i.tiencanh.tep, img => { a.tienCanh = img; });

    const objMap = { dep: "dep", ga: "ga", sao: "sao", bongNgu: "bongNgu" };
    for (let [t, h] of Object.entries(i.do ?? {})) {
      const prop = objMap[t];
      if (prop) loadImg(h.tep, img => { a[prop] = img; });
    }

    await Promise.all(promises);
    return a;
  }

  // --- Official Class P ---
  class P{canvas;bo;onXong;ctx;raf;tCu;tamDung;canVe;msTb;tChamCuoi;onCham;font;goi;pha;tPha;tTong;camX;rung;cham;chop;be;cho;chon;moi;nguoiDam;dich;chu;dep;giay;bui;moc;nhipTim;gaX;gaY;gaT;thoai;henGio;daGiaTinh;omCay;dangOm;quayCay;tOm;daGiatMinh;goc;tCha;nenMo;bienTrai;dongNguoi;bienPhai;hangDoi;tDich;quayDau;buocCha;lechCha;lechTu;constructor(t,h,i){if(this.canvas=t,this.bo=h,this.onXong=i,this.raf=0,this.tCu=0,this.tamDung=!1,this.canVe=!0,this.msTb=16.7,this.tChamCuoi=0,this.font="system-ui, sans-serif",this.goi={},this.pha="cho",this.tPha=0,this.tTong=0,this.camX=0,this.rung=0,this.cham=1,this.chop=0,this.be=[],this.cho={x:640,y:880,v:0,huong:1,dai:"ngu",khung:0,nhay:0},this.chon=null,this.moi=null,this.nguoiDam=null,this.dich=null,this.chu=[],this.dep=[],this.giay=[],this.bui=[],this.moc=new Set,this.nhipTim=0,this.gaX=0,this.gaY=0,this.gaT=-1,this.thoai=[],this.henGio=[],this.daGiaTinh=!1,this.omCay=null,this.dangOm=!1,this.quayCay=0,this.tOm=0,this.daGiatMinh=new Set,this.goc=0,this.tCha=0,this.nenMo=new Map,this.bienTrai=0,this.dongNguoi=!1,this.bienPhai=0,this.hangDoi=[],this.tDich=0,this.quayDau=0,this.buocCha=-1,this.lechCha=0,this.lechTu=0,this.ctx=t.getContext("2d"),"u">typeof document){const t=getComputedStyle(document.documentElement).getPropertyValue("--font-game").trim();t&&(this.font=`${t}, system-ui, sans-serif`)}this.datVeNgu(),this.lamNongAnh()}lamNongAnh(){let t=[this.bo.nen,this.bo.nenNoi,this.bo.tienCanh,this.bo.dep,this.bo.ga,this.bo.sao,this.bo.bongNgu];for(let h of Object.values(this.bo.cho))t.push(h?.anh);for(let h of Object.values(this.bo.hs))for(let i of Object.values(h??{}))t.push(i?.anh);for(let h of t)h&&this.ctx.drawImage(h,0,0,1,1);this.bo.nen&&this.banMo(this.bo.nen),this.bo.nenNoi&&this.banMo(this.bo.nenNoi)}chay(){this.tCu=performance.now();let t=h=>{let i=h-this.tCu,a=Math.min(.05,i/1e3);this.tCu=h,this.tamDung?this.canVe&&this.ve():(this.buoc(a),this.ve(),this.doNhip(i,h)),this.canVe=!1,this.raf=requestAnimationFrame(t)};this.raf=requestAnimationFrame(t)}dung(){cancelAnimationFrame(this.raf),b.nhac(null)}datTamDung(t){this.tamDung=t,this.canVe=!0}veLai(){this.canVe=!0}doNhip(t,h){!(t>250)&&(this.msTb+=(t-this.msTb)*.05,this.msTb>34&&h-this.tChamCuoi>3e3&&(this.tChamCuoi=h,this.msTb=16.7,this.onCham?.()))}batDauLuot(t,h,i){this.donDep(),this.goi=i,this.cho={x:640,y:880,v:0,huong:1,dai:"ngu",khung:0,nhay:0};let a=this.cho.x-40,e=t.doan.length,n=e<=8?1:Math.min(3,Math.ceil(e/15)),s=Math.ceil(e/n),o=Math.max(this.cho.x+520,-270+(s-1)*112+56);this.be=t.doan.map((i,e)=>{if(1===n)return this.taoBe(i,h[i]??e,a-105*e,700+e%2*30+e%3*6,i===t.chon);let s=Math.floor(e/n),c=e%n,l=o-112*s-c%2*56+(Math.random()-.5)*10,r=820-70*c+(Math.random()-.5)*4,u=this.taoBe(i,h[i]??e,l,r,i===t.chon);return u.ti=.8,u}),this.dongNguoi=n>1,this.be.forEach(t=>{t.v=140}),this.chon=this.be.find(t=>t.laChon)??null,this.moi=t.moi?this.be.find(h=>h.ten===t.moi)??null:null,this.nguoiDam=this.be.find(h=>h.ten===t.nguoiDam)??this.be[0],this.camX=this.cho.x-.42*this.rongNhin(),this.dongNguoi&&(this.camX=this.camTheoDoan()),this.vaoPha("ngu"),b.nhac(x.nhacRonRen,1)}tua(){"xong"!==this.pha&&"cho"!==this.pha&&this.chon&&(b.nhac(null),this.datChoDapTay(),this.dep.forEach(t=>{t.nam=!0,t.y=t.dat}),this.chu=[],this.henGio=[],this.vaoPha("xong"),b.nhac(x.nhacChaCha,.8),this.tCha=0,this.buocCha=-1,this.lechCha=0,this.onXong())}datVeNgu(){this.donDep(),this.be=[],this.chon=null,this.cho={x:640,y:880,v:0,huong:1,dai:"ngu",khung:0,nhay:0},this.camX=this.cho.x-.5*this.rongNhin(),this.pha="cho",this.tPha=0}donDep(){this.chu=[],this.dep=[],this.giay=[],this.bui=[],this.rung=0,this.cham=1,this.chop=0,this.gaT=-1,this.dich=null,this.thoai=[],this.henGio=[],this.daGiaTinh=!1,this.omCay=null,this.dangOm=!1,this.quayCay=0,this.daGiatMinh=new Set,this.tCha=0,this.buocCha=-1,this.lechCha=0,this.lechTu=0}camTheoDoan(){let t=this.rongNhin(),h=this.be.reduce((t,h)=>t+h.x,0)/Math.max(1,this.be.length);return Math.min(this.cho.x-.25*t,Math.max(this.cho.x+220-t,Math.max(-158,h-t/2)))}taoBe(t,h,i,a,e){return{ten:t,tenNgan:(0,y.tenGoiCua)(this.goi,t),mau:u[h%u.length],x:i,y:a,yDich:a,v:0,vDich:0,huong:1,dai:"ronren",khung:8*Math.random(),nhay:0,vNhay:0,laChon:e,lach:0,doiLan:1,xDich:i,ti:1}}tiLe(){return this.canvas.height/900}rongNhin(){return this.canvas.width/Math.max(1e-4,this.tiLe())}vaoPha(t){this.pha=t,this.tPha=0,this.moc.clear()}luc(t,h,i){this.tPha>=t&&!this.moc.has(h)&&(this.moc.add(h),i())}noi(t,h,i){this.thoai=this.thoai.filter(h=>h.theo!==t),this.thoai.push({chu:h,theo:t,t:0,dai:i})}noiChu(t,h,i,a={}){this.chu.push({chu:t,x:h,y:i,t:0,dai:1.2,co:44,mau:"#1f2937",...a})}buoc(t){let h=t*this.cham;switch(this.tPha+=h,this.tTong+=h,this.rung=Math.max(0,this.rung-40*t),this.chop=Math.max(0,this.chop-3*t),this.pha){case"cho":this.cho.khung+=3*h;break;case"ngu":this.buocNgu(h);break;case"giaTinh":this.buocGiaTinh(h);break;case"tinh":this.buocTinh(h);break;case"gam":this.buocGam(h);break;case"sua":this.buocSua(h);break;case"chay":case"ngui":case"lao":this.buocDuoi(h,t);break;case"doiMat":this.buocDoiMat(h,t);break;case"bat":this.buocBat();break;case"nhay":this.buocNhay(h);break;case"xong":this.chon&&this.chaCha(h,!1)}if(this.dongNguoi&&("ngu"===this.pha||"giaTinh"===this.pha||"tinh"===this.pha||"gam"===this.pha||"sua"===this.pha)&&(this.camX+=(this.camTheoDoan()-this.camX)*Math.min(1,1.5*t)),"bat"===this.pha||"nhay"===this.pha||"xong"===this.pha)for(let t of this.be)t!==this.chon&&t!==this.omCay&&"sohai"===t.dai&&(t.khung+=6*h);for(let t of this.henGio)t.t-=h;for(let t of this.henGio.filter(t=>t.t<=0))t.fn();for(let h of(this.henGio=this.henGio.filter(t=>t.t>0),this.thoai))h.t+=t;for(let h of(this.thoai=this.thoai.filter(t=>t.t<t.dai),this.chu))h.t+=t;for(let t of(this.chu=this.chu.filter(t=>t.t<t.dai),this.dep))!t.nam&&(t.vy+=2600*h,t.x+=t.vx*h,t.y+=t.vy*h,t.goc+=t.vg*h,t.vy>0&&t.y>=t.dat&&(t.y=t.dat,Math.abs(t.vy)>500?(t.vy*=-.3,t.vx*=.5):t.nam=!0));for(let h of this.giay)h.t+=t,h.vy+=900*t,h.vx*=.99,h.x+=h.vx*t,h.y+=h.vy*t,h.goc+=8*t;for(let t of(this.giay=this.giay.filter(t=>t.t<3.5),this.bui))t.t+=h,t.r+=60*h;for(let t of(this.bui=this.bui.filter(t=>t.t<.6),this.be))t.vNhay-=2400*h,t.nhay=Math.max(0,t.nhay+t.vNhay*h),0===t.nhay&&(t.vNhay=0)}buocNgu(t){this.cho.khung+=3*t,this.luc(.3,"ngay1",()=>b.ngay()),this.luc(1.5,"ngay2",()=>b.ngay()),this.diBo(t,8),this.tPha>=2.4&&this.vaoPha(this.daGiaTinh?"tinh":"giaTinh")}buocGiaTinh(t){let h=this.be,i=h[Math.min(h.length-1,1)];for(let t of(this.luc(0,"hatxi",()=>{for(let t of(this.daGiaTinh=!0,b.nhac(null),b.hatXi(),i.vNhay=420,i.nhay=1,this.noiChu("HẮT XÌÌ!",i.x,i.y-235*i.ti-70,{co:56,mau:"#b45309",dai:1}),h))t.v=0,t.dai="sohai",t.huong=this.cho.x>t.x?1:-1}),this.luc(.35,"hemat",()=>{this.cho.dai="gamgu",this.cho.khung=1}),this.luc(.5,"suyt",()=>{h.length>2&&this.noi(h[0],"Suỵt!!!",1.2)}),[.6,1.2,1.8]))this.luc(t,`tim${t}`,()=>b.timDap());for(let a of(this.luc(2,"ngutiep",()=>{this.cho.dai="ngu",this.cho.khung=0,b.ngay(),this.noi(i,"Phù... hú hồn",1.2)}),this.luc(2.6,"dilai",()=>{for(let t of h)t.dai="ronren",t.huong=1,t.v=140;b.nhac(x.nhacRonRen,1)}),this.tPha<2?this.rung=Math.max(this.rung,1.5):this.cho.khung+=3*t,h))a.khung+=t*("sohai"===a.dai?12:8);this.tPha>=2.6&&this.diBo(t,8),this.tPha>=4&&this.vaoPha("tinh")}diBo(t,h){for(let i of this.be)i.x+=i.v*t,i.khung+=t*h*(i.v>0)}buocTinh(t){let h=this.nguoiDam;this.luc(0,"chit",()=>{b.chit(),this.gaX=h.x+30,this.gaY=h.y+4,this.gaT=0,h.nhay=1,h.vNhay=520,this.noiChu("CHÍTTT!",h.x+30,h.y-40,{co:58,mau:"#dc2626",dai:1.1})}),this.gaT>=0&&(this.gaT+=t),this.luc(.3,"bup",()=>{b.bup(),this.cho.dai="gamgu",this.cho.khung=0}),this.luc(.5,"chetroi",()=>this.noi(h,"Ơ... chết rồi!",1.4)),this.luc(.6,"mat",()=>{this.cho.khung=1}),this.luc(.85,"mat2",()=>{this.cho.khung=2});let i=Math.max(0,1-this.tPha/.6);this.be.forEach(t=>{t.v=140*i}),this.diBo(t,8),this.tPha>=1.1&&this.vaoPha("gam")}buocGam(t){for(let h of(this.luc(0,"gam",()=>{for(let t of(b.nhac(null),b.gamGu(2.4),b.tromDon(2.4),this.be))t.v=0,t.dai="sohai",t.huong=this.cho.x>t.x?1:-1;this.noi("cho","Grừ... Đứa nào chưa học bài?",2.2)}),this.luc(1.3,"khongphaiem",()=>{let t=this.be[3*(this.be.length>3)];t&&this.noi(t,"Dạ... không phải em!",1.1)}),this.cho.khung=this.tPha<.5?3:4+Math.floor(this.tPha/.12)%2,this.rung=Math.max(this.rung,4),this.be))h.khung+=12*t;this.tPha>=2.4&&this.vaoPha("sua")}buocSua(t){for(let h of(this.cho.dai="sua",this.cho.khung=this.tPha<.35?Math.min(1,this.tPha/.18):2+Math.floor((this.tPha-.35)/.12)%2,this.luc(.35,"gau",()=>{for(let t of(b.gau(),this.rung=22,this.chu.push({chu:"GÂU!",x:.5,y:.36,t:0,dai:.9,co:230,mau:"#dc2626",man:!0}),this.be))t.vNhay=700,t.nhay=1,this.noiChu("!!",t.x,t.y-235*t.ti-40,{co:40,mau:"#dc2626",dai:.6})}),this.be))h.khung+=12*t;this.tPha>=.8&&this.batDauChay()}batDauChay(){this.vaoPha("chay"),b.nhac(x.nhacDuoi,1.1),b.vut();let t=this.chon;this.bienTrai=330,this.bienPhai=this.cho.x+2200+45*Math.max(0,this.be.length-8);let h=this.bienTrai,i=this.bienPhai,a=[...this.be].sort((t,h)=>t.x-h.x);a.forEach((t,e)=>{t.xDich=h+80+(i-h-160)*(e+.5)/a.length+(Math.random()-.5)*60,Math.sign(t.xDich-this.cho.x)!==Math.sign(t.x-this.cho.x)&&(t.lach=.9)});let e=this.be.map((t,h)=>690+170*(h+.5)/this.be.length).sort(()=>Math.random()-.5),n=Math.max(1,Math.min(6,Math.round(.35*this.be.length))),s=new Set([...this.be].sort(()=>Math.random()-.5).slice(0,n));this.be.forEach((t,h)=>{let i=t.xDich<t.x?-1:1;if(t.huong=i,t.dai="chay",t.vDich=this.be.length>8?280+200*Math.random():360+60*Math.random(),t.v=1.4*t.vDich,t.yDich=e[h],t.doiLan=1+1.5*Math.random(),s.has(t))for(let h=0;h<2;h++)this.dep.push({x:t.x+(h?12:-12),y:t.y-6,vx:-i*(80+220*Math.random())+(Math.random()-.5)*200,vy:-800-500*Math.random(),goc:0,vg:(Math.random()-.5)*22,dat:t.y+(Math.random()-.5)*30,nam:!1})});let o=[...w].sort(()=>Math.random()-.5);this.be.filter(h=>h!==t).slice(0,3).forEach((t,h)=>{this.henGio.push({t:.25+.7*h,fn:()=>this.noi(t,o[h],1.3)})});let c=this.be.filter(h=>h!==t&&h!==this.moi).sort(()=>Math.random()-.5).slice(0,2);this.hangDoi=[...c,...this.moi?[this.moi]:[]];let l=t=>!!(this.bo.hs[t.mau]?.baucay??this.bo.hs[t.mau]?.omcay),r=this.be.find(h=>h!==t&&h!==this.moi&&!c.includes(h)&&l(h))??null;if(!r&&(r=[...c].reverse().find(l)??null)&&(this.hangDoi=this.hangDoi.filter(t=>t!==r)),r){this.omCay=r,r.vDich=430;let t=r;this.henGio.push({t:.5,fn:()=>this.noi(t,"Á á! Cây ơi!",1)})}this.dich=this.hangDoi.shift()??t,this.tDich=0,this.quayDau=0,this.cho.dai="chay",this.cho.huong=this.dich.x<this.cho.x?-1:1,this.cho.v=0,this.dich===t&&this.vaoPha("lao")}duoiTheo(t,h,i){let a=this.cho,e=t.x<a.x?-1:1;if(this.quayDau>0){this.quayDau-=i,a.dai="phanh",a.khung=this.quayDau>.2?0:1,a.v*=Math.exp(-(8*i)),a.x+=a.huong*a.v*i,Math.random()<25*i&&this.bui.push({x:a.x-40*a.huong,y:a.y,r:10,t:0}),this.quayDau<=0&&(a.huong=e,a.dai="chay",a.v=120);return}if(e!==a.huong&&Math.abs(t.x-a.x)>60){this.quayDau=.45,a.v>200&&b.kit();return}a.dai="chay",a.v+=(h-a.v)*Math.min(1,2.5*i),a.x+=a.huong*a.v*i,a.y+=(t.y-a.y)*Math.min(1,2.2*i),a.khung+=14*i}buocOmCay(t,h){let i=!!this.bo.hs[t.mau]?.baucay;if(this.dangOm){if(this.tOm+=h,!i){t.khung+=10*h;return}if(this.tOm<.9){let h=this.tOm/.9;t.khung=Math.floor(this.tOm/.22)%2,t.y=592+-124*(1-(1-h)*(1-h))}else t.y=468,t.khung=2+Math.floor(this.tOm/.12)%2;return}let a={x:122,y:i?592:512},e=a.x-t.x;t.huong=e<0?-1:1,t.dai="chay",t.v+=(t.vDich-t.v)*Math.min(1,3*h),t.x+=t.huong*Math.min(Math.abs(e),t.v*h),t.y+=(a.y-t.y)*Math.min(1,3*h),t.khung+=14*h,4>Math.abs(e)&&12>Math.abs(a.y-t.y)&&(this.dangOm=!0,this.tOm=0,this.quayCay=2.2,t.x=a.x,t.y=a.y,t.v=0,t.vDich=0,t.huong=1,t.dai=i?"baucay":"omcay",t.khung=0,this.noi(t,v[Math.floor(Math.random()*v.length)],1.8))}ne(t){let h=this.cho;t.vNhay=650,t.nhay=1,t.lach=1.2,t.v=1.5*t.vDich;let i=t.x<h.x?-1:1;t.xDich=Math.min(this.bienPhai-60,Math.max(this.bienTrai+60,t.x+600*i)),t.yDich=h.y<775?860-30*Math.random():690+30*Math.random(),this.chu.length<5&&this.noiChu("Á!",t.x,t.y-235*t.ti-30,{co:48,mau:"#dc2626",dai:.6})}buocDuoi(t,h){let i=this.cho,a=this.chon,e=this.bienTrai,n=this.bienPhai;for(let h of this.be){if(h===this.omCay){this.buocOmCay(h,t);continue}if("chay"===h.dai){h.lach=Math.max(0,h.lach-t);let a=h.x-i.x;if(0===h.lach&&380>Math.abs(a)&&150>Math.abs(h.y-i.y)){let t=a<0?-1:1;if(Math.sign(h.xDich-i.x)!==t||420>Math.abs(h.xDich-i.x)){let a=.35>Math.random(),s=i.x+(a?-t:t)*(500+1e3*Math.random());a&&(h.lach=1.2),h.yDich=690+170*Math.random(),(s<e+60||s>n-60)&&(s=i.x-t*(500+700*Math.random()),h.lach=1.4,h.yDich=i.y<775?860-40*Math.random():690+40*Math.random(),.4>Math.random()&&this.thoai.length<3&&this.noi(h,C[Math.floor(Math.random()*C.length)],.9)),h.xDich=Math.min(n-60,Math.max(e+60,s))}}50>Math.abs(h.xDich-h.x)&&(h.xDich=Math.min(n-60,Math.max(e+60,h.x+(Math.random()-.5)*1e3))),h.huong=h.xDich<h.x?-1:1,h.doiLan-=t,h.doiLan<=0&&(h.doiLan=1.2+1.6*Math.random(),0===h.lach&&(h.yDich=690+170*Math.random()))}h.v+=(h.vDich-h.v)*Math.min(1,3*t),h.x=Math.min(n,Math.max(e,h.x+h.huong*h.v*t)),h.y+=(h.yDich-h.y)*Math.min(1,2.5*t),h.khung+=t*("sohai"===h.dai?12:14)*(h.v>30||"sohai"===h.dai),h.v>200&&Math.random()<6*t*8/Math.max(8,this.be.length)&&b.lepXep()}if("chay"===this.pha){this.tDich+=t;let h=this.dich;this.tPha>.3&&this.duoiTheo(h,h.vDich+70,t);let e=110>Math.abs(h.x-i.x)&&70>Math.abs(h.y-i.y);h===this.moi?(e||this.tDich>3.4)&&(this.vaoPha("ngui"),b.kit()):(e||this.tDich>3.2)&&(this.ne(h),b.ha(),this.noi("cho",k[Math.floor(Math.random()*k.length)],.9),this.dich=this.hangDoi.shift()??a,this.tDich=0,this.dich===a&&this.vaoPha("lao"))}else if("ngui"===this.pha){let h=this.moi;i.dai="phanh",i.v*=Math.exp(-(9*t)),i.x+=i.huong*i.v*t,this.tPha<.35&&Math.random()<30*t&&this.bui.push({x:i.x-40*i.huong,y:i.y,r:10,t:0}),this.luc(.15,"moidung",()=>{h.vDich=0,h.v=0,h.dai="sohai",h.huong=i.x>h.x?1:-1,this.noi(h,"Á á á!!!",.9)}),this.luc(.4,"hit",()=>{b.hit(),this.noi("cho","Hít hít...",.9)}),this.luc(1.2,"khongphai",()=>{b.ha(),this.noi("cho","Ơ... không phải đứa này!",1.3)}),this.luc(1.9,"huhon",()=>this.noi(h,"Hú hồn!",1.2)),this.luc(2.1,"quayxe",()=>{b.kit(),b.vot()}),i.khung=this.tPha<.35?0:this.tPha<2.1?1:this.tPha<2.35?2:3,this.tPha>=2.5&&(h.dai="chay",h.vDich=400,h.lach=1,this.dich=a,i.huong=a.x<i.x?-1:1,i.dai="chay",i.v=200,this.quayDau=0,this.vaoPha("lao"))}else{let e=Math.abs(a.x-i.x);for(let h of(this.duoiTheo(a,Math.min(900,a.vDich+Math.max(110,(e-300)*.5)),t),this.be))h===a||h===this.omCay||this.daGiatMinh.has(h)||Math.abs(h.x-i.x)>130||Math.abs(h.y-i.y)>120||(this.daGiatMinh.add(h),this.ne(h));this.luc(2.5,"met",()=>{a.vDich=260,this.noi(a,"Hết hơi rồi...",1.2)}),this.tPha>6&&(a.vDich=0);let n=Math.abs(a.y-i.y);e<300&&n<140&&1===this.cham&&(this.cham=.4),this.cham<1&&(this.nhipTim-=h,this.nhipTim<=0&&(b.timDap(),this.nhipTim=.55)),e<150&&n<100&&this.vaoDoiMat()}let s=this.rongNhin(),o="lao"===this.pha&&Math.abs(a.x-i.x)<.7*s?(i.x+a.x)/2-s/2:i.x-s/2+i.huong*s*.12;this.quayCay>0&&(this.quayCay-=h,o=122-.3*s),o=Math.min(n+120-s,Math.max(-158,o)),this.camX+=(o-this.camX)*Math.min(1,2.5*h)}vaoDoiMat(){let t=this.chon,h=this.cho;this.cham=1,b.nhac(null),b.kit(),t.v=0,t.vDich=0,t.dai="sohai",t.huong=h.x>t.x?1:-1,h.v=0,h.dai="gamgu",h.khung=4,h.x=t.x+230*t.huong,h.huong=t.x>h.x?1:-1,this.vaoPha("doiMat")}buocDoiMat(t,h){let i=this.chon,a=this.cho;i.khung+=12*t;let e=(i.x+a.x)/2;for(let h of this.be){if(h===i||h===this.omCay)continue;let a=h.x-e;600>Math.abs(a)?(h.dai="chay",h.huong=a<0?-1:1,h.v+=(Math.max(h.vDich,420)-h.v)*Math.min(1,4*t),h.x+=h.huong*h.v*t,h.khung+=14*t):this.dungXem(h,e,t)}a.khung=4+Math.floor(this.tPha/.15)%2,this.luc(.2,"t1",()=>b.timDap()),this.luc(.4,"noi1",()=>this.noi(i,"Em... em chưa chuẩn bị!",1.3)),this.luc(.8,"t2",()=>b.timDap()),this.luc(1.3,"t3",()=>b.timDap()),this.luc(1.5,"hehe",()=>this.noi("cho","Hê hê...",.8));let n=this.rongNhin();this.camX+=((i.x+a.x)/2-n/2-this.camX)*Math.min(1,5*h),this.tPha>=2&&this.batDuoc()}batDuoc(){this.cham=1,b.nhac(null),b.batDuoc(),this.rung=12,this.chop=1,this.datChoDapTay(),this.chu.push({chu:"BẮT ĐƯỢC!",x:.5,y:.3,t:0,dai:1,co:150,mau:"#dc2626",man:!0}),this.vaoPha("bat")}datChoDapTay(){let t=this.chon,h=this.rongNhin();t.dai="dongtay",t.ti=1,t.huong=1,t.khung=0,t.v=0,t.vDich=0,t.nhay=0;let i=Math.min(840,Math.max(730,t.y));t.y=i,this.chu=this.chu.filter(t=>t.man),this.thoai=[],this.goc=Math.max(530,t.x),t.x=this.goc;let a=!!this.bo.cho.nhay;this.cho={...this.cho,x:t.x+165,y:i,v:0,huong:a?1:-1,dai:a?"nhay":"dongtay",khung:0,nhay:0},this.camX=t.x+82.5-h/2;let e=t.x+82.5;for(let i of(this.gaT=-1,this.dep=this.dep.filter(t=>Math.abs(t.x-e)>h),this.omCay=null,this.be))i!==t&&(i.vDich=0,i.x=i.x<e?this.camX-600:this.camX+h+600,this.dungXem(i,e,0))}dungXem(t,h,i){t.v=0,t.dai="sohai",t.huong=t.x<h?1:-1,t.khung+=6*i}buocBat(){this.chon.khung=Math.min(1,this.tPha/.25),this.tPha>=.6&&this.vaoPha("nhay")}chaCha(t,h){let i=this.chon,a=this.cho;this.tCha+=t;let e=this.tCha%D,n=0;for(;n<T.length-1&&e>=T[n].phach*M;)e-=T[n].phach*M,n++;let s=T[n],o=!!this.bo.hs[i.mau]?.nhay&&!!this.bo.cho.nhay;n!==this.buocCha&&(this.buocCha=n,this.lechTu=this.lechCha,i.dai=o?"nhay":"dongtay",a.dai=o?"nhay":"dongtay",i.khung=o?s.nguoi:3,a.khung=o?s.cho:3,h&&s.cha&&this.noiChu(s.cha,this.goc+82.5+(n%3-1)*70,i.y-305.5,{co:48,mau:"#db2777",dai:.55}));let c=s.phach*M,l=Math.min(1,e/(.55*c));this.lechCha=this.lechTu+(s.lech-this.lechTu)*l*l*(3-2*l),i.x=this.goc+this.lechCha,a.x=this.goc+165+this.lechCha,i.nhay=s.cha?14*Math.sin(Math.min(1,e/c)*Math.PI):0,a.nhay=i.nhay}buocNhay(t){let h=this.tPha;this.luc(.45,"nhacCha",()=>b.nhac(x.nhacChaCha,1.2)),h>=.45&&this.chaCha(t,!0),this.luc(0,"bop",()=>{b.bop(),this.rung=8;let t=this.chon;this.noiChu("BỘP!",this.goc+82.5,t.y-176.25,{co:70,mau:"#ea580c",dai:.7})}),this.luc(.3,"phao",()=>{b.phaoGiay();let t=this.rongNhin();for(let h=0;h<140;h++)this.giay.push({x:this.camX+t*(.15+.7*Math.random()),y:-20-300*Math.random(),vx:(Math.random()-.5)*300,vy:200*Math.random(),goc:6*Math.random(),mau:N[h%N.length],t:0})}),this.luc(.1,"chachacha",()=>this.noi("cho","Cha cha cha nào!",1.1)),h>=.45+D&&(b.nhac(x.nhacChaCha,.8),this.vaoPha("xong"),this.onXong())}ve(){let t=this.ctx,h=this.tiLe(),i=this.rongNhin();t.setTransform(1,0,0,1,0,0),t.fillStyle="#87c5ea",t.fillRect(0,0,this.canvas.width,this.canvas.height);let a=this.rung?(Math.random()-.5)*this.rung:0,e=this.rung?(Math.random()-.5)*this.rung:0;for(let n of(t.setTransform(h,0,0,h,(-this.camX+a)*h,e*h),this.veNen(i),this.dep))n.nam&&this.veDep(n);for(let h of this.bui)t.globalAlpha=Math.max(0,.5-h.t),t.fillStyle="#d6cfc4",t.beginPath(),t.arc(h.x,h.y-8,h.r,0,2*Math.PI),t.fill(),t.globalAlpha=1;if(this.gaT>=0&&this.bo.ga){let h=this.gaT<.4?.55:1,i=70*this.bo.ga.height/this.bo.ga.width;t.drawImage(this.bo.ga,this.gaX-35,this.gaY-i*h,70,i*h)}let n=[];for(let t of(n.push({y:this.cho.y,ve:()=>this.veCho()}),this.be))t.x<this.camX-300||t.x>this.camX+i+300||n.push({y:t.y,ve:()=>this.veBe(t)});for(let t of(n.sort((t,h)=>t.y-h.y).forEach(t=>t.ve()),this.dep))t.nam||this.veDep(t);if("cho"!==this.pha&&"bat"!==this.pha&&"nhay"!==this.pha&&"xong"!==this.pha){let t=[];for(let h of this.be.filter(t=>t.x>this.camX-200&&t.x<this.camX+i+200).sort((t,h)=>h.y-t.y))this.veTen(h,t,this.dongNguoi)}for(let t of(this.veTienCanh(),this.chu))t.man||this.veChu(t,t.x,t.y);for(let t of this.thoai)this.veThoai(t,i);for(let i of(("cho"===this.pha||"ngu"===this.pha)&&this.veZzz(),t.setTransform(1,0,0,1,0,0),this.giay)){let a=Math.cos(i.goc)*h,e=Math.sin(i.goc)*h;t.setTransform(a,e,-e,a,(i.x-this.camX)*h,i.y*h),t.fillStyle=i.mau,t.fillRect(-6,-3,12,6)}for(let a of(t.setTransform(h,0,0,h,0,0),this.chu))a.man&&this.veChu(a,a.x*i,900*a.y);this.chop>0&&(t.setTransform(1,0,0,1,0,0),t.fillStyle=`rgba(255,255,255,${.6*this.chop})`,t.fillRect(0,0,this.canvas.width,this.canvas.height))}banMo(t){let h=this.nenMo.get(t);if(h)return h;(h=document.createElement("canvas")).width=t.width,h.height=t.height;let i=h.getContext("2d");i.drawImage(t,0,0),i.globalCompositeOperation="destination-in";let a=160*t.height/900,e=i.createLinearGradient(0,0,a,0);return e.addColorStop(0,"rgba(0,0,0,0)"),e.addColorStop(1,"rgba(0,0,0,1)"),i.fillStyle=e,i.fillRect(0,0,h.width,h.height),this.nenMo.set(t,h),h}veNen(t){let{nen:h,nenNoi:i}=this.bo,a=h??i;if(!a)return;let e=a.width/a.height*900,n=e-160,s=Math.floor((this.camX-160)/n),o=Math.floor((this.camX+t)/n);for(let t=s;t<=o;t++){let a=0===t?h??i:i??h,o=t===s?a:this.banMo(a);this.ctx.drawImage(o,t*n,22*(a===i),e+1,900)}}veTienCanh(){let t=this.bo.tienCanh;if(!t)return;let h=.4*t.width,i=.42*t.height,a=t.height-i,e=a/t.height*900*.55,n=h/t.height*900*.55,s=900-e+14,o=this.ctx;o.drawImage(t,0,i,h,a,-20,s,n,e),o.save(),o.translate(-20,0),o.scale(-1,1),o.drawImage(t,0,i,h,a,0,s,n,e),o.restore()}veDai(t,h,i,a,e,n,s=0){if(!t)return;let o=(Math.floor(h)%t.so+t.so)%t.so,c=e.cao/e.chuan,l=t.w*c,r=t.h*c,u=this.ctx;u.save(),u.translate(i,a-s+t.le*c),u.scale(n,1),u.drawImage(t.anh,o*t.w,0,t.w,t.h,-l/2,-r,l,r),u.restore()}veBe(t){let h=this.bo.hs[t.mau];this.bongDo(t.x,t.y,46);let i=h?.[t.dai],a=("omcay"===t.dai||"baucay"===t.dai)&&i?.goc?235*i.goc*t.ti/this.bo.caoHs:0;this.veDai(i,t.khung,t.x-a,t.y,{cao:235*t.ti,chuan:this.bo.caoHs},t.huong,t.nhay)}veCho(){let t=this.cho;this.bongDo(t.x,t.y,70),this.veDai(this.bo.cho[t.dai],t.khung,t.x,t.y,{cao:215,chuan:this.bo.caoCho},t.huong,t.nhay)}veThoai(t,h){let i,a,e=this.ctx;if("cho"===t.theo){let t=this.cho;i=t.x,a=t.y-t.nhay-215*("nhay"===t.dai||"dongtay"===t.dai?1.5:1.05)-24}else{let h=t.theo;i=h.x,a=h.y-h.nhay-235*h.ti*1.12-70}e.font=`800 30px ${this.font}`;let n=e.measureText(t.chu).width+36,s=Math.min(this.camX+h-n-16,Math.max(this.camX+16,i-n/2)),o=Math.min(1,t.t/.12),c=Math.min(1,(t.dai-t.t)/.2);e.save(),e.globalAlpha=Math.max(0,c),e.translate(i,a),e.scale(.7+.3*o,.7+.3*o),e.translate(-i,-a),e.fillStyle="#ffffff",e.strokeStyle="#3b2416",e.lineWidth=4,e.beginPath(),e.roundRect(s,a-52,n,52,22),e.moveTo(i-12,a-2),e.lineTo(i,a+18),e.lineTo(i+12,a-2),e.fill(),e.stroke(),e.fillRect(i-10,a-8,20,8),e.fillStyle="#1f2937",e.textAlign="center",e.textBaseline="middle",e.fillText(t.chu,s+n/2,a-26+2),e.restore()}bongDo(t,h,i){let a=this.ctx;a.fillStyle="rgba(40,30,20,0.18)",a.beginPath(),a.ellipse(t,h-4,i,.22*i,0,0,2*Math.PI),a.fill()}veDep(t){let h=this.bo.dep;if(!h)return;let i=54*h.height/h.width,a=this.ctx;a.save(),a.translate(t.x,t.y-i/2),a.rotate(t.goc),a.drawImage(h,-27,-i/2,54,i),a.restore()}veTen(t,h,i){let a=this.ctx,e=i?19:26,n=i?27:38;a.font=`800 ${e}px ${this.font}`,t.rongTen?.co!==e&&(t.rongTen={co:e,w:a.measureText(t.tenNgan).width+20});let s=t.rongTen.w,o=t.x-s/2,c=t.y-t.nhay-235*t.ti*1.12-n,l=t=>h.some(h=>o<h.x+h.w+4&&h.x<o+s+4&&Math.abs(h.y-t)<n+3);if(l(c)){if(!i||l(c-n-4))return;c-=n+4}h.push({x:o,y:c,w:s}),a.fillStyle="rgba(255,255,255,0.92)",a.strokeStyle="#3b2416",a.lineWidth=3,a.beginPath(),a.roundRect(o,c,s,n,n/2),a.fill(),a.stroke(),a.fillStyle="#1f2937",a.textAlign="center",a.textBaseline="middle",a.fillText(t.tenNgan,t.x,c+n/2+1)}veChu(t,h,i){let a=this.ctx,e=Math.min(1,t.t/.12),n=Math.min(1,(t.dai-t.t)/.25),s=.6+.4*e+(t.man?.15*Math.sin(30*t.t)*(1-e):0);a.save(),a.globalAlpha=Math.max(0,n),a.translate(h,i-(t.man?0:30*t.t)),a.scale(s,s),a.font=`900 ${t.co}px ${this.font}`,a.textAlign="center",a.textBaseline="middle",a.lineJoin="round",a.lineWidth=Math.max(6,.12*t.co),a.strokeStyle="#ffffff",a.strokeText(t.chu,0,0),a.fillStyle=t.mau,a.fillText(t.chu,0,0),a.restore()}veZzz(){let t=this.ctx,h=this.cho;for(let i=0;i<3;i++){let a=(.5*this.tTong+i/3)%1;t.save(),t.globalAlpha=Math.sin(a*Math.PI),t.font=`900 ${28+10*i}px ${this.font}`,t.fillStyle="#1e3a8a",t.strokeStyle="#fff",t.lineWidth=6;let e=h.x+60+60*a+10*i,n=h.y-90-120*a;t.strokeText("Z",e,n),t.fillText("Z",e,n),t.restore()}}}

  // Helper: map student names to short display names
  function bangTenGoi(roster) {
    const map = {};
    roster.forEach(name => {
      const parts = name.trim().split(/\s+/);
      map[name] = parts[parts.length - 1] || name;
    });
    return map;
  }

  // Main Entry Point
  window.launchMucOiDungDayClassic = function(arena, options = {}) {
    arena.innerHTML = '';
    const isModalArena = arena && arena.id === 'game-arena-content';
    arena.style.cssText = isModalArena
      ? 'position: relative; width: 100%; height: 100%; overflow: hidden; background: #0f172a; font-family: system-ui, sans-serif; user-select: none;'
      : 'position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden; background: #0f172a; font-family: system-ui, sans-serif; user-select: none; z-index: 999999;';

    // Roster
    let roster = (options.roster && options.roster.length >= 2)
      ? options.roster.filter(s => s && s.trim())
      : (window.classRoster && window.classRoster.length >= 2)
        ? window.classRoster.filter(s => s && s.trim())
        : [
            "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Long", "Phạm Minh Thư",
            "Đặng Quốc Bảo", "Vũ Mai Phương", "Bùi Tấn Phát", "Hoàng Kim Ngân",
            "Ngô Trọng Hiếu", "Đỗ Quỳnh Chi", "Hồ Đức Phúc", "Lý Thanh Hà"
          ];

    let calledSet = new Set();
    let currentLuot = null;
    let engine = null;
    let isPaused = false;
    let gameState = "loading"; // loading -> sanh -> dien -> ketqua

    // Top control bar
    const bar = document.createElement('div');
    bar.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 52px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 50; color: white;';
    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">🐕</span>
        <div>
          <div style="font-weight: 800; font-size: 15px; color: #fde047; letter-spacing: 0.5px;">Mực Ơi, Đừng Dậy!</div>
          <div style="font-size: 11px; color: #cbd5e1;">Rón rén trốn bài - Mực tỉnh giấc đuổi ai nấy lên bảng!</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="muc-classic-back-btn" title="Quay về sảnh EY" style="background: rgba(13,148,136,0.9); border: 1px solid #14b8a6; color: white; border-radius: 8px; padding: 6px 12px; font-weight: 800; cursor: pointer; font-size: 13px;">← Về Sảnh</button>
        <button id="muc-switch-chibi-btn" title="Chuyển sang Bản Mới Chạy Rớt Dép Chibi" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; border-radius: 8px; padding: 6px 12px; font-weight: 800; cursor: pointer; font-size: 13px;">🐾 Đổi bản Mới Chibi</button>
        <button id="muc-sound-btn" title="Bật/Tắt âm thanh" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; padding: 6px 12px; font-weight: 700; cursor: pointer; font-size: 14px;">🔊</button>
        <button id="muc-pause-btn" title="Tạm dừng / Tiếp tục" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; padding: 6px 12px; font-weight: 700; cursor: pointer; font-size: 13px;">⏸️ Tạm dừng</button>
        <button id="muc-tua-btn" title="Tua nhanh đến kết quả (Enter)" style="background: linear-gradient(180deg, #f59e0b, #d97706); border: none; color: white; border-radius: 8px; padding: 6px 14px; font-weight: 800; cursor: pointer; font-size: 13px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);">⏭️ Tua nhanh</button>
      </div>
    `;
    arena.appendChild(bar);

    // Canvas container
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'position: absolute; top: 52px; bottom: 0; left: 0; right: 0; overflow: hidden;';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width: 100%; height: 100%; display: block;';
    canvasWrap.appendChild(canvas);
    arena.appendChild(canvasWrap);

    // Overlay layer (loading / lobby / result)
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: absolute; inset: 52px 0 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 40; pointer-events: auto;';
    arena.appendChild(overlay);

    // Audio toggle
    const soundBtn = bar.querySelector('#muc-sound-btn');
    soundBtn.addEventListener('click', () => {
      b.enabled = !b.enabled;
      soundBtn.textContent = b.enabled ? '🔊' : '🔇';
      if (!b.enabled) b.nhac(null);
    });

    // Pause toggle
    const pauseBtn = bar.querySelector('#muc-pause-btn');
    pauseBtn.addEventListener('click', () => {
      if (gameState !== 'dien') return;
      isPaused = !isPaused;
      engine?.datTamDung(isPaused);
      pauseBtn.textContent = isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
    });

    // Fast-forward
    const tuaBtn = bar.querySelector('#muc-tua-btn');
    tuaBtn.addEventListener('click', () => {
      if (gameState === 'dien') {
        engine?.tua();
      }
    });

    const classicBackBtn = bar.querySelector('#muc-classic-back-btn');
    if (classicBackBtn) {
      classicBackBtn.addEventListener('click', () => {
        destroy();
        if (window.__activePickerCleanup) window.__activePickerCleanup = null;
        if (window.__activeFullscreenGameCleanup) window.__activeFullscreenGameCleanup = null;
        if (typeof options.onExit === 'function') {
          options.onExit();
        } else {
          const modal = document.getElementById('game-modal');
          if (modal) modal.classList.remove('open');
          arena.style.cssText = '';
          arena.innerHTML = '';
        }
      });
    }

    const switchChibiBtn = bar.querySelector('#muc-switch-chibi-btn');
    if (switchChibiBtn) {
      switchChibiBtn.addEventListener('click', () => {
        destroy();
        const runChibi = () => {
          if (typeof window.launchMucOiDungDay === 'function') {
            const cleanup = window.launchMucOiDungDay(arena, options);
            if (window.__activePickerCleanup !== undefined) window.__activePickerCleanup = cleanup;
            if (window.__activeFullscreenGameCleanup !== undefined) window.__activeFullscreenGameCleanup = cleanup;
          }
        };
        if (typeof window.launchMucOiDungDay === 'function') {
          runChibi();
        } else {
          const s = document.createElement('script');
          s.src = '/ey/games/muc-oi-dung-day.js?v=20261111_chibi';
          s.onload = runChibi;
          document.head.appendChild(s);
        }
      });
    }

    // Resize handling
    let resizeObserver = null;
    function resizeCanvas() {
      if (!canvasWrap || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const h = Math.max(1, canvasWrap.clientHeight);
      const scale = Math.min(dpr, Math.max(1, 1200 / h));
      canvas.width = Math.round(canvasWrap.clientWidth * scale);
      canvas.height = Math.round(h * scale);
      engine?.veLai();
    }

    // Keydown handler
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'sanh') {
          startNewRound();
        } else if (gameState === 'dien') {
          isPaused = !isPaused;
          engine?.datTamDung(isPaused);
          pauseBtn.textContent = isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
        } else if (gameState === 'ketqua') {
          startNewRound();
        }
      } else if (e.code === 'Enter') {
        if (gameState === 'dien') {
          e.preventDefault();
          engine?.tua();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    // Show Loading
    function showLoading(pct) {
      overlay.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.88); border: 2px solid #f97316; border-radius: 20px; padding: 28px 40px; text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.6); max-width: 420px; width: 90%;">
          <div style="font-size: 54px; margin-bottom: 12px; animation: bounce 1s infinite;">🐕</div>
          <div style="font-size: 20px; font-weight: 800; color: #fde047; margin-bottom: 6px;">Đang chuẩn bị ngõ hẻm...</div>
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 18px;">Đang tải hoạt cảnh và chú chó Mực (${Math.round(pct * 100)}%)</div>
          <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.15); border-radius: 999px; overflow: hidden;">
            <div style="width: ${Math.round(pct * 100)}%; height: 100%; background: linear-gradient(90deg, #f97316, #fde047); border-radius: 999px; transition: width 0.2s;"></div>
          </div>
        </div>
      `;
    }

    // Show Lobby
    function showLobby() {
      gameState = "sanh";
      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.88); border: 2px solid #f97316; border-radius: 24px; padding: 32px 44px; text-align: center; color: white; box-shadow: 0 15px 50px rgba(0,0,0,0.65); max-width: 480px; width: 90%; backdrop-filter: blur(12px);">
          <div style="font-size: 64px; margin-bottom: 8px;">🐕💤</div>
          <h2 style="font-size: 24px; font-weight: 900; color: #fde047; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Mực Đang Ngủ Say...</h2>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
            Cả lớp hãy rón rén trốn qua ngõ hẻm. Coi chừng làm Mực thức giấc! Chú chó Mực đuổi bắt trúng ai thì bạn đó sẽ được <b>mời lên bảng</b>!
          </p>
          <div style="font-size: 13px; color: #fed7aa; margin-bottom: 20px; background: rgba(249, 115, 22, 0.2); border: 1px solid rgba(249, 115, 22, 0.4); padding: 8px 16px; border-radius: 12px;">
            👥 Sĩ số: <b>${roster.length}</b> học sinh | Đã gọi: <b>${calledSet.size}</b>
          </div>
          <button id="btn-start-game" style="background: linear-gradient(180deg, #ea580c, #c2410c); border: 3px solid #fde047; color: white; padding: 14px 40px; border-radius: 18px; font-size: 19px; font-weight: 900; cursor: pointer; box-shadow: 0 6px 0 #7c2d12, 0 10px 25px rgba(234, 88, 12, 0.5); transition: all 0.15s; letter-spacing: 0.5px;">
            BẮT ĐẦU CHƠI (Space)
          </button>
        </div>
      `;

      overlay.querySelector('#btn-start-game').addEventListener('click', () => {
        b.getCtx();
        startNewRound();
      });
    }

    // Start Round
    function startNewRound() {
      if (!engine) return;
      overlay.style.display = 'none';
      gameState = "dien";
      isPaused = false;
      pauseBtn.textContent = '⏸️ Tạm dừng';

      // Pick student
      let uncalled = roster.filter(s => !calledSet.has(s));
      let lamLai = false;
      if (uncalled.length === 0) {
        calledSet.clear();
        uncalled = [...roster];
        lamLai = true;
      }
      const chon = c(uncalled);
      const others = l(roster.filter(s => s !== chon));
      const doan = l([chon, ...others]);
      const moi = others.length > 0 ? c(others) : null;
      const nguoiDam = c(doan);

      currentLuot = { chon, doan, moi, nguoiDam, lamLai };
      calledSet.add(chon);

      const bangTen = bangTenGoi(roster);
      const gioiTinhMap = {};
      roster.forEach((name, idx) => {
        gioiTinhMap[name] = idx % 6;
      });

      engine.batDauLuot(currentLuot, gioiTinhMap, bangTen);
    }

    // Round Finished Callback
    function onRoundComplete() {
      gameState = "ketqua";
      b.loTen();
      const winnerName = currentLuot?.chon || "Học sinh";
      const shortName = bangTenGoi(roster)[winnerName] || winnerName;

      setTimeout(() => {
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.92); border: 3px solid #f59e0b; border-radius: 28px; padding: 36px 48px; text-align: center; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(245, 158, 11, 0.3); max-width: 520px; width: 90%; backdrop-filter: blur(14px); animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="font-size: 58px; margin-bottom: 6px;">🎉🐕🐶</div>
            <div style="font-size: 15px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">MỰC ĐÃ TÚM ĐƯỢC!</div>
            <div style="font-size: 32px; font-weight: 900; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); margin: 8px 0 16px 0; background: linear-gradient(180deg, #ffffff, #fef08a); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              ${winnerName}
            </div>
            <div style="font-size: 15px; color: #fed7aa; margin-bottom: 24px; font-weight: 600;">
              🐾 Mời bạn <b>${shortName}</b> tự tin bước lên bảng trả lời câu hỏi nha!
            </div>
            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <button id="btn-next-round" style="background: linear-gradient(180deg, #ea580c, #c2410c); border: 3px solid #fde047; color: white; padding: 12px 30px; border-radius: 16px; font-size: 17px; font-weight: 900; cursor: pointer; box-shadow: 0 5px 0 #7c2d12; transition: all 0.15s;">
                Gọi lượt tiếp theo (Space)
              </button>
              <button id="btn-end-session" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 12px 24px; border-radius: 16px; font-size: 15px; font-weight: 700; cursor: pointer;">
                Về sảnh
              </button>
            </div>
          </div>
        `;

        overlay.querySelector('#btn-next-round').addEventListener('click', () => {
          startNewRound();
        });

        overlay.querySelector('#btn-end-session').addEventListener('click', () => {
          showLobby();
        });
      }, 700);
    }

    // Load assets and start
    showLoading(0.1);
    loadMucAssets(pct => {
      showLoading(pct);
    }).then(assets => {
      engine = new P(canvas, assets, onRoundComplete);
      engine.onCham = () => resizeCanvas();
      
      resizeCanvas();
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvasWrap);

      engine.chay();
      showLobby();
    }).catch(err => {
      console.error('Failed to load Muc assets:', err);
      overlay.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.9); color: white; padding: 20px; border-radius: 12px; text-align: center;">
          <p>Lỗi tải hoạt cảnh: ${err.message}</p>
          <button onclick="location.reload()" style="padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">Thử lại</button>
        </div>
      `;
    });

    // Cleanup on unmount / modal close
    function destroy() {
      window.removeEventListener('keydown', onKey);
      if (resizeObserver) resizeObserver.disconnect();
      if (engine) engine.dung();
      b.nhac(null);
    }

    return destroy;
  };
})();
