import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, toolNode, dataCard, beam, gridFloor, makeLabel } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod02: ModuleDef = {
  id: 'm02',
  num: 'M02',
  title: 'ReAct Loop — Thought, Action, Observation',
  subtitle: 'How the agent thinks in cycles, not in one shot.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.05);
    const flights = toolNode(C.tool, 'Flights');
    const weather = toolNode(C.rag, 'Weather');
    const hotels = toolNode(C.tool, 'Hotels');
    let thoughtCard: Group | null = null;
    let actionCard: Group | null = null;
    let obsCard: Group | null = null;
    let beams: Group[] = [];
    let p = { tool: 'flights' };
    let wrongChoice = false;

    function setCards(thought: string[] | null, action: string[] | null, obs: string[] | null) {
      [thoughtCard, actionCard, obsCard].forEach((c) => { if (c) root.remove(c); });
      thoughtCard = thought ? dataCard(thought, C.agent, { w: 3.2 }) : null;
      actionCard = action ? dataCard(action, C.tool, { w: 3.2 }) : null;
      obsCard = obs ? dataCard(obs, C.rag, { w: 3.4 }) : null;
      if (thoughtCard) { thoughtCard.position.set(-5.5, 2.2, 0); root.add(thoughtCard); }
      if (actionCard) { actionCard.position.set(0, -3.6, 0); root.add(actionCard); }
      if (obsCard) { obsCard.position.set(5.5, 2.2, 0); root.add(obsCard); }
    }

    function fireBeam(from: Vector3, to: Vector3, color = C.tool) {
      const b = beam(from, to, color); root.add(b); beams.push(b as any);
      ctx.tweens.to({ duration: 0.5, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.6 * t; } });
    }

    function clearBeams() { for (const b of beams) root.remove(b); beams = []; }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Thought',
          story: 'The agent writes its reasoning out loud before doing anything: <i>"Sam wants Lisbon under $500. I need real flight prices first."</i>',
          llm: 'The LLM outputs a "thought" string. The orchestrator doesn\'t treat it as the answer — it\'s scratchpad for the next decision.'
        },
        {
          title: 'Step 2 — Action',
          story: 'The agent picks a tool and writes a function call: <code>flight_search(origin="JFK", dest="LIS", date="Fri")</code>. Use the control to try the wrong tool and see what happens.',
          llm: 'The LLM outputs a structured tool call (JSON or function schema). The orchestrator parses it and routes to the real API.'
        },
        {
          title: 'Step 3 — Observation',
          story: 'The Flights API returns: <i>3 flights, cheapest $295 (Iberia, 9h 05m)</i>. This data becomes a new message in the conversation.',
          llm: 'The tool result is appended to the LLM\'s context. The next LLM call sees thought + action + observation, and produces the next thought.'
        },
        {
          title: 'Step 4 — Next thought (the loop continues)',
          story: 'New thought: <i>"$295 leaves room for hotel. Check hotels in budget areas next."</i> The same shape — thought, action, observation — repeats until the agent has enough to answer.',
          llm: 'The LLM keeps deciding what to do next based on accumulated observations. It exits the loop when its thought says <code>"I have enough — write final answer."</code>'
        },
        {
          title: 'Step 5 — The pattern, generalized',
          story: 'ReAct = <b>Reasoning + Acting</b>. It\'s reasoning <i>with external feedback</i> — every guess gets checked against the real world before the next guess.',
          llm: 'Without observations, the LLM hallucinates. With observations, the LLM updates its plan. The loop is the difference between confident wrongness and grounded correctness.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        agent.position.set(0, 0, 0); root.add(agent);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);
        flights.position.set(-4, -3, -1); flights.scale.setScalar(0.55); root.add(flights);
        hotels.position.set(0, -3, -1); hotels.scale.setScalar(0.55); root.add(hotels);
        weather.position.set(4, -3, -1); weather.scale.setScalar(0.55); root.add(weather);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 15], [0, -0.5, 0]);
      },
      goStep(i) {
        clearBeams();
        if (i === 0) setCards(['# Thought', 'I need real flight prices', 'before I can plan anything.'], null, null);
        if (i === 1) {
          const tool = p.tool === 'flights' ? flights : p.tool === 'hotels' ? hotels : weather;
          wrongChoice = p.tool !== 'flights';
          setCards(
            ['# Thought', 'I need real flight prices.'],
            [`# Action`, `${p.tool === 'flights' ? 'flight_search' : p.tool === 'hotels' ? 'hotel_search' : 'weather'}(`, '  origin="JFK",', '  dest="LIS")'],
            null
          );
          fireBeam(agent.position.clone(), tool.position.clone(), C.tool);
        }
        if (i === 2) {
          const obs = wrongChoice && p.tool === 'weather'
            ? ['# Observation', 'Lisbon: 15°C, light rain.', '(useful later — not yet)']
            : wrongChoice && p.tool === 'hotels'
              ? ['# Observation', 'Hotels $38–120/night.', 'Can\'t budget without flight.']
              : ['# Observation', 'Iberia 9h 05m  $295', 'TAP    7h 20m  $380', 'United 6h 45m  $420'];
          const tool = p.tool === 'flights' ? flights : p.tool === 'hotels' ? hotels : weather;
          setCards(['# Thought', 'I need real flight prices.'], [`# Action`, `${p.tool}_search(...)`], obs);
          fireBeam(tool.position.clone(), agent.position.clone(), C.rag);
        }
        if (i === 3) {
          setCards(
            ['# Next thought', '$295 leaves $205 for hotel +', 'food. Check hotels next.'],
            ['# Action', 'hotel_search(', '  city="Lisbon",', '  max=70)'],
            ['# Observation', 'Hostel Alfama $38/night ✓', 'Bairro Boutique $72/night']
          );
          fireBeam(agent.position.clone(), hotels.position.clone(), C.tool);
          fireBeam(hotels.position.clone(), agent.position.clone(), C.rag);
        }
        if (i === 4) {
          setCards(
            ['# Final thought', 'Flight $295 + 2 nights $76', '+ food/transport $69', '= $440. Under $500 ✓.', 'Write the plan.'],
            null,
            ['# Loop summary', 'Iterations: 3', 'Tools used: flights, hotels', 'Wrong calls: ' + (wrongChoice ? '1 (cost time)' : '0')]
          );
        }
      },
      onControl(k, v) { if (k === 'tool') p.tool = v; },
      update(dt, t) { agent.rotation.y += dt * 0.5; (agent as any).core.material.emissiveIntensity = 0.55 + Math.sin(t * 3) * 0.18; },
      getControls() {
        return [{ kind: 'choice', key: 'tool', label: 'First tool the agent picks', value: p.tool,
          options: [ { id: 'flights', label: 'Flights ✓' }, { id: 'hotels', label: 'Hotels' }, { id: 'weather', label: 'Weather' } ] }];
      },
      getOutput() {
        const iter = wrongChoice ? 4 : 3;
        return [
          { k: 'Loop iterations', v: String(iter), class: wrongChoice ? 'warn' as const : 'good' as const },
          { k: 'Tools called', v: wrongChoice ? '3' : '2', class: 'good' as const },
          { k: 'Wrong calls', v: wrongChoice ? '1' : '0', class: wrongChoice ? 'bad' as const : 'good' as const },
          { k: 'Total tokens', v: wrongChoice ? '~3200' : '~2100', class: wrongChoice ? 'warn' as const : 'good' as const }
        ];
      },
      getDelta() {
        return wrongChoice
          ? '<b>Wrong first tool</b> = extra loop iteration. The agent recovers, but pays in tokens and latency. <span class="changed">Tool-choice quality is a real bottleneck.</span>'
          : '<b>Right first tool</b> = clean 3-step loop, evidence-backed final answer.';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
