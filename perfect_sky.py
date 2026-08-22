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

def get_sky_gradient(x, y_s):
    t = y_s / 365.0
    # True Windows XP Bliss sky gradient
    b = 212 * (1 - t**0.8) + 242 * (t**0.8)
    g = 108 * (1 - t**0.8) + 188 * (t**0.8)
    r = 14 * (1 - t**0.8) + 98 * (t**0.8)
    # Subtle natural horizon curve and noise
    curve = 1.0 - 0.02 * ((x - width/2) / (width/2))**2
    noise = ((x * 47 + y_s * 89) % 7) - 3
    return b * curve + noise, g * curve + noise, r * curve + noise

# Left sky inpaint (x: 10 to 455, y: 10 to 355)
for y_s in range(10, 355):
    for x_s in range(10, 455):
        # Blend feathering near x=455
        if x_s > 430:
            w_new = (455 - x_s) / 25.0
            sb, sg, sr = get_sky_gradient(x_s, y_s)
            ob, og, or_ = get_pixel(x_s, y_s)
            set_pixel(x_s, y_s, sb * w_new + ob * (1 - w_new), sg * w_new + og * (1 - w_new), sr * w_new + or_ * (1 - w_new))
        else:
            sb, sg, sr = get_sky_gradient(x_s, y_s)
            set_pixel(x_s, y_s, sb, sg, sr)

# Right sky inpaint (x: 935 to width-10, y: 10 to 355)
for y_s in range(10, 355):
    for x_s in range(935, width - 10):
        if x_s < 965:
            w_new = (x_s - 935) / 30.0
            sb, sg, sr = get_sky_gradient(x_s, y_s)
            ob, og, or_ = get_pixel(x_s, y_s)
            set_pixel(x_s, y_s, sb * w_new + ob * (1 - w_new), sg * w_new + og * (1 - w_new), sr * w_new + or_ * (1 - w_new))
        else:
            sb, sg, sr = get_sky_gradient(x_s, y_s)
            set_pixel(x_s, y_s, sb, sg, sr)

# Inpaint black line in grass (x: 415 to 605, y: 465 to 535)
for y_s in range(465, 535):
    for x_s in range(415, 605):
        b1, g1, r1 = get_pixel(x_s, y_s - 35)
        b2, g2, r2 = get_pixel(x_s, y_s + 35)
        b = (b1 + b2) // 2
        g = (g1 + g2) // 2
        r = (r1 + r2) // 2
        noise = ((x_s * 13 + y_s * 29) % 9) - 4
        set_pixel(x_s, y_s, b + noise, g + noise, r + noise)

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
print("Pristine smooth photographic sky rendered across all 10 Bliss chapters!")
