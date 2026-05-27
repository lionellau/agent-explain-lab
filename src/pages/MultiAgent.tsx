import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowDiagram, FlowNode, FlowArrow, FLOW_COLORS } from '../components/Flow';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[11];

type Tone = 'agent' | 'tool' | 'rag' | 'warn' | 'bad' | 'memory';
const ROLES: { name: string; emoji: string; tone: Tone; sub: string }[] = [
  { name: 'Planner',      emoji: '🗺',  tone: 'agent',  sub: 'splits the work' },
  { name: 'Researcher',   emoji: '🔎',  tone: 'tool',   sub: 'queries APIs' },
  { name: 'Local Expert', emoji: '📚',  tone: 'rag',    sub: 'reads guides' },
  { name: 'Writer',       emoji: '✍',  tone: 'warn',   sub: 'drafts answer' },
  { name: 'Reviewer',     emoji: '🧐',  tone: 'bad',    sub: 'double-checks' },
  { name: 'Booker',       emoji: '🎫',  tone: 'memory', sub: 'finalizes' }
];

const BEATS: Beat[] = [
  { caption: 'Instead of one agent doing everything, split the job across roles.', readingMs: 3000,
    llmNote: 'Each "agent" is the same LLM with a different system prompt and a narrower toolset.' },
  { caption: 'Planner → Researcher → Writer → Reviewer. A small team of 3–4 is usually best.', readingMs: 3200,
    llmNote: 'Specialists can use tighter prompts than generalists. Quality goes up.' },
  { caption: 'But: every line between them is another LLM call. Cost grows fast.', readingMs: 3200,
    llmNote: 'Fully-connected teams have n×(n-1)/2 message channels. 4 agents = 6 links. 6 agents = 15.' },
  { caption: '2–4 specialists ≈ sweet spot. Past that, you\'re paying for chatter.', readingMs: 3200,
    llmNote: 'Production teams cap iterations, message sizes, and how many agents can see each other.' }
];

const W = 720;
const H = 380;
const CX = W / 2;
const CY = H / 2;
const R = 140;

function nodeStyle(p: { x: number; y: number }, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: `calc(${(p.x / W) * 100}% - ${w / 2}px)`,
    top:  `calc(${(p.y / H) * 100}% - ${h / 2}px)`,
    width: w
  };
}

const COLOR_BY_TONE: Record<Tone, string> = {
  agent:  FLOW_COLORS.agent,
  tool:   FLOW_COLORS.tool,
  rag:    FLOW_COLORS.rag,
  warn:   FLOW_COLORS.warn,
  bad:    FLOW_COLORS.bad,
  memory: FLOW_COLORS.memory
};

export default function MultiAgent() {
  const [step, setStep] = useState(0);
  const teamSize = step <= 0 ? 1 : Math.min(step + 2, ROLES.length); // 1, 3, 4, 5, 6
  const team = ROLES.slice(0, teamSize);
  const positions = team.map((_, i) => {
    const a = (i / team.length) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R };
  });
  const messages = teamSize <= 1 ? 0 : (teamSize * (teamSize - 1)) / 2;

  return (
    <ChapterShell
      chapter={C}
      intro="When a job is big, split it across a small team of specialists. But teams cost messages — and messages cost money."
      demo={
        <>
          <FlowDiagram
            height={H}
            width={W}
            arrows={
              <>
                {positions.map((from, i) =>
                  positions.slice(i + 1).map((to, j) => (
                    <FlowArrow
                      key={`m-${i}-${j}`}
                      from={from}
                      to={to}
                      color={FLOW_COLORS.agent}
                      curve={0}
                      thickness={1}
                      dashed
                      active
                    />
                  ))
                )}
              </>
            }
            nodes={
              <>
                {team.map((r, i) => (
                  <div key={r.name} style={nodeStyle(positions[i], 130, 56)}>
                    <FlowNode tone={r.tone} emoji={r.emoji} title={r.name} sub={r.sub} size="sm" />
                  </div>
                ))}
                {teamSize === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-paper/40 text-sm italic">one generalist agent — no team yet</div>
                  </div>
                )}
              </>
            }
          />
          <div className="grid grid-cols-3 gap-3 mt-3 text-center text-sm">
            <div className="rounded-lg bg-white/5 border border-white/10 p-2">
              <div className="text-[10px] uppercase tracking-widest text-paper/40">Specialists</div>
              <div className="text-grape-soft font-bold text-lg">{teamSize}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2">
              <div className="text-[10px] uppercase tracking-widest text-paper/40">Message channels</div>
              <div className="text-sun font-bold text-lg">{messages}</div>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2">
              <div className="text-[10px] uppercase tracking-widest text-paper/40">Verdict</div>
              <div className={`font-bold text-sm ${teamSize <= 1 ? 'text-paper/60' : teamSize <= 4 ? 'text-mint' : 'text-coral'}`}>
                {teamSize <= 1 ? 'too few' : teamSize <= 4 ? '✓ sweet spot' : '⚠ chatter'}
              </div>
            </div>
          </div>
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
      outro="Next: not every task needs an agent. Sometimes a plain function beats a team."
    />
  );
}
