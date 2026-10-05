// src/components/Snap2Fit.tsx
import React, { useEffect, useRef, useState } from 'react';

// Product sizes come from the existing Snap 2 Fit engine (backend/ai_resizer.py).
interface ProductSpec {
  id: string;
  label: string;
  width: number;
  height: number;
  position: 'center' | 'center_top' | 'fill';
  note: string;
}

const PRODUCTS: ProductSpec[] = [
  { id: 'tshirt', label: 'T-Shirt', width: 2400, height: 3200, position: 'center_top', note: 'Fits inside, sits at the top centre. Nothing is stretched.' },
  { id: 'mug', label: 'Mug', width: 1200, height: 1000, position: 'center', note: 'Fits inside, centred. Nothing is stretched.' },
  { id: 'phone_case', label: 'Phone Case', width: 1400, height: 2900, position: 'fill', note: 'Fills the whole case. Edges may be trimmed so there are no empty gaps.' },
  { id: 'print', label: 'Square Print', width: 2000, height: 2000, position: 'center', note: 'Fits inside, centred. Nothing is stretched.' },
];

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
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Load a blob/object URL into an Image and report its REAL measured size.
// This is how the page checks its own work instead of just claiming success.
function measureImage(url: string): Promise<{ element: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve({ element, width: element.naturalWidth, height: element.naturalHeight });
    element.onerror = () => reject(new Error('That file could not be read as a picture.'));
    element.src = url;
  });
}

// Really resize: draw the picture onto a new canvas at the product's exact size.
async function fitImageToProduct(image: LoadedImage, product: ProductSpec): Promise<FitResult> {
  const canvas = document.createElement('canvas');
  canvas.width = product.width;
  canvas.height = product.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create a picture canvas.');

  const sourceRatio = image.width / image.height;
  const targetRatio = product.width / product.height;

  let drawWidth: number;
  let drawHeight: number;
  if (product.position === 'fill') {
    // Fill: scale until the canvas is fully covered (cover), crop the overflow.
    if (sourceRatio > targetRatio) {
      drawHeight = product.height;
      drawWidth = drawHeight * sourceRatio;
    } else {
      drawWidth = product.width;
      drawHeight = drawWidth / sourceRatio;
    }
  } else {
    // Fit inside: scale until the whole picture is visible (contain), never stretch.
    if (sourceRatio > targetRatio) {
      drawWidth = product.width;
      drawHeight = drawWidth / sourceRatio;
    } else {
      drawHeight = product.height;
      drawWidth = drawHeight * sourceRatio;
    }
  }

  const x = (product.width - drawWidth) / 2;
  const y = product.position === 'center_top' ? 0 : (product.height - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image.element, x, y, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The fitted picture could not be created.');

  const url = URL.createObjectURL(blob);
  // Verify the output by loading it back and measuring it for real.
  const measured = await measureImage(url);

  return {
    url,
    width: measured.width,
    height: measured.height,
    sizeBytes: blob.size,
    productLabel: product.label,
  };
}

export default function Snap2Fit() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [result, setResult] = useState<FitResult | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

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
      setImage({
        url,
        name: file.name,
        width: measured.width,
        height: measured.height,
        sizeBytes: file.size,
        element: measured.element,
      });
    } catch {
      URL.revokeObjectURL(url);
      setError('That file could not be read as a picture.');
    }
  };

  const handleFit = async () => {
    if (!image) return;
    setWorking(true);
    setError(null);
    try {
      const fitted = await fitImageToProduct(image, product);
      setResult(fitted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong fitting your picture.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Snap 2 Fit Studio</h2>
        <p className="text-sm text-slate-400">
          Add a picture, pick a product, and Snap 2 Fit will really resize it to that product's print size — right here, no stretching.
        </p>
      </div>

      {/* Step 1: upload */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">1. Add your picture</p>
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

      {/* Step 2: pick a product */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">2. Pick a product</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProductId(p.id);
                setResult(null);
              }}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                p.id === productId
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {p.label} — {p.width} × {p.height}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">{product.note}</p>
      </div>

      {/* Step 3: fit it */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">3. Fit it</p>
        <button
          type="button"
          disabled={!image || working}
          onClick={() => void handleFit()}
          className="px-4 py-2 bg-slate-100 text-slate-900 text-sm font-semibold rounded-lg hover:bg-white transition disabled:opacity-40"
        >
          {working ? 'Fitting…' : `Fit my picture to a ${product.label}`}
        </button>
        {!image && <p className="text-xs text-slate-500">Add a picture first, then this button will work.</p>}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm">{error}</div>
        )}
      </div>

      {/* Result: before and after, with real measured sizes */}
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
              <img src={result.url} alt="Your picture fitted to the product size" className="max-h-80 w-auto mx-auto rounded bg-white/5" />
              <p className="text-xs text-emerald-300 mt-2 text-center">
                Checked: this new picture really measures {result.width} × {result.height} pixels · {formatBytes(result.sizeBytes)}
              </p>
            </div>
          </div>
          <a
            href={result.url}
            download={`snap2fit-${product.id}-${result.width}x${result.height}.png`}
            className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition"
          >
            Download the fitted picture
          </a>
        </div>
      )}
    </div>
  );
}
