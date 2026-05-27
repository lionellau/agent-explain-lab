import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[2];

const BEATS: Beat[] = [
  { caption: 'Some helpers follow rails: step 1, step 2, step 3. Always.', readingMs: 3200,
    llmNote: 'A workflow is a fixed recipe written by an engineer ahead of time.' },
  { caption: 'Others act like drones: same goal, but can fly around problems.', readingMs: 3200,
    llmNote: 'An agent picks its next step at runtime, based on what it just saw.' },
  { caption: 'Everything works → the train is faster and cheaper. Workflow wins.', readingMs: 3200,
    llmNote: 'When the path never changes, you don\'t need an LLM deciding every step.' },
  { caption: 'Hotel API is down → the train stops. The drone reroutes.', readingMs: 3400,
    llmNote: 'Agents handle "I didn\'t expect this" gracefully. Workflows have to be fixed in code.' },
  { caption: 'Use workflows for the boring, repeatable bits. Use agents for surprises.', readingMs: 3400,
    llmNote: 'In production most teams use both: a fixed outer recipe with an agent inside specific decision points.' }
];

export default function WorkflowVsAgent() {
  const [step, setStep] = useState(0);
  const broken = step >= 3;
  const trainPos = broken ? '60%' : (step >= 2 ? '95%' : '5%');
  const dronePos = (step >= 2 || broken) ? '95%' : '5%';

  return (
    <ChapterShell
      chapter={C}
      intro="Two ways to build a helper: lay down rails for it, or let it fly. Both work — for different problems."
      demo={
        <div className="space-y-6 min-h-[260px]">
          {/* Workflow rail */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-paper/40 mb-2">🛤️ Workflow (train on rails)</p>
            <div className="relative h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-sky/30" />
              {['Flights','Hotels','Confirm'].map((label, i) => (
                <div key={label} className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded-md ${broken && i === 1 ? 'bg-coral/30 text-coral' : 'bg-white/10 text-paper/70'}`} style={{ left: `${10 + i * 40}%` }}>
                  {broken && i === 1 ? '✗ down' : label}
                </div>
              ))}
              <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-[1400ms] ease-in-out" style={{ left: trainPos }}>
                <span className="text-2xl">🚂</span>
              </div>
              {broken && <div className="absolute top-1 right-2 text-[10px] text-coral font-semibold animate-pulse">derailed</div>}
            </div>
          </div>
          {/* Agent path */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-grape-soft mb-2">🚁 Agent (drone reroutes)</p>
            <div className="relative h-16 rounded-xl bg-grape/10 border border-grape-soft/30 overflow-hidden">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-grape-soft/30 border-dashed" />
              {(broken ? ['Flights','Hostel↗','Activities','Confirm'] : ['Flights','Hotels','Activities','Confirm']).map((label, i, arr) => (
                <div key={i} className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-paper/70`} style={{ left: `${8 + i * (84 / (arr.length - 1))}%` }}>
                  {label}
                </div>
              ))}
              <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-[1400ms] ease-in-out" style={{ left: dronePos }}>
                <span className="text-2xl">🚁</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className={`rounded-lg p-3 border ${broken ? 'border-coral/30 bg-coral/10 text-coral' : 'border-sky/30 bg-sky/10 text-sky'}`}>
              <b>Workflow:</b> {broken ? 'FAILED at "Hotels" step (no plan B coded)' : '✓ Cheap and fast in normal weather'}
            </div>
            <div className="rounded-lg p-3 border border-grape-soft/30 bg-grape/10 text-grape-soft">
              <b>Agent:</b> {broken ? '✓ Saw the error, swapped to "Hostel" API, finished' : '✓ Also finished, used a few extra tokens deciding'}
            </div>
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
      outro="Next: before the agent acts at all, can it break a fuzzy request into clean small steps?"
    />
  );
}
