# 🧪 Explain-Lab Prompt

Paste into a new Claude session, fill the `«…»`, hand it your chapter list.

```
Build an "Explain Lab" — a teaching site for non-technical learners.
Mirror github.com/lionellau/llm-explain-lab and github.com/lionellau/agent-explain-lab
exactly. Pattern is finalised — DO NOT redesign the shell, nav, or interactions.
Only customise the topic, the running story, and the per-chapter visuals.

TOPIC
- Repo name:      «kebab-name»
- Hero title:     «How does X actually work?»
- Tagline:        «No math. No code. No prior background needed.»
- Running story:  one sentence the user asks; threads through every chapter.
- Chapters:       N items (10–15). For each: title · 1-line tagline ·
                  emoji · accent token (coral/sun/mint/sky/grape-soft/rose).

STACK (locked)
Vite + React 19 + TypeScript + Tailwind v4 + react-router-dom HashRouter.
@react-three/fiber@^9 + @react-three/drei@^10 ONLY for chapters where the
lesson IS spatial. Everything else uses SVG+HTML Flow components.

LAYOUT (locked)
- Desktop ≥1024: grid-cols-[1fr_400px]. Visual left, StorySteps sticky-top right.
- Mobile: StorySteps becomes position:fixed bottom-0, z-30, max-h-[55vh]
  with overflow-y-auto. Outro + "After this chapter" card move into main
  flow under the demo. pb-[260px] reserved on container.
- TopNav: never wraps. Mobile = logo + "01 · Title" pill + ☰ menu.

STORY CONTRACT (locked)
Each chapter = ONE 📖 Explanation card, 4–6 beats. Each beat = ONE bold
sentence in the chapter accent color + optional sub-note (hidden on mobile).
Next button glows after 3s reading delay. Optional ▶ auto-play. No quizzes.
Mentor-at-coffee voice. One running story repeats verbatim every chapter.

ONE COLOR = ONE MEANING across all chapters. Decide the mapping in
chapters.ts and never deviate.

2D vs 3D RULE
3D only when the lesson IS spatial (vectors, meaning-space). For everything
else use Flow components: swim-lane comparison, horizontal pipeline, cycle
diagram, before/after wiring, ring graph. Free-orbit 3D HURTS comprehension
when the lesson isn't spatial.

COMPARISON CHAPTERS
Two separate columns, each with its OWN copy of the question → process →
outcome. Big "VS" divider. NEVER one source forking to two paths (reads as
pipeline). Stacks vertically on sm.

FLOWNODE CONTRACT
Solid bg-ink-soft body, 2px colored border, title in tone color, sub-text
always full-opacity text-paper. NEVER bg-X/10 tints for body content.
FlowDiagram has fixed 720px design width inside overflow-x-auto so labels
never overlap on mobile.

MOBILE CHECKLIST (fail if any is true at 375×812)
☐ Next button needs scrolling   ☐ Labels overlap   ☐ Nav wraps
☐ Low text contrast              ☐ Comparison chapters render side-by-side

ANTI-PATTERNS (forbidden)
✗ 3-panel dashboard with controls/metrics/delta
✗ Free-orbit 3D for non-spatial concepts
✗ bg-X/10 cards with body text
✗ Next button below the fold
✗ Quizzes or "did you understand?" gates
✗ Telemetry, analytics, remote calls

INFRA (copy verbatim from llm-explain-lab)
vite.config.ts with CSP + BASE_PATH, public/_headers, HashRouter,
.github/workflows/deploy.yml (npm ci, BASE_PATH=/${{repo.name}}/,
cp index.html→404.html for SPA fallback). README structure: hero +
tagline + Try-it-live + Why this exists + chapter table + 2×2 screenshot
gallery + How it's built + Run locally + Mentors guide + Roadmap +
About + MIT + Credits. SECURITY.md mirrors sister repos.

PUBLISH
1. git init main + commit with <id>+<user>@users.noreply.github.com
2. gh repo create user/repo --public --source=. --push --homepage ...
3. gh api -X POST repos/user/repo/pages -f build_type=workflow
4. Workflow auto-deploys. Verify live URL returns 200.

DELIVERABLES
Repo + N chapters + README/SECURITY/LICENSE + docs/screenshots at
1280×800 + mobile-verified at 375 + deploy workflow + short status report.

Ask me only: "What concept, what running story?" Then go.
```

## Use

1. New Claude session → paste the block.
2. Fill the `«…»` placeholders.
3. Hand it your chapter list (title + tagline + emoji + accent each).
4. Let it build. Click through on mobile before merging.

For anything ambiguous, the instruction is to copy from
[llm-explain-lab](https://github.com/lionellau/llm-explain-lab) or
[agent-explain-lab](https://github.com/lionellau/agent-explain-lab) — those
are the source of truth for the pattern.
