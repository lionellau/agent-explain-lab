import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[4];

const BEATS: Beat[] = [
  { caption: 'Sam says: "Same kind of trip as my Tokyo one, but cheaper."', readingMs: 3200,
    llmNote: 'This sentence only makes sense if the agent already remembers the Tokyo trip.' },
  { caption: 'Short-term memory = the sticky notes on the desk (this chat).', readingMs: 3000,
    llmNote: 'It\'s the current conversation. The model sees it directly, but it disappears when you close the tab.' },
  { caption: 'Long-term memory = the notebook in the drawer (past visits, preferences).', readingMs: 3200,
    llmNote: 'Stored somewhere the agent can look up — like a small database of what it knows about you.' },
  { caption: 'A good agent pulls only the relevant pages, not the whole notebook.', readingMs: 3400,
    llmNote: 'Pulling the wrong page is worse than pulling none. It misleads the model with confidence.' },
  { caption: '"Window seat. Vegetarian. Allergic to seafood." → real plan, no surprises.', readingMs: 3400,
    llmNote: 'Good memory + good filter = the agent feels like it really knows you.' }
];

export default function Memory() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="A real assistant remembers things about you. But it also has to remember the right things, and forget the rest."
      demo={
        <div className="grid md:grid-cols-2 gap-4 min-h-[280px]">
          {/* Short-term */}
          <div className="rounded-xl bg-sun/10 border border-sun/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-sun mb-3">📝 Short-term (this chat)</p>
            <div className="space-y-2 text-sm">
              {['Current request: cheap Lisbon weekend', 'Just checked: 3 flights, $295 cheapest', 'Sam: "leave Friday night, return Sunday"'].map((s, i) => (
                <div key={s} className="rounded-md bg-white/10 border border-white/10 px-3 py-1.5 anim-float-in" style={{ animationDelay: `${i * 100}ms` }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Long-term */}
          <div className="rounded-xl bg-rose/10 border border-rose/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-rose mb-3">📒 Long-term (notebook)</p>
            <div className="space-y-2 text-sm">
              <div className={`rounded-md px-3 py-1.5 border transition-all ${step >= 3 ? 'bg-mint/15 border-mint/40 text-paper' : 'bg-white/5 border-white/10 text-paper/60'}`}>
                <span className={step >= 3 ? 'text-mint' : 'text-paper/50'}>{step >= 3 ? '✓ ' : ''}</span>Tokyo trip — window seat, vegetarian
              </div>
              <div className={`rounded-md px-3 py-1.5 border transition-all ${step >= 3 ? 'bg-mint/15 border-mint/40 text-paper' : 'bg-white/5 border-white/10 text-paper/60'}`}>
                <span className={step >= 3 ? 'text-mint' : 'text-paper/50'}>{step >= 3 ? '✓ ' : ''}</span>Seafood allergy flagged since 2024
              </div>
              <div className={`rounded-md px-3 py-1.5 border transition-all ${step >= 3 ? 'opacity-30 line-through' : 'bg-white/5 border-white/10 text-paper/60'}`}>
                <span className="text-paper/50">{step >= 3 ? '✗ ' : ''}</span>Berlin business trip (different traveler)
              </div>
              <div className={`rounded-md px-3 py-1.5 border transition-all ${step >= 3 ? 'opacity-30 line-through' : 'bg-white/5 border-white/10 text-paper/60'}`}>
                <span className="text-paper/50">{step >= 3 ? '✗ ' : ''}</span>Cancelled Paris trip (irrelevant)
              </div>
              {step >= 3 && <p className="text-[11px] text-mint mt-2 italic">✓ keeps only what matches today's question</p>}
            </div>
          </div>
          {step >= 4 && (
            <div className="md:col-span-2 rounded-xl bg-grape/10 border border-grape-soft/30 p-3 text-center text-grape-soft text-sm anim-float-in">
              Final plan honors window seat + vegetarian + seafood allergy without Sam re-typing any of it.
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
      outro="Next: when the agent needs to read a manual — like a refund policy — how does it find the right paragraph?"
    />
  );
}
