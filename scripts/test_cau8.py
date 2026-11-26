import numpy as np
from PIL import Image

img_path = r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg"
im = Image.open(img_path).convert("RGB")
w, h = im.size
arr = np.array(im)

# Say Gemini predicted a rough box: [ymin=580, xmin=450, ymax=740, xmax=970]
raw_ymin, raw_xmin, raw_ymax, raw_xmax = 580, 450, 740, 970
px_y0 = int(raw_ymin / 1000 * h)
px_x0 = int(raw_xmin / 1000 * w)
px_y1 = int(raw_ymax / 1000 * h)
px_x1 = int(raw_xmax / 1000 * w)

crop_region = arr[px_y0:px_y1, px_x0:px_x1]
is_ink = (crop_region[:, :, 0] < 225) | (crop_region[:, :, 1] < 225) | (crop_region[:, :, 2] < 225)
col_ink_count = np.sum(is_ink, axis=0)

# Find white gutters
runs = []
cur_start = None
for idx, c in enumerate(col_ink_count):
    if c <= 2:
        if cur_start is None: cur_start = idx
    else:
        if cur_start is not None:
            runs.append((cur_start, idx - 1, idx - cur_start))
            cur_start = None
if cur_start is not None:
    runs.append((cur_start, len(col_ink_count) - 1, len(col_ink_count) - cur_start))

print("Continuous white gutters in Câu 8 crop region:")
for r in runs:
    if r[2] >= 3:
        print(f"  Gutter at col {r[0]}..{r[1]} (width {r[2]}px)")

# If there is a gutter separating the left text from the graph:
# The gutter near the middle/left of the crop region:
sep_col = 0
for r in runs:
    if r[2] >= 4 and r[0] < len(col_ink_count) * 0.5:
        sep_col = r[1] + 1

print("Chosen separation col:", sep_col, "-> absolute x0:", px_x0 + sep_col)
fx0 = px_x0 + sep_col
# Find right boundary (last gutter or ink)
fx1 = px_x1
for r in reversed(runs):
    if r[2] >= 4 and r[1] >= len(col_ink_count) - 20:
        fx1 = px_x0 + r[0]

# Now in the graph column region:
graph_region = arr[px_y0:px_y1, fx0:fx1]
is_ink_graph = (graph_region[:, :, 0] < 225) | (graph_region[:, :, 1] < 225) | (graph_region[:, :, 2] < 225)
row_ink_count = np.sum(is_ink_graph, axis=1)

ink_rows = np.where(row_ink_count > 0)[0]
top_ink = ink_rows[0]
bot_ink = ink_rows[-1]
print(f"Graph ink starts at y={px_y0 + top_ink}, ends at y={px_y0 + bot_ink}")

cropped = im.crop((fx0 - 6, px_y0 + top_ink - 6, fx1 + 6, px_y0 + bot_ink + 6))
cropped.save("scripts/test_crop_cau8.png")
print("Saved test_crop_cau8.png with size:", cropped.size)
