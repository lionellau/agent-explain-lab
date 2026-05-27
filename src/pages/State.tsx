import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[10];

const STEPS_LIST = [
  '① Confirmed dates and budget',
  '② Searched flights',
  '③ Picked Iberia $295',
  '④ Searched hotels',
  '⑤ Picked Hostel Alfama',
  '⑥ Drafted day-by-day',
  '⑦ Wrote final plan'
];

const BEATS: Beat[] = [
  { caption: 'Halfway through Sam\'s trip plan, the browser crashes.', readingMs: 3000,
    llmNote: 'In real life: network drops, tabs close, servers restart. Agents have to survive that.' },
  { caption: 'Without checkpoints: the agent restarts from step 1.', readingMs: 3000,
    llmNote: 'Every tool call has to run again. Money and tokens wasted, user kept waiting.' },
  { caption: 'With checkpoints: each completed step was saved to a tiny file.', readingMs: 3200,
    llmNote: 'The "state" — the plan + recent results + draft — is written to storage after each step.' },
  { caption: 'After the crash, the agent reads the file and resumes at step 5.', readingMs: 3200,
    llmNote: 'This is the difference between a demo and a production system. Recoverable beats fragile.' }
];

export default function StateChapter() {
  const [step, setStep] = useState(0);
  const completed = 4; // 4 steps had finished before crash
  const checkpointOn = step >= 2;
  return (
    <ChapterShell
      chapter={C}
      intro="Sometimes things crash. A real agent has to recover gracefully — not redo every tool call from scratch."
      demo={
        <div className="min-h-[300px]">
          <ol className="space-y-1.5 mb-4 max-w-xl mx-auto">
            {STEPS_LIST.map((s, i) => {
              const done = i < completed;
              const isCheckpoint = checkpointOn && done;
              return (
                <li
                  key={s}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 border text-sm transition-all ${
                    done ? 'bg-mint/10 border-mint/30 text-paper' : 'bg-white/5 border-white/10 text-paper/40'
                  }`}
                >
                  <span className="font-mono text-xs">{s}</span>
                  {isCheckpoint && <span className="ml-auto text-mint text-xs">💾 saved</span>}
                  {!done && i === completed && step >= 1 && <span className="ml-auto text-coral text-xs animate-pulse">⚡ crash here</span>}
                </li>
              );
            })}
          </ol>
          {step >= 1 && (
            <div className="grid md:grid-cols-2 gap-3 anim-float-in">
              <div className={`rounded-xl p-4 border text-sm ${!checkpointOn ? 'bg-coral/10 border-coral/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <p className={`text-[11px] uppercase tracking-widest mb-2 ${!checkpointOn ? 'text-coral' : 'text-paper/40'}`}>Without checkpoints</p>
                <p className="text-paper/90">Replays steps 1–4 from scratch. ~4 extra tool calls, 20s extra wait, costs you money for nothing.</p>
              </div>
              <div className={`rounded-xl p-4 border text-sm ${checkpointOn ? 'bg-mint/10 border-mint/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                <p className={`text-[11px] uppercase tracking-widest mb-2 ${checkpointOn ? 'text-mint' : 'text-paper/40'}`}>With checkpoints</p>
                <p className="text-paper/90">Loads last save, continues from step 5. The user never notices anything happened.</p>
              </div>
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
      outro="Next: instead of one agent doing everything, what if we split the job across a small team?"
    />
  );
}
