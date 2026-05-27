import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, orb, toolNode, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

const DOCS = [
  { id: 'd1', title: 'Lisbon rainy-day museums', sparse: false, dense: true },
  { id: 'd2', title: 'Indoor tram 28 tour', sparse: false, dense: true },
  { id: 'd3', title: '"Rainy weather Lisbon" travel tip', sparse: true, dense: true },
  { id: 'd4', title: 'Beach trip Cascais sun', sparse: false, dense: false },
  { id: 'd5', title: '"Lisbon March weather" guide', sparse: true, dense: true },
  { id: 'd6', title: 'Aerobus airport transfer SOP', sparse: false, dense: false },
  { id: 'd7', title: 'Drizzle-friendly day trip ideas', sparse: false, dense: true }
];

export const mod07: ModuleDef = {
  id: 'm07',
  num: 'M07',
  title: 'Dense vs Sparse Search',
  subtitle: 'Same query, two retrieval models, different winners.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const queryCard = dataCard(['# Query', '"rainy weather plans Lisbon March"'], C.user, { w: 3.5 });
    queryCard.position.set(0, 3.5, 0);

    const sparseMachine = toolNode(C.tool, 'Sparse (BM25 / keywords)');
    sparseMachine.position.set(-5, 0.5, 0); sparseMachine.scale.setScalar(0.65);
    const denseMachine  = toolNode(C.rag, 'Dense (vector / meaning)');
    denseMachine.position.set(5, 0.5, 0); denseMachine.scale.setScalar(0.65);

    const docCards: Group[] = [];
    let beams: Group[] = [];
    let p = { mode: 'hybrid' };

    function placeDocs() {
      docCards.forEach((d) => root.remove(d)); docCards.length = 0;
      DOCS.forEach((d, i) => {
        const card = dataCard(['# ' + d.id, d.title], C.dim, { w: 2.6 });
        card.position.set(-6 + (i % 4) * 3.3, -2.5 - Math.floor(i / 4) * 1.0, 0);
        root.add(card); docCards.push(card);
      });
    }

    function highlight() {
      beams.forEach((b) => root.remove(b)); beams = [];
      docCards.forEach((card, i) => {
        const d = DOCS[i];
        let pick = false;
        if (p.mode === 'sparse') pick = d.sparse;
        if (p.mode === 'dense') pick = d.dense;
        if (p.mode === 'hybrid') pick = d.sparse || d.dense;
        if (p.mode === 'hybrid_rerank') pick = d.dense; // reranker chooses semantic best
        const col = pick ? (d.dense && d.sparse ? C.accentWarm : (d.dense ? C.rag : C.tool)) : C.dim;
        ((card as any).plane.material).color = col;
        ((card as any).plane.material).opacity = pick ? 1.0 : 0.35;
        if (pick) {
          const src = (d.dense && !d.sparse) ? denseMachine.position : sparseMachine.position;
          const b = beam(src.clone(), card.position.clone(), col);
          root.add(b); beams.push(b as any);
          ctx.tweens.to({ duration: 0.6, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.55 * t; } });
        }
      });
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — One query, two understandings',
          story: 'Sam asks for rainy-day plans. <b>Sparse search</b> looks at literal words: "rainy", "Lisbon", "March". <b>Dense search</b> looks at meaning: rain ≈ drizzle ≈ indoor.',
          llm: 'Sparse = inverted index over tokens (think classic Google). Dense = embedding-vector nearest neighbors. They\'re solving different shapes of the same problem.'
        },
        {
          title: 'Step 2 — Sparse fires on exact words',
          story: 'It nails "rainy weather Lisbon March" — but misses "indoor museums" and "drizzle-friendly day trips" because none of those use the word "rainy".',
          llm: 'BM25-style scoring rewards rare-but-matching words. It\'s great for exact terminology (product codes, ticket IDs) and terrible at synonyms.'
        },
        {
          title: 'Step 3 — Dense catches meaning',
          story: 'Embeddings know "drizzle" lives near "rain" and "museum" near "indoor". It returns the semantically related docs — but might skip an exact-keyword match if the wording is off.',
          llm: 'Embedding models learn proximity from training corpora. They generalize well but can be fooled by paraphrase or unusual jargon the model never saw.'
        },
        {
          title: 'Step 4 — Hybrid = OR, reranked = best of both',
          story: 'Hybrid takes both sets and unions them. Then a reranker (slower, more careful) reorders to put the most relevant on top. Production RAG almost always does this.',
          llm: 'Hybrid alone catches more but adds noise. A cross-encoder reranker reads (query, doc) pairs together and scores them precisely — slow but high-quality.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(queryCard); root.add(sparseMachine); root.add(denseMachine);
        placeDocs();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [0, 0, 0]);
      },
      goStep(i) {
        if (i === 0) { p.mode = 'sparse'; }
        if (i === 1) { p.mode = 'sparse'; }
        if (i === 2) { p.mode = 'dense'; }
        if (i === 3) { p.mode = 'hybrid_rerank'; }
        highlight();
      },
      onControl(k, v) { if (k === 'mode') { p.mode = v; highlight(); } },
      update(dt) { sparseMachine.rotation.y += dt * 0.4; denseMachine.rotation.y += dt * 0.4; },
      getControls() {
        return [{ kind: 'choice', key: 'mode', label: 'Retrieval strategy', value: p.mode,
          options: [ { id: 'sparse', label: 'Sparse' }, { id: 'dense', label: 'Dense' }, { id: 'hybrid', label: 'Hybrid' }, { id: 'hybrid_rerank', label: 'Hybrid + rerank' } ] }];
      },
      getOutput() {
        const counts: Record<string, [number, number, string]> = {
          sparse: [2, 5, 'misses synonyms'],
          dense: [4, 3, 'misses exact IDs'],
          hybrid: [5, 2, 'noisier but covers both'],
          hybrid_rerank: [3, 0, 'best 3 only']
        };
        const [hits, misses, note] = counts[p.mode];
        return [
          { k: 'Relevant hits', v: String(hits), class: hits >= 3 ? 'good' as const : 'warn' as const },
          { k: 'Missed docs',   v: String(misses), class: misses === 0 ? 'good' as const : misses > 3 ? 'bad' as const : 'warn' as const },
          { k: 'Noise',         v: p.mode === 'hybrid' ? 'higher' : 'low', class: p.mode === 'hybrid' ? 'warn' as const : 'good' as const },
          { k: 'Note',          v: note }
        ];
      },
      getDelta() {
        const d: Record<string, string> = {
          sparse: '<b>Sparse</b> caught the exact-word "rainy / March" docs. Missed the semantic ones (drizzle, indoor).',
          dense: '<b>Dense</b> caught the meaning matches. Could miss a doc with the exact ticket-ID-style title.',
          hybrid: '<b>Hybrid</b> unions both. More hits, more noise — needs a reranker downstream.',
          hybrid_rerank: '<b>Hybrid + rerank</b> ⇒ the production answer. <span class="changed">Best 3 docs, no waste.</span>'
        };
        return d[p.mode];
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
