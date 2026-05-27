import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowDiagram, FlowNode, FlowArrow, FLOW_COLORS } from '../components/Flow';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[1];

const BEATS: Beat[] = [
  { caption: 'The agent doesn\'t answer in one shot. It thinks → tries → looks.', readingMs: 3200,
    llmNote: 'Each cycle has three parts: a Thought (plan), an Action (use a tool), an Observation (what came back).' },
  { caption: 'Thought: "I should check real flight prices first."', readingMs: 3000,
    llmNote: 'The model writes a short note out loud so its reasoning is auditable.' },
  { caption: 'Action: it calls the Flights tool.', readingMs: 3000,
    llmNote: 'The model fills in the inputs and the orchestrator routes the call to a real API.' },
  { caption: 'Observation: Iberia $295. Now we know.', readingMs: 3000,
    llmNote: 'The tool reply becomes a new message in the conversation. The next thought reads it.' },
  { caption: 'New thought: "Got the flight. Hotels next." The cycle starts again.', readingMs: 3400,
    llmNote: 'The model keeps cycling until its thought says "I have enough — write the answer."' }
];

const W = 720;
const H = 380;

// Three nodes in a triangle, with the agent brain in the middle.
const C_THOUGHT = { x: 170, y: 100 };
const C_ACTION  = { x: 550, y: 100 };
const C_OBSERV  = { x: 360, y: 290 };
const C_BRAIN   = { x: 360, y: 180 };

function nodeStyle(p: { x: number; y: number }, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: `calc(${(p.x / W) * 100}% - ${w / 2}px)`,
    top:  `calc(${(p.y / H) * 100}% - ${h / 2}px)`,
    width: w
  };
}

const STEPS = [
  { thought: '…',                                       action: '',                          obs: '' },
  { thought: '"I should check real flight prices first."', action: '',                          obs: '' },
  { thought: '"I should check real flight prices first."', action: 'flight_search(JFK→LIS, Fri)', obs: '' },
  { thought: '"I should check real flight prices first."', action: 'flight_search(JFK→LIS, Fri)', obs: 'Iberia · $295 · 7h' },
  { thought: '"Got the flight. Hotels next."',            action: 'hotel_search(Lisbon, ≤$70)', obs: 'Hostel Alfama · $38/nt' }
];

export default function ReactLoop() {
  const [step, setStep] = useState(0);
  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const t = step >= 1;
  const a = step >= 2;
  const o = step >= 3;
  const loopBack = step >= 4;

  return (
    <ChapterShell
      chapter={C}
      intro="The agent investigates the way you would. A small thought, a small action, then look at what you learned. Repeat."
      demo={
        <FlowDiagram
          height={H}
          width={W}
          arrows={
            <>
              <FlowArrow from={C_BRAIN}   to={C_THOUGHT} color={FLOW_COLORS.warn} active={t} curve={-0.05} label="1. plan" />
              <FlowArrow from={C_THOUGHT} to={C_ACTION}  color={FLOW_COLORS.tool} active={a} curve={-0.2} label="2. call" />
              <FlowArrow from={C_ACTION}  to={C_OBSERV}  color={FLOW_COLORS.rag}  active={o} curve={0.2}  label="3. result" />
              <FlowArrow from={C_OBSERV}  to={C_BRAIN}   color={FLOW_COLORS.warn} active={loopBack} curve={0} label="↻ next thought" />
            </>
          }
          nodes={
            <>
              <div style={nodeStyle(C_BRAIN, 130, 50)}>
                <FlowNode tone="agent" emoji="🤖" title="Agent (LLM)" size="sm" active={t} />
              </div>
              <div style={nodeStyle(C_THOUGHT, 280, 80)}>
                <FlowNode
                  tone="warn"
                  emoji="💭"
                  title="Thought"
                  size="sm"
                  sub={cur.thought}
                  dim={!t}
                  active={t && !a}
                />
              </div>
              <div style={nodeStyle(C_ACTION, 260, 80)}>
                <FlowNode
                  tone="tool"
                  emoji="🛠"
                  title="Action"
                  size="sm"
                  sub={<code className="text-[11px]">{cur.action || '…'}</code>}
                  dim={!a}
                  active={a && !o}
                />
              </div>
              <div style={nodeStyle(C_OBSERV, 280, 80)}>
                <FlowNode
                  tone="rag"
                  emoji="👀"
                  title="Observation"
                  size="sm"
                  sub={cur.obs || '…'}
                  dim={!o}
                  active={o && !loopBack}
                />
              </div>
            </>
          }
        />
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
      outro="Next: if the agent can loop, why does anyone still use a fixed pipeline that can't?"
    />
  );
}
