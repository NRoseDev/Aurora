import React from 'react';

export default function Scrapbook() {
  return (
    <div className="scrapbook-container p-6 max-w-5xl mx-auto">
      {/* Scrapbook Header */}
      <div className="text-center py-10">
        <h1 className="text-3xl font-light tracking-wide">The Scrapbook</h1>
        <p className="text-sm opacity-70 mt-2">Where ideas come to fruition while you're away.</p>
      </div>

      {/* Main Content Area */}
      <div className="scrapbook-workspace border rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-sm opacity-50">Your morning space is quiet and waiting...</p>
      </div>
    </div>
  );
}
