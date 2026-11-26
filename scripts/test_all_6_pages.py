import os
from PIL import Image
import numpy as np

images = [
    ("Page 1 - Cau 1 (phao)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436566069_d12dcaf6.jpg", [340, 220, 480, 760]),
    ("Page 2 - Cau 6 (sieu am)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg", [220, 460, 390, 960]),
    ("Page 2 - Cau 8 (do thi sin)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg", [590, 640, 730, 960]),
    ("Page 2 - Cau 10 (thang song)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg", [810, 260, 930, 740]),
    ("Page 3 - Cau 11 (remote TV)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436584160_c6279a0a.jpg", [170, 490, 320, 965]),
    ("Page 3 - Cau 14 (van giao thoa)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436584160_c6279a0a.jpg", [645, 290, 805, 710]),
    ("Page 4 - Cau 17 (song dung)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436591463_2db181a7.jpg", [225, 280, 365, 720]),
    ("Page 4 - Cau 18 (dan guitar)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436591463_2db181a7.jpg", [375, 480, 515, 960]),
    ("Page 4 - P2 Cau 1 (do thi MNPQ)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436591463_2db181a7.jpg", [615, 550, 765, 965]),
    ("Page 5 - Cau 2 (ong khi loa thuoc)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436599812_d5025ebd.jpg", [235, 220, 445, 800]),
    ("Page 5 - Cau 3 (do thi u-t)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436599812_d5025ebd.jpg", [600, 250, 780, 745]),
    ("Page 6 - Cau 4 (ve tinh viễn thong)", r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436608696_4ac9281b.jpg", [65, 430, 250, 965])
]

os.makedirs("scripts/output_crops", exist_ok=True)

def auto_refine_crop(img, box):
    w, h = img.size
    arr = np.array(img.convert("RGB"))
    
    # 1. Pixel box from raw box (with margin)
    ymin, xmin, ymax, xmax = box
    y0 = int(ymin / 1000 * h)
    x0 = int(xmin / 1000 * w)
    y1 = int(ymax / 1000 * h)
    x1 = int(xmax / 1000 * w)
    
    # Expand slightly for safety before refining
    pad_y = int(0.015 * h)
    pad_x = int(0.02 * w)
    y0_cand = max(0, y0 - pad_y)
    y1_cand = min(h, y1 + pad_y)
    x0_cand = max(0, x0 - pad_x)
    x1_cand = min(w, x1 + pad_x)
    
    sub = arr[y0_cand:y1_cand, x0_cand:x1_cand]
    sh, sw, _ = sub.shape
    
    # Is ink: luminance < 230 or any channel < 220
    lum = 0.299 * sub[:, :, 0] + 0.587 * sub[:, :, 1] + 0.114 * sub[:, :, 2]
    is_ink = lum < 232
    
    # 2. Check if this is a wrap-text figure (on the right half, xmin > 350)
    # For wrap-text figures, we need to separate the left text column
    final_x0 = x0_cand
    final_x1 = x1_cand
    
    if xmin >= 350:
        # Vertical projection across the candidate width
        col_ink = np.sum(is_ink, axis=0) # length sw
        
        # Look for the vertical gutter between text on the left and figure on the right
        # Find runs of low ink columns (ink count <= 1% of height)
        # Search starting from 0 up to about 50% of candidate width
        threshold_col_ink = max(1, int(sh * 0.02))
        
        # Find continuous zero/low ink column runs
        runs = []
        cur_start = None
        for col_idx in range(sw):
            if col_ink[col_idx] <= threshold_col_ink:
                if cur_start is None: cur_start = col_idx
            else:
                if cur_start is not None:
                    runs.append((cur_start, col_idx - 1, col_idx - cur_start))
                    cur_start = None
        if cur_start is not None:
            runs.append((cur_start, sw - 1, sw - cur_start))
            
        # The gutter we want is typically between the left text and the figure
        # Text on the left usually has ink columns, followed by a gutter >= 3px
        best_gutter = None
        for r in runs:
            # Gutter width >= 3px and starts before 55% of the candidate box
            if r[2] >= 3 and r[0] < sw * 0.55:
                # Check if there is significant ink before this gutter (indicating text was clipped)
                if r[0] > 5 and np.sum(col_ink[:r[0]]) > 10:
                    best_gutter = r
                    
        if best_gutter:
            # Move x0 past this gutter!
            gutter_right = best_gutter[1]
            final_x0 = x0_cand + gutter_right + 1
            print(f"    [Vertical Gutter found] shifted x0 from {x0_cand} to {final_x0} (cleared {best_gutter[2]}px gutter)")

    # 3. Horizontal projection to strip encroaching text above (question) or below (choices)
    # Recalculate sub-region with final_x0 and final_x1
    sub_w = arr[y0_cand:y1_cand, final_x0:final_x1]
    lum_w = 0.299 * sub_w[:, :, 0] + 0.587 * sub_w[:, :, 1] + 0.114 * sub_w[:, :, 2]
    is_ink_w = lum_w < 232
    
    row_ink = np.sum(is_ink_w, axis=1) # length sh
    threshold_row_ink = max(1, int((final_x1 - final_x0) * 0.015))
    
    # Find ink bounds
    ink_rows = np.where(row_ink > threshold_row_ink)[0]
    if len(ink_rows) > 0:
        top_ink = ink_rows[0]
        bot_ink = ink_rows[-1]
        
        # Check if top_ink was a single text line separated by a blank gap
        # Look for horizontal white gap in the top 30% of height
        top_runs = []
        cur = None
        for r in range(top_ink, min(sh, top_ink + int(sh * 0.35))):
            if row_ink[r] <= threshold_row_ink:
                if cur is None: cur = r
            else:
                if cur is not None:
                    top_runs.append((cur, r - 1, r - cur))
                    cur = None
        # If there is a horizontal gap >= 4px after a small ink burst (1-2 text lines)
        for gr in top_runs:
            if gr[2] >= 4 and gr[0] - top_ink < 30: # 30px is ~1-2 lines of text
                # Check if ink above this gap is sparse (like a line of text)
                ink_above = np.sum(row_ink[top_ink:gr[0]])
                if ink_above < (final_x1 - final_x0) * 15: # typical text line
                    print(f"    [Top Text Stripped] jumped top_ink from {top_ink} to {gr[1] + 1}")
                    top_ink = gr[1] + 1
                    break
                    
        # Check if bottom ink was an encroaching answer line
        bot_runs = []
        cur = None
        for r in range(bot_ink, max(0, bot_ink - int(sh * 0.35)), -1):
            if row_ink[r] <= threshold_row_ink:
                if cur is None: cur = r
            else:
                if cur is not None:
                    bot_runs.append((r + 1, cur, cur - r))
                    cur = None
        for gr in bot_runs:
            if gr[2] >= 4 and bot_ink - gr[1] < 30:
                ink_below = np.sum(row_ink[gr[1]:bot_ink + 1])
                if ink_below < (final_x1 - final_x0) * 15:
                    print(f"    [Bottom Text Stripped] adjusted bot_ink from {bot_ink} to {gr[0] - 1}")
                    bot_ink = gr[0] - 1
                    break

        final_y0 = max(0, y0_cand + top_ink - 6)
        final_y1 = min(h, y0_cand + bot_ink + 6)
    else:
        final_y0 = y0_cand
        final_y1 = y1_cand
        
    # Also trim horizontal right/left ink
    sub_final = arr[final_y0:final_y1, final_x0:final_x1]
    lum_f = 0.299 * sub_final[:, :, 0] + 0.587 * sub_final[:, :, 1] + 0.114 * sub_final[:, :, 2]
    is_ink_f = lum_f < 232
    col_ink_f = np.sum(is_ink_f, axis=0)
    ink_cols = np.where(col_ink_f > 0)[0]
    if len(ink_cols) > 0:
        c_left = max(0, ink_cols[0] - 6)
        c_right = min(final_x1 - final_x0, ink_cols[-1] + 6)
        res_x0 = final_x0 + c_left
        res_x1 = final_x0 + c_right
    else:
        res_x0 = final_x0
        res_x1 = final_x1
        
    res_crop = img.crop((res_x0, final_y0, res_x1, final_y1))
    return res_crop

print("Testing all 12 figures across 6 pages:")
for name, path, box in images:
    if os.path.exists(path):
        im = Image.open(path)
        print(f"\nProcessing: {name} (size {im.size})")
        res = auto_refine_crop(im, box)
        safe_name = name.replace(" ", "_").replace("(", "").replace(")", "").replace("-", "_").replace("/", "_")
        out_path = f"scripts/output_crops/{safe_name}.png"
        res.save(out_path)
        print(f"  -> Saved {out_path} ({res.size[0]}x{res.size[1]})")
    else:
        print(f"File not found: {path}")
