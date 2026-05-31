# 🧪 Explain-Lab Prompt

Paste into a new Claude session, fill the `«…»`, hand it your chapter list.

```
Build an "Explain Lab" — a teaching site for non-technical learners.
Mirror github.com/lionellau/llm-explain-lab and github.com/lionellau/agent-explain-lab.
DO NOT redesign the shell, nav, or interactions. Only customise the
topic, the running story, and the per-chapter visuals.

TOPIC
- Repo name (kebab-case):  «name»
- Hero title:              «How does X actually work?»
- Tagline:                 «No math. No code. No prior background needed.»
- Running story:           one sentence the user asks. Repeats verbatim
                           every chapter so learners build one mental model.
- Chapters:                10–15 items. For each: title · 1-line tagline ·
                           emoji · accent (coral/sun/mint/sky/grape-soft/rose).

STACK (locked)
Vite + React 19 + TS + Tailwind v4 + react-router HashRouter.
@react-three/fiber@^9 + @react-three/drei@^10 ONLY for chapters where the
lesson IS spatial. Everything else uses SVG + DOM + CSS animation.
No state library. Local useState only.

VISUALISATION PRINCIPLES (the most-violated rules)
• ONE hero visual per chapter that EVOLVES as beats advance. Add elements
  in place, animate transitions (pulse, slide, snap). Never stack new
  text cards below previous ones beat-by-beat — that's PowerPoint, not
  animation.
• APPEND, NEVER REPLACE. Previous beats stay on screen, slightly dimmed
  with a ✓. Active beat gets an accent ring + label. User must glance up
  and see where they came from. If you must replace, use a smooth
  before/after split — never an abrupt page-flip.
• SHOW THE MECHANISM, THEN THE BENEFIT. Every concept answers two
  questions: (1) What is it doing? — show the actual transformation on
  actual data (real text getting chunked, real phrases becoming visible
  vectors). (2) Why bother? — a short brand-colored bullet list under
  or beside the demo. Don't write "the model averages…" without showing
  averaging.
• If the same stage is drawn in two places on one page, you've failed.
  Draw it once.

LAYOUT (locked)
Desktop ≥1024: grid-cols-[1fr_400px]. Visual left. StorySteps sticky-top right.
Mobile: StorySteps becomes position:fixed bottom-0, z-30, max-h-[55vh]
  overflow-y-auto. Outro + "After this chapter" move into main flow
  under the demo. pb-[260px] reserved on container.
TopNav: never wraps. Mobile = logo + "01 · Title" pill + ☰ menu.
Chapter header on mobile: title full width, next-chapter chip STACKS
  below the title (not inline).

STORY CONTRACT (locked)
Each chapter = ONE 📖 Explanation card, 4–6 beats. Each beat = ONE bold
sentence in the chapter accent + optional sub-note (hidden on mobile).
Next button glows after 3s. Optional ▶ auto-play. No quizzes.
Mentor-at-coffee voice.

CTA RULES
The Next button stays primary on every beat. On the last beat it becomes
"Replay from start" — never replace it with "Continue to next chapter"
(that blocks replay). The next-chapter signal lives as a small chip in
the top-right of the chapter header, visible the whole time, glowing
only when the user reaches the last beat.

ONE COLOR = ONE MEANING — lock in chapters.ts, never deviate.
COLOR DISCIPLINE
• Coral = pain. Use as a small inline marker only — never fill whole
  cards with coral, never coral-on-coral with coral rings. That reads
  as fire alarm.
• For "broken status quo" chapters, keep structure neutral (paper/white
  borders). Mark only the specific words that lie.

VISUAL SHAPE PER LESSON TYPE
• Sequential pipeline → horizontal nodes connected by FlowArrow.
• Comparison (A vs B) → two SEPARATE columns, each with its own copy of
  the question → process → outcome. Big "VS" pill between. Stacks
  vertically on sm. NEVER one source forking up + down (that reads as
  cooperation, not comparison).
• Multiple options "pick one" → three separate scenarios side by side,
  banner: "these are independent approaches". Don't draw them all
  around one central model unless you mean "stack them all".
• Decision frames → BINARY TREE walked one example at a time, lighting
  up the path and the leaf. NOT a 2×2 grid. On mobile, collapse to a
  stacked list of "X YES / Y NO → result" pills.
• Cycle / loop → 3 nodes triangle with arrows + cycle-back arrow.
• Network / graph → ring layout with pairwise edges.
• Spatial (vectors, embeddings) → 3D via r3f. Build a 2D fallback first,
  3D as progressive enhancement. Never 3D-only.

FLOWNODE CONTRACT
Solid bg-ink-soft body. 2px colored border. Title in tone color, sub-text
always full-opacity text-paper. NEVER bg-X/10 tints for body content.
FlowDiagram has fixed 720px design width inside overflow-x-auto so labels
never overlap on mobile.

LABEL DISCIPLINE
Hand-tune positions; no two labels share a row. Don't trust auto-projection.
Keep label text short (≤ ~20 chars). Use labelSide: left | right per
element so right-edge labels don't get clipped. A "drag to rotate" hint
must only appear when dragging actually does something.

MOBILE CHECKLIST (fail if any is true at 375×812)
☐ Next button needs scrolling   ☐ Labels overlap   ☐ Nav wraps
☐ Low text contrast              ☐ Comparison renders side-by-side
☐ Header next-chapter chip sits inline with the title
☐ A 4+ column grid hasn't collapsed

ANTI-PATTERNS
✗ Stacked text-card-per-beat layout instead of one evolving visual
✗ Same stage drawn twice on the same page
✗ Coral-on-coral whole-card fills
✗ 2×2 grids for decisions (use trees)
✗ "Continue to next chapter" replacing the Next button on last beat
✗ Free-orbit 3D for non-spatial concepts
✗ bg-X/10 cards with body text
✗ Quizzes, "did you understand?" gates
✗ Telemetry, analytics, remote calls
✗ Lazy()+Suspense around critical lesson content
✗ Long labels that collide with each other

INFRA (copy from llm-explain-lab)
vite.config.ts: CSP + BASE_PATH. public/_headers. HashRouter.
.github/workflows/deploy.yml: npm ci → build with
BASE_PATH=/${{repo.name}}/ → cp index.html→404.html → upload-pages-artifact.
.gitignore covers: node_modules/, dist/, .env*, .DS_Store, .claude/, .gstack/,
non-npm lockfiles. SECURITY.md mirrors sister repos. LICENSE = MIT.

README VOICE (in order)
1. Centered hero: title + tagline + "▶ Try it live →".
2. Mentor sub-line: "Built by a tech mentor who got tired of explaining
   the same thing in every 1:1."
3. "Why this exists" — open by NAMING THE PAIN. Humbly acknowledge who
   doesn't have this pain (some people use X differently). That earns
   trust. Position author as confident practitioner sharing what they've
   learned — not an instructor lecturing. Polite, direct, no AI-vocabulary
   words ("comprehensive", "robust", "delve", "crucial", "leverage").
   Sign with name + role at the end of the intro.
4. "What you'll learn" — chapter table with "the big idea you walk away
   with" column.
5. "A peek inside" — 2×2 image gallery of 4 representative chapters.
   Capture screenshots from the LIVE DEPLOYED SITE before referencing
   them. Dead images are visible to everyone.
6. How it's built · Run locally · Mentors guide · Roadmap · About + sister
   cross-links · MIT · Credits.

PUBLISH
1. git init main; commit with <id>+<user>@users.noreply.github.com
   (GitHub blocks pushes that would publish your private email).
2. Repo name lowercase kebab-case.
3. gh repo create user/repo --public --source=. --push --homepage URL
   (Settings → also set the homepage field, not just the README link).
4. gh api -X POST repos/user/repo/pages -f build_type=workflow.
5. Workflow auto-deploys on first push.

VERIFICATION BEFORE CLAIMING DONE
1. tsc -b + vite build both pass.
2. Walk EVERY chapter at 1280×720 AND 375×812 — real screenshots, not
   "should work".
3. Click Next on every chapter through to the last beat. Verify the
   top-right next-chapter chip glows at the last beat.
4. Tap every interactive element. If a hint says "drag", drag must work.
5. Open the live URL, check browser console for errors.
6. Live URL returns 200 with the correct <title>.

Ask me only: "What concept, what running story?" Then go.
```

## Use

1. New Claude session → paste the block above.
2. Fill the `«…»` placeholders.
3. Hand Claude your chapter list.
4. Let it build. **Walk every chapter at 1280 and 375 before merging.**

For anything ambiguous, the instruction is to copy from
[llm-explain-lab](https://github.com/lionellau/llm-explain-lab) or
[agent-explain-lab](https://github.com/lionellau/agent-explain-lab) — those
are the source of truth.
