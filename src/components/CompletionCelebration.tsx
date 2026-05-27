"use client";

import { useEffect, useState } from "react";

type CompletionCelebrationProps = {
  open: boolean;
  onClose: () => void;
};

const CONFETTI_COLORS = ["#8be184", "#f5c86b", "#ffffff", "#5bd269", "#d9f99d"];
const CONFETTI_PIECES = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 0.08}s`,
  duration: `${1.8 + (index % 5) * 0.18}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  rotate: `${(index * 29) % 180}deg`,
}));

export function CompletionCelebration({ open, onClose }: CompletionCelebrationProps) {
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    if (open) {
      setBurstKey((current) => current + 1);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Close completion celebration"
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
      />

      <div key={burstKey} className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI_PIECES.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece absolute top-[-16px] h-3 w-1.5 rounded-full"
            style={{
              left: piece.left,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate})`,
            }}
          />
        ))}
      </div>

      <section className="relative w-full max-w-sm rounded-[26px] border border-[#8be184]/25 bg-[#0d1722]/95 p-5 text-center shadow-[0_26px_90px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-[#8be184]/70" />
        <p className="text-2xl font-semibold tracking-tight text-white">MashaAllah!</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          You completed your day with discipline. Keep going.
        </p>
        <div className="mt-4 rounded-2xl border border-[#f5c86b]/20 bg-[#f5c86b]/8 px-4 py-3">
          <p className="text-sm leading-relaxed text-zinc-100">
            “The most beloved deeds to Allah are those done regularly, even if little.”
          </p>
          <p className="mt-2 text-xs font-medium text-[#f5c86b]">Sahih al-Bukhari 6464</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full rounded-2xl bg-[#58ad42] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        >
          Alhamdulillah
        </button>
      </section>

      <style jsx>{`
        .confetti-piece {
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.16, 0.7, 0.34, 1);
          animation-fill-mode: both;
        }

        @keyframes confetti-fall {
          0% {
            opacity: 0;
            translate: 0 -20px;
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            translate: calc((var(--drift, 1) * 18px)) 105vh;
            rotate: 540deg;
          }
        }
      `}</style>
    </div>
  );
}
