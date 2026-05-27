import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { dataCard, gridFloor, makeLabel, toolNode, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

// Each candidate has a "true relevance" (0-1) and a "bi-encoder approximation" with noise.
const CANDIDATES = [
  { id: 'H1', text: 'Hostel Alfama  $38 vegetarian-OK',  truth: 0.95, biScore: 0.62 },
  { id: 'H2', text: 'Bairro Boutique $72 4.6★',          truth: 0.88, biScore: 0.81 },
  { id: 'H3', text: 'Cascais beach resort  $180',        truth: 0.20, biScore: 0.78 },
  { id: 'H4', text: 'Lisbon Marriott  $220',             truth: 0.30, biScore: 0.55 },
  { id: 'H5', text: 'Pet hotel for cats',                truth: 0.02, biScore: 0.49 },
  { id: 'H6', text: 'LX Hostel near tram 28  $35',       truth: 0.90, biScore: 0.45 },
  { id: 'H7', text: 'Tokyo capsule pod',                 truth: 0.05, biScore: 0.66 },
  { id: 'H8', text: 'Lisbon vegan B&B  $48',             truth: 0.92, biScore: 0.40 },
  { id: 'H9', text: 'Generic travel insurance',          truth: 0.10, biScore: 0.52 },
  { id: 'H10', text: 'Lisbon Airbnb downtown $55',       truth: 0.85, biScore: 0.70 }
];

export const mod08: ModuleDef = {
  id: 'm08',
  num: 'M08',
  title: 'Reranking — Fast Retrieval, Careful Judging',
  subtitle: 'Bi-encoder throws cards. Cross-encoder reads each one carefully.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const biTool = toolNode(C.tool, 'Bi-encoder (fast)'); biTool.position.set(-6, 2.6, 0); biTool.scale.setScalar(0.55);
    const crossTool = toolNode(C.agent, 'Cross-encoder (careful)'); crossTool.position.set(6, 2.6, 0); crossTool.scale.setScalar(0.55);
    let cards: { g: Group; data: typeof CANDIDATES[number] }[] = [];
    let beams: Group[] = [];
    let p = { rerank: 'on', topRerank: 10 };

    function placeBefore() {
      for (const c of cards) root.remove(c.g); cards = [];
      // Initial order by biScore desc
      const ordered = [...CANDIDATES].sort((a, b) => b.biScore - a.biScore);
      ordered.forEach((d, i) => {
        const card = dataCard([`# ${d.id}  bi:${d.biScore.toFixed(2)}`, d.text], d.truth > 0.7 ? C.good : d.truth > 0.4 ? C.warn : C.bad, { w: 3.2 });
        card.position.set(-5.5, 1.2 - i * 0.55, 0); card.scale.setScalar(0.001);
        root.add(card); cards.push({ g: card, data: d });
        ctx.tweens.to({ duration: 0.4, easing: ease.outBack, update: (t) => card.scale.setScalar(t) });
      });
    }

    function rerankAnim() {
      for (const b of beams) root.remove(b); beams = [];
      const considered = cards.slice(0, p.topRerank);
      considered.sort((a, b) => b.data.truth - a.data.truth); // cross-encoder knows truth
      const untouched = cards.slice(p.topRerank);
      const finalOrder = [...considered, ...untouched];
      finalOrder.forEach((c, i) => {
        const newX = 4.0;
        const newY = 1.2 - i * 0.55;
        ctx.tweens.to({ duration: 0.6 + i * 0.05, easing: ease.inOutCubic, update: (t) => {
          c.g.position.x = -5.5 + (newX - (-5.5)) * t;
          c.g.position.y = (1.2 - cards.indexOf(c) * 0.55) + (newY - (1.2 - cards.indexOf(c) * 0.55)) * t;
        } });
        const b = beam(crossTool.position.clone(), c.g.position.clone(), C.agent);
        root.add(b); beams.push(b as any);
        ctx.tweens.to({ duration: 0.7, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.4 * t; } });
      });
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Bi-encoder retrieves quickly (and roughly)',
          story: '10 hostel candidates come back from the fast vector search, ordered by approximate score. Cards on the left. Green truth=good, red truth=bad.',
          llm: 'The bi-encoder embeds the query and each doc independently and compares vectors. It\'s O(milliseconds) for millions of docs, but the score is approximate.'
        },
        {
          title: 'Step 2 — Some of the top results are wrong',
          story: 'Notice: <i>Cascais beach resort</i> and <i>Tokyo capsule pod</i> ranked high but are clearly wrong for Sam. The bi-encoder confused "Lisbon hostel" semantics.',
          llm: 'Bi-encoders cannot read query and doc <i>together</i>. They miss subtle cues like "$38 ≤ Sam\'s budget" or "vegetarian-OK aligns with prefs".'
        },
        {
          title: 'Step 3 — Cross-encoder reads each pair carefully',
          story: 'The cross-encoder takes (query, doc) <i>together</i> and assigns a precise relevance score. Watch the cards re-sort to the right column.',
          llm: 'Cross-encoders run a small LLM over the concatenated (query, doc). Slow per call, but the score is much closer to ground truth. So we only rerank the top-K.'
        },
        {
          title: 'Step 4 — Final order is dramatically better',
          story: 'After rerank, <b>Hostel Alfama</b> and <b>Lisbon vegan B&B</b> are at the top — exactly what Sam asked for. The wrong ones drop.',
          llm: 'Without rerank: faster, lower accuracy. With rerank on top-10: a few extra seconds, much better final answer. This is the standard production setup.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(biTool); root.add(crossTool);
        const bL = makeLabel('Before rerank', C.tool); bL.position.set(-5.5, 1.9, 0); root.add(bL);
        const aL = makeLabel('After rerank',  C.agent); aL.position.set(4.0, 1.9, 0); root.add(aL);
        placeBefore();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [-0.5, -1.5, 0]);
      },
      goStep(i) {
        if (i === 0 || i === 1) { placeBefore(); for (const b of beams) root.remove(b); beams = []; }
        if (i >= 2) { rerankAnim(); }
      },
      onControl(k, v) {
        if (k === 'rerank') { p.rerank = v ? 'on' : 'off'; if (v) rerankAnim(); else placeBefore(); }
        if (k === 'topRerank') p.topRerank = v;
      },
      update(dt) { biTool.rotation.y += dt * 0.4; crossTool.rotation.y += dt * 0.4; },
      getControls() {
        return [
          { kind: 'toggle', key: 'rerank', label: 'Rerank on', value: p.rerank === 'on' },
          { kind: 'range', key: 'topRerank', label: 'Rerank top N', value: p.topRerank, min: 3, max: 20, step: 1 }
        ];
      },
      getOutput() {
        const before = CANDIDATES.slice().sort((a, b) => b.biScore - a.biScore).slice(0, 3);
        const beforeAvg = before.reduce((s, x) => s + x.truth, 0) / 3;
        const afterAvg = p.rerank === 'on'
          ? CANDIDATES.slice(0, p.topRerank).sort((a, b) => b.truth - a.truth).slice(0, 3).reduce((s, x) => s + x.truth, 0) / 3
          : beforeAvg;
        return [
          { k: 'Top-3 quality (bi only)', v: (beforeAvg * 100).toFixed(0) + '%', class: 'warn' as const },
          { k: 'Top-3 quality (rerank)', v: (afterAvg * 100).toFixed(0) + '%', class: afterAvg > 0.85 ? 'good' as const : 'warn' as const },
          { k: 'Latency',                v: p.rerank === 'on' ? `+${(p.topRerank * 50)}ms` : 'baseline', class: p.rerank === 'on' ? 'warn' as const : 'good' as const },
          { k: 'Cost',                   v: p.rerank === 'on' ? `${p.topRerank} extra calls` : '0', class: 'warn' as const }
        ];
      },
      getDelta() {
        if (p.rerank === 'off') return 'Rerank off — fast but the top 3 contain a wrong hotel.';
        return `Rerank on top-${p.topRerank} — <span class="changed">slower by ~${p.topRerank * 50}ms, but top 3 are now the right answer.</span>`;
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
