import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[5];

const BEATS: Beat[] = [
  { caption: 'Sam asks: "What if my Lisbon flight gets cancelled? Do I get a refund?"', readingMs: 3400,
    llmNote: 'The answer is somewhere in a 40-page insurance PDF that the model was never trained on.' },
  { caption: 'Step 1 (offline): chop the PDF into bite-size paragraphs.', readingMs: 3000,
    llmNote: 'We split documents in advance into small chunks — usually a few hundred words each.' },
  { caption: 'Step 2 (offline): turn each chunk into a "meaning fingerprint".', readingMs: 3200,
    llmNote: 'An embedding model maps each chunk to a vector — a list of numbers — so similar meanings end up close to each other.' },
  { caption: 'Step 3 (live): turn Sam\'s question into a fingerprint too, and find the nearest chunks.', readingMs: 3400,
    llmNote: 'This is "semantic search". The system asks: which chunks are closest in meaning to this question?' },
  { caption: 'Step 4: hand those chunks to the model. Now it can quote the manual.', readingMs: 3400,
    llmNote: 'The model only sees the question + the matched chunks. It does not memorize your docs — it reads them fresh each time.' }
];

const DOC_CHUNKS = [
  { id: 'A', text: 'Cancellation 24h before departure: full refund minus $30 fee.', good: true },
  { id: 'B', text: 'Baggage policy: 1 carry-on under 8kg.', good: false },
  { id: 'C', text: 'Schedule changes >3h: refund or rebook for free.', good: true },
  { id: 'D', text: 'Loyalty program rules: 2 points per dollar.', good: false },
  { id: 'E', text: 'Force majeure clause: full refund within 14 business days.', good: true },
  { id: 'F', text: 'Pet travel: cabin pets ≤7kg.', good: false }
];

export default function RAG() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="The model doesn't know your private documents. RAG (retrieval-augmented generation) is the way to give it just the right page, just in time."
      demo={
        <div className="space-y-4 min-h-[300px]">
          <div className="text-sm flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">Sam</span>
            <span className="text-paper/80 italic">"What if my flight is cancelled? Refund rules?"</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {/* PDF */}
            <div className={`rounded-xl bg-white/5 border border-white/10 p-3 transition-all ${step >= 1 ? '' : 'opacity-50'}`}>
              <p className="text-[11px] uppercase tracking-widest text-paper/40 mb-2">📄 1) PDF chopped</p>
              <div className="space-y-1">
                {DOC_CHUNKS.map((c) => (
                  <div key={c.id} className="text-[11px] px-2 py-1 rounded bg-white/10 text-paper/80 font-mono truncate">
                    {c.id}: {c.text.slice(0, 28)}…
                  </div>
                ))}
              </div>
            </div>
            {/* Vector store */}
            <div className={`rounded-xl bg-mint/10 border border-mint/30 p-3 transition-all ${step >= 2 ? '' : 'opacity-50'}`}>
              <p className="text-[11px] uppercase tracking-widest text-mint mb-2">🔢 2) Meaning fingerprints</p>
              <div className="grid grid-cols-3 gap-1.5">
                {DOC_CHUNKS.map((c, i) => (
                  <div
                    key={c.id}
                    className="aspect-square rounded bg-mint/20 border border-mint/40 flex items-center justify-center text-mint text-xs font-mono anim-pop-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {c.id}
                  </div>
                ))}
              </div>
            </div>
            {/* Retrieve */}
            <div className={`rounded-xl bg-sky/10 border border-sky/30 p-3 transition-all ${step >= 3 ? '' : 'opacity-50'}`}>
              <p className="text-[11px] uppercase tracking-widest text-sky mb-2">🎯 3) Nearest matches</p>
              <div className="space-y-1.5">
                {DOC_CHUNKS.map((c) => {
                  const picked = step >= 3 && c.good;
                  return (
                    <div
                      key={c.id}
                      className={`text-[11px] px-2 py-1.5 rounded font-mono transition-all ${
                        picked ? 'bg-sky/30 text-paper border border-sky' : 'bg-white/5 text-paper/30'
                      }`}
                    >
                      {picked ? '✓ ' : '  '}{c.id}: {c.text.slice(0, 26)}…
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {step >= 4 && (
            <div className="rounded-xl bg-grape/10 border border-grape-soft/30 p-4 anim-float-in text-sm">
              <p className="text-grape-soft text-[11px] uppercase tracking-widest mb-2">4) Final answer</p>
              <p className="text-paper">
                "Yes — if your flight is cancelled less than 24h before departure, you get a full refund minus a $30 fee.
                Bigger schedule changes give a free rebook or full refund. (Source: matched chunks A, C.)"
              </p>
            </div>
          )}
        </div>
      }
      story={
        <StorySteps
          beats={BEATS}
          accent={C.accentText}
          accentBorder={C.accentBorder}
          accentBg={C.accentBg}
          onStep={setStep}
        />
      }
      outro="Next: there's more than one way to search those chunks. Words versus meaning — both miss things."
    />
  );
}
