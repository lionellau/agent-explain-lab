import { useEffect, useRef, useState } from 'react';

export interface Beat {
  caption: string;
  llmNote?: string;
  readingMs?: number;
}

interface Props {
  beats: Beat[];
  defaultReadingMs?: number;
  accent?: string;
  accentBorder?: string;
  accentBg?: string;
  onStep?: (i: number) => void;
  className?: string;
}

/**
 * Calm linear walkthrough. One beat = one bold sentence + optional "in an LLM" note.
 * The Next button is intentionally quiet until a reading delay passes, then glows.
 */
export default function StorySteps({
  beats,
  defaultReadingMs = 3000,
  accent = 'text-grape-soft',
  accentBorder = 'border-grape-soft/40',
  accentBg = 'bg-grape/10',
  onStep,
  className = ''
}: Props) {
  const [step, setStep] = useState(0);
  const [glow, setGlow] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => { onStep?.(step); }, [step, onStep]);

  useEffect(() => {
    setGlow(false);
    const readMs = beats[step]?.readingMs ?? defaultReadingMs;
    const glowTimer = window.setTimeout(() => setGlow(true), readMs);
    let autoTimer: number | undefined;
    if (autoplay) {
      autoTimer = window.setTimeout(() => {
        setStep((s) => (s + 1 < beats.length ? s + 1 : 0));
      }, readMs + 1800);
    }
    timer.current = glowTimer as unknown as number;
    return () => {
      clearTimeout(glowTimer);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [step, autoplay, beats, defaultReadingMs]);

  const beat = beats[step];
  const isLast = step === beats.length - 1;
  const isFirst = step === 0;

  const next = () => setStep((s) => (s + 1 < beats.length ? s + 1 : 0));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <section className={className}>
      <div className={`relative rounded-2xl border ${accentBorder} bg-ink-soft p-4 sm:p-5 mb-3`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border ${accentBorder} text-[11px] uppercase tracking-widest font-bold ${accent} badge-shimmer`}>
            <span>📖</span><span>Explanation</span>
          </span>
          <span className="text-paper/60 text-xs font-mono ml-auto">
            Step {step + 1} of {beats.length}
          </span>
        </div>

        <p key={`cap-${step}`} className={`anim-float-in text-lg sm:text-xl md:text-[22px] leading-snug font-semibold ${accent}`}>
          {beat?.caption}
        </p>
        {beat?.llmNote && (
          <p key={`note-${step}`} className="anim-float-in mt-3 text-sm text-paper/90 leading-relaxed border-l-2 border-white/25 pl-3 hidden sm:block">
            <span className="text-paper/55 uppercase tracking-widest text-[10px] block mb-0.5">↳ In an LLM</span>
            {beat.llmNote}
          </p>
        )}
      </div>

      <div className="flex gap-1.5 mb-3 px-1">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i === step ? 'bg-grape-soft' : i < step ? 'bg-white/40 hover:bg-white/60' : 'bg-white/15 hover:bg-white/30'
            }`}
            aria-label={`Jump to step ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="px-3 sm:px-4 py-2.5 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-paper transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={() => setAutoplay((a) => !a)}
          className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            autoplay ? 'bg-grape-soft/25 text-grape-soft' : 'bg-white/8 hover:bg-white/15 text-paper/80'
          }`}
          aria-label={autoplay ? 'Pause autoplay' : 'Enable autoplay'}
          title={autoplay ? 'Autoplay on — click to pause' : 'Optional autoplay'}
        >
          {autoplay ? '⏸ auto' : '▶ auto'}
        </button>

        <button
          onClick={next}
          className={`ml-auto px-5 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-grape to-grape-soft text-white font-bold text-base transition-all hover:scale-[1.03] ${
            glow ? 'glow-ring' : 'opacity-80'
          }`}
        >
          {isLast ? '↻ Replay' : 'Next step →'}
        </button>
      </div>

      {!glow && (
        <p className="mt-2 text-[11px] text-paper/50 text-right pr-1 italic hidden sm:block">
          Read the explanation above, then advance when ready…
        </p>
      )}
    </section>
  );
}
