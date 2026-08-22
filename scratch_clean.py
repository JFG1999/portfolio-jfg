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

def get_pixel(x, y_screen):
    y = y_screen if top_down else (height - 1 - y_screen)
    idx = y * row_size + x * 3
    return data[idx], data[idx+1], data[idx+2] # B, G, R

def set_pixel(x, y_screen, b, g, r):
    y = y_screen if top_down else (height - 1 - y_screen)
    idx = y * row_size + x * 3
    data[idx] = max(0, min(255, int(b)))
    data[idx+1] = max(0, min(255, int(g)))
    data[idx+2] = max(0, min(255, int(r)))

# 1. Inpaint Window in top-left (x: 80 to 450, y: 50 to 320)
for y_screen in range(40, 330):
    b1, g1, r1 = get_pixel(40, y_screen)
    b2, g2, r2 = get_pixel(460, y_screen)
    for x in range(70, 455):
        t = (x - 40) / (460 - 40)
        b = b1 * (1 - t) + b2 * t
        g = g1 * (1 - t) + g2 * t
        r = r1 * (1 - t) + r2 * t
        noise = ((x * 17 + y_screen * 31) % 5) - 2
        set_pixel(x, y_screen, b + noise, g + noise, r + noise)

# 2. Inpaint Text in middle-right: "I thought I finally escaped" (x: 940 to 1340, y: 210 to 330)
for y_screen in range(210, 340):
    b1, g1, r1 = get_pixel(920, y_screen)
    b2, g2, r2 = get_pixel(min(width - 15, 1350), y_screen)
    for x in range(935, min(width - 10, 1345)):
        t = (x - 920) / (1350 - 920)
        b = b1 * (1 - t) + b2 * t
        g = g1 * (1 - t) + g2 * t
        r = r1 * (1 - t) + r2 * t
        noise = ((x * 23 + y_screen * 41) % 5) - 2
        set_pixel(x, y_screen, b + noise, g + noise, r + noise)

# Also fix the top-right sky patch (y: 25 to 160, x: 900 to 1350)
for y_screen in range(20, 180):
    b1, g1, r1 = get_pixel(880, y_screen)
    b2, g2, r2 = get_pixel(min(width - 15, 1355), y_screen)
    for x in range(890, min(width - 10, 1350)):
        t = (x - 880) / (1355 - 880)
        b = b1 * (1 - t) + b2 * t
        g = g1 * (1 - t) + g2 * t
        r = r1 * (1 - t) + r2 * t
        noise = ((x * 19 + y_screen * 37) % 5) - 2
        set_pixel(x, y_screen, b + noise, g + noise, r + noise)

# 3. Inpaint black artifact line (x: 420 to 600, y: 470 to 530)
for y_screen in range(465, 535):
    for x in range(415, 605):
        b1, g1, r1 = get_pixel(x, y_screen - 25)
        b2, g2, r2 = get_pixel(x, y_screen + 25)
        b = (b1 + b2) // 2
        g = (g1 + g2) // 2
        r = (r1 + r2) // 2
        noise = ((x * 13 + y_screen * 29) % 7) - 3
        set_pixel(x, y_screen, b + noise, g + noise, r + noise)

# 10 distinct, continuous, beautiful Bliss chapters:
chapters = [
    ("bliss-01-hero.jpg", 1.0, 1.0, 1.0, 0, 0, 0),         # Pure High Noon Bliss
    ("bliss-02-manifesto.jpg", 1.05, 1.02, 0.95, 10, 5, -5), # Warm Sunlight Afternoon
    ("bliss-03-gallery1.jpg", 0.98, 1.04, 0.92, -5, 10, -5),  # Deep Emerald Meadow
    ("bliss-04-interlude1.jpg", 1.08, 0.98, 1.05, 15, 0, 15), # Soft Lavender Dusk
    ("bliss-05-gallery2.jpg", 1.10, 1.05, 0.90, 20, 10, -10), # Golden Hour Glow
    ("bliss-06-interlude2.jpg", 0.90, 0.95, 1.10, -15, 0, 25),# Twilight Blue Hour
    ("bliss-07-gallery3.jpg", 1.02, 1.06, 0.96, 5, 12, -8),   # High Contrast Vivid Meadow
    ("bliss-08-gallery4.jpg", 0.95, 1.02, 1.02, 0, 8, 10),    # Soft Dream Haze
    ("bliss-09-interlude3.jpg", 1.15, 0.95, 1.08, 30, -5, 20),# Sunset Cloud Horizon
    ("bliss-10-footer.jpg", 0.85, 0.90, 1.15, -20, -10, 30)   # Cosmic Midnight Meadow
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
print("Perfect inpainting complete across all 10 Bliss chapters!")
