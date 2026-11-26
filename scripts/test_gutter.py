import numpy as np
from PIL import Image

img_path = r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg"
im = Image.open(img_path).convert("RGB")
w, h = im.size
arr = np.array(im)

print(f"Image size: {w}x{h}")

# Let's say Gemini predicted an approximate (imperfect) bbox for Câu 6 (thai nhi):
# e.g. [ymin=210, xmin=450, ymax=400, xmax=970] in 0..1000 coordinates
# Notice xmin=450 encroaches on the left text!
raw_ymin, raw_xmin, raw_ymax, raw_xmax = 210, 450, 400, 970

# Convert to pixels:
px_y0 = int(raw_ymin / 1000 * h)
px_x0 = int(raw_xmin / 1000 * w)
px_y1 = int(raw_ymax / 1000 * h)
px_x1 = int(raw_xmax / 1000 * w)

print(f"Raw pixel box: y0={px_y0}, x0={px_x0}, y1={px_y1}, x1={px_x1}")

# Crop region
crop_region = arr[px_y0:px_y1, px_x0:px_x1]
# Ink mask: where pixels are not white (e.g. any channel < 220)
is_ink = (crop_region[:, :, 0] < 225) | (crop_region[:, :, 1] < 225) | (crop_region[:, :, 2] < 225)

# 1. Vertical projection (sum along rows) to see ink columns
col_ink_count = np.sum(is_ink, axis=0)
print(f"Col ink counts (first 80 cols from x0):", col_ink_count[:80])

# Notice: In the gutter between text on the left and the figure on the right,
# there is a vertical strip of 0 ink (or near 0)!
# Let's find the vertical gutter!
# Any column with 0 ink:
zeros = np.where(col_ink_count == 0)[0]
print(f"Zero ink column indices in crop region:", zeros[:30])

# The true gutter between left text and figure:
# It's a continuous run of zero-ink columns!
runs = []
cur_start = None
for idx, c in enumerate(col_ink_count):
    if c <= 1: # almost 0 ink
        if cur_start is None: cur_start = idx
    else:
        if cur_start is not None:
            runs.append((cur_start, idx - 1, idx - cur_start))
            cur_start = None
if cur_start is not None:
    runs.append((cur_start, len(col_ink_count) - 1, len(col_ink_count) - cur_start))

print("Continuous white gutters (start, end, width):")
for r in runs:
    if r[2] >= 4:
        print(f"  Gutter at col {r[0]}..{r[1]} (width {r[2]}px)")
