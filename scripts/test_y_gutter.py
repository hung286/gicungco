import numpy as np
from PIL import Image

img_path = r"C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795436576580_761c049d.jpg"
im = Image.open(img_path).convert("RGB")
w, h = im.size
arr = np.array(im)

raw_ymin, raw_xmin, raw_ymax, raw_xmax = 210, 450, 400, 970
px_y0 = int(raw_ymin / 1000 * h)
px_x0 = int(raw_xmin / 1000 * w)
px_y1 = int(raw_ymax / 1000 * h)
px_x1 = int(raw_xmax / 1000 * w)

# After gutter separation: x0 is px_x0 + 34, x1 is px_x0 + 358
fx0 = px_x0 + 34
fx1 = px_x0 + 358

fig_col_region = arr[px_y0:px_y1, fx0:fx1]
is_ink = (fig_col_region[:, :, 0] < 225) | (fig_col_region[:, :, 1] < 225) | (fig_col_region[:, :, 2] < 225)
row_ink_count = np.sum(is_ink, axis=1)

print("Row ink counts in figure column (first 40 rows from y0):", row_ink_count[:40])
print("Row ink counts in figure column (last 40 rows up to y1):", row_ink_count[-40:])

# Find top ink row and bottom ink row of the figure:
ink_rows = np.where(row_ink_count > 0)[0]
if len(ink_rows) > 0:
    top_ink = ink_rows[0]
    bot_ink = ink_rows[-1]
    print(f"Figure ink starts at row {top_ink} (pixel y={px_y0 + top_ink}), ends at row {bot_ink} (pixel y={px_y0 + bot_ink})")
    
    # Save the resulting cropped figure
    cropped = im.crop((fx0 - 6, px_y0 + top_ink - 6, fx1 + 6, px_y0 + bot_ink + 6))
    cropped.save("scripts/test_crop_cau6.png")
    print("Saved test_crop_cau6.png with size:", cropped.size)
