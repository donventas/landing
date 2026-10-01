"""Build source-first portfolio plates without cropping source artwork.

Every source is placed with ImageOps.contain. The output plates share the
landing's 16:10 frame so desktop and mobile can display them edge-to-edge
without cutting the underlying work.
"""

from pathlib import Path
from shutil import copyfile

from PIL import Image, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SNAPS = ROOT / "portafolio" / "snaps"
SOURCE = ROOT / "portafolio" / "source"
P = SOURCE / "pafi-portfolio-v0.1" / "deliveries" / "block-12" / "mockups"
Q = SOURCE / "quickfinance-0.2.0-rc.2"
SIZE = (1600, 1000)


def open_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def rounded_card(canvas, source, box, background, radius=28, padding=20, shadow=True):
    """Place a complete source image inside a rounded card; never crop it."""
    x, y, w, h = box
    if shadow:
        layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle(
            (x, y + 16, x + w, y + h + 16), radius=radius, fill=(0, 0, 0, 85)
        )
        canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(22)))

    card = Image.new("RGBA", (w, h), background)
    artwork = ImageOps.contain(open_rgb(source), (w - padding * 2, h - padding * 2), Image.Resampling.LANCZOS)
    card.paste(artwork, ((w - artwork.width) // 2, (h - artwork.height) // 2))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    card.putalpha(mask)
    canvas.alpha_composite(card, (x, y))


def save(canvas, name):
    canvas.convert("RGB").save(SNAPS / name, "PNG", optimize=True)


def pafi_merch():
    canvas = Image.new("RGBA", SIZE, "#E8DFD1")
    # The three files below are the exact mockups supplied by Pafi's source capsule.
    rounded_card(canvas, P / "pafi-tote-product-mockup-v0.1.png", (46, 50, 930, 900), "#F4EEE5", padding=24)
    rounded_card(canvas, P / "pafi-termo-product-mockup-v0.1.png", (1016, 50, 538, 430), "#F4EEE5", padding=18)
    rounded_card(canvas, P / "pafi-stickers-product-mockup-v0.1.png", (1016, 520, 538, 430), "#F4EEE5", padding=18)
    save(canvas, "pafi-dv-v4-01-merch.png")


def tamanova_editorial():
    canvas = Image.new("RGBA", SIZE, "#EEE8DB")
    rounded_card(
        canvas,
        SNAPS / "tamanova-dv-v2-01-hospitalidad.png",
        (44, 50, 930, 900),
        "#DDD3C2",
        padding=18,
    )
    rounded_card(
        canvas,
        SNAPS / "tamanova-dv-v2-02-experiencia.png",
        (1014, 50, 542, 430),
        "#F8F5EF",
        padding=18,
    )
    rounded_card(
        canvas,
        SNAPS / "tamanova-dv-v2-03-sistema.png",
        (1014, 520, 542, 430),
        "#F8F5EF",
        padding=18,
    )
    save(canvas, "tamanova-dv-v4-01-editorial.png")


def quickfinance_brand():
    canvas = Image.new("RGBA", SIZE, "#07182D")
    photo = ImageOps.contain(open_rgb(Q / "qf-b6-negocio.png"), (1600, 900), Image.Resampling.LANCZOS)
    canvas.alpha_composite(photo.convert("RGBA"), ((1600 - photo.width) // 2, 0))
    # A solid brand-color footer preserves the full 16:9 source inside a 16:10 plate.
    ImageDraw.Draw(canvas).rectangle((0, 900, 1600, 1000), fill="#07182D")
    save(canvas, "qf-dv-v4-01-brand.png")


if __name__ == "__main__":
    pafi_merch()
    tamanova_editorial()
    quickfinance_brand()
    # Public portfolio selections copied byte-for-byte from the source capsules.
    copyfile(Q / "qf-b6-tablet-taller.png", SNAPS / "qf-dv-v4-02-tablet.png")
    copyfile(Q / "03-analiza.svg", SNAPS / "qf-dv-v4-03-analiza.svg")
    copyfile(P / "pafi-tote-product-mockup-v0.1.png", SNAPS / "pafi-dv-v4-03-tote.png")
