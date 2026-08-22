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

# Load image into 2D float arrays for B, G, R
img_b = [[0.0]*width for _ in range(height)]
img_g = [[0.0]*width for _ in range(height)]
img_r = [[0.0]*width for _ in range(height)]
mask = [[False]*width for _ in range(height)]

for y_s in range(height):
    y = y_s if top_down else (height - 1 - y_s)
    for x in range(width):
        idx = y * row_size + x * 3
        img_b[y_s][x] = float(data[idx])
        img_g[y_s][x] = float(data[idx+1])
        img_r[y_s][x] = float(data[idx+2])

def mark_rect(x1, y1, x2, y2):
    for y in range(max(0, y1), min(height, y2+1)):
        for x in range(max(0, x1), min(width, x2+1)):
            mask[y][x] = True

# 1. Window Box
mark_rect(118, 68, 412, 290)

# 2. Text Box
mark_rect(965, 230, 1315, 320)

# 3. Artifact in grass
mark_rect(440, 515, 580, 540)

# Initialize masked pixels with surrounding average
for y in range(height):
    for x in range(width):
        if mask[y][x]:
            # find nearest non-masked boundary in 4 directions
            img_b[y][x] = 220.0
            img_g[y][x] = 140.0
            img_r[y][x] = 40.0

# Run 250 Jacobi iterations of Laplace equation (harmonic inpainting)
for it in range(250):
    new_b = [row[:] for row in img_b]
    new_g = [row[:] for row in img_g]
    new_r = [row[:] for row in img_r]
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            if mask[y][x]:
                new_b[y][x] = 0.25 * (img_b[y-1][x] + img_b[y+1][x] + img_b[y][x-1] + img_b[y][x+1])
                new_g[y][x] = 0.25 * (img_g[y-1][x] + img_g[y+1][x] + img_g[y][x-1] + img_g[y][x+1])
                new_r[y][x] = 0.25 * (img_r[y-1][x] + img_r[y+1][x] + img_r[y][x-1] + img_r[y][x+1])
    img_b = new_b
    img_g = new_g
    img_r = new_r

# Put inpainted data back with subtle organic film grain
for y_s in range(height):
    y = y_s if top_down else (height - 1 - y_s)
    for x in range(width):
        idx = y * row_size + x * 3
        noise = ((x * 43 + y_s * 79) % 5) - 2 if mask[y_s][x] else 0
        data[idx] = max(0, min(255, int(img_b[y_s][x] + noise)))
        data[idx+1] = max(0, min(255, int(img_g[y_s][x] + noise)))
        data[idx+2] = max(0, min(255, int(img_r[y_s][x] + noise)))

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
print("Harmonic Laplace inpainting complete across all 10 Bliss chapters!")
