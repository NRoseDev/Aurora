import React from 'react';

export default function SoulSketchesGrid({ sketches = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {sketches.map((sketch) => (
        <div key={sketch.id} className="sketch-card border rounded-xl p-5 shadow-sm flex flex-col justify-between bg-white">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">{sketch.type}</span>
            <h3 className="text-xl font-medium mt-1">{sketch.title}</h3>
            <p className="text-sm opacity-90 mt-3">{sketch.description}</p>
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t">
            <button className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:opacity-95">
              Approve
            </button>
            <button className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
              Tweak
            </button>
            <button className="px-3 py-2 border text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
              Scrap
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
