#!/usr/bin/env python3
"""
pdf_figure_extractor.py  -  trich hinh sach tu PDF (dung chung cho MOI file de).

Nguyen tac (uu tien crop):
  * Hinh raster nhung san  -> cat DUNG khung anh, pad = 0  (khong dinh chu quanh).
  * Hinh vector (do thi, hinh hoc) -> gom net ve gan nhau, giu nhan ngan nam sat hinh,
    to trang moi dong chu khac chen vao vung cat. Khong dilate / close / threshold.
  * Loai: anh rac < 40px, khung tieu de / bang chu, duong ke ngang, nen trang scan.
  * PDF scan (khong co lop chu) -> danh dau page.scan = true de client dung nhanh du phong.

Dau ra tuong thich /api/pdf-extract-figures:
  pages[].images[] va figures[]:
    id, index, pageNo, type("raster"|"vector"), xref, bbox=[ymin,xmin,ymax,xmax] thang 0..1000
    goc tren-trai, widthPx, heightPx, widthPt, heightPt, wordWidthPx, wordHeightPx, dataUrl

Engine: PyMuPDF (fitz) neu co, neu khong thi pdfplumber. Render trang bang pdftoppm
(neu co) hoac fitz.

Dung:
  python pdf_figure_extractor.py de1.pdf de2.pdf thu_muc/ --out ket_qua [--dpi 300]
"""
import argparse
import base64
import glob
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

MIN_IMG_PX = 40            # bo anh nho hon (anh 2x2, mask rac)
MIN_FIG_PT = 14.0          # canh toi thieu cua hinh (pt)
CLUSTER_GAP_PT = 12.0      # gom net ve cach nhau <= gap
RASTER_TILE_GAP_PT = 1.5   # anh bi cat thanh nhieu manh sat nhau -> gop
LABEL_GAP_PT = 10.0        # nhan ngan trong vong nay quanh hinh vector duoc giu
LABEL_MAX_CHARS = 4
MAX_TEXT_CHARS_VECTOR = 80 # cum vector chua nhieu chu hon -> khung/bang chu, bo
FULLPAGE_RATIO = 0.80      # anh phu > 80% trang = nen scan, khong phai hinh
PAD_VECTOR_PT = 2.0


# ----------------------------------------------------------------------------- hinh hoc
def rect_union(a, b):
    return (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))


def rect_area(r):
    return max(0.0, r[2] - r[0]) * max(0.0, r[3] - r[1])


def rect_inter(a, b):
    x0, y0, x1, y1 = max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])
    return (x0, y0, x1, y1) if x1 > x0 and y1 > y0 else None


def rect_grow(r, g):
    return (r[0] - g, r[1] - g, r[2] + g, r[3] + g)


def rects_touch(a, b, gap):
    return not (a[2] + gap < b[0] or b[2] + gap < a[0] or a[3] + gap < b[1] or b[3] + gap < a[1])


def cluster_rects(rects, gap):
    """Gom cac hcn gan nhau (lien thong theo gap). Tra ve danh sach khung hop nhat."""
    boxes = [tuple(r) for r in rects]
    merged = True
    while merged:
        merged = False
        out = []
        while boxes:
            cur = boxes.pop()
            changed = True
            while changed:
                changed = False
                rest = []
                for b in boxes:
                    if rects_touch(cur, b, gap):
                        cur = rect_union(cur, b)
                        changed = True
                        merged = True
                    else:
                        rest.append(b)
                boxes = rest
            out.append(cur)
        boxes = out
    return boxes


# ----------------------------------------------------------------------------- engine
class PageInfo:
    def __init__(self, width, height, images, drawings, words):
        self.width, self.height = width, height
        self.images = images      # [(rect, w_px, h_px, xref)]
        self.drawings = drawings  # [rect]
        self.words = words        # [(rect, text)]


def load_pages_fitz(path):
    import fitz
    doc = fitz.open(path)
    for pno, page in enumerate(doc):
        imgs = []
        for info in page.get_image_info(xrefs=True):
            r = tuple(info["bbox"])
            imgs.append((r, int(info.get("width", 0)), int(info.get("height", 0)), int(info.get("xref", 0))))
        draws = [tuple(d["rect"]) for d in page.get_drawings()]
        words = [((w[0], w[1], w[2], w[3]), w[4]) for w in page.get_text("words")]
        yield pno + 1, PageInfo(page.rect.width, page.rect.height, imgs, draws, words), page.get_text("text")


def load_pages_plumber(path):
    import pdfplumber
    with pdfplumber.open(path) as pdf:
        for pno, page in enumerate(pdf.pages):
            imgs = []
            for k, im in enumerate(page.images):
                w, h = (im.get("srcsize") or (0, 0))
                imgs.append(((im["x0"], im["top"], im["x1"], im["bottom"]), int(w), int(h), k + 1))
            draws = []
            for coll in (page.rects, page.lines, page.curves):
                for o in coll:
                    draws.append((o["x0"], o["top"], o["x1"], o["bottom"]))
            words = [((w["x0"], w["top"], w["x1"], w["bottom"]), w["text"]) for w in page.extract_words()]
            yield pno + 1, PageInfo(float(page.width), float(page.height), imgs, draws, words), page.extract_text() or ""


def load_pages(path, engine):
    if engine in ("auto", "fitz"):
        try:
            import fitz  # noqa: F401
            return "fitz", load_pages_fitz(path)
        except ImportError:
            if engine == "fitz":
                raise
    return "pdfplumber", load_pages_plumber(path)


def render_page(path, pno, dpi, cache_dir, engine_name):
    """Render ca trang -> PIL.Image. Dung pdftoppm neu co (khong can fitz)."""
    out = os.path.join(cache_dir, f"p{pno}")
    if shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(pno), "-l", str(pno), "-png", "-singlefile",
                        path, out], check=True, capture_output=True)
        return Image.open(out + ".png").convert("RGB")
    import fitz
    doc = fitz.open(path)
    pix = doc[pno - 1].get_pixmap(dpi=dpi, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


# ----------------------------------------------------------------------------- phat hien hinh
def detect_figures(pg):
    """Tra ve danh sach {'rect','type','xref'} theo thu tu doc (tren->duoi, trai->phai)."""
    page_area = pg.width * pg.height
    raw = []
    for r, wpx, hpx, xref in pg.images:
        if (wpx and wpx < MIN_IMG_PX) or (hpx and hpx < MIN_IMG_PX):
            continue
        if (r[2] - r[0]) < MIN_FIG_PT or (r[3] - r[1]) < MIN_FIG_PT:
            continue
        raw.append((r, xref))

    # gop cac manh anh sat nhau thanh 1 hinh
    figs = []
    rects = [r for r, _ in raw]
    for c in cluster_rects(rects, RASTER_TILE_GAP_PT):
        xr = next((x for r, x in raw if rect_inter(r, c)), 0)
        figs.append({"rect": c, "type": "raster", "xref": xr})

    # nen scan: anh phu gan het trang
    scan = False
    kept = []
    for f in figs:
        if rect_area(f["rect"]) / max(1.0, page_area) > FULLPAGE_RATIO:
            scan = True
            continue
        kept.append(f)
    figs = kept

    # hinh vector
    raster_rects = [f["rect"] for f in figs]
    vec = []
    for d in pg.drawings:
        w, h = d[2] - d[0], d[3] - d[1]
        if w > 0.8 * pg.width and h < 6:       # duong ke ngang / phan cach
            continue
        # net ve nam tron trong 1 anh raster -> bo
        if any(rect_inter(d, rr) and rect_area(rect_inter(d, rr)) >= 0.9 * rect_area(d) for rr in raster_rects):
            continue
        vec.append(d)
    for c in cluster_rects(vec, CLUSTER_GAP_PT):
        w, h = c[2] - c[0], c[3] - c[1]
        if w < MIN_FIG_PT or h < MIN_FIG_PT:
            continue
        # khung / bang chu: nhieu chu nam trong cum
        inside = [t for r, t in pg.words
                  if rect_inter(r, c) and rect_area(rect_inter(r, c)) >= 0.5 * rect_area(r)]
        if sum(len(t) for t in inside) > MAX_TEXT_CHARS_VECTOR:
            continue
        # khung gan tron trang (khung vien de thi)
        if rect_area(c) / max(1.0, page_area) > 0.6:
            continue
        c = absorb_labels(c, pg.words)
        figs.append({"rect": c, "type": "vector", "xref": 0})

    figs.sort(key=lambda f: (round(f["rect"][1] / 8), f["rect"][0]))
    return figs, scan


def paragraph_words(words, min_chars=20):
    """Chi so cac tu thuoc DONG DOAN VAN (dong dai). Nhan do thi thuong ngan nen khong bi tinh."""
    order = sorted(range(len(words)), key=lambda i: (round(words[i][0][1] / 2.5), words[i][0][0]))
    lines, cur = [], []
    for i in order:
        r = words[i][0]
        if cur:
            pr = words[cur[-1]][0]
            if abs(r[1] - pr[1]) < 2.5 and 0 <= r[0] - pr[2] < 10:
                cur.append(i)
                continue
            lines.append(cur)
        cur = [i]
    if cur:
        lines.append(cur)
    out = set()
    for ln in lines:
        if sum(len(words[i][1]) for i in ln) + len(ln) - 1 > min_chars:
            out.update(ln)
    return out


def absorb_labels(rect, words):
    """Giu nhan ngan (A, x, -1, O...) nam sat hinh vector, bo chu cua doan van."""
    para = paragraph_words(words)
    changed = True
    while changed:
        changed = False
        for wi, (r, t) in enumerate(words):
            if wi in para or len(t) > LABEL_MAX_CHARS or not rects_touch(rect, r, LABEL_GAP_PT):
                continue
            if r[0] >= rect[0] and r[1] >= rect[1] and r[2] <= rect[2] and r[3] <= rect[3]:
                continue
            # co lap voi chu khac cung dong khong? (la chu doan van, khong phai nhan)
            same_line_neighbors = [
                1 for r2, t2 in words
                if r2 is not r and abs(r2[1] - r[1]) < 2.5 and 0 <= (r2[0] - r[2]) < 8 and len(t2) > LABEL_MAX_CHARS
            ] + [
                1 for r2, t2 in words
                if r2 is not r and abs(r2[1] - r[1]) < 2.5 and 0 <= (r[0] - r2[2]) < 8 and len(t2) > LABEL_MAX_CHARS
            ]
            if same_line_neighbors:
                continue
            rect = rect_union(rect, r)
            changed = True
    return rect


# ----------------------------------------------------------------------------- cat anh
def crop_figure(page_img, pg, fig, dpi):
    s = dpi / 72.0
    r = fig["rect"]
    pad = 0.0 if fig["type"] == "raster" else PAD_VECTOR_PT
    box = (max(0.0, r[0] - pad), max(0.0, r[1] - pad), min(pg.width, r[2] + pad), min(pg.height, r[3] + pad))
    px = (int(round(box[0] * s)), int(round(box[1] * s)), int(round(box[2] * s)), int(round(box[3] * s)))
    img = page_img.crop(px).copy()
    if fig["type"] == "vector":
        # to trang moi chu nam NGOAI khung hinh (da gom nhan) ma lot vao vung cat
        keep = fig["rect"]
        para = paragraph_words(pg.words)
        for wi, (wr, _t) in enumerate(pg.words):
            inter = rect_inter(wr, box)
            if not inter:
                continue
            inside_keep = rect_inter(wr, keep) and rect_area(rect_inter(wr, keep)) >= 0.5 * rect_area(wr)
            if inside_keep and wi not in para:
                continue
            m = (int(round((inter[0] - box[0]) * s)) - 1, int(round((inter[1] - box[1]) * s)) - 1,
                 int(round((inter[2] - box[0]) * s)) + 1, int(round((inter[3] - box[1]) * s)) + 1)
            img.paste((255, 255, 255), m)
    return img, box


def to_data_url(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG", dpi=(300, 300))
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


# ----------------------------------------------------------------------------- chinh
def extract_figures(path, dpi=300, engine="auto", with_data_url=True, out_dir=None):
    engine_name, it = load_pages(path, engine)
    cache = tempfile.mkdtemp(prefix="figx_")
    pages, flat, idx = [], [], 0
    try:
        for pno, pg, text in it:
            figs, scan = detect_figures(pg)
            page_img = render_page(path, pno, dpi, cache, engine_name) if figs else None
            images = []
            for f in figs:
                idx += 1
                img, box = crop_figure(page_img, pg, f, dpi)
                wpt, hpt = box[2] - box[0], box[3] - box[1]
                item = {
                    "id": f"fig_{idx}", "index": idx, "pageNo": pno, "type": f["type"], "xref": f["xref"],
                    "bbox": [round(box[1] / pg.height * 1000), round(box[0] / pg.width * 1000),
                             round(box[3] / pg.height * 1000), round(box[2] / pg.width * 1000)],
                    "widthPx": img.width, "heightPx": img.height,
                    "widthPt": round(wpt, 2), "heightPt": round(hpt, 2),
                    "wordWidthPx": round(wpt * 96 / 72), "wordHeightPx": round(hpt * 96 / 72),
                }
                if out_dir:
                    os.makedirs(out_dir, exist_ok=True)
                    fn = os.path.join(out_dir, f"p{pno}_{item['id']}_{f['type']}.png")
                    img.save(fn)
                    item["file"] = fn
                if with_data_url:
                    item["dataUrl"] = to_data_url(img)
                images.append(item)
                flat.append(item)
            pages.append({"pageNo": pno, "text": text, "scan": scan or (not pg.words and bool(pg.images)),
                          "images": images})
    finally:
        shutil.rmtree(cache, ignore_errors=True)
    return {"success": True, "engine": engine_name, "pages": pages, "figures": flat}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+", help="file PDF hoac thu muc")
    ap.add_argument("--out", default="figures_out")
    ap.add_argument("--dpi", type=int, default=300)
    ap.add_argument("--engine", default="auto", choices=["auto", "fitz", "pdfplumber"])
    a = ap.parse_args()
    files = []
    for i in a.inputs:
        files += sorted(glob.glob(os.path.join(i, "*.pdf"))) if os.path.isdir(i) else [i]
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        res = extract_figures(f, a.dpi, a.engine, with_data_url=False, out_dir=os.path.join(a.out, name))
        with open(os.path.join(a.out, name + ".json"), "w", encoding="utf-8") as fh:
            json.dump(res, fh, ensure_ascii=False, indent=1)
        print(f"\n== {name}  (engine={res['engine']}, {len(res['figures'])} hinh)")
        for p in res["pages"]:
            if p["scan"]:
                print(f"  trang {p['pageNo']}: SCAN -> dung nhanh layout detector o client")
            for im in p["images"]:
                print(f"  trang {p['pageNo']}  {im['id']:7s} {im['type']:6s} {im['widthPx']}x{im['heightPx']}px  bbox={im['bbox']}")


if __name__ == "__main__":
    main()
