# 🧪 Explain-Lab Prompt

A reusable Claude prompt for building a teaching site in the *Explain Lab*
style — the calm, 15-chapter interactive tour pattern used by
[`llm-explain-lab`](https://github.com/lionellau/llm-explain-lab) and
[`agent-explain-lab`](https://github.com/lionellau/agent-explain-lab).

Paste it into a fresh Claude session, fill in the `«…»` placeholders, then
hand it the topic. Everything else is locked-in from past iteration so you
shouldn't have to relitigate UX or stack choices.

---

```
You are helping me build a new "Explain Lab" — an interactive teaching site
that explains a single technical concept to non-technical learners using one
running story, calm linear pacing, and purposeful visualisations.

The pattern is finalised. Do NOT redesign the shell, nav, or interaction
model. Customise only the content, the per-chapter visuals, and the running
story. If something below is ambiguous, copy the equivalent piece from
github.com/lionellau/llm-explain-lab or github.com/lionellau/agent-explain-lab.

══════════════════════════════════════════════════════════════════════════
TOPIC (fill in for each new project)
══════════════════════════════════════════════════════════════════════════
- New project name:       «agent-explain-lab»          # kebab-case repo name
- Hero title:             «How does an AI agent actually work?»
- Hero accent gradient:   «sun → coral → grape-soft»   # 2–3 token names
- Tagline:                «No math. No code. No prior background needed.»
- Running story:          one sentence the imaginary user asks. Same
                          sentence threads through every chapter so the
                          learner builds one mental model.
                          e.g. "Sam asks: plan me a 3-day weekend trip to
                          Lisbon under $500, leaving Friday night."
- Total chapters:         «15»  (10–15 is the sweet spot)
- Chapter list:           Title, 1-line tagline, 1-line blurb,
                          accent token (coral/sun/mint/sky/grape-soft/rose),
                          emoji. ONE chapter per "big idea you walk away
                          with." Sequence them so each builds on the last.
- Sister projects to cross-link in the README: «llm-explain-lab»

══════════════════════════════════════════════════════════════════════════
LOCKED-IN STACK — do not substitute
══════════════════════════════════════════════════════════════════════════
- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 via @tailwindcss/vite
- react-router-dom HashRouter (deep-links survive static hosts)
- three + @react-three/fiber@^9 + @react-three/drei@^10
  ONLY for chapters where 3D is literally the lesson. Everything else is
  SVG + HTML via the Flow components below.
- No state library. Local useState is enough.
- Node 20, npm. (Bun also works.)

══════════════════════════════════════════════════════════════════════════
FILE LAYOUT (mirror exactly)
══════════════════════════════════════════════════════════════════════════
src/
├── main.tsx                      # entry, HashRouter
├── App.tsx                       # routes + <TopNav />
├── index.css                     # design tokens + keyframes (copy verbatim)
├── chapters.ts                   # single source: CHAPTERS[] + STORY const
├── components/
│   ├── TopNav.tsx                # compact stepper + ☰ menu
│   ├── StorySteps.tsx            # 📖 Explanation card + beats + Next
│   ├── JourneyNav.tsx            # desktop-only prev/next + dot bar
│   ├── ChapterShell.tsx          # split layout, mobile sticky-bottom story
│   └── Flow.tsx                  # FlowNode / FlowArrow / FlowDiagram /
│                                 # FlowLane / FLOW_COLORS + TONE map
├── three/                        # only if any chapter uses 3D
│   ├── Scene3D.tsx               # Canvas wrapper + WebGL-fail fallback
│   └── Prims.tsx                 # Brain / ToolNode / Orb / Beam + COLORS
└── pages/
    ├── Home.tsx
    └── «ChapterN.tsx» × N        # one file per chapter, ~80–150 lines each

Plus:
- index.html (title, favicon link, no-referrer meta)
- public/favicon.svg + public/_headers (CSP for static hosts)
- vite.config.ts (CSP for dev+preview, BASE_PATH for GitHub Pages)
- tsconfig.json (jsx: react-jsx, strict, ES2022)
- .github/workflows/deploy.yml (Pages, npm ci, BASE_PATH=/${{repo.name}}/,
  copy index.html → 404.html for SPA fallback)
- README.md, SECURITY.md, LICENSE (MIT), docs/screenshots/

══════════════════════════════════════════════════════════════════════════
DESIGN TOKENS — copy verbatim into index.css
══════════════════════════════════════════════════════════════════════════
@theme {
  --color-ink:        #0f0f1e;   /* background */
  --color-ink-soft:   #1a1a2e;   /* card/body backdrop */
  --color-paper:      #fdf6f0;   /* primary text */
  --color-grape:      #7c3aed;   /* primary brand */
  --color-grape-soft: #a78bfa;   /* primary brand soft */
  --color-sun:        #fbbf24;   /* warm accent + the "user" tone */
  --color-coral:      #fb7185;
  --color-mint:       #34d399;
  --color-sky:        #38bdf8;
  --color-rose:       #f472b6;
}
body background: radial-gradient(ellipse at top, #2a1b4d 0%, #0f0f1e 60%) fixed;
Keyframes (copy verbatim): float-in, pulse-glow, glow-ring, badge-shimmer,
anim-pop-in. The glow-ring is the "Next step button is ready" cue.

ONE COLOR = ONE MEANING ACROSS ALL CHAPTERS. Pick the mapping in chapters.ts
and never deviate (e.g. user=sun, primary subject=grape, tools=sky,
retrieval=mint, memory=rose, errors=coral).

══════════════════════════════════════════════════════════════════════════
THE CHAPTER STORY CONTRACT — non-negotiable
══════════════════════════════════════════════════════════════════════════
Every chapter is ONE prominent "📖 Explanation" card with 4–6 beats. Each
beat is:
  caption:  ONE bold sentence in the chapter's accent color. This IS the
            lesson; the visual just illustrates it. No paragraphs.
  llmNote:  ("In a real system…") A short clarifying note shown BELOW the
            caption with a left-border, smaller text. HIDDEN on mobile so
            the sticky-bottom panel stays compact.
  readingMs: how long before the Next button starts glowing. Default 3000ms.

Pacing rules:
  • User reads, watches visual update, presses Next when ready.
  • Next button glows after the reading delay so the user is gently
    invited but never rushed.
  • Optional ▶ auto-play advances ~1800ms after the glow.
  • Progress dots above the controls. Each dot is clickable to jump.
  • No quizzes. No friction. No "did you understand?" prompts.

Voice:
  • Plain English, no jargon. Mentor-at-coffee tone, not lecture-hall tone.
  • One big idea per chapter. One bold sentence per beat.
  • Same friendly emoji per chapter, used in nav + header + cards.
  • Outro: a one-sentence transition pointing at the next chapter.

══════════════════════════════════════════════════════════════════════════
LAYOUT — non-negotiable
══════════════════════════════════════════════════════════════════════════
Desktop (lg ≥ 1024px):
  grid lg:grid-cols-[1fr_400px] gap-5
    left column:  Watch panel (the visual) + extras
    right column: <StorySteps/> + outro + "After this chapter →" card
                  position: lg:sticky lg:top-20 so it stays in view while
                  the user scrolls the visual.

Mobile (<lg):
  story panel becomes POSITION: FIXED to the bottom of the viewport,
  z-30, bg-ink-soft, top-border in the accent color, big drop-shadow,
  max-h-[55vh] overflow-y-auto. The Next button is ALWAYS thumb-reachable;
  the diagram lives in normal scroll above it.
  Container gets pb-[260px] lg:pb-8 so demo content isn't hidden under
  the sticky panel.
  Outro paragraph + "After this chapter →" card move OUT of the story
  panel and INTO the main scroll flow under the demo, so the sticky panel
  stays compact.

JourneyNav (big prev/next + 15-dot bar at page bottom) is `hidden lg:block`.
Mobile uses the sticky panel + the "After this chapter" card instead.

TopNav:
  All chapters available behind a ☰ Chapters dropdown.
  Bar always shows: logo + current chapter "01 · 🗣️ Title" pill +
  Chapters button.
  Tablet+ adds: small progress dot row + Home button.
  Never wrap onto a second row.

══════════════════════════════════════════════════════════════════════════
2D vs 3D DECISION RULE — non-negotiable
══════════════════════════════════════════════════════════════════════════
Use 3D (react-three-fiber) ONLY when the lesson IS about a 3D property:
  ✓ meaning-as-space (vectors, embeddings, similarity clouds)
  ✓ rotation / spatial reasoning is the concept

Use 2D (Flow components) for everything else:
  ✗ "A vs B" comparison → swim lanes or side-by-side columns with a VS pill
  ✗ Sequential pipeline → horizontal nodes connected by FlowArrow
  ✗ Cycle / loop → 3 nodes in a triangle with arrows + cycle-back arrow
  ✗ Before/after → two panels separated by a dashed vertical line
  ✗ Network / graph → circular layout with pairwise edges
  ✗ Categorical chart → grid of FlowNodes with toggle

Free-orbit 3D (OrbitControls) almost always HURTS comprehension when the
lesson isn't spatial. Don't reach for it just because it looks impressive.

══════════════════════════════════════════════════════════════════════════
THE FlowNode CONTRACT — readability over decoration
══════════════════════════════════════════════════════════════════════════
- ALWAYS solid bg-ink-soft for the body. NEVER use bg-X/10 or bg-X/15
  tints for the body — body text becomes unreadable.
- 2px colored border carries the semantic color.
- Title text gets the tone color at full saturation.
- Sub-text is ALWAYS full-opacity text-paper. Never the tone color.
- States: { active: ring-2 + ring-offset + anim-float-in,
            dim:    opacity-35,
            base:   normal }
- Step-driven reveal: components take a `step` prop and either dim or
  hide based on a `revealAt` threshold so the diagram completes itself
  as the user advances beats.

FlowArrow is an SVG <path> with a quadratic-bezier curve (perpendicular
midpoint offset for arc), a fading opacity for inactive state, and an
optional small label rendered as an SVG <text> near the midpoint.

FlowDiagram wraps a fixed design width (720px default) in an
overflow-x-auto container so labels never overlap on narrow screens —
mobile users pan sideways instead of seeing crammed text.

══════════════════════════════════════════════════════════════════════════
COMPARISON CHAPTERS — make "VS" unmissable
══════════════════════════════════════════════════════════════════════════
When the lesson is "Path A vs Path B":
  - TWO separate columns. NEVER one source forking up + down — that reads
    as a pipeline, not a comparison.
  - Each column shows ITS OWN copy of the running-story question at the
    top, then its own process, then its own reply, then its own ✗/✓
    outcome banner.
  - Big "VS" divider between columns (text-paper/40, bold, font-extrabold).
  - Stack vertically on sm with VS as a round pill between stacks.

══════════════════════════════════════════════════════════════════════════
MOBILE CHECKLIST — verify before every commit
══════════════════════════════════════════════════════════════════════════
Test at 375 × 812 in a real browser. The lab fails if any of these is true:
  ☐ Next button requires scrolling to reach
  ☐ Diagram labels overlap each other
  ☐ Text contrast is below "easily readable in sunlight"
  ☐ Top nav wraps to a second row
  ☐ Comparison chapters render side-by-side instead of stacking

══════════════════════════════════════════════════════════════════════════
README — mirror the llm-explain-lab structure
══════════════════════════════════════════════════════════════════════════
Sections in order:
  1. Centered hero: title, tagline, "▶ Try it live →" link to GH Pages URL.
  2. <sub>Built by a tech mentor who got tired of explaining the same
     thing in every 1:1.</sub>
  3. Hero screenshot.
  4. "## Why this exists" — personal mentor-origin-story paragraph.
  5. "## What you'll learn in N minutes" — chapter table with "the big
     idea you walk away with" column.
  6. "## A peek inside" — 2×2 image gallery of 4 representative chapters.
  7. "## How it's built" — stack list + "Security & privacy" subsection
     linking SECURITY.md.
  8. "## Run it locally" — npm install / dev / build / preview.
  9. "## For fellow mentors and educators" — deep-link list + how to fork.
  10. "## Roadmap" — checklist of open ideas.
  11. "## About the author" — cross-link sister projects.
  12. "## License" — MIT.
  13. "## Credits" — outstanding explainers studied while building.

══════════════════════════════════════════════════════════════════════════
INFRA — copy verbatim
══════════════════════════════════════════════════════════════════════════
- vite.config.ts:
    base: process.env.BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    server.headers: CSP(dev=true) + standard security headers
    preview.headers: CSP(dev=false) + standard security headers
    preview.port: 4173
    CSP: default-src 'self'; script-src 'self' (+ unsafe-eval unsafe-inline
    in dev only); style-src 'self' 'unsafe-inline'; img-src 'self' data:
    blob:; font-src 'self' data:; connect-src 'self' (+ ws: wss: in dev);
    worker-src 'self' blob:; object-src 'none'; base-uri 'self';
    frame-ancestors 'none'; form-action 'none'.
- public/_headers: same CSP + HSTS for static hosts.
- .github/workflows/deploy.yml:
    on: push to main, runs npm ci + npm run build with
    BASE_PATH=/${{ github.event.repository.name }}/,
    copies dist/index.html → dist/404.html for SPA fallback,
    uploads via actions/upload-pages-artifact, deploys via
    actions/deploy-pages.
- SECURITY.md: threat-surface table, mitigations applied, dep audit,
  out-of-scope list, manual review notes, verdict.
- LICENSE: MIT, copyright «year» «name».

══════════════════════════════════════════════════════════════════════════
PUBLISHING STEPS — when ready to ship
══════════════════════════════════════════════════════════════════════════
1. git init && git checkout -b main
2. git commit with noreply email: «<id>+<user>@users.noreply.github.com»
3. gh repo create «user/repo» --public --source=. --remote=origin --push
   --description «one-line description» --homepage «https://user.github.io/repo»
4. gh api -X POST repos/«user/repo»/pages -f build_type=workflow
5. gh run watch (the deploy.yml workflow auto-triggers on first push)
6. Verify live URL returns 200 and has the right <title>.

══════════════════════════════════════════════════════════════════════════
ANTI-PATTERNS — explicitly forbidden
══════════════════════════════════════════════════════════════════════════
✗ 3-panel dashboard layout with controls + metrics + delta panels.
  Each chapter is ONE story, not a control surface.
✗ Free-orbit 3D for non-spatial concepts. It hurts comprehension.
✗ bg-X/10 or bg-X/15 backgrounds on cards with body text.
✗ "Next" button below the fold on any screen size.
✗ Pill-grid nav that wraps onto multiple rows.
✗ Forcing the user to scroll up after every step to see the visual change.
✗ Jargon-dense captions ("ReAct = reasoning + acting"). Translate first.
✗ Quizzes, "did you understand?" gates, or progress lock-out.
✗ Telemetry, analytics, remote network calls of any kind.
✗ Substituting the stack (Next.js, plain CSS, Vue, vanilla Three.js).
✗ Inventing a new design system. Always copy the tokens above.

══════════════════════════════════════════════════════════════════════════
DELIVERABLES YOU SHOULD PRODUCE
══════════════════════════════════════════════════════════════════════════
1. Working repo with the file layout above, typecheck-clean, builds with
   npm run build, runs with npm run preview at http://127.0.0.1:4173/.
2. All N chapter pages following the contract above. Use FlowDiagram for
   everything that isn't spatial; use Scene3D only for chapters where 3D
   is the lesson.
3. README + SECURITY + LICENSE.
4. Screenshots in docs/screenshots/ at 1280×800 from the live preview.
5. Verified mobile at 375 width: sticky-bottom Next button, no overlap,
   no horizontal text crush.
6. .github/workflows/deploy.yml ready to ship.
7. A short status report at the end listing: chapters built, where the
   3D budget went, what wasn't tested live yet, any open concerns.

If you need to ask me ONE question before starting, it's: "What concept,
and what running story?" Then go.
```

---

## How to use this prompt

1. **Copy the fenced block above** into a fresh Claude session.
2. **Fill in the `«…»` placeholders** at the top — project name, hero
   title, accent gradient, tagline, running story, chapter list.
3. **Hand Claude the topic** and let it build. Everything else (UX,
   stack, layout, infra) is already decided.
4. When Claude is done, run `npm install && npm run dev` and click
   through. Verify mobile at 375 width before merging anything.

## Variants

- **Slimmer (5–7 chapters)** for a quick "5-minute tour" — match the
  rhythm of llm-explain-lab. Cap each chapter at 4 beats.
- **Longer (12–18 chapters)** for a workshop-length tour — match the
  rhythm of agent-explain-lab. Up to 6 beats per chapter.

## Things that genuinely vary per project

- The accent token palette pairing (e.g. mint+sky for biology topics,
  coral+sun for product/business).
- The 3D budget — how many chapters genuinely deserve r3f. Most projects
  will land on 0–2.
- Whether you want a "Try your own" textarea on any chapter
  (Tokenizer chapter in llm-explain-lab is the canonical example).

Everything else is the same on purpose. Boring infrastructure is the
point — your effort should go into the explanations.
