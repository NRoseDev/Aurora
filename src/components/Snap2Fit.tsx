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

// BACKGROUND REMOVAL, honestly scoped: this takes out a PLAIN
// background — one colour, like the white behind a logo. It starts
// from the edges of the picture and works inward while the colour
// stays close to the corner colour, so the same colour inside the
// design is left alone. It cannot separate a design from a busy
// photograph background; no honest claim is made that it can.
function removeBackgroundCanvas(source: HTMLImageElement, tolerance = 46): HTMLCanvasElement {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create a picture canvas.');
  ctx.drawImage(source, 0, 0);
  if (width < 2 || height < 2) return canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // The background colour: the average of small patches in the corners.
  let br = 0, bg = 0, bb = 0, count = 0;
  const patch = Math.min(6, Math.floor(Math.min(width, height) / 2));
  const corners: Array<[number, number]> = [[0, 0], [width - patch, 0], [0, height - patch], [width - patch, height - patch]];
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * width + x) * 4;
        br += data[i]; bg += data[i + 1]; bb += data[i + 2]; count++;
      }
    }
  }
  br /= count; bg /= count; bb /= count;

  const distAt = (idx: number): number => {
    const i = idx * 4;
    const dr = data[i] - br;
    const dg = data[i + 1] - bg;
    const db = data[i + 2] - bb;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // Flood from every edge pixel, through pixels close to the
  // background colour. Anything the flood cannot reach stays.
  const total = width * height;
  const removed = new Uint8Array(total);
  const stack: number[] = [];
  const tryPush = (idx: number) => {
    if (!removed[idx] && distAt(idx) <= tolerance) {
      removed[idx] = 1;
      stack.push(idx);
    }
  };
  for (let x = 0; x < width; x++) {
    tryPush(x);
    tryPush((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryPush(y * width);
    tryPush(y * width + width - 1);
  }
  const edgePixels = new Set<number>();
  while (stack.length > 0) {
    const idx = stack.pop() as number;
    const x = idx % width;
    const y = (idx - x) / width;
    const neighbours: number[] = [];
    if (x > 0) neighbours.push(idx - 1);
    if (x < width - 1) neighbours.push(idx + 1);
    if (y > 0) neighbours.push(idx - width);
    if (y < height - 1) neighbours.push(idx + width);
    for (const n of neighbours) {
      if (removed[n]) continue;
      if (distAt(n) <= tolerance) {
        removed[n] = 1;
        stack.push(n);
      } else {
        edgePixels.add(n);
      }
    }
  }
  for (let idx = 0; idx < total; idx++) {
    if (removed[idx]) data[idx * 4 + 3] = 0;
  }
  // Soften the cut edge a touch: design pixels right at the boundary
  // that are still close-ish to the background colour go half-clear.
  edgePixels.forEach((idx) => {
    if (distAt(idx) <= tolerance * 1.7) data[idx * 4 + 3] = Math.min(data[idx * 4 + 3], 110);
  });
  ctx.putImageData(imageData, 0, 0);
  return canvas;
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

// ---------------------------------------------------------------------
// THE VIEWING ROOMS — "See the fantasy alive before you buy."
// Nichole's feature (2026-10-05): a separate space where the design is
// shown alive, at any scale, on anything usable — a building, a
// billboard, a shirt, a blanket, a tapestry, a keychain, a wallet.
// Each room is a small stage; the design is placed into it the way it
// would really sit. Rooms change on their own (a gentle tour), and the
// user can also tap any room to step into it.
// ---------------------------------------------------------------------
interface FantasyScene {
  id: string;
  room: string;
  caption: string;
  backdrop: React.ReactNode;
  frameStyle: React.CSSProperties;
  frameClass?: string;
}

const FANTASY_SCENES: FantasyScene[] = [
  {
    id: 'building',
    room: 'The City',
    caption: 'Your design, across a whole building.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#1e1b4b 0%,#312e81 55%,#0f172a 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-950/80" />
        <div className="absolute bottom-10 left-2 w-14 h-24 bg-slate-900/90" />
        <div className="absolute bottom-10 right-3 w-16 h-32 bg-slate-900/90" />
        <div className="absolute bottom-10 left-[19%] w-[62%] h-[74%] bg-slate-800 shadow-2xl" />
      </>
    ),
    frameStyle: { left: '21%', top: '14%', width: '58%', height: '58%', transform: 'perspective(700px) rotateY(-4deg)' },
    frameClass: 'shadow-2xl',
  },
  {
    id: 'billboard',
    room: 'The Highway',
    caption: 'Your design, up on a billboard for everyone driving by.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#7dd3fc 0%,#bae6fd 55%,#475569 55.2%,#334155 100%)' }} />
        <div className="absolute left-1/2 top-[58%] w-3 h-[30%] -translate-x-1/2 bg-slate-600" />
        <div className="absolute bottom-2 left-6 text-2xl">🚗</div>
        <div className="absolute bottom-3 right-10 text-xl">🚙</div>
      </>
    ),
    frameStyle: { left: '14%', top: '10%', width: '72%', height: '44%', border: '6px solid #1e293b' },
    frameClass: 'shadow-2xl',
  },
  {
    id: 'wall',
    room: 'Your Living Room',
    caption: 'Your design, framed on the wall above the couch.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#fef3c7 0%,#fde68a 78%,#b45309 78.2%,#92400e 100%)' }} />
        <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[62%] h-[20%] rounded-t-2xl bg-rose-800/90" />
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[70%] h-[10%] rounded-xl bg-rose-900" />
      </>
    ),
    frameStyle: { left: '33%', top: '10%', width: '34%', height: '44%', border: '8px solid #78350f' },
    frameClass: 'shadow-xl',
  },
  {
    id: 'body',
    room: 'On You',
    caption: 'Your design, worn — right there on the shirt.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#fce7f3 0%,#fbcfe8 100%)' }} />
        <svg viewBox="0 0 200 190" className="absolute left-1/2 top-[6%] h-[92%] -translate-x-1/2" aria-hidden="true">
          <circle cx="100" cy="26" r="17" fill="#f59e0b" opacity="0.85" />
          <path d="M100 44 L142 56 L168 92 L142 100 L142 178 L58 178 L58 100 L32 92 L58 56 Z" fill="#334155" />
        </svg>
      </>
    ),
    frameStyle: { left: '41.5%', top: '38%', width: '17%', height: '30%' },
  },
  {
    id: 'bed',
    room: 'The Bedroom',
    caption: 'Your design, spread across the blanket on the bed.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#e0e7ff 0%,#c7d2fe 62%,#a5b4fc 62.2%,#818cf8 100%)' }} />
        <div className="absolute left-[16%] top-[30%] w-[68%] h-[10%] rounded-t-xl bg-white/90" />
        <div className="absolute left-[13%] bottom-0 w-[74%] h-[16%] rounded-t-lg bg-indigo-950/70" />
      </>
    ),
    frameStyle: { left: '17%', top: '40%', width: '66%', height: '46%', transform: 'perspective(500px) rotateX(38deg)', transformOrigin: 'top' },
    frameClass: 'shadow-2xl',
  },
  {
    id: 'tapestry',
    room: 'The Wall Hanging',
    caption: 'Your design, hanging soft as a tapestry.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#f5f5f4 0%,#e7e5e4 100%)' }} />
        <div className="absolute left-[24%] top-[7%] w-[52%] h-2 rounded bg-amber-900/80" />
      </>
    ),
    frameStyle: { left: '27%', top: '10%', width: '46%', height: '74%', borderRadius: '0 0 46% 46% / 0 0 6% 6%' },
    frameClass: 'shadow-xl',
  },
  {
    id: 'car',
    room: 'Your Car',
    caption: 'Your design, riding on the side of your car.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#bae6fd 0%,#e0f2fe 60%,#64748b 60.2%,#475569 100%)' }} />
        <svg viewBox="0 0 320 150" className="absolute left-1/2 bottom-[8%] w-[86%] -translate-x-1/2" aria-hidden="true">
          <path d="M18 96 L44 56 Q52 44 72 42 L238 42 Q258 44 268 58 L292 88 Q300 96 294 102 L286 112 L240 112 A26 26 0 0 0 188 112 L116 112 A26 26 0 0 0 64 112 L24 112 Q12 108 18 96 Z" fill="#0ea5e9" />
          <rect x="86" y="50" width="60" height="24" rx="4" fill="#e0f2fe" />
          <rect x="156" y="50" width="60" height="24" rx="4" fill="#e0f2fe" />
          <circle cx="90" cy="112" r="17" fill="#0f172a" /><circle cx="90" cy="112" r="8" fill="#94a3b8" />
          <circle cx="214" cy="112" r="17" fill="#0f172a" /><circle cx="214" cy="112" r="8" fill="#94a3b8" />
        </svg>
      </>
    ),
    frameStyle: { left: '47%', top: '52%', width: '15%', height: '22%', borderRadius: '6px' },
  },
  {
    id: 'floor',
    room: 'The Floor',
    caption: 'Your design, underfoot as a rug on the floor.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#fef9c3 0%,#fef08a 52%,#a16207 52.2%,#854d0e 100%)' }} />
        <div className="absolute left-[8%] top-[8%] w-[20%] h-[30%] rounded bg-amber-950/25" />
      </>
    ),
    frameStyle: { left: '26%', top: '56%', width: '48%', height: '36%', transform: 'perspective(420px) rotateX(52deg)', transformOrigin: 'top' },
    frameClass: 'shadow-2xl',
  },
  {
    id: 'keychain',
    room: 'In Your Pocket',
    caption: 'Your design, small enough to carry everywhere — a keychain.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 34%,#fef3c7 0%,#fcd34d 58%,#f59e0b 100%)' }} />
        <div className="absolute left-1/2 top-[5%] h-[16%] w-3 -translate-x-1/2 rounded bg-slate-400" />
        <div className="absolute left-1/2 top-[3%] h-10 w-10 -translate-x-1/2 rounded-full border-4 border-slate-300" />
      </>
    ),
    frameStyle: { left: '35%', top: '21%', width: '30%', height: '58%', borderRadius: '9999px', border: '5px solid #d6d3d1' },
    frameClass: 'shadow-2xl',
  },
  {
    id: 'wallet',
    room: 'In Your Hands',
    caption: 'Your design, on a wallet you touch every day.',
    backdrop: (
      <>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#dcfce7 0%,#86efac 100%)' }} />
        <div className="absolute left-1/2 top-[16%] h-[66%] w-[62%] -translate-x-1/2 rounded-2xl bg-amber-950 shadow-2xl" />
        <div className="absolute left-1/2 top-[16%] h-[66%] w-[62%] -translate-x-1/2 rounded-2xl border-2 border-dashed border-amber-200/40" />
      </>
    ),
    frameStyle: { left: '24%', top: '23%', width: '34%', height: '52%', borderRadius: '10px' },
  },
];

export default function Snap2Fit({ onSendToSizeMeUp }: { onSendToSizeMeUp?: (design: import('../types').SharedDesign) => void } = {}) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [repixelate, setRepixelate] = useState(true);
  const [strength, setStrength] = useState<'gentle' | 'strong'>('gentle');
  const [removeBg, setRemoveBg] = useState(false);
  // The design with its plain background taken out (when that is on).
  // Everything downstream uses this version, so the fitting, the shop
  // previews and the full-size makes all show the same clean design.
  const [designSource, setDesignSource] = useState<LoadedImage | null>(null);
  const [bgWorking, setBgWorking] = useState(false);
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
  // ---- The Viewing Rooms: see the fantasy alive ----
  const [fantasyIdx, setFantasyIdx] = useState(0);
  const [fantasyPlaying, setFantasyPlaying] = useState(true);
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

  // Keep the "design we actually use" in step with the background
  // choice. Turning it off goes straight back to the original picture.
  useEffect(() => {
    if (!image) {
      setDesignSource(null);
      return;
    }
    if (!removeBg) {
      setDesignSource(image);
      return;
    }
    let cancelled = false;
    setBgWorking(true);
    // Let the "working" note paint before the pixel work starts.
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const canvas = removeBackgroundCanvas(image.element);
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (!blob || cancelled) return;
          const url = URL.createObjectURL(blob);
          const measured = await measureImage(url);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          setDesignSource({ ...image, url, element: measured.element, sizeBytes: blob.size });
          setResult(null);
        } catch {
          if (!cancelled) {
            setError('The background could not be taken out of this picture. Your original is unchanged.');
            setRemoveBg(false);
          }
        } finally {
          if (!cancelled) setBgWorking(false);
        }
      })();
    }, 30);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [image, removeBg]);

  const effectiveImage = designSource ?? image;

  // The gentle tour: while the tour is playing and a design is here,
  // the viewing rooms change on their own, one after another.
  useEffect(() => {
    if (!fantasyPlaying || !effectiveImage) return;
    const timer = setInterval(() => {
      setFantasyIdx((idx) => (idx + 1) % FANTASY_SCENES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [fantasyPlaying, effectiveImage]);
  const fantasyScene = FANTASY_SCENES[fantasyIdx % FANTASY_SCENES.length];

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
      const fitted = await fitImage(effectiveImage ?? image, product, fitMode, repixelate, strength);
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
        next[p.id] = await previewForProduct(effectiveImage ?? image, p);
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
        const fitted = await fitImage(effectiveImage ?? image, p, p.defaultMode, repixelate, strength);
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
        <div className="pt-2 border-t border-slate-700/60 space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={removeBg} onChange={(event) => setRemoveBg(event.target.checked)} className="h-4 w-4" />
            Take the background out
          </label>
          <p className="text-xs text-slate-400">
            This takes out a <strong>plain background</strong> — one colour, like the white behind a logo — so your design itself can sit on any colour item. It works from the edges inward, so the same colour inside your design is left alone. A busy photo background can't be separated this way.
          </p>
          {removeBg && bgWorking && <p className="text-xs text-emerald-300">Taking the background out…</p>}
          {removeBg && !bgWorking && designSource && image && designSource !== image && (
            <div className="flex items-center gap-3">
              <img
                src={designSource.url}
                alt="Your design with the background taken out"
                className="h-24 w-auto rounded border border-slate-700"
                style={{ backgroundImage: 'conic-gradient(#475569 0 25%, #1e293b 0 50%, #475569 0 75%, #1e293b 0)', backgroundSize: '16px 16px' }}
              />
              <p className="text-xs text-slate-400">Here it is on the checkerboard — the squares show where it is now see-through. Everything below uses this clean version.</p>
            </div>
          )}
        </div>
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
          disabled={!image || working || bgWorking}
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

      {/* 6. The Viewing Rooms — see the fantasy alive before you buy */}
      <div className="p-4 rounded-xl border border-fuchsia-500/30 space-y-4" style={{ background: 'linear-gradient(160deg, rgba(88,28,135,0.25), rgba(15,23,42,0.6))' }}>
        <style>{`
          @keyframes fantasyFade { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
          .fantasy-stage-enter { animation: fantasyFade 900ms ease both; }
        `}</style>
        <div>
          <p className="text-sm font-semibold text-fuchsia-200">6. The Viewing Rooms — see the fantasy alive before you buy ✨</p>
          <p className="text-xs text-slate-300">
            The shop showed you products. This room shows you the <em>fantasy</em>. Your design, alive at any size, on anything — a building, a billboard, a blanket, a keychain. The rooms change on their own; tap one to step into it.
          </p>
        </div>
        {!effectiveImage && <p className="text-xs text-slate-400">Add a picture first — then step into the rooms and watch it come alive.</p>}
        {effectiveImage && (
          <>
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ aspectRatio: '16 / 10' }}>
              <div key={fantasyScene.id} className="fantasy-stage-enter absolute inset-0">
                {fantasyScene.backdrop}
                <div className={`absolute overflow-hidden ${fantasyScene.frameClass ?? ''}`} style={fantasyScene.frameStyle}>
                  <img src={effectiveImage.url} alt={`Your design in ${fantasyScene.room}`} className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(0,0,0,0.10) 60%)' }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-slate-950/70 px-4 py-2 backdrop-blur-sm">
                <p className="text-sm text-slate-100"><span className="font-semibold text-fuchsia-200">{fantasyScene.room}.</span> {fantasyScene.caption}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => setFantasyPlaying((playing) => !playing)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-900 border-fuchsia-500/40 text-fuchsia-200 hover:border-fuchsia-400 transition"
              >
                {fantasyPlaying ? '⏸ Pause the tour' : '▶ Let the rooms change on their own'}
              </button>
              {FANTASY_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => { setFantasyIdx(idx); setFantasyPlaying(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    idx === fantasyIdx ? 'bg-fuchsia-500/15 border-fuchsia-400 text-fuchsia-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {scene.room}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">These rooms are daydreams — drawings that show the feeling, not photographs of real products. The real, measured pictures are the ones you make and download above.</p>
          </>
        )}
      </div>
    </div>
  );
}
