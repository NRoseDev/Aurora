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

    def clear_background(self, image_bytes):
        """NOT implemented. This used to pretend to remove the background
        and return the picture unchanged. Background removal needs a real
        segmentation model, which this project does not have yet."""
        raise NotImplementedError(
            "Background removal is not implemented yet; it needs a segmentation model."
        )

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
