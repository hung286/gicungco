/*
 * figure_crop_client.js  -  crop hinh chuan cho tool toan-markdown-docx (dung chung moi file de).
 *
 * Moi toa do bbox: [ymin, xmin, ymax, xmax] thang 0..1000, goc tren-trai
 * (giong normalizeGeminiBox2d va /api/pdf-extract-figures).
 *
 * Thu tu uu tien khi crop:
 *   1. Hinh server (anh nhung / vector da gom)  -> dataUrl sach, KHONG qua Snap-to-Ink/autoTrim/clean.
 *   2. Khong ghep duoc -> cat tu canvas trang DUNG bbox, chi to trang chu ngoai bbox (neu co text layer).
 *   3. Khong co gi -> cat dung bbox, khong sua pixel.
 * Khong dilate / close / threshold / lam dam net o bat ky nhanh nao.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FigureCrop = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------- bbox
  function normalizeBox(raw) {
    if (!raw) return null;
    var v = Array.isArray(raw) ? raw : (Array.isArray(raw.box_2d) ? raw.box_2d : [raw.ymin, raw.xmin, raw.ymax, raw.xmax]);
    if (!v || v.length < 4) return null;
    var a = v.map(Number);
    if (!a.every(Number.isFinite)) return null;
    var ymin = a[0], xmin = a[1], ymax = a[2], xmax = a[3];
    if (ymax <= 1.01 && xmax <= 1.01 && ymin >= 0 && xmin >= 0) { ymin *= 1000; xmin *= 1000; ymax *= 1000; xmax *= 1000; }
    if (ymin > ymax) { var t = ymin; ymin = ymax; ymax = t; }
    if (xmin > xmax) { var u = xmin; xmin = xmax; xmax = u; }
    var c = function (n) { return Math.max(0, Math.min(1000, n)); };
    ymin = c(ymin); xmin = c(xmin); ymax = c(ymax); xmax = c(xmax);
    return (ymax > ymin && xmax > xmin) ? [ymin, xmin, ymax, xmax] : null;
  }

  function area(b) { return Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]); }
  function inter(a, b) {
    var y0 = Math.max(a[0], b[0]), x0 = Math.max(a[1], b[1]), y1 = Math.min(a[2], b[2]), x1 = Math.min(a[3], b[3]);
    return (y1 > y0 && x1 > x0) ? (y1 - y0) * (x1 - x0) : 0;
  }

  // 0.7 * (phan hinh server nam trong khung Gemini) + 0.3 * IoU.
  // Phan "phu" chiu duoc khung Gemini lech/thua chu; IoU phan biet hai hinh o gan nhau.
  function matchScore(fig, g) {
    var i = inter(fig, g), aF = area(fig), aG = area(g);
    if (!i) return 0;
    return 0.7 * i / Math.max(1, aF) + 0.3 * i / Math.max(1, aF + aG - i);
  }

  // ---------------------------------------------------------------- ghep the <-> hinh
  /**
   * pageFigs : [{id,type,bbox,dataUrl,...}] cua MOT trang (tu server)
   * tags     : [{bbox}] cac the [HINH_CROP] tren trang do (theo thu tu trong van ban)
   * Tra ve mang cung do dai voi tags: figure | null.  Moi hinh chi gan cho 1 the.
   * Buoc 1: tham lam theo diem giam dan.  Buoc 2: neu con lai so the == so hinh thi ghep theo thu tu doc.
   */
  function assignTagsToFigures(pageFigs, tags, opts) {
    opts = opts || {};
    var thRaster = opts.thRaster != null ? opts.thRaster : 0.35;
    var thVector = opts.thVector != null ? opts.thVector : 0.55;   // cao hon: khung tieu de de bi nhan nham
    var res = new Array(tags.length).fill(null), used = new Set(), pairs = [];
    tags.forEach(function (tg, ti) {
      var g = normalizeBox(tg && tg.bbox);
      if (!g) return;
      pageFigs.forEach(function (f, fi) {
        var s = matchScore(f.bbox, g), th = f.type === "vector" ? thVector : thRaster;
        if (s >= th) pairs.push({ ti: ti, fi: fi, s: s });
      });
    });
    pairs.sort(function (a, b) { return b.s - a.s; });
    var tagDone = new Set();
    pairs.forEach(function (p) {
      if (tagDone.has(p.ti) || used.has(p.fi)) return;
      res[p.ti] = pageFigs[p.fi]; tagDone.add(p.ti); used.add(p.fi);
    });
    // thu tu doc
    var restTags = [], restFigs = [];
    tags.forEach(function (_, ti) { if (!tagDone.has(ti)) restTags.push(ti); });
    pageFigs.forEach(function (f, fi) { if (!used.has(fi)) restFigs.push(f); });
    if (restTags.length && restTags.length === restFigs.length && opts.orderFallback !== false) {
      restFigs.sort(function (a, b) { return Math.round(a.bbox[0] / 8) - Math.round(b.bbox[0] / 8) || a.bbox[1] - b.bbox[1]; });
      restTags.sort(function (a, b) {
        var A = normalizeBox(tags[a] && tags[a].bbox), B = normalizeBox(tags[b] && tags[b].bbox);
        return (A ? A[0] : 0) - (B ? B[0] : 0) || a - b;
      });
      restTags.forEach(function (ti, k) { res[ti] = Object.assign({ matchedBy: "order" }, restFigs[k]); });
    }
    return res;
  }

  // ---------------------------------------------------------------- nhanh du phong tu canvas
  /**
   * Cac hcn (pixel canvas) can to trang: chu nam trong vung cat nhung tam nam NGOAI bbox goc
   * (chua cong padding). Nhan ngan nam sat/trong hinh duoc giu.
   * textRects: [{x0,y0,x1,y1,text}] pixel canvas.
   */
  function computeMaskRects(cropRect, keepRect, textRects, opts) {
    opts = opts || {};
    var labelMax = opts.labelMaxChars || 4;
    var out = [];
    textRects.forEach(function (t) {
      var ix0 = Math.max(t.x0, cropRect.x0), iy0 = Math.max(t.y0, cropRect.y0);
      var ix1 = Math.min(t.x1, cropRect.x1), iy1 = Math.min(t.y1, cropRect.y1);
      if (ix1 <= ix0 || iy1 <= iy0) return;
      var cx = (t.x0 + t.x1) / 2, cy = (t.y0 + t.y1) / 2;
      var centerInside = cx >= keepRect.x0 && cx <= keepRect.x1 && cy >= keepRect.y0 && cy <= keepRect.y1;
      var isLabel = (t.text || "").trim().length <= labelMax;
      if (centerInside && isLabel) return;          // nhan trong hinh
      if (centerInside && !opts.maskInside) return; // chu nam trong khung Gemini: tin khung
      out.push({ x0: ix0, y0: iy0, x1: ix1, y1: iy1 });
    });
    return out;
  }

  /**
   * Cat tu canvas trang. Khong snap-to-ink, khong autoTrim, khong lam dam net.
   * pageCanvas: HTMLCanvasElement; box: bbox 0..1000; textRects: tuy chon (pixel canvas).
   */
  function cropFromCanvas(pageCanvas, box, textRects, opts) {
    opts = opts || {};
    var W = pageCanvas.width, H = pageCanvas.height;
    var keep = { x0: Math.floor(box[1] / 1000 * W), y0: Math.floor(box[0] / 1000 * H),
                 x1: Math.ceil(box[3] / 1000 * W),  y1: Math.ceil(box[2] / 1000 * H) };
    var pad = opts.padPx || 0;
    var crop = { x0: Math.max(0, keep.x0 - pad), y0: Math.max(0, keep.y0 - pad),
                 x1: Math.min(W, keep.x1 + pad), y1: Math.min(H, keep.y1 + pad) };
    var cw = crop.x1 - crop.x0, ch = crop.y1 - crop.y0;
    var out = document.createElement("canvas"); out.width = cw; out.height = ch;
    var g = out.getContext("2d");
    g.drawImage(pageCanvas, crop.x0, crop.y0, cw, ch, 0, 0, cw, ch);
    if (textRects && textRects.length && pad > 0) {
      g.fillStyle = "#fff";
      computeMaskRects(crop, keep, textRects, opts).forEach(function (m) {
        g.fillRect(m.x0 - crop.x0 - 1, m.y0 - crop.y0 - 1, m.x1 - m.x0 + 2, m.y1 - m.y0 + 2);
      });
    }
    return out.toDataURL("image/png");
  }

  // ---------------------------------------------------------------- API chinh
  /**
   * Thay cho cropFigureFromPage cu.
   *   serverPages : window.allPdfDetectedFigures  ([{pageNo, images:[...], scan}])
   *   getPageCanvas(pageNo) -> canvas trang (cho nhanh du phong)
   *   getTextRects(pageNo)  -> [{x0,y0,x1,y1,text}] pixel canvas (pdf.js getTextContent), tuy chon
   * Tra ve {dataUrl, source:'server'|'canvas', figId?, matchedBy?}
   */
  function resolveCrops(items, serverPages, getPageCanvas, getTextRects, opts) {
    var byPage = {};
    items.forEach(function (it, i) { (byPage[it.pageNo || 1] = byPage[it.pageNo || 1] || []).push(i); });
    var results = new Array(items.length);
    Object.keys(byPage).forEach(function (pn) {
      var idxs = byPage[pn];
      var pg = (serverPages || []).find(function (p) { return p.pageNo === Number(pn); });
      var figs = pg && !pg.scan ? (pg.images || []) : [];
      var assigned = figs.length ? assignTagsToFigures(figs, idxs.map(function (i) { return items[i]; }), opts) : idxs.map(function () { return null; });
      idxs.forEach(function (itemIdx, k) {
        var f = assigned[k];
        if (f && f.dataUrl) { results[itemIdx] = { dataUrl: f.dataUrl, source: "server", figId: f.id, matchedBy: f.matchedBy || "bbox" }; return; }
        var box = normalizeBox(items[itemIdx].bbox), cv = getPageCanvas && getPageCanvas(Number(pn));
        if (box && cv) {
          var tr = getTextRects ? getTextRects(Number(pn)) : null;
          results[itemIdx] = { dataUrl: cropFromCanvas(cv, box, tr, opts), source: "canvas" };
        } else results[itemIdx] = null;
      });
    });
    return results;
  }

  return { normalizeBox: normalizeBox, matchScore: matchScore, assignTagsToFigures: assignTagsToFigures,
           computeMaskRects: computeMaskRects, cropFromCanvas: cropFromCanvas, resolveCrops: resolveCrops };
});
