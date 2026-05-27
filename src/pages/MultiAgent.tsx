import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[11];

const ROLES = [
  { e: '🗺️', name: 'Planner',      role: 'splits the work',          bg: 'bg-grape/10', border: 'border-grape-soft/40', text: 'text-grape-soft' },
  { e: '🔎', name: 'Researcher',   role: 'queries flights & hotels', bg: 'bg-sky/10',   border: 'border-sky/40',         text: 'text-sky' },
  { e: '📚', name: 'Local Expert', role: 'reads city guides',         bg: 'bg-mint/10',  border: 'border-mint/40',        text: 'text-mint' },
  { e: '✍️', name: 'Writer',       role: 'drafts the answer',         bg: 'bg-sun/10',   border: 'border-sun/40',         text: 'text-sun' },
  { e: '🧐', name: 'Reviewer',     role: 'double-checks',             bg: 'bg-coral/10', border: 'border-coral/40',       text: 'text-coral' }
];

const BEATS: Beat[] = [
  { caption: 'Instead of one agent doing everything, split the job across roles.', readingMs: 3200,
    llmNote: 'Each "agent" is the same LLM with a different system prompt and a narrower toolset.' },
  { caption: 'Planner cuts the work. Researcher fetches facts. Writer drafts. Reviewer checks.', readingMs: 3200,
    llmNote: 'Specialists can use better prompts for their narrow job — they usually beat one generalist.' },
  { caption: 'But: every message between them is another call. Costs add up fast.', readingMs: 3200,
    llmNote: 'A team of 6 agents talking freely sends many messages back and forth. The cost grows quickly.' },
  { caption: '2–4 specialists ≈ sweet spot. More than that is usually bureaucracy.', readingMs: 3200,
    llmNote: 'Production systems put limits: max iterations, max messages, capped reply length.' }
];

export default function MultiAgent() {
  const [step, setStep] = useState(0);
  const teamSize = step <= 0 ? 1 : Math.min(step + 1, ROLES.length);
  const team = ROLES.slice(0, teamSize);
  const messages = teamSize * (teamSize - 1);
  return (
    <ChapterShell
      chapter={C}
      intro="When a job is big, you can split it across a small team of specialists. But teams cost messages — and messages cost money."
      demo={
        <div className="min-h-[280px]">
          <div className="flex flex-wrap justify-center gap-3 mb-4 min-h-[120px]">
            {team.map((r) => (
              <div key={r.name} className={`rounded-2xl border px-4 py-3 text-center anim-pop-in ${r.bg} ${r.border}`}>
                <div className="text-3xl mb-1">{r.e}</div>
                <div className={`text-sm font-semibold ${r.text}`}>{r.name}</div>
                <div className="text-[11px] text-paper/60 mt-0.5">{r.role}</div>
              </div>
            ))}
          </div>
          {step >= 2 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center text-sm anim-float-in">
              <p className="text-paper/70">Messages exchanged this run: <span className="text-grape-soft font-bold">{messages}</span></p>
              <p className="text-[11px] text-paper/40 mt-1">Each message = another LLM call.</p>
            </div>
          )}
          {step >= 3 && teamSize <= 4 && (
            <p className="mt-3 text-center text-mint text-sm anim-float-in">✓ Sweet spot — solid quality, manageable cost.</p>
          )}
          {step >= 3 && teamSize > 4 && (
            <p className="mt-3 text-center text-coral text-sm anim-float-in">⚠ Too many specialists. Most of the cost is now agents talking to each other.</p>
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
      outro="Next: not every job actually needs an agent. Some need just a function."
    />
  );
}
