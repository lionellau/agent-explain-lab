import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, toolNode, orb, particles, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod15: ModuleDef = {
  id: 'm15',
  num: 'M15',
  title: 'Capstone — Watch the Whole System Run',
  subtitle: 'All the controls in one place. Plan Sam\'s Lisbon trip end-to-end.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const request = orb({ color: C.user, r: 0.45 });
    const planner = brain(C.agent, 0.85);
    const memory  = toolNode(C.memory, 'Memory');
    const rag     = toolNode(C.rag, 'RAG');
    const flights = toolNode(C.tool, 'Flights');
    const hotels  = toolNode(C.tool, 'Hotels');
    const critic  = orb({ color: C.bad, r: 0.35 });
    const writer  = brain(C.accent, 0.55);
    const output  = dataCard(['# Final plan','(waiting...)'], C.good, { w: 3.6 });
    let beams: Group[] = [];

    let p = { memory: true, rag: true, toolReliability: 95, topK: 5, rerank: true, agents: 3, checkpoint: true };

    function fire(from: Vector3, to: Vector3, color: any, dur = 0.6) {
      const b = beam(from, to, color); root.add(b); beams.push(b as any);
      ctx.tweens.to({ duration: dur, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.55 * t; } });
    }
    function clearBeams() { for (const b of beams) root.remove(b); beams = []; }

    function buildOutput() {
      // Compute aggregate quality from all controls
      const q = 0.40
        + (p.memory ? 0.10 : 0)
        + (p.rag ? 0.12 : 0)
        + (p.rerank ? 0.06 : 0)
        + (p.topK >= 3 && p.topK <= 7 ? 0.06 : 0)
        + (p.agents >= 2 && p.agents <= 4 ? 0.08 : -0.04)
        + (p.toolReliability / 100) * 0.10
        + (p.checkpoint ? 0.04 : 0);
      const conf = Math.min(0.98, q);
      const cost = (0.04 + (p.rag ? 0.02 : 0) + p.agents * 0.015 + (p.rerank ? 0.01 : 0)).toFixed(3);
      const latency = (1.5 + p.agents * 0.6 + (p.rag ? 0.4 : 0) + (p.rerank ? 0.3 : 0)).toFixed(1);
      return { q, conf, cost, latency };
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Request enters the system',
          story: 'Sam: <i>"Plan a 3-day Lisbon weekend under $500, leaving Friday."</i> The orb on the left is the request. Everything you see is one continuous agent run.',
          llm: 'The whole right-hand control panel toggles real production switches. Try turning RAG off, or pushing top-K to 10, and watch the dashboard.'
        },
        {
          title: 'Step 2 — Plan → recall memory → retrieve docs',
          story: 'Planner decomposes. Long-term memory recalls "Tokyo: window seat, vegetarian". RAG retrieves Lisbon neighborhood + insurance docs. All into the prompt context.',
          llm: 'Each upstream stage produces text that gets concatenated into the next LLM call\'s context. Garbage in any stage = garbage out at the end.'
        },
        {
          title: 'Step 3 — Tools, ReAct loop, reflection',
          story: 'Flight + hotel APIs called. ReAct iterates: thought → action → observation → next thought. Critic checks budget. Reviser fixes the overshoot.',
          llm: 'This is where most of the cost happens. More agents + more iterations + bigger context = more dollars. The dashboard tells you whether you\'re getting your money\'s worth.'
        },
        {
          title: 'Step 4 — Final plan + dashboard',
          story: 'Writer composes the day-by-day plan, grounded in evidence. Dashboard shows quality, grounding, latency, cost. <b>Tune the controls and re-run</b> — see the trade-offs in real time.',
          llm: 'You now have a complete mental model: LLM at the center, surrounded by memory + retrieval + tools + critic + checkpointing. Everything else is variations on this shape.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        request.position.set(-7.5, 1.5, 0); root.add(request);
        const rl = makeLabel('Sam\'s request', C.user); rl.position.y = -0.9; request.add(rl);

        planner.position.set(-3.5, 1.5, 0); root.add(planner);
        const pl = makeLabel('Planner', C.agent); pl.position.y = 1.7; planner.add(pl);

        memory.position.set(-3.5, -2.2, 0); memory.scale.setScalar(0.55); root.add(memory);
        rag.position.set(0, -2.2, 0); rag.scale.setScalar(0.55); root.add(rag);
        flights.position.set(3.5, -2.2, 0); flights.scale.setScalar(0.55); root.add(flights);
        hotels.position.set(0, -3.5, 0); hotels.scale.setScalar(0.55); root.add(hotels);

        critic.position.set(3.5, 1.5, 0); root.add(critic);
        const cl = makeLabel('Critic', C.bad); cl.position.y = 0.9; critic.add(cl);

        writer.position.set(6.5, 1.5, 0); root.add(writer);
        const wl = makeLabel('Writer', C.accent); wl.position.y = 1.2; writer.add(wl);

        output.position.set(2, -4.7, 0); root.add(output);
        root.add(particles(180, C.accent, 7));

        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 18], [0, -0.5, 0]);
      },
      goStep(i) {
        clearBeams();
        const seq: [Vector3, Vector3, any][] = [];
        if (i >= 0) seq.push([request.position, planner.position, C.user]);
        if (i >= 1) {
          if (p.memory) seq.push([memory.position, planner.position, C.memory]);
          if (p.rag) seq.push([rag.position, planner.position, C.rag]);
        }
        if (i >= 2) {
          seq.push([planner.position, flights.position, C.tool]);
          seq.push([planner.position, hotels.position, C.tool]);
          seq.push([flights.position, planner.position, C.tool]);
          seq.push([hotels.position, planner.position, C.tool]);
          seq.push([planner.position, critic.position, C.bad]);
          seq.push([critic.position, planner.position, C.bad]);
        }
        if (i >= 3) {
          seq.push([planner.position, writer.position, C.accent]);
          seq.push([writer.position, output.position, C.good]);
        }
        seq.forEach(([a, b, col], idx) => setTimeout(() => fire(a.clone(), b.clone(), col, 0.6), idx * 200));
      },
      onControl(k, v) {
        (p as any)[k] = v;
        // Re-update final plan card text
        const { q, cost } = buildOutput();
        ((output as any).plane).geometry.dispose();
        root.remove(output);
        const lines = q > 0.85
          ? ['# Final plan ✓','Fri 9pm Iberia JFK→LIS $295','Hostel Alfama ×3        $114','Tram 28 + Belém         $24','Veg lunches ×2          $32','TOTAL                  $465  ✓ under $500']
          : q > 0.65
            ? ['# Final plan (acceptable)','Iberia $295, B&B $144,','activities $36 → $475', '(weather not checked)']
            : ['# Final plan (weak)','Generic plan, no budget check.','Likely off-target.'];
        (output as any).plane.material.map.dispose();
        const newCard = dataCard(lines, q > 0.85 ? C.good : q > 0.65 ? C.warn : C.bad, { w: 3.8 });
        newCard.position.copy(output.position); root.add(newCard);
        (output as any).plane = (newCard as any).plane;
      },
      update(dt, t) {
        planner.rotation.y += dt * 0.4;
        writer.rotation.y += dt * 0.5;
        request.rotation.y += dt * 0.6;
        critic.rotation.y += dt * 0.7;
      },
      getControls() {
        return [
          { kind: 'toggle', key: 'memory', label: 'Long-term memory', value: p.memory },
          { kind: 'toggle', key: 'rag',    label: 'RAG retrieval',    value: p.rag },
          { kind: 'range',  key: 'topK',   label: 'RAG top-K',        value: p.topK, min: 1, max: 12 },
          { kind: 'toggle', key: 'rerank', label: 'Rerank',           value: p.rerank },
          { kind: 'range',  key: 'agents', label: 'Number of agents', value: p.agents, min: 1, max: 6 },
          { kind: 'toggle', key: 'checkpoint', label: 'Checkpointing', value: p.checkpoint },
          { kind: 'range',  key: 'toolReliability', label: 'Tool reliability', value: p.toolReliability, min: 50, max: 100, unit: '%' }
        ];
      },
      getOutput() {
        const { q, conf, cost, latency } = buildOutput();
        return [
          { k: 'Answer quality', v: (q * 100).toFixed(0) + '%', class: q > 0.8 ? 'good' as const : q > 0.6 ? 'warn' as const : 'bad' as const,
            bar: q > 0.8 ? { good: 100 } : q > 0.6 ? { good: 70, warn: 30 } : { bad: 100 } },
          { k: 'Grounding',      v: (p.rag ? 'evidence-backed' : 'hallucinated'),     class: p.rag ? 'good' as const : 'bad' as const },
          { k: 'Confidence',     v: (conf * 100).toFixed(0) + '%',                    class: conf > 0.85 ? 'good' as const : 'warn' as const },
          { k: 'Latency',        v: latency + 's',                                    class: Number(latency) > 6 ? 'warn' as const : 'good' as const },
          { k: 'Cost',           v: '$' + cost,                                       class: Number(cost) > 0.12 ? 'warn' as const : 'good' as const },
          { k: 'Risk',           v: (p.checkpoint ? 'recoverable' : 'fragile'),       class: p.checkpoint ? 'good' as const : 'warn' as const }
        ];
      },
      getDelta() {
        const tips: string[] = [];
        if (!p.memory) tips.push('Memory off ⇒ forgets Sam\'s veg + window-seat prefs.');
        if (!p.rag) tips.push('RAG off ⇒ no neighborhood/insurance grounding.');
        if (p.topK > 8) tips.push('High top-K ⇒ noise in context.');
        if (p.agents > 4) tips.push('Many agents ⇒ extra messages, no quality gain.');
        if (p.toolReliability < 70) tips.push('Flaky tools ⇒ retries and longer latency.');
        if (!p.checkpoint) tips.push('No checkpoint ⇒ a crash means starting over.');
        return tips.length ? tips.map((t) => '• ' + t).join('<br>') : '<b>Solid configuration.</b> This is roughly the production default.';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
