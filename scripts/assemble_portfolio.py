from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SNAPS = ROOT / "portafolio" / "snaps"
CANVAS = (1600, 1000)


def font(size, bold=False, serif=False):
    candidates = []
    if serif:
        candidates.append(Path(r"C:\Windows\Fonts\georgiab.ttf" if bold else r"C:\Windows\Fonts\georgia.ttf"))
    else:
        candidates.append(Path(r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf"))
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def contain(image, size):
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def centered_scene(path, fill):
    canvas = Image.new("RGB", CANVAS, fill)
    scene = contain(Image.open(path).convert("RGB"), CANVAS)
    canvas.paste(scene, ((CANVAS[0] - scene.width) // 2, (CANVAS[1] - scene.height) // 2))
    return canvas


def paste_with_shadow(canvas, image, xy, blur=18, offset=(0, 16), opacity=90):
    image = image.convert("RGBA")
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    mask = image.getchannel("A")
    block = Image.new("RGBA", image.size, (0, 0, 0, opacity))
    shadow.paste(block, (xy[0] + offset[0], xy[1] + offset[1]), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(image, xy)


def tamanova():
    canvas = centered_scene(SNAPS / "tamanova-dv-v3-01-scene.webp", "#d7b486").convert("RGBA")
    guide = contain(Image.open(SNAPS / "tamanova-dv-v2-02-experiencia.png").convert("RGB"), (520, 346))
    paper = Image.new("RGBA", (guide.width + 18, guide.height + 18), "#f6efe4")
    paper.paste(guide, (9, 9))
    paper = paper.rotate(1.2, resample=Image.Resampling.BICUBIC, expand=True, fillcolor=(0, 0, 0, 0))
    paste_with_shadow(canvas, paper, (420, 424), blur=15, offset=(0, 14), opacity=85)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((1120, 860, 1530, 938), radius=39, fill=(25, 67, 56, 238))
    draw.text((1150, 880), "ESCENA CONCEPTUAL", font=font(16, bold=True), fill="#f6efe1")
    draw.text((1150, 907), "GUÍA REAL · SIN RECORTE", font=font(12), fill="#e6c075")
    canvas.convert("RGB").save(SNAPS / "tamanova-dv-v3-01-ensamble.webp", "WEBP", quality=92, method=6)


def personal():
    canvas = centered_scene(SNAPS / "arturo-dv-v3-01-studio.webp", "#d9d4ca").convert("RGBA")
    screen = Image.open(SNAPS / "01-arturo-web.png").convert("RGB")
    screen = contain(screen, (700, 382))
    frame = Image.new("RGBA", (716, 398), "#111416")
    frame.paste(screen, ((716 - screen.width) // 2, (398 - screen.height) // 2))
    paste_with_shadow(canvas, frame, (548, 242), blur=12, offset=(0, 9), opacity=80)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((1040, 860, 1530, 938), radius=39, fill=(16, 55, 63, 242))
    draw.text((1070, 880), "ESCENA CONCEPTUAL", font=font(16, bold=True), fill="#f4f5f2")
    draw.text((1070, 907), "SITIO AUTÉNTICO · SIN RECORTE", font=font(12), fill="#8ed3df")
    canvas.convert("RGB").save(SNAPS / "arturo-dv-v3-01-ensamble.webp", "WEBP", quality=92, method=6)


def add_screen(canvas, source, box, radius):
    x, y, w, h = box
    card = Image.new("RGBA", (w, h), "#f4f6f8")
    shot = contain(Image.open(source).convert("RGB"), (w - 24, h - 28))
    card.paste(shot, ((w - shot.width) // 2, (h - shot.height) // 2))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    card.putalpha(mask)
    paste_with_shadow(canvas, card, (x, y), blur=22, offset=(0, 18), opacity=95)


def quickfinance():
    canvas = Image.new("RGBA", CANVAS, "#07182d")
    glow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((800, -420, 1780, 720), fill=(43, 107, 146, 120))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((64, 82, 232, 90), fill="#f47a22")
    draw.text((64, 120), "QUICKFINANCE · SISTEMA DIGITAL", font=font(18, bold=True), fill="#f47a22")
    y = 220
    for line in ("Conversa.", "Calcula.", "Decide."):
        draw.text((64, y), line, font=font(70, bold=True, serif=True), fill="#f7f8fa")
        y += 82
    draw.text((66, 498), "Orientación financiera y herramientas", font=font(21), fill="#b7c8d8")
    draw.text((66, 530), "para convertir números en acciones.", font=font(21), fill="#b7c8d8")
    draw.text((66, 650), "HOME EDITORIAL", font=font(14, bold=True), fill="#9fb4c7")
    draw.text((66, 699), "ORIENTADOR", font=font(14, bold=True), fill="#9fb4c7")
    draw.text((66, 748), "PUNTO DE EQUILIBRIO", font=font(14, bold=True), fill="#9fb4c7")
    draw.ellipse((60, 807, 74, 821), fill="#f47a22")
    draw.text((88, 803), "EVIDENCIA REAL · SIN RECORTE", font=font(16, bold=True), fill="#f7f8fa")
    add_screen(canvas, SNAPS / "qf-dv-v3-01-home.png", (714, 72, 350, 858), 18)
    add_screen(canvas, SNAPS / "qf-dv-v3-02-conversation.png", (1090, 116, 188, 766), 26)
    add_screen(canvas, SNAPS / "qf-dv-v3-03-calculator.png", (1302, 116, 188, 766), 26)
    canvas.convert("RGB").save(SNAPS / "qf-dv-v3-00-sistema.png", optimize=True)


if __name__ == "__main__":
    tamanova()
    personal()
    quickfinance()
