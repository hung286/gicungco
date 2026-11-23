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
   * Cat tu canvas trang thong thuong (khi co textRects tu PDF layer).
   */
  function fallbackCanvasCrop(pageCanvas, box, textRects, opts) {
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

  /**
   * Smart Refine Raster Crop chuyen dung cho file hinh anh upload (JPG, PNG, anh chup, de thi scan)
   * khong co textRects vector tu PDF.
   * Tu dong:
   * 1. Tach khe ho doc (Vertical Gutter Separation) cho hinh nam ben phai cau hoi (wrap-text, xmin >= 350)
   *    -> loai bo 100% cac chu cau hoi lech ben trai.
   * 2. Gọt bo dong chu tren (cau hoi) va dong dap an duoi (A, B, C, D) bang Horizontal Projection.
   * 3. Trim vien sat net ve + dem le 6px sach se.
   * 4. Tay trang nhe nen giay scan (lum >= 238) thanh #ffffff.
   */
  function smartRefineRasterCrop(pageCanvas, box, opts) {
    opts = opts || {};
    var W = pageCanvas.width, H = pageCanvas.height;
    var ymin = box[0], xmin = box[1], ymax = box[2], xmax = box[3];
    var y0 = Math.floor(ymin / 1000 * H);
    var x0 = Math.floor(xmin / 1000 * W);
    var y1 = Math.ceil(ymax / 1000 * H);
    var x1 = Math.ceil(xmax / 1000 * W);

    // Vung ung vien mo rong an toan de tim khe ho va gọt chu
    var padY = Math.max(8, Math.round(H * 0.018));
    var padX = Math.max(8, Math.round(W * 0.025));
    var y0Cand = Math.max(0, y0 - padY);
    var y1Cand = Math.min(H, y1 + padY);
    var x0Cand = Math.max(0, x0 - padX);
    var x1Cand = Math.min(W, x1 + padX);
    var candW = x1Cand - x0Cand;
    var candH = y1Cand - y0Cand;

    if (candW <= 10 || candH <= 10) {
      return fallbackCanvasCrop(pageCanvas, box, null, opts);
    }

    var pageCtx = pageCanvas.getContext("2d", { willReadFrequently: true }) || pageCanvas.getContext("2d");
    var imgData;
    try {
      imgData = pageCtx.getImageData(x0Cand, y0Cand, candW, candH);
    } catch (e) {
      return fallbackCanvasCrop(pageCanvas, box, null, opts);
    }
    var data = imgData.data;

    // Mask muc: nhung diem khong phai trang tinh
    var isInk = new Uint8Array(candW * candH);
    for (var i = 0; i < data.length; i += 4) {
      var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 50) continue;
      var lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 232 || r < 215 || g < 215 || b < 215) {
        isInk[i >> 2] = 1;
      }
    }

    var finalX0 = x0Cand;
    var finalX1 = x1Cand;

    // 1. Vertical Gutter Separation cho hinh ben phai (wrap-text, xmin >= 350)
    if (xmin >= 350) {
      var colInk = new Int32Array(candW);
      for (var cy = 0; cy < candH; cy++) {
        var rowOffset = cy * candW;
        for (var cx = 0; cx < candW; cx++) {
          if (isInk[rowOffset + cx]) colInk[cx]++;
        }
      }
      var thColInk = Math.max(1, Math.floor(candH * 0.02));
      var runs = [];
      var curStart = null;
      for (var col = 0; col < candW; col++) {
        if (colInk[col] <= thColInk) {
          if (curStart === null) curStart = col;
        } else {
          if (curStart !== null) {
            runs.push({ start: curStart, end: col - 1, width: col - curStart });
            curStart = null;
          }
        }
      }
      if (curStart !== null) {
        runs.push({ start: curStart, end: candW - 1, width: candW - curStart });
      }

      var bestGutter = null;
      for (var ri = 0; ri < runs.length; ri++) {
        var run = runs[ri];
        if (run.width >= 3 && run.start < candW * 0.55) {
          var inkBefore = 0;
          for (var c = 0; c < run.start; c++) inkBefore += colInk[c];
          if (run.start > 5 && inkBefore > 10) {
            bestGutter = run;
          }
        }
      }
      if (bestGutter) {
        finalX0 = x0Cand + bestGutter.end + 1;
      }
    }

    // 2. Horizontal Projection de got bo dong chu de phia tren va dong dap an phia duoi
    var cropW = Math.max(1, finalX1 - finalX0);
    var rowInk = new Int32Array(candH);
    for (var ry = 0; ry < candH; ry++) {
      var rOff = ry * candW;
      var startCol = finalX0 - x0Cand;
      var endCol = finalX1 - x0Cand;
      for (var rx = startCol; rx < endCol; rx++) {
        if (isInk[rOff + rx]) rowInk[ry]++;
      }
    }

    var thRowInk = Math.max(1, Math.floor(cropW * 0.015));
    var topInk = -1, botInk = -1;
    for (var r1 = 0; r1 < candH; r1++) {
      if (rowInk[r1] > thRowInk) { topInk = r1; break; }
    }
    for (var r2 = candH - 1; r2 >= 0; r2--) {
      if (rowInk[r2] > thRowInk) { botInk = r2; break; }
    }

    var finalY0 = y0Cand;
    var finalY1 = y1Cand;

    if (topInk >= 0 && botInk >= topInk) {
      // Kiem tra dong chu de phia tren bi chen vao (co khe trang nam o 35% tren cung)
      var maxTopSearch = Math.min(candH - 1, topInk + Math.floor(candH * 0.35));
      var topRuns = [];
      var curTop = null;
      for (var tr = topInk; tr <= maxTopSearch; tr++) {
        if (rowInk[tr] <= thRowInk) {
          if (curTop === null) curTop = tr;
        } else {
          if (curTop !== null) {
            topRuns.push({ start: curTop, end: tr - 1, height: tr - curTop });
            curTop = null;
          }
        }
      }
      for (var ti = 0; ti < topRuns.length; ti++) {
        var tGutter = topRuns[ti];
        if (tGutter.height >= 4 && tGutter.start - topInk < 35) {
          var inkAbove = 0;
          for (var ia = topInk; ia < tGutter.start; ia++) inkAbove += rowInk[ia];
          if (inkAbove < cropW * 20) {
            topInk = tGutter.end + 1;
            break;
          }
        }
      }

      // Kiem tra dong dap an A/B/C/D phia duoi bi chen vao (co khe trang o 35% duoi cung)
      var minBotSearch = Math.max(0, botInk - Math.floor(candH * 0.35));
      var botRuns = [];
      var curBot = null;
      for (var br = botInk; br >= minBotSearch; br--) {
        if (rowInk[br] <= thRowInk) {
          if (curBot === null) curBot = br;
        } else {
          if (curBot !== null) {
            botRuns.push({ start: br + 1, end: curBot, height: curBot - br });
            curBot = null;
          }
        }
      }
      for (var bi = 0; bi < botRuns.length; bi++) {
        var bGutter = botRuns[bi];
        if (bGutter.height >= 4 && botInk - bGutter.end < 35) {
          var inkBelow = 0;
          for (var ib = bGutter.end; ib <= botInk; ib++) inkBelow += rowInk[ib];
          if (inkBelow < cropW * 20) {
            botInk = bGutter.start - 1;
            break;
          }
        }
      }

      finalY0 = Math.max(0, y0Cand + topInk - 6);
      finalY1 = Math.min(H, y0Cand + botInk + 6);
    }

    // 3. Trim mep ngang theo vien muc + 6px
    var finalColInk = new Int32Array(candW);
    var startRow = Math.max(0, finalY0 - y0Cand);
    var endRow = Math.min(candH, finalY1 - y0Cand);
    for (var fy = startRow; fy < endRow; fy++) {
      var fyOff = fy * candW;
      for (var fx = finalX0 - x0Cand; fx < finalX1 - x0Cand; fx++) {
        if (isInk[fyOff + fx]) finalColInk[fx]++;
      }
    }
    var leftInkCol = -1, rightInkCol = -1;
    for (var c1 = finalX0 - x0Cand; c1 < finalX1 - x0Cand; c1++) {
      if (finalColInk[c1] > 0) { leftInkCol = c1; break; }
    }
    for (var c2 = finalX1 - x0Cand - 1; c2 >= finalX0 - x0Cand; c2--) {
      if (finalColInk[c2] > 0) { rightInkCol = c2; break; }
    }
    var resX0 = (leftInkCol >= 0) ? Math.max(0, x0Cand + leftInkCol - 6) : finalX0;
    var resX1 = (rightInkCol >= 0) ? Math.min(W, x0Cand + rightInkCol + 6) : finalX1;
    var resY0 = finalY0;
    var resY1 = finalY1;

    var cw = Math.max(1, resX1 - resX0);
    var ch = Math.max(1, resY1 - resY0);

    var out = document.createElement("canvas");
    out.width = cw;
    out.height = ch;
    var g = out.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, cw, ch);
    g.drawImage(pageCanvas, resX0, resY0, cw, ch, 0, 0, cw, ch);

    // 4. Tay trang nhe nen giay scan (lum >= 238)
    if (opts.cleanScan !== false) {
      try {
        var outImg = g.getImageData(0, 0, cw, ch);
        var od = outImg.data;
        for (var oi = 0; oi < od.length; oi += 4) {
          var or = od[oi], og = od[oi + 1], ob = od[oi + 2];
          var olum = 0.299 * or + 0.587 * og + 0.114 * ob;
          if (olum >= 238) {
            od[oi] = 255;
            od[oi + 1] = 255;
            od[oi + 2] = 255;
          }
        }
        g.putImageData(outImg, 0, 0);
      } catch (e) {}
    }

    return out.toDataURL("image/png");
  }

  /**
   * Cat tu canvas trang.
   * Neu co textRects (PDF layer): dung computeMaskRects xoa chu ngoai bbox.
   * Neu khong co textRects (anh upload, scan, JPG, PNG): dung smartRefineRasterCrop
   * tach khe ho doc wrap-text, got dong chu tren/duoi va trim net ve.
   */
  function cropFromCanvas(pageCanvas, box, textRects, opts) {
    if (textRects && textRects.length > 0) {
      return fallbackCanvasCrop(pageCanvas, box, textRects, opts);
    }
    return smartRefineRasterCrop(pageCanvas, box, opts);
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
           computeMaskRects: computeMaskRects, cropFromCanvas: cropFromCanvas, smartRefineRasterCrop: smartRefineRasterCrop, fallbackCanvasCrop: fallbackCanvasCrop, resolveCrops: resolveCrops };
});
