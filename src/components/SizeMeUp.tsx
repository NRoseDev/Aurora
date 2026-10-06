// src/components/SizeMeUp.tsx
//
// Size Me Up — a separate app inside Aurora.
// It takes a finished design (sent across from Snap 2 Fit, or uploaded
// here), shows it on a model, and tells the user in plain English how
// the garment will fit that model.
//
// It works from measurements, not guesses: standard flat-garment metrics
// (chest width and length, laid flat) compared with the model's body
// measurements. The room a garment gives a body is called "ease":
//   garment chest (flat width x 2) - body chest = ease
// That is the same maths clothing designers use, and it is what lets a
// shopper choose a size before ordering — fewer try-ons, fewer returns.
//
// Honest scope: the model view is a clear front-view diagram with the
// design placed at its real relative size. It is not a photograph and
// does not pretend to warp fabric around a body.
import React, { useMemo, useRef, useState } from 'react';
import type { SharedDesign } from '../types';

interface BodyModel {
  id: string;
  label: string;
  chestIn: number; // around the body
  waistIn: number;
  heightLabel: string;
}

const MODELS: BodyModel[] = [
  { id: 'xs', label: 'Model XS', chestIn: 31, waistIn: 24, heightLabel: '5\'3"' },
  { id: 's', label: 'Model S', chestIn: 34, waistIn: 27, heightLabel: '5\'5"' },
  { id: 'm', label: 'Model M', chestIn: 38, waistIn: 31, heightLabel: '5\'8"' },
  { id: 'l', label: 'Model L', chestIn: 42, waistIn: 35, heightLabel: '5\'10"' },
  { id: 'xl', label: 'Model XL', chestIn: 46, waistIn: 39, heightLabel: '5\'10"' },
  { id: '2xl', label: 'Model 2XL', chestIn: 50, waistIn: 43, heightLabel: '6\'0"' },
];

interface GarmentSize {
  size: string;
  flatChestIn: number; // laid flat, armpit to armpit
  lengthIn: number;
}

// Standard flat-garment metrics for a classic unisex tee.
const GARMENT_SIZES: GarmentSize[] = [
  { size: 'XS', flatChestIn: 16, lengthIn: 26 },
  { size: 'S', flatChestIn: 18, lengthIn: 27 },
  { size: 'M', flatChestIn: 20, lengthIn: 28 },
  { size: 'L', flatChestIn: 22, lengthIn: 29 },
  { size: 'XL', flatChestIn: 24, lengthIn: 30 },
  { size: '2XL', flatChestIn: 26, lengthIn: 31 },
  { size: '3XL', flatChestIn: 28, lengthIn: 32 },
];

export interface FitVerdict {
  size: string;
  easeIn: number;
  verdict: string;
  detail: string;
}

export function fitForSize(bodyChestIn: number, garment: GarmentSize): FitVerdict {
  const ease = garment.flatChestIn * 2 - bodyChestIn;
  let verdict: string;
  let detail: string;
  if (ease < 0) {
    verdict = 'Too small';
    detail = 'The garment is smaller around than the body. It will not fit comfortably.';
  } else if (ease < 2) {
    verdict = 'Very close fit';
    detail = 'It will hug the body with almost no room to spare.';
  } else if (ease < 5) {
    verdict = 'Regular fit';
    detail = 'The everyday fit most people expect — room to move, not baggy.';
  } else if (ease < 8) {
    verdict = 'Relaxed fit';
    detail = 'Loose and easy, with clear extra room.';
  } else {
    verdict = 'Oversized';
    detail = 'Deliberately big and drapey on this model.';
  }
  return { size: garment.size, easeIn: Math.round(ease * 10) / 10, verdict, detail };
}

export function recommendedSize(bodyChestIn: number): FitVerdict {
  const all = GARMENT_SIZES.map((g) => fitForSize(bodyChestIn, g));
  const regular = all.find((f) => f.verdict === 'Regular fit');
  if (regular) return regular;
  // Fall back to the size with ease closest to the middle of regular (3.5").
  return all.reduce((best, f) => (Math.abs(f.easeIn - 3.5) < Math.abs(best.easeIn - 3.5) ? f : best), all[0]);
}

export default function SizeMeUp({ design }: { design: SharedDesign | null }) {
  const [localDesign, setLocalDesign] = useState<SharedDesign | null>(null);
  const [modelId, setModelId] = useState('m');
  const [size, setSize] = useState('M');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDesign = design ?? localDesign;
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[2];
  const garment = GARMENT_SIZES.find((g) => g.size === size) ?? GARMENT_SIZES[2];
  const fit = useMemo(() => fitForSize(model.chestIn, garment), [model, garment]);
  const best = useMemo(() => recommendedSize(model.chestIn), [model]);
  const allFits = useMemo(() => GARMENT_SIZES.map((g) => fitForSize(model.chestIn, g)), [model]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose a picture file (for example a PNG or JPG).');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      setLocalDesign({ url, name: file.name, width: img.naturalWidth, height: img.naturalHeight, productLabel: 'Uploaded design' });
    img.onerror = () => setError('That file could not be read as a picture.');
    img.src = url;
  };

  // Where the design sits on the garment, at its real relative size:
  // an 8-inch-wide print on a chest that is (flatChest) inches wide.
  const PRINT_WIDTH_IN = 8;
  const printWidthPct = Math.min(92, (PRINT_WIDTH_IN / garment.flatChestIn) * 100);
  // Model diagram width scales a little with the model's chest.
  const torsoWidth = 120 + (model.chestIn - 31) * 2.2;

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Size Me Up</h2>
        <p className="text-sm text-slate-400">
          See your design on a model, and find out how the garment will fit — before anyone orders, tries on, or returns anything.
        </p>
      </div>

      {/* 1. Design */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <p className="text-sm font-semibold text-slate-200">1. Your design</p>
        {activeDesign ? (
          <div className="flex items-center gap-4">
            <img src={activeDesign.url} alt="Your design" className="h-20 w-auto rounded bg-white/5" />
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-100">{activeDesign.name}</span>
              <br />
              {activeDesign.productLabel} · made at {activeDesign.width} × {activeDesign.height} pixels
              {design ? <><br /><span className="text-emerald-300">Sent over from Snap 2 Fit.</span></> : null}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No design yet. Finish one in Snap 2 Fit and press “Next step: Size Me Up”, or add one here:
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 rounded-lg hover:bg-slate-700 transition">
          {activeDesign ? 'Use a different design' : 'Add a design'}
        </button>
        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm">{error}</div>}
      </div>

      {/* 2 and 3 side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-200">2. Pick the model</p>
          <div className="flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModelId(m.id)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  m.id === modelId ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Chest {model.chestIn}" · Waist {model.waistIn}" · Height {model.heightLabel}
          </p>

          <p className="text-sm font-semibold text-slate-200 pt-2">3. Pick the garment size</p>
          <div className="flex flex-wrap gap-2">
            {GARMENT_SIZES.map((g) => (
              <button
                key={g.size}
                type="button"
                onClick={() => setSize(g.size)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  g.size === size ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {g.size}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Laid flat, this size measures {garment.flatChestIn}" across the chest and {garment.lengthIn}" long.
          </p>
        </div>

        {/* Model view */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
          <p className="text-sm font-semibold text-slate-200 mb-3">The model wearing it</p>
          <svg viewBox="0 0 300 340" className="mx-auto h-80 w-auto" role="img" aria-label={`${model.label} wearing a size ${garment.size} shirt with your design on it`}>
            {/* head */}
            <circle cx="150" cy="34" r="22" fill="#334155" />
            {/* body / torso */}
            <path d={`M ${150 - torsoWidth / 2} 70 L ${150 + torsoWidth / 2} 70 L ${150 + torsoWidth / 2 - 12} 300 L ${150 - torsoWidth / 2 + 12} 300 Z`} fill="#1e293b" stroke="#475569" />
            {/* garment */}
            <path
              d={`M ${150 - garment.flatChestIn * 3.4} 78 L ${150 + garment.flatChestIn * 3.4} 78 L ${150 + garment.flatChestIn * 3.1} ${78 + garment.lengthIn * 6.4} L ${150 - garment.flatChestIn * 3.1} ${78 + garment.lengthIn * 6.4} Z`}
              fill="#0f766e"
              opacity="0.85"
            />
            {/* sleeves hint */}
            <path d={`M ${150 - garment.flatChestIn * 3.4} 78 L ${150 - garment.flatChestIn * 4.1} 118 L ${150 - garment.flatChestIn * 3.2} 130 L ${150 - garment.flatChestIn * 3.0} 84 Z`} fill="#0f766e" opacity="0.7" />
            <path d={`M ${150 + garment.flatChestIn * 3.4} 78 L ${150 + garment.flatChestIn * 4.1} 118 L ${150 + garment.flatChestIn * 3.2} 130 L ${150 + garment.flatChestIn * 3.0} 84 Z`} fill="#0f766e" opacity="0.7" />
          </svg>
          {activeDesign && (
            <div className="text-center -mt-56 mb-40 pointer-events-none">
              <img
                src={activeDesign.url}
                alt=""
                style={{ width: `${printWidthPct * 1.4}px`, maxWidth: '150px' }}
                className="mx-auto rounded-sm bg-white/10"
              />
            </div>
          )}
          <p className="text-xs text-slate-400 text-center mt-2">
            A front-view diagram. The shirt is drawn from this size’s real measurements, and your design is shown {PRINT_WIDTH_IN} inches wide, the standard print width.
          </p>
        </div>
      </div>

      {/* Fit report */}
      <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/30 space-y-3">
        <p className="text-sm font-semibold text-emerald-300">How it fits {model.label}</p>
        <p className="text-sm text-slate-200">
          Size <strong>{garment.size}</strong> on {model.label}: <strong>{fit.verdict}.</strong> {fit.detail}
        </p>
        <p className="text-sm text-slate-300">
          The size that gives this model a regular, everyday fit is <strong>{best.size}</strong>
          {best.size !== garment.size ? ' — you can tap it above to see the difference.' : '.'}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {allFits.map((f) => (
            <span
              key={f.size}
              className={`px-2.5 py-1 rounded-full text-xs border ${
                f.size === garment.size ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' : 'border-slate-700 text-slate-400'
              }`}
            >
              {f.size}: {f.verdict}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          For designers: fits are worked out from flat-garment measurements against body measurements — the room between them is the “ease” ({fit.easeIn}" here). Getting this right on screen is what saves hours of trying on and cuts mail-order returns.
        </p>
      </div>
    </div>
  );
}
