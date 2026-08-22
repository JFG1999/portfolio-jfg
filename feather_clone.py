import struct
import math
import subprocess
import os

src_jpg = "/Users/jfg/.gemini/antigravity/brain/de8a7f61-c2a8-4263-b216-2022fd5c98d8/screensaver_bliss_weirdcore_1787394396346.jpg"
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

print(f"Loaded: width={width}, height={height}, top_down={top_down}")

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

def clone_patch(dst_x1, dst_y1, dst_x2, dst_y2, src_x1, src_y1, feather=20):
    w = dst_x2 - dst_x1
    h = dst_y2 - dst_y1
    for dy in range(h):
        y_dst = dst_y1 + dy
        y_src = src_y1 + dy
        for dx in range(w):
            x_dst = dst_x1 + dx
            x_src = src_x1 + dx
            
            # Distance from edge for feathering
            dist_x = min(dx, w - 1 - dx)
            dist_y = min(dy, h - 1 - dy)
            dist = min(dist_x, dist_y)
            alpha = min(1.0, dist / float(feather)) if feather > 0 else 1.0
            # Smooth cosine curve
            alpha = 0.5 - 0.5 * math.cos(alpha * math.pi)
            
            sb, sg, sr = get_p(x_src, y_src)
            db, dg, dr = get_p(x_dst, y_dst)
            
            fb = sb * alpha + db * (1.0 - alpha)
            fg = sg * alpha + dg * (1.0 - alpha)
            fr = sr * alpha + dr * (1.0 - alpha)
            
            set_p(x_dst, y_dst, fb, fg, fr)

# 1. Clone clean sky over Window:
# Window is at dst: x in [415..635], y in [160..385]
# Source clean sky from: x in [170..390], y in [160..385]
clone_patch(415, 160, 635, 385, 170, 160, feather=25)

# 2. Clone clean sky over Text "I thought I finally escaped":
# Text is at dst: x in [670..950], y in [65..160]
# Source clean sky from: x in [1020..1300], y in [65..160]
clone_patch(670, 65, 950, 160, 1020, 65, feather=22)

# 3. Clone clean grass over black bar:
# Black bar is at dst: x in [430..600], y in [675..725]
# Source clean grass from: x in [230..400], y in [675..725]
clone_patch(430, 675, 600, 725, 230, 675, feather=15)

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
print("Feathered clone complete across all 10 Bliss chapters!")
