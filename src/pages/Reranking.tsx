import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[7];

// truth = real relevance. fast = rough first-pass score.
const HOTELS = [
  { name: 'Hostel Alfama $38 (veg-OK)',    truth: 0.95, fast: 0.62 },
  { name: 'Bairro Boutique $72 4.6★',     truth: 0.88, fast: 0.81 },
  { name: 'Cascais beach resort $180',    truth: 0.20, fast: 0.78 },
  { name: 'Tokyo capsule pod $40',        truth: 0.05, fast: 0.70 },
  { name: 'Lisbon vegan B&B $48',          truth: 0.92, fast: 0.55 },
  { name: 'LX Hostel near tram 28 $35',    truth: 0.90, fast: 0.45 },
  { name: 'Marriott downtown $220',       truth: 0.30, fast: 0.50 }
];

const BEATS: Beat[] = [
  { caption: 'The fast search hands us 7 hotels — roughly in a good order.', readingMs: 3200,
    llmNote: 'A bi-encoder is a quick first pass. It\'s great at "kind of relevant", not at picking the very best.' },
  { caption: 'Look at the top of the list. Two of these are wrong for Sam.', readingMs: 3200,
    llmNote: 'A "Cascais beach resort" and a "Tokyo capsule pod" should not beat the actual Lisbon hostels.' },
  { caption: 'A slower, smarter judge reads each one against the question.', readingMs: 3200,
    llmNote: 'A cross-encoder looks at (question, candidate) together. Slower per call, but its scores are far better.' },
  { caption: 'The list re-sorts. Now the top 3 actually match what Sam asked for.', readingMs: 3200,
    llmNote: 'You only rerank the top 10–20, not the whole library — it would be way too slow otherwise.' }
];

export default function Reranking() {
  const [step, setStep] = useState(0);
  const before = [...HOTELS].sort((a, b) => b.fast - a.fast);
  const after  = [...HOTELS].sort((a, b) => b.truth - a.truth);
  const list = step >= 2 ? after : before;
  const showRerank = step >= 2;
  const top3 = list.slice(0, 3);
  return (
    <ChapterShell
      chapter={C}
      intro="A fast search throws ten guesses on the table. A slower, careful judge then picks the three that actually answer the question."
      demo={
        <div className="min-h-[260px]">
          <div className="mb-3 text-sm flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">Looking for</span>
            <span className="text-paper/80 italic">"cheap, vegetarian-friendly hotel in Lisbon"</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-sky/10 border border-sky/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-sky mb-2">⚡ Fast search (bi-encoder)</p>
              {before.map((h, i) => (
                <div key={h.name} className={`text-[12px] px-2 py-1.5 my-1 rounded font-mono ${i < 3 ? 'bg-sky/15' : 'bg-white/5'} ${i < 3 && step === 1 && h.truth < 0.5 ? 'border border-coral text-coral' : 'text-paper/85'}`}>
                  <span className="text-paper/40 mr-2">#{i + 1}</span>{h.name}
                </div>
              ))}
            </div>
            <div className={`rounded-xl bg-grape/10 border border-grape-soft/30 p-3 transition-opacity ${showRerank ? '' : 'opacity-40'}`}>
              <p className="text-[11px] uppercase tracking-widest text-grape-soft mb-2">🧠 Careful judge (cross-encoder)</p>
              {after.map((h, i) => (
                <div key={h.name} className={`text-[12px] px-2 py-1.5 my-1 rounded font-mono ${i < 3 ? 'bg-grape-soft/25 text-paper border border-grape-soft/50' : 'bg-white/5 text-paper/70'}`}>
                  <span className="text-paper/40 mr-2">#{i + 1}</span>{h.name}
                </div>
              ))}
            </div>
          </div>
          {step >= 3 && (
            <div className="mt-4 rounded-xl bg-mint/10 border border-mint/30 p-3 text-sm anim-float-in">
              <p className="text-mint">Top 3 after reranking — exactly what Sam asked for:</p>
              <p className="text-paper mt-1">{top3.map((h) => h.name).join(' · ')}</p>
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
      outro="Next: the agent needs to use the outside world — flight APIs, calendars, email. How does it plug in?"
    />
  );
}
