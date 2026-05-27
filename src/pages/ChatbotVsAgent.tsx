import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS, STORY } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, ToolNode, Orb, Beam, COLORS } from '../three/Prims';
import { Html } from '@react-three/drei';

const C = CHAPTERS[0];

const BEATS: Beat[] = [
  { caption: `${STORY.who} asks: "${STORY.ask}"`,
    llmNote: 'The gold orb on the left is the question. Watch where it goes.',
    readingMs: 3200 },
  { caption: 'A chatbot answers right away, from memory only.',
    llmNote: 'Up top: the gray chatbot brain receives the orb and replies straight back. No tools touched.',
    readingMs: 3400 },
  { caption: 'An agent pauses. "Do I need real info first?"',
    llmNote: 'Down below: the purple agent brain glows brighter — it\'s about to reach out instead of reply.',
    readingMs: 3400 },
  { caption: 'It calls real tools: flight prices, hotel availability, weather.',
    llmNote: 'Watch the cyan beams light up between the agent and the three tool cubes.',
    readingMs: 3600 },
  { caption: 'Now the answer is grounded in real numbers, not guesses.',
    llmNote: 'Same model in both cases. The only difference: an agent has tools, takes its time, and bakes the results into its reply.',
    readingMs: 3400 }
];

function ChatbotScene({ step }: { step: number }) {
  const reqStart: [number, number, number] = [-5, 0, 0];
  const chatbotPos: [number, number, number] = [-1, 2.6, 0];
  const agentPos:   [number, number, number] = [-1, -2.4, 0];
  const tools: { pos: [number, number, number]; label: string }[] = [
    { pos: [4, -1.0, 1.5], label: 'Flights' },
    { pos: [5, -2.6, 0],   label: 'Hotels' },
    { pos: [4, -4.0, 1.0], label: 'Weather' }
  ];
  const evidencePos: [number, number, number] = [3.5, -2.6, -1.6];

  return (
    <>
      <Orb position={reqStart} color={COLORS.user} label="user question" />
      <Brain position={chatbotPos} color={COLORS.chatbot} size={0.85} label="Chatbot" dim={step >= 2} spin={0.25} />
      <Brain position={agentPos}   color={COLORS.agent}   size={1.05} label="Agent"   dim={step < 2} spin={0.55} />

      {/* Tools */}
      {tools.map((t, i) => (
        <ToolNode key={t.label} position={t.pos} color={COLORS.tool} label={t.label} active={step >= 3} />
      ))}

      {/* Beams */}
      {step >= 1 && <Beam from={reqStart} to={chatbotPos} color={COLORS.chatbot} active />}
      {step >= 1 && <Beam from={chatbotPos} to={[3, 4, 0]} color={COLORS.chatbot} active thick={1.5} dashed />}
      {step >= 2 && <Beam from={reqStart} to={agentPos} color={COLORS.user} active />}
      {step >= 3 && tools.map((t) => (
        <Beam key={'b-' + t.label} from={agentPos} to={t.pos} color={COLORS.tool} active />
      ))}
      {step >= 4 && tools.map((t) => (
        <Beam key={'r-' + t.label} from={t.pos} to={agentPos} color={COLORS.rag} active thick={1.4} />
      ))}

      {/* Floating answer cards via Html */}
      {step >= 1 && (
        <Html position={[3, 4, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.chatbot}`, borderRadius: 10,
            padding: '8px 12px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.4,
            width: 220, textAlign: 'left'
          }}>
            <div style={{ color: COLORS.chatbot, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Chatbot reply</div>
            "Try Kayak for flights, Hostelworld for stays. Have fun!"
            <div style={{ marginTop: 4, color: '#fdf6f088', fontSize: 10, fontStyle: 'italic' }}>no prices checked</div>
          </div>
        </Html>
      )}
      {step >= 4 && (
        <Html position={evidencePos} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.good}`, borderRadius: 10,
            padding: '8px 12px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.5,
            width: 240, textAlign: 'left'
          }}>
            <div style={{ color: COLORS.good, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Agent's grounded plan</div>
            Iberia $295 · Hostel Alfama $76 · Activities $56
            <div style={{ marginTop: 4, color: COLORS.good, fontWeight: 700 }}>Total $427 ✓ under $500</div>
          </div>
        </Html>
      )}
    </>
  );
}

export default function ChatbotVsAgent() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="A chatbot answers from what it already remembers. An agent first goes and checks. Watch the same question land on each of them."
      demo={
        <Scene3D
          height="460px"
          camera={{ position: [0, 0, 14], fov: 50 }}
          orbit
          hint="Drag to rotate the room · scroll to zoom"
        >
          <ChatbotScene step={step} />
        </Scene3D>
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
      outro="Next: if an agent can use tools, how does it decide which one to pick — and what to do with the result?"
    />
  );
}
