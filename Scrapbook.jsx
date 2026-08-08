import React from 'react';
import RiseAndAlignHeader from './RiseAndAlignHeader';
import SoulSketchesGrid from './SoulSketchesGrid';

export default function Scrapbook() {
  const sampleSketches = [
    {
      id: 1,
      type: "Design / Apparel",
      title: "Midnight Velvet Crop Tank",
      description: "Generated overnight based on current trending high-waist aesthetics."
    },
    {
      id: 2,
      type: "Social Post",
      title: "Behind the Seams Drop Teaser",
      description: "Draft caption and media alignment for your next collection release."
    },
    {
      id: 3,
      type: "Product Listing",
      title: "Rise Up Healing Custom Accent Piece",
      description: "Optimized tags and market-aligned pricing recommendation."
    }
  ];

  return (
    <div className="scrapbook-container p-6 max-w-6xl mx-auto">
      <div className="text-center py-6">
        <h1 className="text-3xl font-light tracking-wide">The Scrapbook</h1>
        <p className="text-sm opacity-70 mt-2">Where ideas come to fruition while you're away.</p>
      </div>

      <div className="scrapbook-workspace border rounded-2xl p-8 bg-gray-50/50">
        <RiseAndAlignHeader />
        <SoulSketchesGrid sketches={sampleSketches} />
      </div>
    </div>
  );
}
