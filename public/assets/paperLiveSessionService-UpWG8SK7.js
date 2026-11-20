// Local & BroadcastChannel & REST Hybrid Sync Engine for Paper Mode
const c = "paper_live_sessions";
const CHANNEL_NAME = "paper_live_sync";
const STORAGE_PREFIX = "paper_live_session_";

const localListeners = {
  devices: new Set(),
  state: new Set(),
  status: new Set(),
  scans: new Set()
};

function dispatchLocal(type, sid, data) {
  if (localListeners[type]) {
    localListeners[type].forEach(fn => {
      try { fn(sid, data); } catch (e) {}
    });
  }
}

function getBc() {
  if (typeof BroadcastChannel !== "undefined") {
    try { return new BroadcastChannel(CHANNEL_NAME); } catch (e) {}
  }
  return null;
}
let bc = getBc();

function notifyBc(sid, type, payload) {
  if (!bc) bc = getBc();
  if (bc) {
    try { bc.postMessage({ sid, type, payload, ts: Date.now() }); } catch (e) {}
  }
  dispatchLocal(type, sid, payload);
}

function loadLocalSession(sid) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + sid);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveLocalSession(sid, session) {
  try {
    localStorage.setItem(STORAGE_PREFIX + sid, JSON.stringify(session));
    localStorage.setItem("paper_live_last_update", String(Date.now()));
  } catch (e) {}
  try {
    fetch("/api/paper-live/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid, session })
    }).catch(() => {});
  } catch (e) {}
}

async function A(e = 20) {
  for (let t = 0; t < e; t++) {
    const s = "S" + Math.floor(1e4 + Math.random() * 9e4).toString();
    const existing = loadLocalSession(s);
    if (!existing) return s;
  }
  return "S" + Math.floor(1e4 + Math.random() * 9e4).toString();
}

async function T(e) {
  var t;
  try {
    const s = await A();
    const o = {};
    for (const i of e.students) o[String(i.cardNumber)] = { name: i.name };
    const u = e.questions.map(i => ({
      id: i.id,
      text: i.text,
      image: i.image || null,
      audio: i.audio || null,
      correctAnswer: i.correctAnswer,
      optionCount: i.optionCount || 4,
      options: i.options,
      optionImages: i.optionImages || null
    }));
    const l = {
      info: {
        teacherId: e.teacherId,
        classId: e.classId,
        title: e.title,
        status: "active",
        totalQuestions: e.questions.length,
        createdAt: Date.now(),
        surveyScale: e.surveyScale || "",
        countdownSeconds: e.countdownSeconds || 0
      },
      state: {
        currentQuestionIndex: 0,
        phase: "scanning",
        correctAnswer: ((t = e.questions[0]) == null ? void 0 : t.correctAnswer) ?? null,
        questionStartedAt: 0,
        showVoters: !1
      },
      questions: u,
      roster: o,
      devices: {},
      scans: {}
    };
    saveLocalSession(s, l);
    notifyBc(s, "session_create", l);
    return s;
  } catch (s) {
    throw console.error("Error creating paper live session:", s), s;
  }
}

async function I(e) {
  try {
    let sess = loadLocalSession(e);
    if (!sess) {
      try {
        const res = await fetch(`/api/paper-live/session?sid=${e}`);
        if (res.ok) {
          sess = await res.json();
          saveLocalSession(e, sess);
        }
      } catch (err) {}
    }
    if (!sess) throw new Error("Live session not found");
    return sess;
  } catch (t) {
    throw console.error("Error getting live session:", t), t;
  }
}

async function b(e, t, s) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.state = sess.state || {};
      sess.state.currentQuestionIndex = t;
      sess.state.phase = "scanning";
      sess.state.correctAnswer = s ?? null;
      sess.state.showVoters = !1;
      sess.state.questionStartedAt = Date.now();
      saveLocalSession(e, sess);
      notifyBc(e, "state", sess.state);
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, currentQuestionIndex: t, phase: "scanning", correctAnswer: s ?? null, showVoters: !1, questionStartedAt: Date.now() })
    }).catch(() => {});
  } catch (n) {
    throw console.error("Error advancing to next question:", n), n;
  }
}

async function q(e) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.state = sess.state || {};
      sess.state.remindAt = Date.now();
      saveLocalSession(e, sess);
      notifyBc(e, "state", sess.state);
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, remindAt: Date.now() })
    }).catch(() => {});
  } catch (t) {
    throw console.error("Error requesting remind:", t), t;
  }
}

async function V(e) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.state = sess.state || {};
      sess.state.phase = "results";
      sess.state.questionStartedAt = 0;
      saveLocalSession(e, sess);
      notifyBc(e, "state", sess.state);
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, phase: "results", questionStartedAt: 0 })
    }).catch(() => {});
  } catch (t) {
    throw console.error("Error showing results:", t), t;
  }
}

async function L(e, t) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.state = sess.state || {};
      sess.state.showVoters = t;
      saveLocalSession(e, sess);
      notifyBc(e, "state", sess.state);
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, showVoters: t })
    }).catch(() => {});
  } catch (s) {
    throw console.error("Error toggling voters:", s), s;
  }
}

async function Q(e) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.state = sess.state || {};
      sess.state.questionStartedAt = Date.now();
      saveLocalSession(e, sess);
      notifyBc(e, "state", sess.state);
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, questionStartedAt: Date.now() })
    }).catch(() => {});
  } catch (t) {
    console.error("Error restarting question timer:", t);
  }
}

async function k(e, t, s, n, o) {
  try {
    const sess = loadLocalSession(e) || { scans: {} };
    sess.scans = sess.scans || {};
    sess.scans[t] = sess.scans[t] || {};
    const existing = sess.scans[t][s];
    const prevAnswer = existing ? existing.answer : null;
    const isNew = !existing;
    const changed = !isNew && prevAnswer !== n;

    if (isNew || changed) {
      sess.scans[t][s] = {
        answer: n,
        scannedAt: Date.now(),
        isCorrect: !!o && n === o
      };
      saveLocalSession(e, sess);
      notifyBc(e, "scans", sess.scans);
      fetch("/api/paper-live/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: e, questionIndex: t, cardNumber: s, answer: n, isCorrect: !!o && n === o })
      }).catch(() => {});
    }

    return { isNew, changed, previousAnswer: prevAnswer };
  } catch (l) {
    throw console.error("Error submitting scan:", l), l;
  }
}

async function N(e) {
  const deviceId = "dev_" + Math.random().toString(36).substring(2, 9);
  const sess = loadLocalSession(e);
  if (sess) {
    sess.devices = sess.devices || {};
    sess.devices[deviceId] = { connectedAt: Date.now(), lastSeen: Date.now() };
    saveLocalSession(e, sess);
    notifyBc(e, "devices", sess.devices);
  }
  fetch("/api/paper-live/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sid: e, deviceId, deviceName: "Camera Scanner" })
  }).catch(() => {});

  const keepAlive = setInterval(() => {
    const current = loadLocalSession(e);
    if (current) {
      current.devices = current.devices || {};
      if (current.devices[deviceId]) {
        current.devices[deviceId].lastSeen = Date.now();
        saveLocalSession(e, current);
      }
    }
  }, 3000);

  return () => {
    clearInterval(keepAlive);
    const endSess = loadLocalSession(e);
    if (endSess && endSess.devices) {
      delete endSess.devices[deviceId];
      saveLocalSession(e, endSess);
      notifyBc(e, "devices", endSess.devices);
    }
  };
}

function C(e, t) {
  const check = () => {
    const sess = loadLocalSession(e);
    const count = sess && sess.devices ? Object.keys(sess.devices).length : 0;
    t(count);
  };
  check();

  const localCb = (sid, data) => {
    if (sid === e) check();
  };
  localListeners.devices.add(localCb);

  const handleBc = (evt) => {
    if (evt.data && evt.data.sid === e && (evt.data.type === "devices" || evt.data.type === "session_create")) {
      check();
    }
  };
  const handleStorage = (evt) => {
    if (evt.key === STORAGE_PREFIX + e || evt.key === "paper_live_last_update") check();
  };

  if (bc) bc.addEventListener("message", handleBc);
  window.addEventListener("storage", handleStorage);
  const interval = setInterval(check, 1000);

  return () => {
    localListeners.devices.delete(localCb);
    if (bc) bc.removeEventListener("message", handleBc);
    window.removeEventListener("storage", handleStorage);
    clearInterval(interval);
  };
}

function _(e, t) {
  const check = () => {
    const sess = loadLocalSession(e);
    t(sess ? sess.state : null);
  };
  check();

  const localCb = (sid, data) => {
    if (sid === e) check();
  };
  localListeners.state.add(localCb);

  const handleBc = (evt) => {
    if (evt.data && evt.data.sid === e && (evt.data.type === "state" || evt.data.type === "session_create")) {
      check();
    }
  };
  const handleStorage = (evt) => {
    if (evt.key === STORAGE_PREFIX + e || evt.key === "paper_live_last_update") check();
  };

  if (bc) bc.addEventListener("message", handleBc);
  window.addEventListener("storage", handleStorage);
  const interval = setInterval(check, 1000);

  return () => {
    localListeners.state.delete(localCb);
    if (bc) bc.removeEventListener("message", handleBc);
    window.removeEventListener("storage", handleStorage);
    clearInterval(interval);
  };
}

function M(e, t) {
  const check = () => {
    const sess = loadLocalSession(e);
    t(sess && sess.info ? sess.info.status : null);
  };
  check();

  const localCb = (sid, data) => {
    if (sid === e) check();
  };
  localListeners.status.add(localCb);

  const handleBc = (evt) => {
    if (evt.data && evt.data.sid === e && evt.data.type === "status") check();
  };
  const handleStorage = (evt) => {
    if (evt.key === STORAGE_PREFIX + e) check();
  };

  if (bc) bc.addEventListener("message", handleBc);
  window.addEventListener("storage", handleStorage);
  const interval = setInterval(check, 1500);

  return () => {
    localListeners.status.delete(localCb);
    if (bc) bc.removeEventListener("message", handleBc);
    window.removeEventListener("storage", handleStorage);
    clearInterval(interval);
  };
}

function O(e, t, s) {
  const check = () => {
    const sess = loadLocalSession(e);
    const questionScans = sess && sess.scans ? (sess.scans[t] || {}) : {};
    s(questionScans);
  };
  check();

  const localCb = (sid, data) => {
    if (sid === e) check();
  };
  localListeners.scans.add(localCb);

  const handleBc = (evt) => {
    if (evt.data && evt.data.sid === e && (evt.data.type === "scans" || evt.data.type === "state")) {
      check();
    }
  };
  const handleStorage = (evt) => {
    if (evt.key === STORAGE_PREFIX + e || evt.key === "paper_live_last_update") check();
  };

  if (bc) bc.addEventListener("message", handleBc);
  window.addEventListener("storage", handleStorage);
  const interval = setInterval(check, 600);

  return () => {
    localListeners.scans.delete(localCb);
    if (bc) bc.removeEventListener("message", handleBc);
    window.removeEventListener("storage", handleStorage);
    clearInterval(interval);
  };
}

async function P(e) {
  try {
    const sess = loadLocalSession(e);
    if (sess) {
      sess.info = sess.info || {};
      sess.info.status = "ended";
      saveLocalSession(e, sess);
      notifyBc(e, "status", "ended");
    }
    fetch("/api/paper-live/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: e, status: "ended" })
    }).catch(() => {});
  } catch (t) {
    throw console.error("Error ending paper live session:", t), t;
  }
}

async function W(e) {
  try {
    const sess = loadLocalSession(e);
    return sess && sess.scans ? sess.scans : {};
  } catch (t) {
    throw console.error("Error getting all scans:", t), t;
  }
}

export { C as a, M as b, O as c, b as d, V as e, P as f, I as g, W as h, T as i, k as j, N as k, _ as l, q as m, Q as r, L as s };
