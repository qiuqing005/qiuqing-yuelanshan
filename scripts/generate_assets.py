from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        color = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=color)
    return img.convert("RGBA")


def add_noise(img, amount=10, seed=1):
    rng = random.Random(seed)
    px = img.load()
    w, h = img.size
    for _ in range(w * h // 75):
        x, y = rng.randrange(w), rng.randrange(h)
        r, g, b, a = px[x, y]
        delta = rng.randint(-amount, amount)
        px[x, y] = (max(0, min(255, r + delta)), max(0, min(255, g + delta)), max(0, min(255, b + delta)), a)


def vignette(img, strength=150):
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    for i in range(0, max(w, h), 8):
        alpha = int(strength * (i / max(w, h)) ** 1.7)
        box = (i - w * 0.2, i - h * 0.1, w - i + w * 0.2, h - i + h * 0.1)
        if box[2] < box[0] or box[3] < box[1]:
            break
        draw.ellipse(box, fill=max(0, 255 - alpha))
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dark = Image.new("RGBA", img.size, (0, 0, 0, strength))
    overlay.alpha_composite(dark)
    img.alpha_composite(Image.composite(Image.new("RGBA", img.size, (0, 0, 0, 0)), overlay, mask))


def draw_moon(draw, x, y, r, color=(226, 225, 188, 210)):
    draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
    draw.ellipse((x - r * 0.35, y - r * 0.75, x + r * 1.25, y + r * 0.75), fill=(12, 24, 38, 170))


def save_bg(name, img):
    add_noise(img, 7, hash(name) & 9999)
    vignette(img, 120)
    img.save(OUT / name)


def night_road():
    w, h = 1600, 900
    img = gradient((w, h), (12, 28, 38), (9, 11, 18))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_moon(draw, 1260, 128, 62)
    for i in range(90):
        x = (i * 127) % w
        y = (i * 73) % 330
        draw.ellipse((x, y, x + 2, y + 2), fill=(230, 235, 205, 120))
    road = [(555, h), (1045, h), (865, 382), (735, 382)]
    draw.polygon(road, fill=(28, 35, 42, 235))
    for n in range(18):
        y0 = 410 + n * 31
        spread = n * 9
        draw.line((800, y0, 800, y0 + 18 + n * 4), fill=(206, 213, 180, 80), width=max(2, n // 3))
        draw.line((735 - spread, y0, 555 - spread * 1.8, h), fill=(172, 194, 186, 55), width=2)
        draw.line((865 + spread, y0, 1045 + spread * 1.8, h), fill=(172, 194, 186, 55), width=2)
    draw.rectangle((283, 240, 297, 690), fill=(25, 26, 26, 240))
    draw.line((290, 248, 383, 272), fill=(42, 39, 36, 230), width=7)
    for r, a in [(90, 30), (55, 65), (26, 180)]:
        draw.ellipse((366 - r, 265 - r, 366 + r, 265 + r), fill=(245, 191, 99, a))
    for i in range(7):
        y = 635 + i * 30
        draw.ellipse((420 + i * 28, y, 455 + i * 28, y + 12), fill=(116, 145, 99, 110))
        draw.ellipse((1030 - i * 30, y + 10, 1070 - i * 30, y + 24), fill=(78, 112, 92, 120))
    save_bg("bg-night-road.png", img)


def mountain_gate():
    w, h = 1600, 900
    img = gradient((w, h), (19, 33, 42), (13, 18, 22))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_moon(draw, 1190, 124, 72)
    draw.polygon([(0, 585), (410, 405), (805, 590)], fill=(27, 46, 47, 220))
    draw.polygon([(560, 560), (1200, 370), (1600, 600), (1600, 900), (560, 900)], fill=(23, 38, 42, 235))
    draw.rectangle((560, 318, 590, 700), fill=(48, 43, 35, 240))
    draw.rectangle((1035, 318, 1065, 700), fill=(48, 43, 35, 240))
    draw.rectangle((520, 300, 1105, 340), fill=(55, 45, 36, 245))
    draw.rectangle((675, 335, 950, 372), fill=(43, 37, 32, 245))
    path = [(710, 900), (980, 900), (880, 505), (800, 505)]
    draw.polygon(path, fill=(31, 37, 38, 235))
    for x in range(180, 1400, 120):
        for y in range(620, 830, 58):
            draw.ellipse((x, y, x + 30, y + 48), fill=(156, 192, 172, 120))
            draw.ellipse((x + 12, y + 7, x + 44, y + 45), fill=(186, 168, 218, 150))
    for i in range(9):
        y = 220 + i * 55
        draw.rectangle((0, y, w, y + 40), fill=(190, 210, 210, 12))
    save_bg("bg-mountain-gate.png", img)


def teahouse():
    w, h = 1600, 900
    img = gradient((w, h), (88, 55, 42), (23, 22, 25))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle((95, 110, 640, 560), fill=(33, 45, 51, 210), outline=(182, 135, 81, 150), width=8)
    for x in range(130, 620, 44):
        draw.line((x, 120, x - 72, 550), fill=(210, 230, 235, 32), width=2)
    for y in range(170, 515, 55):
        draw.line((105, y, 635, y), fill=(220, 220, 200, 28), width=2)
    draw.rectangle((0, 610, w, h), fill=(38, 29, 25, 245))
    draw.polygon([(230, 640), (1420, 640), (1540, 900), (90, 900)], fill=(82, 54, 38, 245))
    for x in [865, 980, 1110]:
        draw.ellipse((x - 60, 612, x + 60, 648), fill=(39, 28, 22, 120))
        draw.ellipse((x - 44, 594, x + 44, 634), fill=(182, 108, 72, 230))
    draw.rectangle((590, 600, 760, 640), fill=(112, 76, 48, 250))
    draw.rectangle((600, 550, 775, 605), fill=(166, 122, 76, 245))
    for cx, cy, r in [(330, 170, 80), (1180, 145, 90), (1370, 260, 55)]:
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(247, 180, 86, 45))
        draw.ellipse((cx - r * 0.35, cy - r * 0.35, cx + r * 0.35, cy + r * 0.35), fill=(252, 198, 98, 160))
    save_bg("bg-teahouse.png", img)


def mirror_room():
    w, h = 1600, 900
    img = gradient((w, h), (39, 44, 56), (18, 16, 22))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle((1060, 80, 1380, 600), fill=(41, 57, 66, 210), outline=(165, 170, 150, 120), width=10)
    draw.polygon([(1072, 110), (1358, 94), (1290, 586), (1095, 580)], fill=(150, 188, 190, 45))
    draw.rectangle((350, 610, 1220, 660), fill=(61, 43, 38, 245))
    draw.rectangle((465, 515, 790, 610), fill=(86, 59, 45, 245))
    for x in [505, 550, 595, 640, 685, 730]:
        draw.line((x, 525, x + 25, 600), fill=(218, 190, 142, 80), width=3)
    draw.rectangle((265, 280, 430, 620), fill=(35, 37, 45, 235))
    draw.ellipse((290, 220, 405, 335), fill=(28, 27, 33, 245))
    draw.ellipse((820, 452, 940, 595), fill=(26, 24, 29, 125))
    for r, a in [(145, 22), (90, 55), (30, 160)]:
        draw.ellipse((935 - r, 492 - r, 935 + r, 492 + r), fill=(235, 176, 98, a))
    save_bg("bg-mirror-room.png", img)


def festival_road():
    w, h = 1600, 900
    img = gradient((w, h), (35, 34, 55), (22, 18, 24))
    draw = ImageDraw.Draw(img, "RGBA")
    for i, x in enumerate(range(115, 1510, 145)):
        y = 120 + (i % 2) * 38
        draw.line((x - 80, y - 22, x + 80, y - 22), fill=(162, 93, 63, 150), width=3)
        draw.ellipse((x - 34, y - 28, x + 34, y + 34), fill=(242, 139, 78, 120))
        draw.rectangle((x - 25, y - 22, x + 25, y + 24), fill=(237, 111, 71, 190), outline=(255, 219, 124, 180), width=2)
    draw.rectangle((0, 610, w, h), fill=(27, 26, 31, 245))
    for x in range(120, 1500, 155):
        draw.rectangle((x, 390, x + 95, 615), fill=(50, 34, 33, 245))
        draw.polygon([(x - 20, 390), (x + 115, 390), (x + 90, 340), (x + 5, 340)], fill=(116, 54, 43, 245))
        draw.rectangle((x + 12, 425, x + 82, 490), fill=(236, 174, 96, 70))
    rng = random.Random(7)
    for _ in range(32):
        x = rng.randint(80, 1520)
        y = rng.randint(590, 770)
        draw.ellipse((x - 18, y - 52, x + 18, y - 16), fill=(18, 17, 21, 180))
        draw.rectangle((x - 15, y - 20, x + 15, y + 62), fill=(19, 17, 22, 170))
    for x in range(410, 1220, 42):
        draw.ellipse((x, 810, x + 28, 820), fill=(244, 168, 88, 65))
    save_bg("bg-festival-road.png", img)


def portrait(name, mood):
    w, h = 900, 1200
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    if mood == "warm":
        coat = (55, 54, 52, 255)
        shirt = (238, 226, 206, 255)
        eye = (178, 115, 68, 255)
        aura = (232, 163, 73, 70)
        mouth = (109, 56, 56, 230)
    else:
        coat = (48, 64, 78, 255)
        shirt = (205, 215, 217, 255)
        eye = (115, 166, 195, 255)
        aura = (116, 172, 205, 70)
        mouth = (69, 70, 78, 230)
    for r in range(360, 60, -18):
        draw.ellipse((w / 2 - r, 210 - r, w / 2 + r, 210 + r), fill=(*aura[:3], max(0, int(aura[3] * r / 360))))
    draw.polygon([(260, 1080), (640, 1080), (735, 1200), (170, 1200)], fill=coat)
    draw.polygon([(350, 1030), (550, 1030), (595, 1200), (305, 1200)], fill=shirt)
    draw.polygon([(360, 1015), (450, 1165), (325, 1200), (260, 1080)], fill=(36, 36, 38, 210))
    draw.polygon([(540, 1015), (450, 1165), (575, 1200), (640, 1080)], fill=(36, 42, 48, 220))
    draw.ellipse((300, 135, 600, 485), fill=(35, 28, 26, 255))
    draw.rounded_rectangle((305, 310, 595, 760), radius=126, fill=(224, 176, 142, 255))
    draw.ellipse((286, 485, 330, 570), fill=(218, 162, 130, 255))
    draw.ellipse((570, 485, 614, 570), fill=(218, 162, 130, 255))
    for x in [383, 518]:
        draw.ellipse((x - 32, 468, x + 32, 510), fill=(248, 241, 224, 255))
        draw.ellipse((x - 15, 472, x + 15, 506), fill=eye)
        draw.ellipse((x - 6, 478, x + 6, 500), fill=(28, 30, 32, 255))
        draw.ellipse((x + 5, 475, x + 11, 481), fill=(255, 255, 235, 220))
    draw.line((352, 444, 414, 432), fill=(52, 40, 35, 230), width=8)
    draw.line((488, 432, 550, 444), fill=(52, 40, 35, 230), width=8)
    draw.line((452, 505, 437, 588, 470, 592), fill=(149, 98, 83, 170), width=5)
    if mood == "warm":
        draw.arc((390, 632, 510, 704), 12, 168, fill=mouth, width=7)
        draw.ellipse((350, 542, 388, 578), fill=(232, 133, 112, 52))
        draw.ellipse((512, 542, 550, 578), fill=(232, 133, 112, 52))
    else:
        draw.line((390, 672, 510, 665), fill=mouth, width=7)
        draw.line((342, 420, 416, 448), fill=(32, 38, 46, 120), width=4)
        draw.line((484, 448, 558, 420), fill=(32, 38, 46, 120), width=4)
    hair = (28, 25, 24, 255)
    strands = [
        (280, 330, 360, 125, 430, 335),
        (340, 275, 420, 105, 470, 345),
        (420, 270, 520, 120, 520, 360),
        (515, 300, 610, 165, 590, 450),
        (315, 410, 250, 535, 330, 670),
        (595, 405, 655, 540, 565, 690),
    ]
    for coords in strands:
        draw.line(coords, fill=hair, width=34, joint="curve")
    if mood == "cold":
        draw.line((300, 770, 600, 770), fill=(133, 184, 203, 180), width=5)
        draw.line((315, 805, 585, 805), fill=(133, 184, 203, 120), width=3)
    else:
        draw.ellipse((622, 545, 642, 575), fill=(210, 150, 78, 180))
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=105, threshold=4))
    img.save(OUT / name)


def rulebook():
    w = h = 900
    img = gradient((w, h), (91, 66, 48), (32, 27, 25))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rounded_rectangle((205, 155, 690, 735), radius=24, fill=(159, 119, 76, 255), outline=(64, 43, 35, 210), width=8)
    draw.rounded_rectangle((245, 205, 655, 700), radius=16, fill=(222, 196, 147, 255), outline=(122, 88, 58, 160), width=4)
    for i in range(10):
        y = 270 + i * 38
        draw.line((300, y, 605, y + random.Random(i).randint(-3, 3)), fill=(95, 66, 55, 90), width=3)
    draw.line((190, 455, 705, 450), fill=(148, 31, 45, 230), width=11)
    draw.line((455, 130, 450, 760), fill=(148, 31, 45, 210), width=9)
    draw.ellipse((410, 410, 500, 500), outline=(148, 31, 45, 230), width=10)
    draw.arc((552, 242, 640, 330), 80, 286, fill=(201, 186, 116, 220), width=10)
    vignette(img, 80)
    img.save(OUT / "item-rulebook.png")


def small_items():
    for name, kind in [("item-redthread.png", "thread"), ("item-moonbookmark.png", "moon"), ("item-teacup.png", "cup")]:
        img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, "RGBA")
        draw.ellipse((76, 360, 436, 430), fill=(0, 0, 0, 55))
        if kind == "thread":
            for offset in [0, 18, -15]:
                draw.arc((95 + offset, 110, 415 + offset, 390), 20, 330, fill=(172, 38, 54, 245), width=13)
            draw.ellipse((220, 220, 292, 292), outline=(172, 38, 54, 245), width=12)
        elif kind == "moon":
            draw.ellipse((156, 86, 356, 286), fill=(222, 208, 128, 235))
            draw.ellipse((232, 54, 410, 286), fill=(0, 0, 0, 0))
            draw.polygon([(250, 248), (300, 248), (330, 440), (260, 405)], fill=(66, 79, 84, 245))
        else:
            draw.ellipse((150, 205, 345, 330), fill=(230, 207, 166, 255), outline=(127, 85, 61, 220), width=8)
            draw.arc((318, 225, 420, 318), 270, 90, fill=(127, 85, 61, 220), width=14)
            draw.ellipse((180, 228, 315, 285), fill=(99, 72, 48, 180))
            for x in [215, 255, 295]:
                draw.line((x, 205, x + 20, 150), fill=(223, 217, 190, 80), width=8)
        img.save(OUT / name)


if __name__ == "__main__":
    night_road()
    mountain_gate()
    teahouse()
    mirror_room()
    festival_road()
    portrait("portrait-qiuqing.png", "warm")
    portrait("portrait-yuelanshan.png", "cold")
    rulebook()
    small_items()
