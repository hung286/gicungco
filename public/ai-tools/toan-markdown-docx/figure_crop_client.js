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
    var thRaster = opts.thRaster != null ? opts.thRaster : 0.25;
    var thVector = opts.thVector != null ? opts.thVector : 0.38;
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
    // thu tu doc (chi ghep neu cung vung doc, tranh ghep nham logo dau trang voi cau cuoi)
    var restTags = [], restFigs = [];
    tags.forEach(function (_, ti) { if (!tagDone.has(ti)) restTags.push(ti); });
    pageFigs.forEach(function (f, fi) { if (!used.has(fi)) restFigs.push(f); });
    if (restTags.length && restTags.length === restFigs.length && opts.orderFallback !== false) {
      restFigs.sort(function (a, b) { return Math.round(a.bbox[0] / 8) - Math.round(b.bbox[0] / 8) || a.bbox[1] - b.bbox[1]; });
      restTags.sort(function (a, b) {
        var A = normalizeBox(tags[a] && tags[a].bbox), B = normalizeBox(tags[b] && tags[b].bbox);
        return (A ? A[0] : 0) - (B ? B[0] : 0) || a - b;
      });
      restTags.forEach(function (ti, k) {
        var gBox = normalizeBox(tags[ti] && tags[ti].bbox);
        var fBox = restFigs[k] && restFigs[k].bbox;
        if (gBox && fBox) {
          var gCy = 0.5 * (gBox[0] + gBox[2]);
          var fCy = 0.5 * (fBox[0] + fBox[2]);
          if (Math.abs(gCy - fCy) > 220) return;
        }
        res[ti] = Object.assign({ matchedBy: "order" }, restFigs[k]);
      });
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
      var isEdgeProse = (t.text || "").trim().length > 18 && (cy < keepRect.y0 + (keepRect.y1 - keepRect.y0) * 0.18 || cy > keepRect.y1 - (keepRect.y1 - keepRect.y0) * 0.18);
      if (centerInside && !opts.maskInside && !isEdgeProse) return; // chu nam trong khung Gemini: tin khung (tru dong van ban dai o mep tren/duoi)
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
    if (textRects && textRects.length && (pad > 0 || opts.maskEdgeProse !== false)) {
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

    // Mo rong phia tren nhieu hon (padTop) de bat tron dau mui ten truc tung & nhan E_t/x(cm), giu phia duoi gon (padBot) de tranh cham bang/dap an
    var padTop = Math.max(12, Math.round(H * 0.022));
    var padBot = Math.max(4, Math.round(H * 0.008));
    var padX = Math.max(10, Math.round(W * 0.016));
    var y0Cand = Math.max(0, y0 - padTop);
    var y1Cand = Math.min(H, y1 + padBot);
    // Chi han che mo rong sang trai khi hinh thuc su nam o nua phai (wrap-text, xmin >= 420)
    var leftPadX = (xmin >= 420) ? 2 : padX;
    var x0Cand = Math.max(0, x0 - leftPadX);
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

    // Mask muc dam: bo qua luoi o ly xanh nhat (lum >= 210) nhung giu day du net ve va nhan nho
    var isInk = new Uint8Array(candW * candH);
    for (var i = 0; i < data.length; i += 4) {
      var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 50) continue;
      var lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 210) {
        isInk[i >> 2] = 1;
      }
    }

    var finalX0 = x0Cand;
    var finalX1 = x1Cand;

    // 1. Vertical Gutter Separation chi ap dung cho hinh nam o nua phai (wrap-text, xmin >= 420)
    // Tranh cat mat nhan ben trai truc tung (nhu -4, +10, E_t) cua cac do thi can giua!
    if (xmin >= 420) {
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
      var minGutterW = Math.max(8, Math.round(candW * 0.03));
      var minProseInk = Math.max(40, Math.round(candH * 0.25));
      for (var ri = 0; ri < runs.length; ri++) {
        var run = runs[ri];
        if (run.width >= minGutterW && run.start < candW * 0.40) {
          var inkBefore = 0;
          for (var c = 0; c < run.start; c++) inkBefore += colInk[c];
          if (run.start > 8 && inkBefore > minProseInk) {
            bestGutter = run;
          }
        }
      }
      if (bestGutter) {
        finalX0 = x0Cand + bestGutter.end + 1;
      }
    }

    // 1b. Vertical Gutter Separation cho hinh ben trai (Square/Tight wrap ben phai, xmax <= 720)
    if (xmax <= 720) {
      var rColInk = new Int32Array(candW);
      for (var rcy = 0; rcy < candH; rcy++) {
        var rRowOff = rcy * candW;
        for (var rcx = finalX0 - x0Cand; rcx < finalX1 - x0Cand; rcx++) {
          if (isInk[rRowOff + rcx]) rColInk[rcx]++;
        }
      }
      var rThCol = Math.max(1, Math.floor(candH * 0.02));
      var rRuns = [];
      var rCur = null;
      for (var rcol = finalX0 - x0Cand; rcol < finalX1 - x0Cand; rcol++) {
        if (rColInk[rcol] <= rThCol) {
          if (rCur === null) rCur = rcol;
        } else {
          if (rCur !== null) {
            rRuns.push({ start: rCur, end: rcol - 1, width: rcol - rCur });
            rCur = null;
          }
        }
      }
      if (rCur !== null) {
        rRuns.push({ start: rCur, end: (finalX1 - x0Cand) - 1, width: (finalX1 - x0Cand) - rCur });
      }
      for (var rri = 0; rri < rRuns.length; rri++) {
        var rRun = rRuns[rri];
        if (rRun.width >= 3 && rRun.start > candW * 0.45) {
          var inkAfter = 0;
          for (var ra = rRun.end + 1; ra < finalX1 - x0Cand; ra++) inkAfter += rColInk[ra];
          if ((finalX1 - x0Cand) - rRun.end > 5 && inkAfter > 10) {
            finalX1 = x0Cand + rRun.start;
            break;
          }
        }
      }
    }

    // 2. Horizontal Projection de got bo dong chu de phia tren va dong dap an / bang Dung-Sai phia duoi
    var cropW = Math.max(1, finalX1 - finalX0);
    var rowInk = new Int32Array(candH);
    var rowGreen = new Int32Array(candH);
    for (var ry = 0; ry < candH; ry++) {
      var rOff = ry * candW;
      var startCol = finalX0 - x0Cand;
      var endCol = finalX1 - x0Cand;
      for (var rx = startCol; rx < endCol; rx++) {
        if (isInk[rOff + rx]) rowInk[ry]++;
        var pOff = (rOff + rx) * 4;
        var pr = data[pOff], pg = data[pOff + 1], pb = data[pOff + 2];
        if (pg > pr + 15 && pg > pb + 15 && pg > 65) rowGreen[ry]++;
      }
    }

    var thRowInk = Math.max(1, Math.floor(cropW * 0.015));
    var topInk = -1, botInk = -1;
    // Dùng ngưỡng >= 1 pixel để không bao giờ cắt mất đỉnh mũi tên trục tung hoặc chữ nhỏ ở mép trên/dưới
    for (var r1 = 0; r1 < candH; r1++) {
      if (rowInk[r1] > 0) { topInk = r1; break; }
    }
    for (var r2 = candH - 1; r2 >= 0; r2--) {
      if (rowInk[r2] > 0) { botInk = r2; break; }
    }

    var finalY0 = y0Cand;
    var finalY1 = y1Cand;

    if (topInk >= 0 && botInk >= topInk) {
      // 2a. Neu ban than vung cat chi la bang xanh (Phat bieu | Dung | Sai) chu khong phai do thi -> bo qua khong cat
      var topGreenBandRows = 0;
      var topCheckEnd = Math.min(botInk, topInk + Math.max(25, Math.floor(candH * 0.30)));
      for (var tgr = topInk; tgr <= topCheckEnd; tgr++) {
        if (rowGreen[tgr] > cropW * 0.30) topGreenBandRows++;
      }
      if (topGreenBandRows >= 8) {
        return null;
      }

      // 2b. Neu co thanh tieu de bang xanh (Phat bieu | Dung | Sai) o nua duoi vung cat, cat bo tu khe trang ngay phia tren thanh xanh
      var greenStartSearch = Math.max(topInk + 20, Math.floor(candH * 0.45));
      var firstGreenRow = -1;
      for (var gr = greenStartSearch; gr <= botInk; gr++) {
        if (rowGreen[gr] > cropW * 0.28) {
          firstGreenRow = gr;
          break;
        }
      }
      if (firstGreenRow > topInk + 15) {
        var cutAboveGreen = firstGreenRow - 1;
        while (cutAboveGreen > topInk && rowInk[cutAboveGreen] === 0) {
          cutAboveGreen--;
        }
        if (cutAboveGreen > topInk + 15) {
          botInk = cutAboveGreen;
        }
      }

      // Kiem tra dong chu de phia tren bi chen vao (co khe trang nam o 35% tren cung)
      var maxTopSearch = Math.min(candH - 1, topInk + Math.floor(candH * 0.35));
      var topRuns = [];
      var curTop = null;
      for (var tr = topInk; tr <= maxTopSearch; tr++) {
        if (rowInk[tr] <= 2) {
          if (curTop === null) curTop = tr;
        } else {
          if (curTop !== null) {
            topRuns.push({ start: curTop, end: tr - 1, height: tr - curTop });
            curTop = null;
          }
        }
      }
      var maxTopTrim = Math.max(72, Math.round(candH * 0.28));
      for (var ti = 0; ti < topRuns.length; ti++) {
        var tGutter = topRuns[ti];
        if (tGutter.height < 5) continue;
        if (tGutter.start - topInk < maxTopTrim) {
          // Tính độ trải rộng ngang (spanX) của phần mực phía trên khe trắng
          var spanX0 = candW, spanX1 = -1, inkAbove = 0;
          for (var ia = topInk; ia < tGutter.start; ia++) {
            inkAbove += rowInk[ia];
            var rOff = ia * candW;
            for (var cx = 0; cx < candW; cx++) {
              if (isInk[rOff + cx]) {
                if (cx < spanX0) spanX0 = cx;
                if (cx > spanX1) spanX1 = cx;
              }
            }
          }
          var spanAboveW = (spanX1 >= spanX0) ? (spanX1 - spanX0 + 1) : 0;
          // TUYỆT ĐỐI KHÔNG gọt nếu là nhãn chữ đỉnh hình (như chữ S đỉnh chóp, chữ A/B có bề ngang hẹp < 40% cropW)
          // CHỈ gọt nếu phần phía trên là 1 dòng chữ đề thi dài trải rộng (>45% cropW) và có lượng mực đáng kể
          if (spanAboveW >= cropW * 0.45 && inkAbove >= cropW * 1.5 && inkAbove < cropW * 25) {
            topInk = tGutter.end + 1;
            continue;
          }
        }
        break;
      }

      // Kiem tra dong dap an A/B/C/D phia duoi bi chen vao (co khe trang o 50% duoi cung, luon giu it nhat 40px phia tren)
      var minBotSearch = Math.max(topInk + 40, botInk - Math.floor(candH * 0.50));
      var botRuns = [];
      var curBot = null;
      for (var br = botInk; br >= minBotSearch; br--) {
        if (rowInk[br] <= 2) {
          if (curBot === null) curBot = br;
        } else {
          if (curBot !== null) {
            botRuns.push({ start: br + 1, end: curBot, height: curBot - br });
            curBot = null;
          }
        }
      }
      var maxBotTrim = Math.max(80, Math.round(candH * 0.48));
      for (var bi = 0; bi < botRuns.length; bi++) {
        var bGutter = botRuns[bi];
        if (bGutter.height < 4) continue;
        if (botInk - bGutter.end < maxBotTrim) {
          var inkBelow = 0;
          var maxRowBelow = 0;
          var bandH = Math.max(1, botInk - bGutter.end + 1);
          for (var ib = bGutter.end; ib <= botInk; ib++) {
            inkBelow += rowInk[ib];
            if (rowInk[ib] > maxRowBelow) maxRowBelow = rowInk[ib];
          }
          var isSolidTableHeader = (inkBelow / bandH) > cropW * 0.45 && bandH <= 42;
          // Truc hoanh thuc su la net manh (chi 1-4 hang co muc > 60%), khong phai dong chu dai day dac
          var denseRows = 0;
          for (var ib2 = bGutter.end; ib2 <= botInk; ib2++) {
            if (rowInk[ib2] > cropW * 0.55) denseRows++;
          }
          var hasHorizontalAxis = maxRowBelow > cropW * 0.60 && denseRows <= 4 && !isSolidTableHeader;
          if (!hasHorizontalAxis && (inkBelow < cropW * 25 || isSolidTableHeader)) {
            botInk = bGutter.start - 1;
            continue;
          }
        }
        break;
      }

      finalY0 = Math.max(0, y0Cand + topInk - 8);
      finalY1 = Math.min(H, y0Cand + botInk + 8);
      if (firstGreenRow > topInk + 15) {
        finalY1 = Math.min(finalY1, y0Cand + firstGreenRow - 2);
      }
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
    var resX0 = (leftInkCol >= 0) ? Math.max(0, x0Cand + leftInkCol - 8) : finalX0;
    var resX1 = (rightInkCol >= 0) ? Math.min(W, x0Cand + rightInkCol + 8) : finalX1;
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

    // 3b. Loc chu Tight/Through wrap tho vao goc trai/phai (tach roi khoi hinh chinh)
    try {
      var twImg = g.getImageData(0, 0, cw, ch);
      var twData = twImg.data;
      var twInk = new Uint8Array(cw * ch);
      for (var ti2 = 0; ti2 < twData.length; ti2 += 4) {
        if (twData[ti2 + 3] >= 50) {
          var tl = 0.299 * twData[ti2] + 0.587 * twData[ti2 + 1] + 0.114 * twData[ti2 + 2];
          if (tl < 232 || twData[ti2] < 215 || twData[ti2 + 1] < 215 || twData[ti2 + 2] < 215) twInk[ti2 >> 2] = 1;
        }
      }
      var vis = new Uint8Array(cw * ch);
      var q = new Int32Array(cw * ch);
      var toMask = [];
      for (var sy = 0; sy < ch; sy++) {
        for (var sx = 0; sx < cw; sx++) {
          var sIdx = sy * cw + sx;
          if (!twInk[sIdx] || vis[sIdx]) continue;
          var qh = 0, qt = 0;
          q[qt++] = sIdx;
          vis[sIdx] = 1;
          var minX = sx, maxX = sx, minY = sy, maxY = sy, pixels = [];
          while (qh < qt) {
            var cur = q[qh++];
            pixels.push(cur);
            var cx2 = cur % cw, cy2 = (cur - cx2) / cw;
            if (cx2 < minX) minX = cx2; if (cx2 > maxX) maxX = cx2;
            if (cy2 < minY) minY = cy2; if (cy2 > maxY) maxY = cy2;
            for (var dy = -2; dy <= 2; dy++) {
              var ny = cy2 + dy;
              if (ny < 0 || ny >= ch) continue;
              for (var dx = -4; dx <= 4; dx++) {
                var nx = cx2 + dx;
                if (nx < 0 || nx >= cw) continue;
                var nIdx = ny * cw + nx;
                if (twInk[nIdx] && !vis[nIdx]) { vis[nIdx] = 1; q[qt++] = nIdx; }
              }
            }
          }
          var compH = maxY - minY + 1, compW = maxX - minX + 1;
          // Chỉ xóa chữ đề bài dài lấn vào mép trái; tuyệt đối không xóa ký hiệu trục (x, t, O, -4, +5) hay mũi tên ở mép trái/phải
          var isLeftProseBleed = minX <= 3 && compW > cw * 0.18 && maxX < cw * 0.42 && compH <= 22;
          if (isLeftProseBleed) toMask.push(pixels);
        }
      }
      if (toMask.length > 0) {
        for (var mi = 0; mi < toMask.length; mi++) {
          var pxList = toMask[mi];
          for (var pi = 0; pi < pxList.length; pi++) {
            var off = pxList[pi] * 4;
            twData[off] = 255; twData[off + 1] = 255; twData[off + 2] = 255;
          }
        }
        g.putImageData(twImg, 0, 0);
      }
    } catch (e) {}

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
      // To trang chu de bai ngoai vung hinh bang textRects truoc, sau do chay smartRefineRasterCrop de bam sat net muc (khong bi lech)
      var W = pageCanvas.width, H = pageCanvas.height;
      var keep = { x0: Math.floor(box[1] / 1000 * W), y0: Math.floor(box[0] / 1000 * H),
                   x1: Math.ceil(box[3] / 1000 * W),  y1: Math.ceil(box[2] / 1000 * H) };
      var padPx = Math.max(18, Math.round(Math.max(W, H) * 0.025));
      var crop = { x0: Math.max(0, keep.x0 - padPx), y0: Math.max(0, keep.y0 - padPx),
                   x1: Math.min(W, keep.x1 + padPx), y1: Math.min(H, keep.y1 + padPx) };
      var maskList = computeMaskRects(crop, keep, textRects, opts);
      if (maskList.length > 0) {
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = W;
        tmpCanvas.height = H;
        var tg = tmpCanvas.getContext("2d");
        tg.drawImage(pageCanvas, 0, 0);
        tg.fillStyle = "#ffffff";
        maskList.forEach(function (m) {
          tg.fillRect(m.x0 - 1, m.y0 - 1, m.x1 - m.x0 + 2, m.y1 - m.y0 + 2);
        });
        return smartRefineRasterCrop(tmpCanvas, box, opts);
      }
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
