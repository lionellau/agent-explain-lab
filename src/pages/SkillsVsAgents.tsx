import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[12];

const TASKS = [
  { id: 't1', label: 'Turn receipt photos into a spreadsheet', best: 'skill',    why: 'Same steps every time. No decisions.' },
  { id: 't2', label: 'Plan a weekend trip under $500',         best: 'agent',    why: 'Lots of choices that depend on each other.' },
  { id: 't3', label: 'Send a weekly progress email',           best: 'workflow', why: 'Sequence known up front. Just run the recipe.' },
  { id: 't4', label: 'Triage 50 incoming support tickets',     best: 'multi',    why: 'Parallel work, each ticket different. Teams help.' },
  { id: 't5', label: 'Translate a menu from Portuguese',       best: 'skill',    why: 'One input, one output, no reasoning needed.' },
  { id: 't6', label: 'Choose travel insurance for this trip',  best: 'agent',    why: 'Needs to weigh tradeoffs against Sam\'s situation.' }
];

const LABELS: Record<string, { name: string; cost: string; text: string }> = {
  skill:    { name: 'Skill',      cost: '~$0',    text: 'text-sky' },
  workflow: { name: 'Workflow',   cost: '~$0.01', text: 'text-mint' },
  agent:    { name: 'Agent',      cost: '~$0.05', text: 'text-grape-soft' },
  multi:    { name: 'Multi-agent',cost: '~$0.30', text: 'text-coral' }
};

const BEATS: Beat[] = [
  { caption: 'Not every helpful thing needs to be an agent.', readingMs: 3000,
    llmNote: 'Agents are flexible but slow and expensive. Use them only where flexibility matters.' },
  { caption: 'If the steps are the same every time → it\'s a skill.', readingMs: 3000,
    llmNote: 'Skill = a function. Same input always gives the same output. No LLM in the loop.' },
  { caption: 'If the steps are fixed but use an LLM in places → it\'s a workflow.', readingMs: 3000,
    llmNote: 'Like a recipe: deterministic ordering with one or two LLM calls inside specific steps.' },
  { caption: 'If you can\'t list the steps in advance → it\'s an agent.', readingMs: 3000,
    llmNote: 'You need an agent when the next move depends on what the last move just discovered.' },
  { caption: 'Click each task on the right — see which kind of helper fits.', readingMs: 3200,
    llmNote: 'Picking the right level keeps things cheap and reliable. Sledgehammer ≠ thumbtack.' }
];

export default function SkillsVsAgents() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(TASKS[1].id);
  const cur = TASKS.find((t) => t.id === picked)!;
  const meta = LABELS[cur.best];

  return (
    <ChapterShell
      chapter={C}
      intro="Agents are powerful, but a screwdriver is not always the right tool. This chapter is the quick test for when you actually need one."
      demo={
        <div className="grid md:grid-cols-2 gap-3 min-h-[280px]">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-paper/40 mb-2">Pick a task</p>
            <ul className="space-y-2">
              {TASKS.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setPicked(t.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm border transition-all ${
                      picked === t.id ? 'bg-grape/15 border-grape-soft/50 text-paper' : 'bg-white/5 border-white/10 text-paper/70 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-ink-soft/60 border border-white/10 p-4">
            <p className="text-[11px] uppercase tracking-widest text-paper/40 mb-2">Best fit</p>
            <div className={`text-3xl font-bold ${meta.text}`}>{meta.name}</div>
            <p className="text-sm text-paper/70 mt-1">Estimated cost per run: <b className="text-paper">{meta.cost}</b></p>
            <p className="text-sm text-paper/85 mt-3 leading-relaxed border-l-2 border-white/20 pl-3">{cur.why}</p>
            {step >= 4 && (
              <p className="mt-4 text-[12px] text-paper/50 italic anim-float-in">
                Rule of thumb: if a junior could write a 10-line script for it, it's a skill, not an agent.
              </p>
            )}
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
      outro="Next: people sometimes confuse agents with RPA bots. They look similar from the outside — they really aren't."
    />
  );
}
