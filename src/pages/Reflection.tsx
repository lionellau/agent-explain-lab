import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[9];

const BEATS: Beat[] = [
  { caption: 'First draft: looks great. Total $535. Wait — Sam said under $500.', readingMs: 3400,
    llmNote: 'Models often write confident, fluent answers that quietly violate a constraint. We have to catch that.' },
  { caption: 'A second voice — the critic — reads the draft against the rules.', readingMs: 3200,
    llmNote: 'The critic can be a checklist of rules, a second LLM with a "find flaws" prompt, or even a human reviewer.' },
  { caption: 'It says: "$535 > $500. Swap the boutique hotel for a hostel."', readingMs: 3200,
    llmNote: 'The critic doesn\'t rewrite the answer. It just flags what\'s wrong and the agent revises.' },
  { caption: 'Final draft: $467. Under budget, all preferences kept. Now you see it.', readingMs: 3200,
    llmNote: 'Each pass costs a bit more. So most teams cap it at 1–3 revisions max.' }
];

export default function Reflection() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="Even a careful agent writes the wrong thing sometimes. Before you see the answer, a second voice gets to push back."
      demo={
        <div className="grid md:grid-cols-3 gap-3 min-h-[260px]">
          <div className={`rounded-xl bg-coral/10 border border-coral/30 p-4 transition-opacity ${step >= 0 ? '' : 'opacity-30'}`}>
            <p className="text-[11px] uppercase tracking-widest text-coral mb-2">📝 First draft</p>
            <ul className="text-sm space-y-1 text-paper/90">
              <li>Iberia flight — $295</li>
              <li>Bairro Boutique ×3 — $216</li>
              <li>Tram + Belém — $24</li>
              <li className="text-coral font-semibold mt-2">Total: $535 ✗</li>
            </ul>
          </div>
          <div className={`rounded-xl bg-sun/10 border border-sun/30 p-4 transition-opacity ${step >= 1 ? '' : 'opacity-30'}`}>
            <p className="text-[11px] uppercase tracking-widest text-sun mb-2">🪞 Critic</p>
            <p className="text-sm text-paper/90">"You said $500 max. This is $535. Try the hostel option."</p>
            {step >= 2 && <p className="mt-2 text-[12px] text-sun italic">Mismatch flagged. Sending back for revision.</p>}
          </div>
          <div className={`rounded-xl bg-mint/10 border border-mint/30 p-4 transition-opacity ${step >= 3 ? '' : 'opacity-30'}`}>
            <p className="text-[11px] uppercase tracking-widest text-mint mb-2">✅ Revised draft</p>
            <ul className="text-sm space-y-1 text-paper/90">
              <li>Iberia flight — $295</li>
              <li>Hostel Alfama ×3 — $114</li>
              <li>Tram + Belém + lunches — $58</li>
              <li className="text-mint font-semibold mt-2">Total: $467 ✓</li>
            </ul>
          </div>
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
      outro="Next: imagine the browser crashes mid-plan. Does the agent start over, or pick up where it stopped?"
    />
  );
}
