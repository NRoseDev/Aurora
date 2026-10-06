# Snap 2 Fit engine: real image repixelation and auto-fitting.
#
# History: this file used to be placeholder code. Its methods returned the
# input unchanged, or a "success" message with no image at all, while
# claiming the work was done. Nothing else in the app called them either.
# The methods below now do the work for real, using Pillow (already the
# project's image dependency in requirements.txt):
#
# - Repixelate = enlarge in a high-quality way (Lanczos), then sharpen the
#   edges (unsharp mask) and lift contrast/colour a little. It cannot invent
#   detail that was never in the picture; no honest tool can.
# - Auto-fit = place the design onto a canvas at the item's exact print
#   size, either fitting the whole design in (nothing cut off) or filling
#   the item (edges trimmed), without ever stretching it out of shape.
import io

from PIL import Image, ImageEnhance, ImageFilter

# Item print sizes in pixels (inches x 300 DPI unless noted).
DIMENSIONS = {
    "tshirt": {"width": 2400, "height": 3200, "position": "center_top", "mode": "fit"},
    "hoodie": {"width": 2400, "height": 3200, "position": "center_top", "mode": "fit"},
    "mug": {"width": 1200, "height": 1000, "position": "center", "mode": "fit"},
    "phone_case": {"width": 1400, "height": 2900, "position": "center", "mode": "fill"},
    "tote": {"width": 3000, "height": 3000, "position": "center", "mode": "fit"},
    "poster": {"width": 3600, "height": 5400, "position": "center", "mode": "fit"},
    "canvas": {"width": 4800, "height": 3600, "position": "center", "mode": "fit"},
    "keychain": {"width": 1200, "height": 1200, "position": "center", "mode": "fit"},
    "print": {"width": 2000, "height": 2000, "position": "center", "mode": "fit"},
}
DEFAULT_SPEC = {"width": 2000, "height": 2000, "position": "center", "mode": "fit"}


def _load(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    return img.convert("RGBA")


def _to_png_bytes(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _repixelate(img, strength="gentle"):
    """Sharpen and clean an (already resized) image. Real pixel changes."""
    percent = 220 if strength == "strong" else 150
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=percent, threshold=2))
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.07)
    return img


def _fit(img, width, height, mode="fit", position="center", repixelate=True, strength="gentle"):
    """Return a new RGBA image of exactly (width, height) with the design fitted."""
    source_ratio = img.width / img.height
    target_ratio = width / height

    if mode == "fill":
        if source_ratio > target_ratio:
            draw_h = height
            draw_w = round(draw_h * source_ratio)
        else:
            draw_w = width
            draw_h = round(draw_w / source_ratio)
    else:
        if source_ratio > target_ratio:
            draw_w = width
            draw_h = round(draw_w / source_ratio)
        else:
            draw_h = height
            draw_w = round(draw_h * source_ratio)

    design = img.resize((max(1, draw_w), max(1, draw_h)), Image.LANCZOS)
    if repixelate:
        design = _repixelate(design, strength=strength)

    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    x = (width - design.width) // 2
    y = 0 if position == "center_top" and mode == "fit" else (height - design.height) // 2
    canvas.alpha_composite(design, dest=(x, y))
    return canvas


class AIResizer:
    def __init__(self):
        pass

    def clear_background(self, image_bytes, tolerance=46):
        """Really remove a PLAIN background and return PNG bytes with
        transparency (Nichole's Snap 2 Fit, 2026-10-06).

        How it works, honestly: the background colour is sampled from
        the corners, then a flood from the picture's edges removes every
        connected pixel close to that colour. The same colour INSIDE the
        design is not touched, because the flood cannot reach it.
        Edge pixels close to the background colour go half-clear to
        soften the cut.

        Limit, stated plainly: this separates a design from a plain
        one-colour background (the white behind a logo is the classic
        case). It does NOT separate a subject from a busy photograph
        background — that needs a segmentation model, which remains
        future work. tolerance is a colour distance in RGB space
        (0-441); 46 is a gentle default that copes with JPG noise.
        """
        img = _load(image_bytes).convert("RGBA")
        width, height = img.size
        if width < 2 or height < 2:
            return _to_png_bytes(img)

        pixels = img.load()
        # Background colour: average of small patches in the corners.
        patch = max(1, min(6, min(width, height) // 2))
        totals = [0, 0, 0]
        count = 0
        for cx, cy in ((0, 0), (width - patch, 0), (0, height - patch), (width - patch, height - patch)):
            for yy in range(cy, cy + patch):
                for xx in range(cx, cx + patch):
                    r, g, b, _a = pixels[xx, yy]
                    totals[0] += r
                    totals[1] += g
                    totals[2] += b
                    count += 1
        bg = tuple(t / count for t in totals)

        def dist(x, y):
            r, g, b, _a = pixels[x, y]
            return ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5

        # Flood from every edge pixel through near-background colour.
        removed = bytearray(width * height)
        stack = []

        def try_push(x, y):
            idx = y * width + x
            if not removed[idx] and dist(x, y) <= tolerance:
                removed[idx] = 1
                stack.append((x, y))

        for x in range(width):
            try_push(x, 0)
            try_push(x, height - 1)
        for y in range(height):
            try_push(0, y)
            try_push(width - 1, y)

        edge_pixels = set()
        while stack:
            x, y = stack.pop()
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height:
                    idx = ny * width + nx
                    if removed[idx]:
                        continue
                    if dist(nx, ny) <= tolerance:
                        removed[idx] = 1
                        stack.append((nx, ny))
                    else:
                        edge_pixels.add((nx, ny))

        for idx in range(width * height):
            if removed[idx]:
                x, y = idx % width, idx // width
                r, g, b, _a = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)
        for x, y in edge_pixels:
            if dist(x, y) <= tolerance * 1.7:
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (r, g, b, min(a, 110))

        return _to_png_bytes(img)

    def upscale_image(self, image_bytes, target_scale=4, repixelate=True, strength="gentle"):
        """Really enlarge an image by target_scale and (by default) repixelate it.
        Returns PNG bytes of the enlarged image."""
        img = _load(image_bytes)
        new_size = (max(1, round(img.width * target_scale)), max(1, round(img.height * target_scale)))
        img = img.resize(new_size, Image.LANCZOS)
        if repixelate:
            img = _repixelate(img, strength=strength)
        return _to_png_bytes(img)

    def auto_fit_to_object(self, image_bytes, object_type, repixelate=True, strength="gentle"):
        """Really fit a design to a named item's print size.
        Returns a dict like before (status / applied_dimensions / message)
        and now also 'image_bytes' (PNG) plus the measured 'width'/'height',
        so callers can check the work instead of trusting the message."""
        spec = DIMENSIONS.get(str(object_type).lower(), DEFAULT_SPEC)
        img = _load(image_bytes)
        fitted = _fit(
            img,
            spec["width"],
            spec["height"],
            mode=spec["mode"],
            position=spec["position"],
            repixelate=repixelate,
            strength=strength,
        )
        return {
            "status": "success",
            "applied_dimensions": spec,
            "width": fitted.width,
            "height": fitted.height,
            "image_bytes": _to_png_bytes(fitted),
            "message": f"Image repixelated and fitted for {object_type} at {fitted.width}x{fitted.height}",
        }

    def auto_fit_custom(self, image_bytes, width, height, mode="fit", repixelate=True, strength="gentle"):
        """Fit a design to ANY item: give the item's print size in pixels."""
        if width <= 0 or height <= 0:
            raise ValueError("Width and height must be above zero.")
        if mode not in ("fit", "fill"):
            raise ValueError("Mode must be 'fit' or 'fill'.")
        img = _load(image_bytes)
        fitted = _fit(img, int(width), int(height), mode=mode, repixelate=repixelate, strength=strength)
        return {
            "status": "success",
            "width": fitted.width,
            "height": fitted.height,
            "image_bytes": _to_png_bytes(fitted),
            "message": f"Image fitted to a custom item at {fitted.width}x{fitted.height}",
        }

    def execute_ai_model_tryon_swap(self, image_bytes, model_profile_id):
        """NOT implemented. This used to return a fake 'success' message.
        Virtual try-on needs a warping model this project does not have yet."""
        raise NotImplementedError(
            "AI try-on is not implemented yet; it needs a mesh-warping model."
        )

    def process_multi_channel_batch_resize(self, image_bytes, repixelate=False):
        """Really reformat one image into social feed sizes in one go.
        Returns a dict with 'images': {feed_name: PNG bytes} plus the specs."""
        batch_dimensions = {
            "tiktok_9_16": {"width": 1080, "height": 1920, "aspect": "9:16"},
            "youtube_16_9": {"width": 1920, "height": 1080, "aspect": "16:9"},
            "instagram_1_1": {"width": 1080, "height": 1080, "aspect": "1:1"},
        }
        img = _load(image_bytes)
        images = {}
        for name, spec in batch_dimensions.items():
            fitted = _fit(img, spec["width"], spec["height"], mode="fill", repixelate=repixelate)
            images[name] = _to_png_bytes(fitted)
        return {
            "status": "success",
            "processed_feeds": list(batch_dimensions.keys()),
            "meta_specs": batch_dimensions,
            "images": images,
            "message": "Batch multi-channel feed export complete.",
        }
