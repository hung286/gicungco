/* ============================================================================
   SmartEdu Bank Client — doc cau hoi tu kho ngan hang theo mon/lop.
   Firebase project RIENG: nganhanggame (khac gamehocvui).
   Cau truc: banks/{mon}/topics/{idcd}  +  banks/{mon}/questions/{idquestion}
   - Topic: {idcd, lop, name, mon, muc1..muc4, total, mcqAB}
   - Question (chi mcq): {id, classTag, idcd, lop, level a/b/c/d, type,
       part, question, options[4], answer, correctIndex, loigiai, rand, drawKey}
   - drawKey = "idcd_level_bucket(0-9)": boc ngau nhien bang 1 dieu kien bang
     don (where drawKey == ...) nen KHONG can composite index Firestore.
   Can 2 file Firebase compat (tu host o ../vendor/firebase/):
     firebase-app-compat.js, firebase-firestore-compat.js
   ============================================================================ */
(function (G) {
  'use strict';

  var BANK_CONFIG = {
    apiKey: 'AIzaSyDJb5wHo1vv3Ya1JzP-H3_G_J00pRMAvXU',
    authDomain: 'nganhanggame.firebaseapp.com',
    projectId: 'nganhanggame',
    storageBucket: 'nganhanggame.firebasestorage.app',
    messagingSenderId: '1092801629809',
    appId: '1:1092801629809:web:00b73f55916b7b439915d0'
  };

  // Mon co sheetId thi dung duoc; mon chua co sheetId hien "sap co" o giao dien.
  // Ha bo sung sheetId cac mon khac vao day sau.
  var SUBJECTS = [
    { id: 'toan', name: 'Toán', sheetId: '1OQqE-GFm9LG5NSzQ0AvaRsYpMmN4VUH9UrQEnu2iAe0' },
    { id: 'anh', name: 'Tiếng Anh', sheetId: '1rOX69J28spIJK_GtFBBHOwOXAnRCyThjHVZVSCojlwY' },
    { id: 'van', name: 'Ngữ văn', sheetId: '1xlU27f0GF6pF7xPHbm3lHwBPnpQVGR2KKGRqUksJuBU' },
    { id: 'ly', name: 'Vật lý', sheetId: '1uWg0AmO9Aojg-vD2eG7Lly0Oky1mIkd2juSNS68Z4sg' },
    { id: 'hoa', name: 'Hóa học', sheetId: '195pcho_8QnsfSEZ-fEbym3GSGRLiT-KRyJSZsx_tPhU' },
    { id: 'sinh', name: 'Sinh học', sheetId: '1lQ0X7dm1hNJTu38QueTOGU9v_aRYgN_N8tAFVq-_LZE' },
    { id: 'su', name: 'Lịch sử', sheetId: '1K_eL-VAwwAk4-cF_Cr0iAxc1fy2hgfp2UvYSVWo0_DY' },
    { id: 'dia', name: 'Địa lý', sheetId: '1DOIyrWAxI-gb_S0aPx0_i0Wwj_Kt2P01IymzUg6C9Tg' },
    { id: 'gdcd', name: 'GDCD', sheetId: '1ZopZqHGP27yNWkNuX5WmmmoSUM2ZxWv5n9h6g2dR92w' },
    { id: 'cncn', name: 'CNCN', sheetId: '1cwugF6pJIKaqCZZ5oaJzfZu1Nwsp4j-rV4oApf3BjBs' },
    { id: 'cnnn', name: 'CNNN', sheetId: '1aIiIhJ0RU0DangfQZrdFtOb4li5BkmjncW9fn36rEYY' },
    { id: 'tin', name: 'Tin học', sheetId: '10Nwb4dSrXvKRufF2yHQ_YYSPMsP7L7iQGq_CX2HPmWQ' }
  ];

  var _db = null;
  var _initError = '';

  function db() {
    if (_db) return _db;
    if (!G.firebase) { _initError = 'Chưa tải được thư viện Firebase.'; return null; }
    try {
      /* Lay app 'bank' neu co; neu chua co thi khoi tao moi — KHONG dua
         vao firebase.apps.length, vi 1 app mac dinh khac (vd roster
         gamesmartedu cua Trieu Phu) co the da khoi tao truoc, luc do
         app('bank') se nem loi du 'bank' chua ton tai. */
      var app;
      try { app = G.firebase.app('bank'); }
      catch (e0) { app = G.firebase.initializeApp(BANK_CONFIG, 'bank'); }
      _db = app.firestore();
    } catch (e) {
      _initError = 'Không khởi tạo được Firebase: ' + (e && e.message); return null;
    }
    return _db;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function stripHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = String(html || '');
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* Doc Firestore -> cau hoi dang game hieu:
     {q, qHtml, opts[4], optsHtml[4], answer, ans, exp, _bank, _id} */
  function toGameQuestion(d) {
    var qHtml = d.question || '';
    var opts = (d.options || []).slice(0, 4);
    return {
      q: stripHtml(qHtml),
      qHtml: qHtml,
      opts: opts,
      optsHtml: opts.slice(),
      answer: d.correctIndex,
      ans: d.correctIndex,
      exp: d.loigiai || '',
      _bank: true,
      _id: d.id
    };
  }

  function validGameQ(q) {
    return q && q.q && (q.opts || []).length >= 2 &&
      q.answer != null && q.answer >= 0 && q.answer < q.opts.length;
  }

  /* Danh sach chuyen de cua 1 mon (+ loc lop neu grade > 0). */
  function listTopics(subjectId, grade) {
    var d = db();
    if (!d) return Promise.reject(new Error(_initError || 'Firebase chưa sẵn sàng.'));
    var col = d.collection('banks').doc(subjectId).collection('topics');
    var q = grade ? col.where('lop', '==', grade) : col;
    return q.get().then(function (snap) {
      var arr = snap.docs.map(function (doc) { return doc.data(); });
      arr.sort(function (a, b) { return (a.lop - b.lop) || (String(a.idcd).localeCompare(String(b.idcd))); });
      return arr;
    });
  }

  function drawBucket(subjectId, idcd, level, bucket) {
    var d = db();
    if (!d) return Promise.reject(new Error(_initError || 'Firebase chưa sẵn sàng.'));
    return d.collection('banks').doc(subjectId).collection('questions')
      .where('drawKey', '==', idcd + '_' + level + '_' + bucket).get()
      .then(function (snap) { return snap.docs.map(function (doc) { return doc.data(); }); });
  }

  /* Boc ngau nhien `count` cau mcq muc a/b cua 1 chuyen de.
     Tra ve {questions, got, want, short}. */
  function drawTopic(subjectId, idcd, count) {
    count = Math.max(0, count | 0);
    if (!count) return Promise.resolve({ questions: [], got: 0, want: 0, short: false });
    var pool = [];
    var seen = {};
    var startBucket = Math.floor(Math.random() * 10);
    var chain = Promise.resolve();
    for (var k = 0; k < 10 && pool.length < count; k++) {
      (function (bucket) {
        chain = chain.then(function () {
          if (pool.length >= count) return null;
          return Promise.all([drawBucket(subjectId, idcd, 'a', bucket), drawBucket(subjectId, idcd, 'b', bucket)])
            .then(function (res) {
              res[0].concat(res[1]).forEach(function (d) {
                if (d && d.id != null && !seen[d.id]) { seen[d.id] = 1; pool.push(d); }
              });
            });
        });
      })((startBucket + k) % 10);
    }
    return chain.then(function () {
      shuffle(pool);
      var picked = pool.slice(0, count).map(toGameQuestion).filter(validGameQ);
      return { questions: picked, got: picked.length, want: count, short: picked.length < count };
    });
  }

  /* Boc nhieu chuyen de 1 luc: picks = [{idcd, count}]. */
  function drawMany(subjectId, picks) {
    var jobs = (picks || []).filter(function (p) { return p && p.count > 0; })
      .map(function (p) {
        return drawTopic(subjectId, p.idcd, p.count).then(function (r) {
          r.idcd = p.idcd;
          return r;
        });
      });
    return Promise.all(jobs).then(function (results) {
      var all = [], short = [];
      results.forEach(function (r) {
        all = all.concat(r.questions);
        if (r.short) short.push({ idcd: r.idcd, got: r.got, want: r.want });
      });
      return { questions: all, got: all.length, short: short };
    });
  }

  G.SmartEduBank = {
    config: BANK_CONFIG,
    subjects: SUBJECTS,
    ready: function () { return !!db(); },
    initError: function () { return _initError; },
    listTopics: listTopics,
    drawTopic: drawTopic,
    drawMany: drawMany,
    toGameQuestion: toGameQuestion,
    validGameQ: validGameQ
  };
})(typeof window !== 'undefined' ? window : this);
