import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowDiagram, FlowNode, FlowArrow, FLOW_COLORS } from '../components/Flow';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[8];

const BEATS: Beat[] = [
  { caption: 'For an agent to do things in the real world, it has to plug into tools.', readingMs: 3000,
    llmNote: 'A "tool" is any API or function the agent can call: flights, hotels, calendar, email.' },
  { caption: 'Without a standard, every tool needs its own custom cable.', readingMs: 3200,
    llmNote: 'Six tools = six hand-written integrations. Each speaks a slightly different language.' },
  { caption: 'MCP is one universal plug that fits them all.', readingMs: 3200,
    llmNote: 'MCP (Model Context Protocol) is "USB for AI tools" — one shared shape any tool can implement.' },
  { caption: 'Real life: things break. Bad parameters, timeouts, permissions.', readingMs: 3200,
    llmNote: 'For risky tools (payments, email send) the orchestrator stops and asks a human first.' }
];

const W = 720;
const H = 400;

const TOOLS = [
  { id: 'flights',  label: '✈ Flights' },
  { id: 'hotels',   label: '🏨 Hotels' },
  { id: 'calendar', label: '📅 Cal' },
  { id: 'weather',  label: '☁ Wx' },
  { id: 'email',    label: '📧 Email' },
  { id: 'maps',     label: '🗺 Maps' }
];

// Left panel: messy direct wiring. Right panel: clean MCP-hub wiring.
const LEFT_AGENT  = { x: 175, y: 60 };
const RIGHT_AGENT = { x: 545, y: 60 };
const RIGHT_HUB   = { x: 545, y: 190 };

// 6 tools spread across each half. Each half is ~340px wide.
const leftToolPos  = (i: number) => ({ x:  35 + i * 56,  y: 330 });
const rightToolPos = (i: number) => ({ x: 405 + i * 56,  y: 330 });

function nodeStyle(p: { x: number; y: number }, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: `calc(${(p.x / W) * 100}% - ${w / 2}px)`,
    top:  `calc(${(p.y / H) * 100}% - ${h / 2}px)`,
    width: w
  };
}

export default function ToolsMCP() {
  const [step, setStep] = useState(0);
  const showLeft  = step >= 1;
  const showRight = step >= 2;
  const failIdx   = step >= 3 ? 4 : -1; // Email tool flagged

  return (
    <ChapterShell
      chapter={C}
      intro="A chatbot can only talk. An agent acts — because somebody wired tools into it. Watch what changes when there's a standard plug."
      demo={
        <FlowDiagram
          height={H}
          width={W}
          arrows={
            <>
              {/* Vertical separator at the middle of the design width */}
              <line x1={W / 2} y1="20" x2={W / 2} y2={H - 20} stroke="#ffffff15" strokeDasharray="4 6" />

              {/* LEFT: direct messy wires — every tool has its own cable, with arcs that overlap */}
              {showLeft && TOOLS.map((_, i) => (
                <FlowArrow
                  key={'L-' + i}
                  from={LEFT_AGENT}
                  to={leftToolPos(i)}
                  color={FLOW_COLORS.tool}
                  curve={(i - 2.5) * 0.05}
                  active
                  thickness={1.5}
                  dashed
                />
              ))}

              {/* RIGHT: agent → hub → each tool */}
              {showRight && (
                <FlowArrow from={RIGHT_AGENT} to={RIGHT_HUB} color={FLOW_COLORS.warn} active thickness={2.5} />
              )}
              {showRight && TOOLS.map((_, i) => {
                const isFail = failIdx === i;
                return (
                  <FlowArrow
                    key={'R-' + i}
                    from={RIGHT_HUB}
                    to={rightToolPos(i)}
                    color={isFail ? FLOW_COLORS.bad : FLOW_COLORS.tool}
                    curve={(i - 2.5) * 0.02}
                    active
                    thickness={1.8}
                  />
                );
              })}
            </>
          }
          nodes={
            <>
              {/* Panel labels */}
              <div className="absolute left-4 top-1 text-[10px] uppercase tracking-widest text-paper/40 font-semibold">Before · spaghetti wiring</div>
              <div className="absolute right-4 top-1 text-[10px] uppercase tracking-widest text-paper/40 font-semibold text-right">After · one MCP adapter</div>

              {/* LEFT side */}
              <div style={nodeStyle(LEFT_AGENT, 110, 50)}>
                <FlowNode tone="agent" emoji="🤖" title="Agent" size="sm" dim={!showLeft} />
              </div>
              {TOOLS.map((t, i) => (
                <div key={'lt-' + t.id} style={nodeStyle(leftToolPos(i), 52, 32)}>
                  <FlowNode tone="tool" title={t.label} size="sm" dim={!showLeft} />
                </div>
              ))}

              {/* RIGHT side */}
              <div style={nodeStyle(RIGHT_AGENT, 110, 50)}>
                <FlowNode tone="agent" emoji="🤖" title="Agent" size="sm" dim={!showRight} />
              </div>
              <div style={nodeStyle(RIGHT_HUB, 140, 50)}>
                <FlowNode tone="warn" emoji="🔌" title="MCP adapter" sub="one shared protocol" size="sm" dim={!showRight} active={showRight && step < 3} />
              </div>
              {TOOLS.map((t, i) => {
                const isFail = failIdx === i;
                return (
                  <div key={'rt-' + t.id} style={nodeStyle(rightToolPos(i), 52, 32)}>
                    <FlowNode tone={isFail ? 'bad' : 'tool'} title={isFail ? '⚠ Email' : t.label} size="sm" dim={!showRight} active={isFail} />
                  </div>
                );
              })}

              {step >= 3 && (
                <div className="absolute right-2 bottom-2 max-w-[280px] rounded-lg bg-coral/15 border border-coral/40 px-3 py-2 anim-float-in">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-coral mb-0.5">⚠ Real failure</div>
                  <div className="text-paper/80 text-xs leading-snug">email.send needs human approval — agent pauses and asks.</div>
                </div>
              )}
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
      outro="Next: even with all the right info, the agent's first draft might break a rule. How does it check itself?"
    />
  );
}
