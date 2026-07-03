#!/usr/bin/env python3
"""Regenera assets de marca desde frontend/assets/images/brand/source.png."""

from pathlib import Path

from PIL import Image

BRAND = Path(__file__).resolve().parents[1] / "frontend" / "assets" / "images" / "brand"
SRC = BRAND / "source.png"
PRIMARY = (147, 214, 149)
ON_PRIMARY = (0, 57, 19)


def process_logo(src: Image.Image, fg: tuple[int, int, int], threshold: int = 235) -> Image.Image:
    img = src.convert("RGBA")
    pixels = []
    for r, g, b, _a in img.getdata():
        if r >= threshold and g >= threshold and b >= threshold:
            pixels.append((fg[0], fg[1], fg[2], 0))
        else:
            darkness = max(0, min(255, int((255 - (r + g + b) / 3) * 1.8)))
            pixels.append((fg[0], fg[1], fg[2], darkness))
    out = Image.new("RGBA", img.size)
    out.putdata(pixels)
    return out


def trim_transparent(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    cropped = img.crop((x0, y0, x1, y1))
    w, h = cropped.size
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(cropped, (pad, pad))
    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Falta archivo fuente: {SRC}")

    src = Image.open(SRC)
    logo = trim_transparent(process_logo(src, PRIMARY))
    logo.save(BRAND / "artemis-logo.png", optimize=True)
    trim_transparent(process_logo(src, ON_PRIMARY)).save(BRAND / "artemis-logo-dark.png", optimize=True)

    for size, name in [(512, "artemis-logo-512.png"), (192, "artemis-logo-192.png"), (64, "artemis-logo-64.png")]:
        logo.resize((size, size), Image.Resampling.LANCZOS).save(BRAND / name, optimize=True)

    for size, name in [(32, "favicon-32.png"), (16, "favicon-16.png")]:
        logo.resize((size, size), Image.Resampling.LANCZOS).save(BRAND / name, optimize=True)

    logo.resize((180, 180), Image.Resampling.LANCZOS).save(BRAND / "apple-touch-icon.png", optimize=True)

    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [logo.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[0].save(
        BRAND / "favicon.ico",
        format="ICO",
        sizes=ico_sizes,
        append_images=ico_images[1:],
    )
    print("Brand assets generados en", BRAND)


if __name__ == "__main__":
    main()
