import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, ToolNode, Beam, COLORS } from '../three/Prims';
import { Html } from '@react-three/drei';

const C = CHAPTERS[1];

const BEATS: Beat[] = [
  { caption: 'The agent doesn\'t answer in one shot. It thinks → tries → looks.', readingMs: 3200,
    llmNote: 'Each loop has three parts: a Thought (what to do next), an Action (use a tool), an Observation (what came back).' },
  { caption: 'Thought: "I should check real flight prices first."', readingMs: 3000,
    llmNote: 'The model writes a short note explaining its plan, before acting.' },
  { caption: 'Action: it calls the Flights tool with the right city and date.', readingMs: 3000,
    llmNote: 'The model picks a tool and fills in the inputs. That goes off to a real API.' },
  { caption: 'Observation: $295 on Iberia, 7h flight. Now we know.', readingMs: 3000,
    llmNote: 'The tool\'s reply is handed back to the model so it can read the facts.' },
  { caption: 'New thought: "Got the flight. Hotels next." And the loop starts again.', readingMs: 3400,
    llmNote: 'The model keeps looping until it has enough to give a final answer.' }
];

const STEPS = [
  { thought: '…',                                       action: '',                          obs: '',                              tool: '' },
  { thought: 'I should check real flight prices first.', action: '',                          obs: '',                              tool: '' },
  { thought: 'I should check real flight prices first.', action: 'flight_search(JFK→LIS, Fri)', obs: '',                              tool: 'flights' },
  { thought: 'I should check real flight prices first.', action: 'flight_search(JFK→LIS, Fri)', obs: '3 flights. Cheapest: Iberia $295.', tool: 'flights' },
  { thought: 'Got the flight. Hotels next.',            action: 'hotel_search(Lisbon, ≤$70)', obs: 'Hostel Alfama $38/night.',      tool: 'hotels' }
];

function ReactScene({ step }: { step: number }) {
  const agentPos: [number, number, number] = [0, 1, 0];
  const flights: [number, number, number] = [-3.5, -2.0, 0];
  const hotels:  [number, number, number] = [ 0,   -3.0, 0];
  const weather: [number, number, number] = [ 3.5, -2.0, 0];
  const cur = STEPS[Math.min(step, STEPS.length - 1)];

  const fired = cur.tool;
  const obsBack = !!cur.obs;

  return (
    <>
      <Brain position={agentPos} color={COLORS.agent} size={1.0} label="Agent" />
      <ToolNode position={flights} color={COLORS.tool} label="Flights" active={fired === 'flights'} />
      <ToolNode position={hotels}  color={COLORS.tool} label="Hotels"  active={fired === 'hotels'} />
      <ToolNode position={weather} color={COLORS.rag}  label="Weather" active={false} />

      {fired === 'flights' && <Beam from={agentPos} to={flights} color={COLORS.tool} />}
      {fired === 'hotels'  && <Beam from={agentPos} to={hotels}  color={COLORS.tool} />}
      {obsBack && fired === 'flights' && <Beam from={flights} to={agentPos} color={COLORS.rag} thick={1.6} />}
      {obsBack && fired === 'hotels'  && <Beam from={hotels}  to={agentPos} color={COLORS.rag} thick={1.6} />}

      {/* Thought card floating above the brain */}
      <Html position={[0, 2.7, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.warn}`, borderRadius: 10,
          padding: '8px 12px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.4, width: 240, textAlign: 'left'
        }}>
          <div style={{ color: COLORS.warn, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>💭 Thought</div>
          {cur.thought}
        </div>
      </Html>

      {cur.action && (
        <Html position={[-4.5, 0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.tool}`, borderRadius: 10,
            padding: '8px 12px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.4, width: 220, fontFamily: 'ui-monospace, Menlo, monospace'
          }}>
            <div style={{ color: COLORS.tool, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'inherit' }}>🛠 Action</div>
            {cur.action}
          </div>
        </Html>
      )}

      {cur.obs && (
        <Html position={[4.5, 0.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,22,35,0.92)', border: `1px solid ${COLORS.rag}`, borderRadius: 10,
            padding: '8px 12px', color: '#fdf6f0', fontSize: 11, lineHeight: 1.4, width: 220
          }}>
            <div style={{ color: COLORS.rag, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>👀 Observation</div>
            {cur.obs}
          </div>
        </Html>
      )}
    </>
  );
}

export default function ReactLoop() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="The agent works the way you do when you investigate something. A small thought, a small action, then look at what you learned. Repeat."
      demo={
        <Scene3D
          height="460px"
          camera={{ position: [0, 1, 12], fov: 50 }}
          hint="Drag to rotate the loop · scroll to zoom"
        >
          <ReactScene step={step} />
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
      outro="Next: if the agent can loop, why would anyone use a fixed pipeline that can't?"
    />
  );
}
