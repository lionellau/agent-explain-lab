import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowDiagram, FlowNode, FlowArrow, FLOW_COLORS } from '../components/Flow';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[14];

type Tone = 'agent' | 'memory' | 'rag' | 'tool' | 'warn' | 'bad' | 'good';
const STAGES: { name: string; emoji: string; tone: Tone; note: string }[] = [
  { name: 'Plan',    emoji: '🗺',  tone: 'agent',  note: '7 small tasks' },
  { name: 'Memory',  emoji: '🧠',  tone: 'memory', note: 'window seat · veg' },
  { name: 'RAG',     emoji: '📚',  tone: 'rag',    note: 'refund policy §4' },
  { name: 'Tools',   emoji: '🔌',  tone: 'tool',   note: 'flights · hotels' },
  { name: 'Loop',    emoji: '🔁',  tone: 'warn',   note: '2 think-act passes' },
  { name: 'Reflect', emoji: '🪞',  tone: 'bad',    note: 'fixed $35 overshoot' },
  { name: 'Write',   emoji: '✍',  tone: 'good',   note: 'final plan' }
];

const BEATS: Beat[] = [
  { caption: `Sam: "${STORY.ask}"`, readingMs: 3000,
    llmNote: 'Same question as Chapter 1. This time, watch every piece work together.' },
  { caption: 'The planner makes a list of 7 small tasks.', readingMs: 2600 },
  { caption: 'Memory recalls Sam\'s preferences from past trips.', readingMs: 2600 },
  { caption: 'RAG pulls the right paragraph from the insurance policy.', readingMs: 2600 },
  { caption: 'Tools fetch real prices: flights, hotels, weather.', readingMs: 2600 },
  { caption: 'The think-act loop refines the choices over two passes.', readingMs: 2600 },
  { caption: 'A critic catches a $35 overshoot and fixes it.', readingMs: 2600 },
  { caption: 'A grounded plan comes out the other side. That\'s the whole machine.', readingMs: 3400,
    llmNote: 'You now have a complete mental model: LLM + memory + retrieval + tools + critic, controlled by a loop.' }
];

const W = 1000;
const H = 200;
const PADX = 60;
const STAGE_Y = H / 2;

function stagePos(i: number) {
  const span = W - PADX * 2;
  const x = PADX + (i / (STAGES.length - 1)) * span;
  return { x, y: STAGE_Y };
}

const COLOR_BY_TONE: Record<Tone, string> = {
  agent:  FLOW_COLORS.agent,
  memory: FLOW_COLORS.memory,
  rag:    FLOW_COLORS.rag,
  tool:   FLOW_COLORS.tool,
  warn:   FLOW_COLORS.warn,
  bad:    FLOW_COLORS.bad,
  good:   FLOW_COLORS.good
};

function nodeStyle(p: { x: number; y: number }, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: `calc(${(p.x / W) * 100}% - ${w / 2}px)`,
    top:  `calc(${(p.y / H) * 100}% - ${h / 2}px)`,
    width: w
  };
}

export default function Capstone() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="Every piece of the lab, end-to-end. Watch the stages light up as the story moves through them."
      demo={
        <>
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs shrink-0">Sam</span>
            <span className="text-paper/80 italic truncate">"{STORY.ask}"</span>
          </div>
          <FlowDiagram
            height={H}
            width={W}
            arrows={
              <>
                {STAGES.slice(0, -1).map((s, i) => (
                  <FlowArrow
                    key={'pipe-' + i}
                    from={stagePos(i)}
                    to={stagePos(i + 1)}
                    color={COLOR_BY_TONE[STAGES[i + 1].tone]}
                    active={step >= i + 2}
                    curve={0}
                    thickness={2}
                  />
                ))}
              </>
            }
            nodes={
              <>
                {STAGES.map((s, i) => (
                  <div key={s.name} style={nodeStyle(stagePos(i), 110, 70)}>
                    <FlowNode
                      tone={s.tone}
                      emoji={s.emoji}
                      title={s.name}
                      sub={step >= i + 1 ? s.note : ''}
                      size="sm"
                      dim={step < i + 1}
                      active={step === i + 1}
                    />
                  </div>
                ))}
              </>
            }
          />
        </>
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
      extras={
        step >= STAGES.length + 1 ? (
          <div className="rounded-2xl bg-mint/10 border border-mint/40 p-5 anim-float-in">
            <div className="text-mint text-[11px] uppercase tracking-widest mb-2">Final plan</div>
            <ul className="text-sm space-y-1 text-paper">
              <li>✈️ Fri 9pm Iberia JFK→LIS — <b>$295</b> (window seat ✓)</li>
              <li>🏨 Hostel Alfama, 3 nights — <b>$114</b> (vegetarian breakfast ✓)</li>
              <li>🚋 Tram 28 + Belém day pass — <b>$24</b></li>
              <li>🥗 Veg lunches + Bairro Alto café crawl — <b>$34</b></li>
              <li className="mt-2 text-mint font-semibold">Total: $467 ✓ under $500</li>
              <li className="text-[12px] text-paper/60 italic">If flight cancels: full refund (insurance §4.1 — pulled by RAG).</li>
            </ul>
          </div>
        ) : null
      }
      outro="🎉 That's the tour. Bookmark this page, share it with someone curious, and go build something."
    />
  );
}
