import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[6];

const DOCS = [
  { id: 'd1', text: 'Lisbon rainy-day museums',                   sparse: false, dense: true  },
  { id: 'd2', text: '"Rainy weather Lisbon March" travel tip',    sparse: true,  dense: true  },
  { id: 'd3', text: 'Indoor tram 28 walking tour',                sparse: false, dense: true  },
  { id: 'd4', text: 'Cascais beach trip on a sunny day',          sparse: false, dense: false },
  { id: 'd5', text: '"Rainy" packing checklist',                  sparse: true,  dense: false },
  { id: 'd6', text: 'Drizzle-friendly café crawl Bairro Alto',    sparse: false, dense: true  }
];

const BEATS: Beat[] = [
  { caption: 'Sam asks: "rainy day things to do in Lisbon in March".', readingMs: 3200,
    llmNote: 'A single query, two very different ways to search the docs.' },
  { caption: 'Word search (sparse): looks for the literal words you typed.', readingMs: 3200,
    llmNote: 'Classic search engines. Great when you remember exact phrasing. Misses synonyms.' },
  { caption: 'Meaning search (dense): looks for the same idea, even if worded differently.', readingMs: 3200,
    llmNote: 'Uses those "meaning fingerprints" again. "Drizzle" and "rain" land near each other.' },
  { caption: 'Each one finds things the other misses. Together they cover both.', readingMs: 3400,
    llmNote: 'Real systems usually do both at once and merge the results. That\'s called hybrid search.' }
];

export default function DenseVsSparse() {
  const [step, setStep] = useState(0);

  return (
    <ChapterShell
      chapter={C}
      intro="The same question can be searched two different ways. Watch what each one catches — and what it misses."
      demo={
        <div className="min-h-[260px]">
          <div className="mb-4 text-sm">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">Query</span>{' '}
            <span className="text-paper/80 italic">"rainy day things to do in Lisbon, March"</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-sky/10 border border-sky/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-sky mb-2">🔤 Word search (sparse)</p>
              {DOCS.map((d) => {
                const hit = step >= 1 && d.sparse;
                return (
                  <div key={d.id} className={`text-[12px] px-2 py-1.5 my-1 rounded border transition-all ${
                    hit ? 'bg-sky/20 border-sky/50 text-paper' :
                    step >= 1 ? 'bg-white/5 border-white/10 text-paper/30' : 'bg-white/5 border-white/10 text-paper/60'
                  }`}>
                    {hit ? '✓ ' : '   '}{d.text}
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl bg-mint/10 border border-mint/30 p-3">
              <p className="text-[11px] uppercase tracking-widest text-mint mb-2">💡 Meaning search (dense)</p>
              {DOCS.map((d) => {
                const hit = step >= 2 && d.dense;
                return (
                  <div key={d.id} className={`text-[12px] px-2 py-1.5 my-1 rounded border transition-all ${
                    hit ? 'bg-mint/20 border-mint/50 text-paper' :
                    step >= 2 ? 'bg-white/5 border-white/10 text-paper/30' : 'bg-white/5 border-white/10 text-paper/60'
                  }`}>
                    {hit ? '✓ ' : '   '}{d.text}
                  </div>
                );
              })}
            </div>
          </div>
          {step >= 3 && (
            <div className="mt-4 rounded-xl bg-grape/10 border border-grape-soft/30 p-3 anim-float-in text-sm">
              <p className="text-grape-soft text-[11px] uppercase tracking-widest mb-1">Hybrid (both at once)</p>
              <p className="text-paper">Catches the "rainy" packing list <i>and</i> the drizzle café crawl. Best of both worlds.</p>
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
      outro="Next: even after we have a shortlist, it's not yet in the right order. Time to sort it carefully."
    />
  );
}
