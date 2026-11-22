'use client';

import { useState } from 'react';

interface Studio3DLabProps {
  onOpenAI?: () => void;
}

export default function Studio3DLab({ onOpenAI }: Studio3DLabProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section
      aria-label="Interactive 3D Sylhet Studio"
      className="fixed top-14 inset-x-0 bottom-0 z-10 bg-[#080b0f] overflow-hidden"
    >
      {!loaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#080b0f] text-[#EAECEF]">
          <div className="w-6 h-6 rounded-full border-2 border-[#6BD0C2] border-t-transparent animate-spin mb-3" />
          <p className="font-mono text-xs tracking-widest text-[#8A94A6]">
            INITIALIZING 3D SYLHET STUDIO...
          </p>
        </div>
      )}

      <iframe
        src="/v4-demo.html"
        title="Rafsan Jani — Living 3D Spatial Studio"
        onLoad={() => setLoaded(true)}
        allow="autoplay; fullscreen"
        className={`w-full h-full border-0 transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {onOpenAI && (
        <button
          type="button"
          onClick={onOpenAI}
          title="Ask RJ.AI Assistant"
          className="fixed bottom-5 right-5 z-30 h-10 px-3.5 rounded-full bg-[#131720]/90 border border-[#252b37] backdrop-blur-xl text-xs font-medium text-[#EAECEF] hover:bg-[#1e2430] hover:border-[#6BD0C2]/50 transition-all flex items-center gap-2 shadow-xl"
        >
          <span className="w-2 h-2 rounded-full bg-[#6BD0C2]" />
          <span>Ask RJ.AI</span>
        </button>
      )}
    </section>
  );
}
