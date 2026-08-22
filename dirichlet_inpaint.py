import struct
import math
import subprocess
import os

src_jpg = "/Users/jfg/.gemini/antigravity/brain/de8a7f61-c2a8-4263-b216-2022fd5c98d8/liminal_green_field_portal_1787392255391.jpg"
tmp_bmp = "/Users/jfg/Library/CloudStorage/GoogleDrive-jonas.gelbrich93@gmail.com/Meine Ablage/AntigravityProjects/Webseite/portfolio/public/bg/tmp_raw.bmp"
subprocess.run(["sips", "-s", "format", "bmp", src_jpg, "--out", tmp_bmp], check=True)

with open(tmp_bmp, "rb") as f:
    header = bytearray(f.read(54))
    raw_w, raw_h = struct.unpack_from("<ii", header, 18)
    bpp = struct.unpack_from("<H", header, 28)[0]
    data = bytearray(f.read())

width = raw_w
height = abs(raw_h)
top_down = (raw_h < 0)
row_size = ((width * 3 + 3) // 4) * 4

def get_p(x, y_s):
    y = y_s if top_down else (height - 1 - y_s)
    idx = y * row_size + x * 3
    return data[idx], data[idx+1], data[idx+2]

def set_p(x, y_s, b, g, r):
    y = y_s if top_down else (height - 1 - y_s)
    idx = y * row_size + x * 3
    data[idx] = max(0, min(255, int(b)))
    data[idx+1] = max(0, min(255, int(g)))
    data[idx+2] = max(0, min(255, int(r)))

def inpaint_box_dirichlet(x1, y1, x2, y2, pad=10):
    # Sample 4 boundaries
    top_p = [get_p(x, y1 - pad) for x in range(x1, x2 + 1)]
    bot_p = [get_p(x, y2 + pad) for x in range(x1, x2 + 1)]
    left_p = [get_p(x1 - pad, y) for y in range(y1, y2 + 1)]
    right_p = [get_p(x2 + pad, y) for y in range(y1, y2 + 1)]
    
    bw = x2 - x1
    bh = y2 - y1
    
    for y_idx, y in enumerate(range(y1, y2 + 1)):
        v = y_idx / float(bh) if bh > 0 else 0
        for x_idx, x in enumerate(range(x1, x2 + 1)):
            u = x_idx / float(bw) if bw > 0 else 0
            
            # Bilinear boundary blend
            tb_b = top_p[x_idx][0] * (1 - v) + bot_p[x_idx][0] * v
            tb_g = top_p[x_idx][1] * (1 - v) + bot_p[x_idx][1] * v
            tb_r = top_p[x_idx][2] * (1 - v) + bot_p[x_idx][2] * v
            
            lr_b = left_p[y_idx][0] * (1 - u) + right_p[y_idx][0] * u
            lr_g = left_p[y_idx][1] * (1 - u) + right_p[y_idx][1] * u
            lr_r = left_p[y_idx][2] * (1 - u) + right_p[y_idx][2] * u
            
            b = (tb_b + lr_b) * 0.5
            g = (tb_g + lr_g) * 0.5
            r = (tb_r + lr_r) * 0.5
            
            noise = ((x * 37 + y * 71) % 5) - 2
            set_p(x, y, b + noise, g + noise, r + noise)

# 1. Inpaint Window Box (exact bounds: x=115..425, y=65..295)
inpaint_box_dirichlet(115, 65, 425, 295, pad=12)

# 2. Inpaint Text Box (exact bounds: x=960..1320, y=225..325)
inpaint_box_dirichlet(960, 225, 1320, 325, pad=12)

# 3. Inpaint black artifact line in grass (x=430..585, y=510..545)
inpaint_box_dirichlet(430, 510, 585, 545, pad=15)

# 10 atmospheric chapters of the Bliss universe:
chapters = [
    ("bliss-01-hero.jpg", 1.0, 1.0, 1.0, 0, 0, 0),          # Pure High Noon Bliss
    ("bliss-02-manifesto.jpg", 1.04, 1.02, 0.96, 8, 4, -4), # Warm Sunlight Afternoon
    ("bliss-03-gallery1.jpg", 0.98, 1.05, 0.92, -4, 12, -6), # Deep Emerald Meadow
    ("bliss-04-interlude1.jpg", 1.06, 0.98, 1.04, 12, 0, 12),# Soft Lavender Dusk
    ("bliss-05-gallery2.jpg", 1.08, 1.04, 0.92, 16, 8, -8),  # Golden Hour Glow
    ("bliss-06-interlude2.jpg", 0.92, 0.96, 1.08, -12, 0, 20),# Twilight Blue Hour
    ("bliss-07-gallery3.jpg", 1.02, 1.06, 0.96, 4, 10, -6),  # High Contrast Vivid Meadow
    ("bliss-08-gallery4.jpg", 0.96, 1.02, 1.02, 0, 6, 8),    # Soft Dream Haze
    ("bliss-09-interlude3.jpg", 1.12, 0.96, 1.06, 24, -4, 16),# Sunset Cloud Horizon
    ("bliss-10-footer.jpg", 0.88, 0.92, 1.12, -16, -8, 24)   # Cosmic Midnight Meadow
]

for filename, rf, gf, bf, roff, goff, boff in chapters:
    out_data = bytearray(data)
    for y_s in range(height):
        y = y_s if top_down else (height - 1 - y_s)
        for x in range(width):
            idx = y * row_size + x * 3
            b_val = data[idx] * bf + boff
            g_val = data[idx+1] * gf + goff
            r_val = data[idx+2] * rf + roff
            out_data[idx] = max(0, min(255, int(b_val)))
            out_data[idx+1] = max(0, min(255, int(g_val)))
            out_data[idx+2] = max(0, min(255, int(r_val)))
    
    bmp_path = f"/Users/jfg/Library/CloudStorage/GoogleDrive-jonas.gelbrich93@gmail.com/Meine Ablage/AntigravityProjects/Webseite/portfolio/public/bg/tmp_{filename}.bmp"
    with open(bmp_path, "wb") as f:
        f.write(header)
        f.write(out_data)
    
    jpg_path = f"/Users/jfg/Library/CloudStorage/GoogleDrive-jonas.gelbrich93@gmail.com/Meine Ablage/AntigravityProjects/Webseite/portfolio/public/bg/{filename}"
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "95", "--resampleWidth", "2880", bmp_path, "--out", jpg_path], check=True)
    os.remove(bmp_path)

os.remove(tmp_bmp)
print("Dirichlet inpainting complete across all 10 Bliss chapters!")
