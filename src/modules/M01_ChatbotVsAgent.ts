import { Group, Vector3, Color } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { orb, brain, toolNode, dataCard, beam, gridFloor, particles, makeLabel } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';
import { TRAVELER } from '../core/Scenario';

export const mod01: ModuleDef = {
  id: 'm01',
  num: 'M01',
  title: 'Chatbot vs Agent',
  subtitle: 'Same question, two minds — one talks, one acts.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();

    const request = orb({ color: C.user, r: 0.5 });
    const chatbot = brain(C.chatbot, 0.9);
    const agent = brain(C.agent, 1.05);
    const chatAnswer = dataCard(
      ['# Chatbot answer', '"Try Kayak for flights,', ' Hostelworld for stays.', ' Have a great trip!"'],
      C.chatbot, { w: 2.8 }
    );
    const tools = [
      toolNode(C.tool, 'Flights'),
      toolNode(C.tool, 'Hotels'),
      toolNode(C.rag, 'Weather')
    ];
    const evidence = dataCard(
      ['# Evidence collected', 'JFK→LIS Iberia  $295', 'Hostel Alfama   $38/night', 'Forecast: 15°C, light rain'],
      C.tool, { w: 3.0 }
    );
    const agentAnswer = dataCard(
      ['# Agent answer', 'Plan: Fri 8pm Iberia $295,', '2 nights Alfama $76,', 'Sat tram 28 + Belém,', 'Total: $440 ✓ under $500'],
      C.agent, { w: 3.0 }
    );

    let beams: Group[] = [];
    let p: any = {};

    function place() {
      root.add(gridFloor(C.dim));
      request.position.set(-7, 1.5, 0);
      root.add(request);
      const reqLabel = makeLabel(`"${TRAVELER.request.slice(0, 32)}…"`, C.user, { scale: 1.3 });
      reqLabel.position.set(0, -1.2, 0); request.add(reqLabel);

      chatbot.position.set(0, 3, 0); root.add(chatbot);
      const cl = makeLabel('Chatbot', C.chatbot); cl.position.y = 1.8; chatbot.add(cl);

      agent.position.set(0, -2.4, 0); root.add(agent);
      const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);

      chatAnswer.position.set(6, 3, 0); chatAnswer.visible = false; root.add(chatAnswer);

      tools[0].position.set(4, -3.5, -1.5);
      tools[1].position.set(6, -1.8, 0);
      tools[2].position.set(4, -0.6, 1.5);
      for (const t of tools) { root.add(t); t.scale.setScalar(0.55); t.visible = false; }

      evidence.position.set(8.5, -3.2, 0); evidence.visible = false; root.add(evidence);
      agentAnswer.position.set(8.5, -2.4, 0); agentAnswer.visible = false; root.add(agentAnswer);

      root.add(particles(140, C.accent, 6));
    }

    p.choice = 'tools';
    let outcomeIdx = 0;

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — The same question lands on both',
          story: `User <b>${TRAVELER.name}</b> asks: <i>"${TRAVELER.request}"</i>. The glowing orb on the left is the request. It will be sent to two different minds.`,
          llm: 'Both paths start with the same LLM call. The difference is what happens around the LLM — whether it just answers, or is allowed to decide and act.'
        },
        {
          title: 'Step 2 — Chatbot answers immediately',
          story: 'The <b>chatbot</b> sees the question and produces an answer right away — no tools, no checks. It guesses based on training data only.',
          llm: 'The LLM here gets only the user message in its context. Its output is plausible-sounding text, but nothing is verified against the real world.'
        },
        {
          title: 'Step 3 — Agent pauses to decide',
          story: 'The <b>agent</b> first thinks: "Do I have enough info? Should I use tools?" It opens a decision wheel of choices. Use the <b>"Agent picks"</b> control on the right to try each option.',
          llm: 'The LLM is prompted with a system message describing available tools. Its first output is a tool-call decision, not a final answer.'
        },
        {
          title: 'Step 4 — Agent calls tools, gets evidence',
          story: 'The agent fires tool calls: <code>flight_search</code>, <code>hotel_search</code>, <code>weather</code>. Real data flows back: $295 Iberia flight, $38 hostel, 15°C with rain.',
          llm: 'Tool results are appended to the LLM\'s context as messages. Each new message changes what the next LLM call will produce.'
        },
        {
          title: 'Step 5 — Grounded answer beats guessed answer',
          story: 'The agent produces a plan grounded in evidence: flight + hotel + activities with real prices, total <b>$440</b>, under budget. Compare to the chatbot\'s generic "try Kayak."',
          llm: 'Same LLM, but now the prompt contains tool results. That\'s the whole trick — an agent is an LLM whose context is being actively curated by a loop.'
        }
      ],
      init(c) {
        ctx = c;
        place();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([1, 3, 16], [1, 0, 0]);
      },
      goStep(i) {
        for (const t of tools) t.visible = false;
        evidence.visible = false; agentAnswer.visible = false; chatAnswer.visible = false;
        beams.forEach((b) => root.remove(b)); beams = [];
        agent.scale.setScalar(1); chatbot.scale.setScalar(1);

        if (i === 0) {
          ctx.tweens.to({ duration: 0.8, easing: ease.outCubic, update: (t) => { request.position.x = -7 + (-2) * t; } });
        }
        if (i >= 1) {
          chatAnswer.visible = true;
          const b = beam(new Vector3(-8, 1.5, 0), new Vector3(4.7, 3, 0), C.chatbot);
          (b.material as any).opacity = 0.55; root.add(b); beams.push(b as any);
        }
        if (i >= 2) {
          ctx.tweens.to({ duration: 0.8, easing: ease.outBack, update: (t) => { agent.scale.setScalar(1 + 0.18 * t); } });
        }
        if (i >= 3) {
          for (const t of tools) t.visible = true;
          for (let k = 0; k < tools.length; k++) {
            const b = beam(agent.position.clone(), tools[k].position.clone(), C.tool);
            root.add(b); beams.push(b as any);
            ctx.tweens.to({ duration: 0.5 + k * 0.15, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.6 * t; } });
          }
          evidence.visible = true;
        }
        if (i >= 4) { agentAnswer.visible = true; }
      },
      onControl(k, v) { if (k === 'choice') { p.choice = v; outcomeIdx = ({ direct: 0, tools: 1, search: 2, ask: 3 } as any)[v] ?? 1; } },
      update(dt, t) {
        request.rotation.y += dt * 0.6;
        chatbot.rotation.y += dt * 0.3;
        agent.rotation.y += dt * 0.5;
        (chatbot as any).core.material.emissiveIntensity = 0.35 + Math.sin(t * 2) * 0.1;
        (agent as any).core.material.emissiveIntensity = 0.55 + Math.sin(t * 3) * 0.18;
      },
      getControls() {
        return [{ kind: 'choice', key: 'choice', label: 'How should the agent respond?', value: p.choice,
          options: [
            { id: 'direct',  label: 'Answer directly' },
            { id: 'tools',   label: 'Use tools' },
            { id: 'search',  label: 'Search first' },
            { id: 'ask',     label: 'Ask user' }
          ] }];
      },
      getOutput() {
        const variants = [
          // direct
          [ { k: 'Latency', v: '~0.8s', class: 'good' as const }, { k: 'Grounded?', v: 'No', class: 'bad' as const }, { k: 'Confidence', v: '32%', class: 'bad' as const }, { k: 'Cost', v: '1× LLM', class: 'good' as const } ],
          // tools
          [ { k: 'Latency', v: '~6s', class: 'warn' as const }, { k: 'Grounded?', v: 'Yes (3 tools)', class: 'good' as const }, { k: 'Confidence', v: '89%', class: 'good' as const }, { k: 'Cost', v: '4× LLM + 3 API', class: 'warn' as const } ],
          // search first
          [ { k: 'Latency', v: '~4s', class: 'warn' as const }, { k: 'Grounded?', v: 'Knowledge only', class: 'warn' as const }, { k: 'Confidence', v: '71%', class: 'warn' as const }, { k: 'Cost', v: '2× LLM + 1 search', class: 'good' as const } ],
          // ask
          [ { k: 'Latency', v: 'wait for user', class: 'warn' as const }, { k: 'Grounded?', v: 'Pending', class: 'warn' as const }, { k: 'Confidence', v: 'safer', class: 'good' as const }, { k: 'Cost', v: '1× LLM', class: 'good' as const } ]
        ];
        return variants[outcomeIdx];
      },
      getDelta() {
        const labels: Record<number, string> = {
          0: '<b>Answer directly</b> — fast but ungrounded. Same problem as a plain chatbot.',
          1: '<b>Use tools</b> — slower but every claim is backed by a real API. <span class="changed">This is what makes it an agent.</span>',
          2: '<b>Search first</b> — better explanation, still missing live data.',
          3: '<b>Ask user</b> — safer for high-stakes decisions, but slow.'
        };
        return labels[outcomeIdx] ?? '';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
