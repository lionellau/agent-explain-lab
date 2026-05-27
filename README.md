# Agent Explain Lab

An interactive 3D teaching lab that shows how **AI agents actually work**, built for non-technical learners.

One running story — *"Plan a 3-day weekend trip to Lisbon under $500"* — threads through 15 modules. Every concept is shown as input → process → output, with on-stage tools, memory, retrieval, critics, and reasoning loops you can toggle live.

## Run it

```bash
npm install
npm run dev
```

Then open the browser at the printed URL (default http://localhost:5174). The dev server reloads on save.

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the production build
```

## Controls

- `→` / `J` — next step
- `←` / `K` — previous step
- `Space` — auto-play
- `R` — reset module
- Click any module in the left sidebar to jump.

The right panel has live **controls** that change the agent's behavior, a real-time **output dashboard** (quality, cost, latency, confidence), and a **what changed** delta that explains the trade-off you just made.

## The 15 modules

| # | Module | What it teaches |
|---|---|---|
| M01 | Chatbot vs Agent | Same question, two minds — one talks, one acts. |
| M02 | ReAct Loop | Thought → Action → Observation → next Thought. |
| M03 | Workflow vs Agent | Trains follow rails. Drones reroute. |
| M04 | Planning | One messy request → a roadmap of small steps. |
| M05 | Memory | Short-term desk vs long-term library, with relevance filter. |
| M06 | RAG Pipeline | Document → chunks → vectors → retrieved context. |
| M07 | Dense vs Sparse | Meaning search vs keyword search vs hybrid. |
| M08 | Reranking | Fast bi-encoder retrieval + careful cross-encoder reorder. |
| M09 | Tool Calling & MCP | One adapter, many tools, with failure handling. |
| M10 | Reflection | Critic catches the over-budget plan and forces a revision. |
| M11 | State & Checkpointing | The browser crashes mid-plan — can the agent resume? |
| M12 | Multi-Agent | Specialists vs bureaucracy. |
| M13 | Skills vs Workflows vs Agents | Pick the smallest tool that works. |
| M14 | Agent vs RPA | What happens when the airline redesigns its form. |
| M15 | Capstone | All controls in one place. Tune. Re-run. Compare. |

## Design principles

- **Animation-first.** Every concept is acted out in 3D — no quizzes, no static diagrams.
- **One color = one meaning** across all modules (user gold, agent purple, tools cyan, memory pink, RAG green, errors red).
- **"What the LLM does here"** callout on every step — explicitly tells you which piece is the model and which piece is the orchestrator around it.
- **Live trade-offs.** Every toggle shows the cost/quality/latency change immediately. Learners *feel* the dial, they don't just read about it.
- **Production-honest.** Each module ends with how this works in real production systems, not just the toy version.

## Stack

- Vite + TypeScript
- Three.js (vanilla, no react-three-fiber)
- No dependencies beyond `three` itself

## Project layout

```
src/
├── main.ts                     # orchestrator + module router
├── style.css                   # one-file design tokens
├── core/
│   ├── SceneManager.ts         # render loop, lighting, camera
│   ├── UI.ts                   # nav / controls / output / story panels
│   ├── Tween.ts                # tiny animation helper
│   ├── Theme.ts                # semantic color tokens
│   ├── Scenario.ts             # shared travel-planner data
│   └── ModuleTypes.ts          # Module / ModuleDef contracts
├── components/
│   └── Prims.ts                # orb, brain, toolNode, dataCard, beam, ...
└── modules/
    ├── M01_ChatbotVsAgent.ts
    ├── ...
    └── M15_Capstone.ts
```

Each module is one ~150-line file implementing the `Module` interface (steps, controls, output, delta).
