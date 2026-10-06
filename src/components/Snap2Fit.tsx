// src/components/Snap2Fit.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

// Print sizes are inches x DPI. 300 DPI is the standard print quality.
// The first four sizes come from the existing Snap 2 Fit engine (backend/ai_resizer.py);
// the rest follow the items named in the Aurora README / Snap 2 Fit spec (hoodie, tote, poster, canvas, keychain).
interface ProductSpec {
  id: string;
  label: string;
  width: number;
  height: number;
  defaultMode: 'fit' | 'fill';
  note: string;
  category: string;
}

const PRODUCTS: ProductSpec[] = [
  { id: 'tshirt', label: 'T-Shirt', width: 2400, height: 3200, defaultMode: 'fit', note: '8" x 10.7" at 300 DPI', category: 'Clothing' },
  { id: 'hoodie', label: 'Hoodie', width: 2400, height: 3200, defaultMode: 'fit', note: '8" x 10.7" at 300 DPI', category: 'Clothing' },
  { id: 'mug', label: 'Mug', width: 1200, height: 1000, defaultMode: 'fit', note: '4" x 3.3" at 300 DPI', category: 'Drinkware' },
  { id: 'phone_case', label: 'Phone Case', width: 1400, height: 2900, defaultMode: 'fill', note: '4.7" x 9.7" at 300 DPI', category: 'Bags & Accessories' },
  { id: 'tote', label: 'Tote Bag', width: 3000, height: 3000, defaultMode: 'fit', note: '10" x 10" at 300 DPI', category: 'Bags & Accessories' },
  { id: 'poster', label: 'Poster', width: 3600, height: 5400, defaultMode: 'fit', note: '12" x 18" at 300 DPI', category: 'Prints & Home' },
  { id: 'canvas', label: 'Canvas Print', width: 4800, height: 3600, defaultMode: 'fit', note: '16" x 12" at 300 DPI', category: 'Prints & Home' },
  { id: 'keychain', label: 'Keychain', width: 1200, height: 1200, defaultMode: 'fit', note: '4" x 4" at 300 DPI', category: 'Bags & Accessories' },
  { id: 'print', label: 'Square Print', width: 2000, height: 2000, defaultMode: 'fit', note: '6.7" x 6.7" at 300 DPI', category: 'Prints & Home' },
];

const MAX_CUSTOM_PIXELS_PER_SIDE = 6000;

interface LoadedImage {
  url: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  element: HTMLImageElement;
}

interface FitResult {
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  productLabel: string;
  repixelated: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function measureImage(url: string): Promise<{ element: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve({ element, width: element.naturalWidth, height: element.naturalHeight });
    element.onerror = () => reject(new Error('That file could not be read as a picture.'));
    element.src = url;
  });
}

// Draw a picture to an exact size in steps (double, double, then exact).
// Stepping up gradually keeps an enlarged picture cleaner than one big jump.
function drawSteppedUp(source: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement {
  let current = document.createElement('canvas');
  current.width = source.naturalWidth;
  current.height = source.naturalHeight;
  const startCtx = current.getContext('2d');
  if (!startCtx) throw new Error('Your browser could not create a picture canvas.');
  startCtx.drawImage(source, 0, 0);

  let width = current.width;
  let height = current.height;
  while (width * 2 <= targetWidth && height * 2 <= targetHeight) {
    const next = document.createElement('canvas');
    next.width = width * 2;
    next.height = height * 2;
    const ctx = next.getContext('2d');
    if (!ctx) break;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(current, 0, 0, next.width, next.height);
    current = next;
    width *= 2;
    height *= 2;
  }

  if (width !== targetWidth || height !== targetHeight) {
    const exact = document.createElement('canvas');
    exact.width = Math.max(1, Math.round(targetWidth));
    exact.height = Math.max(1, Math.round(targetHeight));
    const ctx = exact.getContext('2d');
    if (!ctx) throw new Error('Your browser could not create a picture canvas.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(current, 0, 0, exact.width, exact.height);
    current = exact;
  }
  return current;
}

// REPIXELATE, part 2: sharpen the edges of every pixel, for real.
// For each pixel: new value = centre boosted, neighbours subtracted.
// amount 0.5 is gentle, 1.0 is strong. Transparent areas are left alone.
function sharpenCanvas(canvas: HTMLCanvasElement, amount: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  if (width < 3 || height < 3) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const out = new Uint8ClampedArray(src);
  const centre = 1 + 4 * amount;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      if (src[i + 3] === 0) continue;
      const up = i - width * 4;
      const down = i + width * 4;
      const left = i - 4;
      const right = i + 4;
      for (let c = 0; c < 3; c++) {
        out[i + c] = centre * src[i + c] - amount * (src[up + c] + src[down + c] + src[left + c] + src[right + c]);
      }
    }
  }
  imageData.data.set(out);
  ctx.putImageData(imageData, 0, 0);
}

async function fitImage(
  image: LoadedImage,
  product: ProductSpec,
  mode: 'fit' | 'fill',
  repixelate: boolean,
  strength: 'gentle' | 'strong'
): Promise<FitResult> {
  const sourceRatio = image.width / image.height;
  const targetRatio = product.width / product.height;

  let drawWidth: number;
  let drawHeight: number;
  if (mode === 'fill') {
    if (sourceRatio > targetRatio) {
      drawHeight = product.height;
      drawWidth = drawHeight * sourceRatio;
    } else {
      drawWidth = product.width;
      drawHeight = drawWidth / sourceRatio;
    }
  } else {
    if (sourceRatio > targetRatio) {
      drawWidth = product.width;
      drawHeight = drawWidth / sourceRatio;
    } else {
      drawHeight = product.height;
      drawWidth = drawHeight * sourceRatio;
    }
  }

  // The design itself, at its drawn size, cleaned up first if repixelate is on.
  const design = drawSteppedUp(image.element, drawWidth, drawHeight);
  if (repixelate) {
    sharpenCanvas(design, strength === 'strong' ? 0.9 : 0.45);
  }

  const canvas = document.createElement('canvas');
  canvas.width = product.width;
  canvas.height = product.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create a picture canvas.');
  if (repixelate) {
    // A touch more contrast and colour, the way a print cleanup would do.
    ctx.filter = 'contrast(1.06) saturate(1.07)';
  }
  const x = (product.width - drawWidth) / 2;
  const y = (product.height - drawHeight) / 2;
  ctx.drawImage(design, x, y);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The fitted picture could not be created.');
  const url = URL.createObjectURL(blob);
  const measured = await measureImage(url);
  return { url, width: measured.width, height: measured.height, sizeBytes: blob.size, productLabel: product.label, repixelated: repixelate };
}

// A small, quick version of the fitting, just so the user can SEE their
// design on an object. Full-size pictures are only made for the objects
// the user actually picks.
async function previewForProduct(image: LoadedImage, product: ProductSpec): Promise<string> {
  const BOX = 360;
  const scale = Math.min(BOX / product.width, BOX / product.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(product.width * scale));
  canvas.height = Math.max(2, Math.round(product.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create a picture canvas.');
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sourceRatio = image.width / image.height;
  const targetRatio = product.width / product.height;
  let drawWidth: number;
  let drawHeight: number;
  if (product.defaultMode === 'fill') {
    if (sourceRatio > targetRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * sourceRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / sourceRatio;
    }
  } else {
    if (sourceRatio > targetRatio) {
      drawWidth = canvas.width;
      drawHeight = drawWidth / sourceRatio;
    } else {
      drawHeight = canvas.height;
      drawWidth = drawHeight * sourceRatio;
    }
  }
  const design = drawSteppedUp(image.element, drawWidth, drawHeight);
  ctx.drawImage(design, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('A preview could not be created.');
  return URL.createObjectURL(blob);
}

const CATEGORIES = ['Clothing', 'Drinkware', 'Bags & Accessories', 'Prints & Home'];
const STARTING_PRICES: Record<string, string> = {
  tshirt: '24',
  hoodie: '39',
  mug: '14',
  phone_case: '19',
  tote: '18',
  poster: '16',
  canvas: '49',
  keychain: '9',
  print: '12',
};

interface MadeItem extends FitResult {
  productId: string;
  price: string;
}

export default function Snap2Fit({ onSendToSizeMeUp }: { onSendToSizeMeUp?: (design: import('../types').SharedDesign) => void } = {}) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [repixelate, setRepixelate] = useState(true);
  const [strength, setStrength] = useState<'gentle' | 'strong'>('gentle');
  const [customName, setCustomName] = useState('My item');
  const [customWidthIn, setCustomWidthIn] = useState('10');
  const [customHeightIn, setCustomHeightIn] = useState('8');
  const [customDpi, setCustomDpi] = useState('300');
  const [result, setResult] = useState<FitResult | null>(null);
  const [working, setWorking] = useState(false);
  // ---- The shop: this design on every object ----
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [prices, setPrices] = useState<Record<string, string>>(STARTING_PRICES);
  const [showcaseWorking, setShowcaseWorking] = useState(false);
  const [madeItems, setMadeItems] = useState<MadeItem[]>([]);
  const [makingPicked, setMakingPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const customProduct = useMemo<ProductSpec | null>(() => {
    const w = Math.round(parseFloat(customWidthIn) * parseFloat(customDpi));
    const h = Math.round(parseFloat(customHeightIn) * parseFloat(customDpi));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    if (w > MAX_CUSTOM_PIXELS_PER_SIDE || h > MAX_CUSTOM_PIXELS_PER_SIDE) return null;
    return { id: 'custom', label: customName.trim() || 'My item', width: w, height: h, defaultMode: 'fit', note: '', category: 'Your own item' };
  }, [customName, customWidthIn, customHeightIn, customDpi]);

  const customSizeError = useMemo<string | null>(() => {
    const wIn = parseFloat(customWidthIn);
    const hIn = parseFloat(customHeightIn);
    const dpi = parseFloat(customDpi);
    if (!Number.isFinite(wIn) || !Number.isFinite(hIn) || !Number.isFinite(dpi) || wIn <= 0 || hIn <= 0 || dpi <= 0) {
      return 'Type a width, a height, and a DPI above zero.';
    }
    if (Math.round(wIn * dpi) > MAX_CUSTOM_PIXELS_PER_SIDE || Math.round(hIn * dpi) > MAX_CUSTOM_PIXELS_PER_SIDE) {
      return `That is too big for the browser version — each side can be up to ${MAX_CUSTOM_PIXELS_PER_SIDE} pixels. Try a lower DPI.`;
    }
    return null;
  }, [customWidthIn, customHeightIn, customDpi]);

  const product: ProductSpec =
    productId === 'custom'
      ? customProduct ?? { id: 'custom', label: 'My item', width: 2000, height: 2000, defaultMode: 'fit', note: '', category: 'Your own item' }
      : PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const chooseProduct = (id: string) => {
    setProductId(id);
    setResult(null);
    const found = PRODUCTS.find((p) => p.id === id);
    if (found) setFitMode(found.defaultMode);
    if (id === 'custom') setFitMode('fit');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose a picture file (for example a PNG or JPG).');
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const measured = await measureImage(url);
      setImage({ url, name: file.name, width: measured.width, height: measured.height, sizeBytes: file.size, element: measured.element });
    } catch {
      URL.revokeObjectURL(url);
      setError('That file could not be read as a picture.');
    }
  };

  const handleFit = async () => {
    if (!image) return;
    if (productId === 'custom' && !customProduct) {
      setError(customSizeError ?? 'Check your custom size.');
      return;
    }
    setWorking(true);
    setError(null);
    try {
      // Let the "Fitting..." message paint before the heavy pixel work starts.
      await new Promise((resolve) => setTimeout(resolve, 30));
      const fitted = await fitImage(image, product, fitMode, repixelate, strength);
      setResult(fitted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong fitting your picture.');
    } finally {
      setWorking(false);
    }
  };

  const handleShowEverywhere = async () => {
    if (!image) return;
    setShowcaseWorking(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 30));
      const next: Record<string, string> = {};
      for (const p of PRODUCTS) {
        next[p.id] = await previewForProduct(image, p);
      }
      setPreviews(next);
      setMadeItems([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The previews could not be made.');
    } finally {
      setShowcaseWorking(false);
    }
  };

  const pickAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    for (const p of PRODUCTS) next[p.id] = value;
    setPicked(next);
  };

  const pickCategory = (category: string) => {
    setPicked((prev) => {
      const next = { ...prev };
      for (const p of PRODUCTS) if (p.category === category) next[p.id] = true;
      return next;
    });
  };

  const pickedProducts = PRODUCTS.filter((p) => picked[p.id]);
  const pickedTotal = pickedProducts.reduce((sum, p) => sum + (parseFloat(prices[p.id]) || 0), 0);

  const handleMakePicked = async () => {
    if (!image || pickedProducts.length === 0) return;
    setError(null);
    const made: MadeItem[] = [];
    try {
      for (const p of pickedProducts) {
        setMakingPicked(p.label);
        await new Promise((resolve) => setTimeout(resolve, 30));
        const fitted = await fitImage(image, p, p.defaultMode, repixelate, strength);
        made.push({ ...fitted, productId: p.id, price: prices[p.id] ?? '' });
        setMadeItems([...made]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'One of the pictures could not be made.');
    } finally {
      setMakingPicked(null);
    }
  };

  const isUpscaling = image ? product.width > image.width || product.height > image.height : false;

  // ---- The Guide -------------------------------------------------------
  // Per the Creator Journey design principle ("Aurora should never
  // overwhelm the user. One clear next step.") and Nichole's direction:
  // Snap 2 Fit takes the guesswork OUT. It does NOT grade the user's
  // picture, and it does NOT show pixel percentages or quality scores.
  // Instead the guide quietly sets everything up the right way for the
  // picture and item chosen, and the user just follows the steps.
  useEffect(() => {
    if (!image) return;
    // Work out how much enlarging this picture needs for this item —
    // internally only, to choose the clean-up level. Never shown.
    const enlargeFactor = Math.max(product.width / image.width, product.height / image.height);
    setRepixelate(true);
    setStrength(enlargeFactor > 1.75 ? 'strong' : 'gentle');
    setFitMode(product.defaultMode);
    setResult(null);
    // Only re-run the automatic setup when the picture or item changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, productId]);

  // Shape guidance is about what the user will SEE (empty space, or
  // edges trimmed), never about grading their picture.
  const guide = useMemo(() => {
    if (!image) return null;
    const shapeRatio = image.width / image.height;
    const itemRatio = product.width / product.height;
    const shapeDiff = Math.abs(shapeRatio - itemRatio) / itemRatio;
    const shapeAdvice =
      shapeDiff <= 0.15
        ? 'Your design’s shape matches this item well, so it will sit on it nicely.'
        : fitMode === 'fit'
          ? 'Your design will be shown in full. There will be some empty space around it on this item — nothing will be cut off.'
          : 'This will cover the whole item. Some edges of your design will be trimmed away.';
    // Items whose SHAPE best matches this design (not a size score).
    const shapeMatches = [...PRODUCTS]
      .map((p) => ({ product: p, diff: Math.abs(shapeRatio - p.width / p.height) / (p.width / p.height) }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
      .map(({ product: p }) => p);
    return { shapeAdvice, shapeMatches };
  }, [image, product, fitMode]);

  const applyOption = (mode: 'fit' | 'fill', clean: boolean, level: 'gentle' | 'strong') => {
    setFitMode(mode);
    setRepixelate(clean);
    setStrength(level);
    setResult(null);
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Snap 2 Fit Studio</h2>
        <p className="text-sm text-slate-400">
          Add a design, pick any item, and Snap 2 Fit cleans it up (repixelate) and auto-fits it to that item's print size.
        </p>
      </div>

      {/* 1. Upload */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">1. Add your design</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition"
        >
          {image ? 'Choose a different picture' : 'Upload a picture'}
        </button>
        {image && (
          <p className="text-sm text-slate-300">
            <span className="font-medium text-slate-100">{image.name}</span>
            {' — '}your picture is <strong>{image.width} × {image.height}</strong> pixels ({formatBytes(image.sizeBytes)})
          </p>
        )}
      </div>

      {/* The Guide — appears after a picture is added. It has already set
          everything up; the user just follows one clear next step. */}
      {image && guide && (
        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <p className="text-sm font-semibold text-emerald-300">All set up for you</p>
          <p className="text-sm text-slate-200">
            I’ve set this up for a {product.label}. Your design will be cleaned up as it’s made, and{' '}
            {fitMode === 'fit' ? 'shown in full — nothing cut off.' : 'will cover the whole item.'}
          </p>
          <p className="text-sm text-slate-300">{guide.shapeAdvice}</p>
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Your design’s shape also suits these items:</p>
            <div className="flex flex-wrap gap-2">
              {guide.shapeMatches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => chooseProduct(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Prefer it a different way? Tap one — what changes is only what you’ll see:</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyOption('fit', true, strength)} className="px-3 py-2 rounded-lg text-sm border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">
                Show my whole design
              </button>
              <button type="button" onClick={() => applyOption('fill', true, strength)} className="px-3 py-2 rounded-lg text-sm border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">
                Cover the whole item
              </button>
              <button type="button" onClick={() => applyOption('fit', false, 'gentle')} className="px-3 py-2 rounded-lg text-sm border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">
                Keep my picture exactly as it is
              </button>
            </div>
            <p className="text-xs text-slate-500">Your next step is below: pick the item if you want a different one, then press the Make button. Everything else is already handled.</p>
          </div>
        </div>
      )}

      {/* 2. Repixelate */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">2. Repixelate — clean the picture up as it is enlarged</p>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={repixelate} onChange={(event) => setRepixelate(event.target.checked)} className="h-4 w-4" />
          Clean up and sharpen my picture
        </label>
        {repixelate && (
          <div className="flex gap-2">
            {(['gentle', 'strong'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setStrength(level)}
                className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition ${
                  strength === level
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400">
          Honest note: this sharpens edges and adds a little contrast and colour. It cannot invent detail that was never in the picture — no honest tool can.
        </p>
      </div>

      {/* 3. Any item */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">3. Pick the item — any item</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => chooseProduct(p.id)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                p.id === productId
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {p.label} — {p.width} × {p.height}
            </button>
          ))}
          <button
            type="button"
            onClick={() => chooseProduct('custom')}
            className={`px-3 py-2 rounded-lg text-sm border transition ${
              productId === 'custom'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            My own item…
          </button>
        </div>

        {productId === 'custom' ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-end">
              <label className="text-xs text-slate-400">
                Item name
                <input value={customName} onChange={(e) => setCustomName(e.target.value)} className="block mt-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 w-36" />
              </label>
              <label className="text-xs text-slate-400">
                Width (inches)
                <input value={customWidthIn} onChange={(e) => setCustomWidthIn(e.target.value)} inputMode="decimal" className="block mt-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 w-24" />
              </label>
              <label className="text-xs text-slate-400">
                Height (inches)
                <input value={customHeightIn} onChange={(e) => setCustomHeightIn(e.target.value)} inputMode="decimal" className="block mt-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 w-24" />
              </label>
              <label className="text-xs text-slate-400">
                Print quality (DPI)
                <input value={customDpi} onChange={(e) => setCustomDpi(e.target.value)} inputMode="numeric" className="block mt-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 w-24" />
              </label>
            </div>
            {customProduct ? (
              <p className="text-xs text-emerald-300">
                {customProduct.label} will be made at {customProduct.width} × {customProduct.height} pixels.
              </p>
            ) : (
              <p className="text-xs text-rose-300">{customSizeError}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">{product.note}. Sizes are in pixels.</p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setFitMode('fit')}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              fitMode === 'fit' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            Fit the whole design in (nothing cut off)
          </button>
          <button
            type="button"
            onClick={() => setFitMode('fill')}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              fitMode === 'fill' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            Fill the whole item (edges may be trimmed)
          </button>
        </div>
      </div>

      {/* 4. Fit it */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">4. Fit it</p>
        <button
          type="button"
          disabled={!image || working}
          onClick={() => void handleFit()}
          className="px-4 py-2 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-white transition disabled:opacity-40"
        >
          {working ? 'Working — cleaning and fitting…' : `Make my ${product.label}`}
        </button>
        {!image && <p className="text-xs text-slate-500">Add a picture first, then this button will work.</p>}
        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm">{error}</div>}
      </div>

      {/* Result */}
      {image && result && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <p className="text-sm font-semibold mb-2">Before</p>
              <img src={image.url} alt="Your original picture" className="max-h-80 w-auto mx-auto rounded" />
              <p className="text-xs text-slate-400 mt-2 text-center">
                {image.width} × {image.height} pixels · {formatBytes(image.sizeBytes)}
              </p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-emerald-500/30">
              <p className="text-sm font-semibold mb-2">After — fitted for {result.productLabel}</p>
              <img src={result.url} alt="Your picture cleaned up and fitted to the item" className="max-h-80 w-auto mx-auto rounded bg-white/5" />
              <p className="text-xs text-emerald-300 mt-2 text-center">
                Checked: this new picture really measures {result.width} × {result.height} pixels · {formatBytes(result.sizeBytes)}
                {result.repixelated ? ' · Repixelated (sharpened and cleaned)' : ' · Not repixelated'}
              </p>
            </div>
          </div>
          <a
            href={result.url}
            download={`snap2fit-${product.id}-${result.width}x${result.height}.png`}
            className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition"
          >
            Download the finished picture
          </a>
          {onSendToSizeMeUp && (
            <button
              type="button"
              onClick={() =>
                onSendToSizeMeUp({
                  url: result.url,
                  name: image.name,
                  width: result.width,
                  height: result.height,
                  productLabel: result.productLabel,
                })
              }
              className="inline-block ml-3 px-4 py-2 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-white transition"
            >
              Next step: see it on a model in Size Me Up →
            </button>
          )}
        </div>
      )}

      {/* 5. On every object in the shop */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
        <p className="text-sm font-semibold text-slate-200">5. See it on every object in the shop</p>
        <p className="text-xs text-slate-400">
          One design, every object. Look at them all, tick the ones you want, and set your price for each.
        </p>
        <button
          type="button"
          disabled={!image || showcaseWorking}
          onClick={() => void handleShowEverywhere()}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition disabled:opacity-40"
        >
          {showcaseWorking ? 'Putting your design on everything…' : 'Show it on every object'}
        </button>
        {!image && <p className="text-xs text-slate-500">Add a picture first, then this button will work.</p>}

        {Object.keys(previews).length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={() => pickAll(true)} className="px-3 py-1.5 rounded-lg text-xs border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">Select all</button>
              <button type="button" onClick={() => pickAll(false)} className="px-3 py-1.5 rounded-lg text-xs border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">Select none</button>
              <span className="text-xs text-slate-500">or pick a whole kind:</span>
              {CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => pickCategory(cat)} className="px-3 py-1.5 rounded-lg text-xs border bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 transition">
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map((p) => (
                <div key={p.id} className={`p-3 rounded-xl border space-y-2 ${picked[p.id] ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-900'}`}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    <input
                      type="checkbox"
                      checked={!!picked[p.id]}
                      onChange={(event) => setPicked((prev) => ({ ...prev, [p.id]: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    {p.label}
                  </label>
                  <img src={previews[p.id]} alt={`Your design on a ${p.label}`} className="w-full h-40 object-contain rounded bg-slate-800" />
                  <p className="text-[11px] text-slate-500">{p.category} · will be made at {p.width} × {p.height}</p>
                  <label className="block text-xs text-slate-400">
                    Your price ($)
                    <input
                      value={prices[p.id] ?? ''}
                      onChange={(event) => setPrices((prev) => ({ ...prev, [p.id]: event.target.value }))}
                      inputMode="decimal"
                      className="block mt-1 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 w-24"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-200">
                {pickedProducts.length === 0
                  ? 'Nothing ticked yet. Tick the objects you want to sell this design on.'
                  : `You picked ${pickedProducts.length} object${pickedProducts.length === 1 ? '' : 's'}: ${pickedProducts.map((p) => p.label).join(', ')}. If someone bought one of each, that is $${pickedTotal.toFixed(2)}.`}
              </p>
              <button
                type="button"
                disabled={pickedProducts.length === 0 || makingPicked !== null}
                onClick={() => void handleMakePicked()}
                className="px-4 py-2 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-white transition disabled:opacity-40"
              >
                {makingPicked ? `Making your ${makingPicked}…` : 'Make the ones I picked, full size'}
              </button>
            </div>

            {madeItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-200">Made, full size and ready:</p>
                {madeItems.map((item) => (
                  <div key={item.productId} className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <img src={item.url} alt="" className="h-10 w-auto rounded bg-white/5" />
                    <span>
                      {item.productLabel} — {item.width} × {item.height}
                      {item.price ? ` · your price $${item.price}` : ''}
                    </span>
                    <a
                      href={item.url}
                      download={`snap2fit-${item.productId}-${item.width}x${item.height}.png`}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
