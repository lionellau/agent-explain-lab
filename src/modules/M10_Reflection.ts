import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, toolNode, orb, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod10: ModuleDef = {
  id: 'm10',
  num: 'M10',
  title: 'Reflection — The Agent Critiques Itself',
  subtitle: 'First draft: $520. Critic: "Over budget!" Revised: $485.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.0);
    const critic = orb({ color: C.bad, r: 0.55 });
    let draft: Group | null = null;
    let critique: Group | null = null;
    let revised: Group | null = null;
    let beams: Group[] = [];
    let p = { evaluator: 'llm_critic' };

    function setDraft() {
      if (draft) root.remove(draft);
      draft = dataCard(['# First draft itinerary', 'Flight Iberia    $295', 'Bairro Boutique×3 $216', 'Tram + Belém     $24', 'TOTAL            $535  ✗'], C.warn, { w: 3.4 });
      draft.position.set(-5, 1.5, 0); root.add(draft);
    }
    function setCritique() {
      if (critique) root.remove(critique);
      let lines: string[] = [];
      if (p.evaluator === 'none') lines = ['# No evaluator', '(answer accepted as-is)', 'Sam is charged $535. ✗'];
      if (p.evaluator === 'rule') lines = ['# Rule validator', 'Rule: total ≤ $500', '535 > 500 → REJECT', 'Reason: budget'];
      if (p.evaluator === 'llm_critic') lines = ['# LLM critic', 'Claim: under $500', 'Evidence: $535', 'Mismatch detected.', 'Suggest: swap hotel.'];
      if (p.evaluator === 'human') lines = ['# Human reviewer', '"Over budget by $35.', ' Try the hostel instead."'];
      critique = dataCard(lines, p.evaluator === 'none' ? C.bad : C.agent, { w: 3.2 });
      critique.position.set(1.5, 1.5, 0); root.add(critique);
    }
    function setRevised() {
      if (revised) root.remove(revised);
      if (p.evaluator === 'none') return;
      revised = dataCard(['# Revised itinerary', 'Flight Iberia    $295', 'Hostel Alfama×3   $114', 'Tram + Belém      $24', 'Veg lunch×2       $32', 'TOTAL             $465  ✓'], C.good, { w: 3.4 });
      revised.position.set(-5, -2.5, 0); root.add(revised);
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — First draft is plausible but wrong',
          story: 'Agent produces a Lisbon plan: looks good, except the total is <b>$535</b> — over Sam\'s $500 budget. Without a check, this would be the final answer.',
          llm: 'LLMs often produce confident, fluent answers that violate a constraint they "knew" was in the prompt. Constraints need to be enforced after generation.'
        },
        {
          title: 'Step 2 — The critic scans the draft',
          story: 'A separate critic (red orb) reads the draft against the evidence and the user\'s constraints. Use the evaluator-type control on the right to try each style.',
          llm: 'The critic can be: (a) deterministic rules (cheapest, safest), (b) a different LLM with a sharper "find flaws" prompt, or (c) a human in the loop.'
        },
        {
          title: 'Step 3 — Mismatch detected, agent revises',
          story: 'Critic says: "$535 > $500 budget." Agent swaps the boutique hotel for the hostel, regenerates, lands at <b>$465 ✓</b>.',
          llm: 'Reflection is a generate → critique → regenerate loop. Each iteration costs more tokens, so cap the loop (usually 1-3 iterations) to avoid runaway cost.'
        },
        {
          title: 'Step 4 — Pick the right critic for the stakes',
          story: 'Cheap and low-risk? Rule check. Medium risk? LLM critic. Money or identity at stake? Human. Reflection is quality control, not magic.',
          llm: 'For irreversible actions (payments, deletes, sends), always require human sign-off. "The LLM seemed confident" is not a defense.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        agent.position.set(-6.5, -0.5, 0); root.add(agent);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);
        critic.position.set(2.5, -0.5, 0); root.add(critic);
        const cl = makeLabel('Critic', C.bad); cl.position.y = 1.0; critic.add(cl);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 16], [-1, 0, 0]);
      },
      goStep(i) {
        beams.forEach((b) => root.remove(b)); beams = [];
        if (draft) root.remove(draft); if (critique) root.remove(critique); if (revised) root.remove(revised);
        draft = critique = revised = null;
        if (i >= 0) setDraft();
        if (i >= 1) {
          setCritique();
          const b = beam(critic.position.clone(), draft!.position.clone(), C.bad);
          root.add(b); beams.push(b as any);
          ctx.tweens.to({ duration: 0.6, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.5 * t; } });
        }
        if (i >= 2) {
          setRevised();
          if (p.evaluator !== 'none' && revised) {
            const r = revised as Group;
            const b = beam(critique!.position.clone(), r.position.clone(), C.agent);
            root.add(b); beams.push(b as any);
            ctx.tweens.to({ duration: 0.6, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.55 * t; } });
          }
        }
      },
      onControl(k, v) { if (k === 'evaluator') { p.evaluator = v; setCritique(); setRevised(); } },
      update(dt, t) {
        agent.rotation.y += dt * 0.4;
        critic.rotation.y += dt * 0.6;
        (critic as any).core.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.25;
      },
      getControls() {
        return [{ kind: 'choice', key: 'evaluator', label: 'Critic type', value: p.evaluator,
          options: [ { id: 'none', label: 'None' }, { id: 'rule', label: 'Rule' }, { id: 'llm_critic', label: 'LLM critic' }, { id: 'human', label: 'Human' } ] }];
      },
      getOutput() {
        const out: Record<string, any[]> = {
          none:       [ { k: 'Final cost', v: '$535', class: 'bad' }, { k: 'Constraint OK?', v: 'No', class: 'bad' }, { k: 'Tokens spent', v: '1×', class: 'good' }, { k: 'Risk', v: 'High', class: 'bad' } ],
          rule:       [ { k: 'Final cost', v: '$465', class: 'good' }, { k: 'Constraint OK?', v: 'Yes', class: 'good' }, { k: 'Tokens spent', v: '1.3×', class: 'good' }, { k: 'Catches logic', v: 'No', class: 'warn' } ],
          llm_critic: [ { k: 'Final cost', v: '$465', class: 'good' }, { k: 'Constraint OK?', v: 'Yes', class: 'good' }, { k: 'Tokens spent', v: '2.5×', class: 'warn' }, { k: 'Catches logic', v: 'Yes', class: 'good' } ],
          human:      [ { k: 'Final cost', v: '$465', class: 'good' }, { k: 'Constraint OK?', v: 'Yes', class: 'good' }, { k: 'Tokens spent', v: '1.2×', class: 'good' }, { k: 'Latency', v: 'Minutes', class: 'warn' } ]
        };
        return out[p.evaluator];
      },
      getDelta() {
        const d: Record<string, string> = {
          none: '<b>No critic</b> — overbudget answer ships. Sam is annoyed.',
          rule: '<b>Rule</b> — catches numeric/format constraints. Cheap but blind to logic mistakes.',
          llm_critic: '<b>LLM critic</b> — catches "claim doesn\'t match evidence." Most flexible. <span class="changed">Cost: extra LLM call per iteration.</span>',
          human: '<b>Human</b> — safest, slowest. Use for irreversible actions.'
        };
        return d[p.evaluator];
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
