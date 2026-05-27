import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowDiagram, FlowNode, FlowArrow, FLOW_COLORS } from '../components/Flow';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[0];

const BEATS: Beat[] = [
  { caption: `${STORY.who} asks: "${STORY.ask}"`,
    llmNote: 'The same question is sent to two helpers. Watch what each one does with it.',
    readingMs: 3200 },
  { caption: 'The chatbot answers right away, from memory only.',
    llmNote: 'It writes a fluent reply, but nothing is checked against the real world.',
    readingMs: 3200 },
  { caption: 'The agent pauses — "do I need real info first?"',
    llmNote: 'Before replying, it decides whether to call tools, search, or just answer.',
    readingMs: 3200 },
  { caption: 'It calls real tools — flight prices, hotels, weather.',
    llmNote: 'Each tool is a real API. The results come back as facts the model now reads.',
    readingMs: 3400 },
  { caption: 'Now the reply quotes real numbers, not guesses.',
    llmNote: 'Same model. The difference is access to tools, time to think, and a habit of checking.',
    readingMs: 3400 }
];

// Geometry for the SVG arrow layer + matching node positions.
// viewBox is 1000 × 420 — nodes use percent positions so they line up.
const W = 1000;
const H = 420;
const Q = { x: 70,  y: H / 2 }; // request anchor

// Chatbot lane (top)
const CB_BRAIN = { x: 360, y: 110 };
const CB_REPLY = { x: 760, y: 110 };

// Agent lane (bottom)
const AG_BRAIN = { x: 360, y: H - 110 };
const AG_TOOL1 = { x: 600, y: H - 60 };
const AG_TOOL2 = { x: 600, y: H - 110 };
const AG_TOOL3 = { x: 600, y: H - 160 };
const AG_REPLY = { x: 830, y: H - 110 };

function nodeStyle(pos: { x: number; y: number }, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: `calc(${(pos.x / W) * 100}% - ${w / 2}px)`,
    top:  `calc(${(pos.y / H) * 100}% - ${h / 2}px)`,
    width: w
  };
}

export default function ChatbotVsAgent() {
  const [step, setStep] = useState(0);
  const chatbotActive = step >= 1;
  const agentThinking = step >= 2;
  const toolsActive   = step >= 3;
  const agentReply    = step >= 4;

  return (
    <ChapterShell
      chapter={C}
      intro="The chatbot answers from what it already remembers. An agent first goes and checks. Watch the same question land on each of them."
      demo={
        <FlowDiagram
          height={H}
          width={W}
          arrows={
            <>
              {/* Lane separator */}
              <line x1="100" y1={H/2} x2="900" y2={H/2} stroke="#ffffff15" strokeDasharray="4 6" />

              {/* Chatbot lane arrows */}
              <FlowArrow from={Q} to={CB_BRAIN} color={FLOW_COLORS.chatbot} active={chatbotActive} curve={-0.05} />
              <FlowArrow from={CB_BRAIN} to={CB_REPLY} color={FLOW_COLORS.chatbot} active={chatbotActive} label="reply" curve={0} />

              {/* Agent lane arrows */}
              <FlowArrow from={Q} to={AG_BRAIN} color={FLOW_COLORS.user} active={agentThinking} curve={0.05} />
              <FlowArrow from={AG_BRAIN} to={AG_TOOL1} color={FLOW_COLORS.tool} active={toolsActive} curve={-0.12} />
              <FlowArrow from={AG_BRAIN} to={AG_TOOL2} color={FLOW_COLORS.tool} active={toolsActive} curve={0} />
              <FlowArrow from={AG_BRAIN} to={AG_TOOL3} color={FLOW_COLORS.tool} active={toolsActive} curve={0.12} />
              <FlowArrow from={AG_TOOL1} to={AG_REPLY} color={FLOW_COLORS.rag} active={agentReply} curve={-0.08} />
              <FlowArrow from={AG_TOOL2} to={AG_REPLY} color={FLOW_COLORS.rag} active={agentReply} curve={0} />
              <FlowArrow from={AG_TOOL3} to={AG_REPLY} color={FLOW_COLORS.rag} active={agentReply} curve={0.08} />
            </>
          }
          nodes={
            <>
              {/* Lane labels */}
              <div className="absolute left-2 top-2 text-[10px] uppercase tracking-widest text-paper/40 font-semibold">🗣 Chatbot path</div>
              <div className="absolute left-2 bottom-2 text-[10px] uppercase tracking-widest text-paper/40 font-semibold">🤖 Agent path</div>

              {/* User question */}
              <div style={nodeStyle(Q, 110, 60)}>
                <FlowNode tone="user" emoji="❓" title="Sam's question" sub="trip to Lisbon, $500" size="sm" />
              </div>

              {/* Chatbot lane */}
              <div style={nodeStyle(CB_BRAIN, 130, 60)}>
                <FlowNode tone="chatbot" emoji="🧠" title="Chatbot" sub="answer from memory" size="sm" dim={!chatbotActive} />
              </div>
              <div style={nodeStyle(CB_REPLY, 220, 70)}>
                <FlowNode tone="chatbot" emoji="💬" title="Generic reply" sub={'"Try Kayak for flights, Hostelworld for stays!"'} size="sm" dim={!chatbotActive} />
              </div>

              {/* Agent lane */}
              <div style={nodeStyle(AG_BRAIN, 140, 60)}>
                <FlowNode tone="agent" emoji="🤖" title="Agent" sub={agentThinking ? '"let me check first…"' : 'thinking'} size="sm" dim={!agentThinking} active={agentThinking && !toolsActive} />
              </div>
              <div style={nodeStyle(AG_TOOL1, 110, 36)}>
                <FlowNode tone="tool" title="✈ Flights API" size="sm" dim={!toolsActive} />
              </div>
              <div style={nodeStyle(AG_TOOL2, 110, 36)}>
                <FlowNode tone="tool" title="🏨 Hotels API" size="sm" dim={!toolsActive} />
              </div>
              <div style={nodeStyle(AG_TOOL3, 110, 36)}>
                <FlowNode tone="rag" title="☁ Weather API" size="sm" dim={!toolsActive} />
              </div>
              <div style={nodeStyle(AG_REPLY, 240, 110)}>
                <FlowNode
                  tone="good"
                  emoji="✅"
                  title="Grounded plan"
                  size="sm"
                  dim={!agentReply}
                  sub={
                    <div className="space-y-0.5">
                      <div>Iberia JFK→LIS · $295</div>
                      <div>Hostel Alfama 2nt · $76</div>
                      <div>Activities · $56</div>
                      <div className="text-mint font-semibold mt-1">Total $427 ✓ under $500</div>
                    </div>
                  }
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
      outro="Next: if an agent can use tools, how does it actually decide which one to call?"
    />
  );
}
