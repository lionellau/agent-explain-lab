import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[3];

const SUBTASKS = [
  'Confirm dates and budget',
  'Search flights JFK ↔ LIS',
  'Search hotels under $70/night',
  'Pick 2–3 activities',
  'Check the weather for the dates',
  'Add it all up — under $500?',
  'Write a day-by-day plan'
];

const BEATS: Beat[] = [
  { caption: `The request "${STORY.ask}" hides a dozen little tasks.`, readingMs: 3400,
    llmNote: 'Big requests sound like one job. They are usually many small jobs in disguise.' },
  { caption: 'The agent\'s first move is not to answer — it\'s to make a list.', readingMs: 3000,
    llmNote: 'It asks the LLM: "before doing anything, break this into clear, small steps."' },
  { caption: 'Now it has a checklist it can work through one at a time.', readingMs: 3000,
    llmNote: 'Each item is small enough that one tool call or one short LLM call can finish it.' },
  { caption: 'Easier to verify. Easier to retry just one piece if something breaks.', readingMs: 3200,
    llmNote: 'The same plan also becomes the audit trail. You can see exactly what the agent did.' }
];

export default function Planning() {
  const [step, setStep] = useState(0);
  const shown = step === 0 ? 0 : step === 1 ? 0 : step === 2 ? SUBTASKS.length : SUBTASKS.length;

  return (
    <ChapterShell
      chapter={C}
      intro="Watch one fuzzy sentence get cut into a tidy to-do list before the agent does anything else."
      demo={
        <div className="min-h-[260px]">
          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">Sam asks</span>
            <span className="text-paper/80 italic">"{STORY.ask}"</span>
          </div>
          <div className="flex items-center justify-center mb-4 text-paper/40 text-sm">
            <span className={`transition-all ${step >= 1 ? 'text-grape-soft scale-110' : ''}`}>↓ planner LLM breaks it down ↓</span>
          </div>
          <ol className="space-y-2 max-w-xl mx-auto">
            {SUBTASKS.map((t, i) => (
              <li
                key={t}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-all ${
                  i < shown ? 'bg-mint/10 border-mint/30 text-paper anim-float-in' : 'bg-white/5 border-white/10 text-paper/30'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={`font-mono text-xs w-5 h-5 rounded-full flex items-center justify-center ${i < shown ? 'bg-mint/30 text-mint' : 'bg-white/10 text-paper/40'}`}>
                  {i + 1}
                </span>
                <span className="text-sm">{t}</span>
                {i < shown && step >= 3 && <span className="ml-auto text-mint text-xs">✓</span>}
              </li>
            ))}
          </ol>
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
      outro="Next: when Sam says 'like last time but cheaper' — how does the agent know what 'last time' was?"
    />
  );
}
