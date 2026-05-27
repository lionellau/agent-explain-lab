import { useMemo, useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, Orb, Beam, COLORS } from '../three/Prims';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const C = CHAPTERS[5];

const BEATS: Beat[] = [
  { caption: 'Sam asks: "What if my Lisbon flight is cancelled? Do I get a refund?"', readingMs: 3400,
    llmNote: 'The answer is somewhere in a 40-page insurance PDF that the model was never trained on.' },
  { caption: 'Step 1 (offline): chop the PDF into bite-size chunks.', readingMs: 3000,
    llmNote: 'Each tile in the cloud is one chunk. Real systems have thousands.' },
  { caption: 'Step 2 (offline): turn each chunk into a "meaning fingerprint".', readingMs: 3200,
    llmNote: 'Chunks about the same topic land near each other in 3D space. (Real models use hundreds of dimensions.)' },
  { caption: 'Step 3 (live): Sam\'s question becomes a fingerprint too. Watch the gold orb fly in.', readingMs: 3400,
    llmNote: 'The system finds the chunks closest to the query in meaning-space — its "nearest neighbors".' },
  { caption: 'Step 4: hand those chunks to the LLM. Now it can quote the manual.', readingMs: 3400,
    llmNote: 'The model only sees the question + the matched chunks. It does not memorize your docs — it reads them fresh each time.' }
];

const CHUNKS = [
  { id: 'A', text: 'Cancellation 24h before departure: full refund minus $30 fee.',  good: true,  pos: [1.6, 0.7, 0.5] },
  { id: 'B', text: 'Baggage policy: 1 carry-on under 8kg.',                          good: false, pos: [-2.0, 1.8, -1.5] },
  { id: 'C', text: 'Schedule changes >3h: refund or rebook for free.',              good: true,  pos: [1.2, -0.4, 1.2] },
  { id: 'D', text: 'Loyalty program rules: 2 points per dollar.',                   good: false, pos: [-2.5, -1.4, 0.6] },
  { id: 'E', text: 'Force majeure clause: full refund within 14 business days.',    good: true,  pos: [0.8, 1.6, -0.4] },
  { id: 'F', text: 'Pet travel: cabin pets ≤7kg.',                                  good: false, pos: [-1.6, -2.0, -1.0] },
  { id: 'G', text: 'Hotel cancellation differs from flight.',                       good: false, pos: [-0.5, 2.3, 1.4] },
  { id: 'H', text: 'Insurance claim form must be filed within 30 days.',            good: true,  pos: [1.9, -1.2, -0.8] },
  { id: 'I', text: 'Lost luggage compensation up to $1500.',                        good: false, pos: [-1.0, 0.4, 2.0] },
  { id: 'J', text: 'Refund requests: contact via app or call center.',              good: true,  pos: [2.4, 0.2, -0.2] }
] as const;

function VectorCloud({ step }: { step: number }) {
  const group = useRef<Group>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.08; });

  const queryPos: [number, number, number] = [4, -2.5, 2];
  const llmPos:   [number, number, number] = [4.5, 2.8, 0];

  // Step pacing inside the 3D scene:
  //  step 0 — chunks barely visible (intro), pretend they're still a PDF blob
  //  step 1 — chunks pop into place (split done)
  //  step 2 — chunks color by topic group (good chunks green, others gray) = embedded
  //  step 3 — query orb appears, beams to the GOOD chunks
  //  step 4 — beams from those chunks to LLM brain

  const showChunks   = step >= 1;
  const colorByMeaning = step >= 2;
  const showQuery    = step >= 3;
  const showHandoff  = step >= 4;

  return (
    <>
      <Brain position={llmPos} color={COLORS.agent} size={0.75} label="LLM" />
      {showQuery && <Orb position={queryPos} color={COLORS.user} label="question" />}

      <group ref={group}>
        {CHUNKS.map((c, i) => {
          const baseColor = colorByMeaning ? (c.good ? COLORS.rag : COLORS.chatbot) : '#fdf6f0';
          const activeColor = showQuery && c.good ? COLORS.warn : baseColor;
          const size = step === 0 ? 0.001 : (showQuery && c.good) ? 0.28 : 0.18;
          return (
            <group key={c.id} position={c.pos as [number, number, number]}>
              <mesh>
                <icosahedronGeometry args={[size, 0]} />
                <meshStandardMaterial
                  color={activeColor}
                  emissive={activeColor}
                  emissiveIntensity={showQuery && c.good ? 1.0 : 0.45}
                  roughness={0.35}
                  metalness={0.5}
                  transparent
                  opacity={showChunks ? 1 : 0.001}
                />
              </mesh>
              {showChunks && (
                <Html position={[0, 0.45, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
                  <div style={{
                    color: (showQuery && c.good) ? COLORS.warn : '#fdf6f0aa',
                    fontSize: 10, fontWeight: (showQuery && c.good) ? 700 : 500,
                    textShadow: '0 0 6px #0f0f1e', whiteSpace: 'nowrap'
                  }}>{c.id}</div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* Query → good chunks (cloud rotates so beams stretch nicely from outside) */}
      {showQuery && CHUNKS.filter((c) => c.good).map((c) => (
        <Beam key={'q-' + c.id} from={queryPos} to={c.pos as [number, number, number]} color={COLORS.warn} thick={1.2} />
      ))}
      {showHandoff && CHUNKS.filter((c) => c.good).map((c) => (
        <Beam key={'l-' + c.id} from={c.pos as [number, number, number]} to={llmPos} color={COLORS.rag} thick={1.4} />
      ))}
    </>
  );
}

export default function RAG() {
  const [step, setStep] = useState(0);
  const matched = useMemo(() => CHUNKS.filter((c) => c.good), []);
  return (
    <ChapterShell
      chapter={C}
      intro="The model doesn't know your private documents. RAG (retrieval-augmented generation) is the way to give it just the right page, just in time."
      demo={
        <Scene3D
          height="480px"
          camera={{ position: [-1, 1, 10], fov: 55 }}
          orbit
          hint="Spin the meaning cloud · the gold orb is Sam's question"
        >
          <VectorCloud step={step} />
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
      extras={
        step >= 4 ? (
          <div className="rounded-xl bg-grape/10 border border-grape-soft/30 p-4 text-sm">
            <p className="text-grape-soft text-[11px] uppercase tracking-widest mb-2">Final answer (grounded in chunks {matched.map((c) => c.id).join(', ')})</p>
            <p className="text-paper">"Yes — if your flight is cancelled less than 24h before departure, you get a full refund minus a $30 fee. Bigger schedule changes give a free rebook or full refund."</p>
          </div>
        ) : null
      }
      outro="Next: there's more than one way to search those chunks. Words versus meaning — both miss things."
    />
  );
}
