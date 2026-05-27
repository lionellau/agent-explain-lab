import type { ModuleDef } from './ModuleTypes';

export type CtlSpec =
  | { kind: 'toggle'; key: string; label: string; value: boolean }
  | { kind: 'choice'; key: string; label: string; value: string; options: { id: string; label: string }[] }
  | { kind: 'range'; key: string; label: string; value: number; min: number; max: number; step?: number; unit?: string };

export type MetricSpec = { k: string; v: string; class?: 'good' | 'bad' | 'warn'; bar?: { good?: number; warn?: number; bad?: number } };

export class UI {
  nav = document.getElementById('nav')!;
  controls = document.getElementById('controls')!;
  output = document.getElementById('output')!;
  delta = document.getElementById('delta')!;
  story = document.getElementById('story')!;
  callout = document.getElementById('llm-callout')!;
  moduleNum = document.getElementById('module-num')!;
  moduleTitle = document.getElementById('module-title')!;
  moduleSub = document.getElementById('module-sub')!;
  stepLabel = document.getElementById('step-label')!;
  btnPrev = document.getElementById('btn-prev-step') as HTMLButtonElement;
  btnNext = document.getElementById('btn-next-step') as HTMLButtonElement;
  btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  btnReset = document.getElementById('btn-reset') as HTMLButtonElement;

  onControl: ((key: string, value: any) => void) | null = null;

  renderNav(modules: ModuleDef[], activeId: string, onPick: (id: string) => void) {
    this.nav.innerHTML = '<h2>Curriculum</h2>';
    for (const m of modules) {
      const el = document.createElement('div');
      el.className = 'nav-item' + (m.id === activeId ? ' active' : '');
      el.innerHTML = `<span class="num">${m.num}</span><span>${m.title}</span>`;
      el.onclick = () => onPick(m.id);
      this.nav.appendChild(el);
    }
  }

  setHeader(num: string, title: string, sub?: string) {
    this.moduleNum.textContent = num;
    this.moduleTitle.textContent = title;
    this.moduleSub.textContent = sub ?? 'Story: planning a 3-day weekend trip to Lisbon, under $500';
  }

  setStep(i: number, n: number, story: string, llmCallout?: string | null) {
    this.stepLabel.textContent = `Step ${i + 1} / ${n}`;
    this.story.innerHTML = story;
    if (llmCallout) {
      this.callout.classList.remove('hidden');
      this.callout.innerHTML = `<div style="margin-top:18px">${llmCallout}</div>`;
    } else {
      this.callout.classList.add('hidden');
      this.callout.innerHTML = '';
    }
  }

  setControls(specs: CtlSpec[]) {
    this.controls.innerHTML = '';
    if (specs.length === 0) {
      this.controls.innerHTML = '<div style="font-size:12px;color:var(--muted)">No controls for this module — use the step pager above.</div>';
      return;
    }
    for (const s of specs) {
      const el = document.createElement('div');
      el.className = 'ctl';
      if (s.kind === 'toggle') {
        el.innerHTML = `<label>${s.label}</label>
          <div class="row">
            <button class="opt ${s.value ? 'active' : ''}" data-v="on">On</button>
            <button class="opt ${!s.value ? 'active' : ''}" data-v="off">Off</button>
          </div>`;
        el.querySelectorAll('button.opt').forEach((b) => {
          b.addEventListener('click', () => {
            const v = (b as HTMLElement).dataset.v === 'on';
            el.querySelectorAll('button.opt').forEach((bb) => bb.classList.remove('active'));
            b.classList.add('active');
            this.onControl?.(s.key, v);
          });
        });
      } else if (s.kind === 'choice') {
        el.innerHTML = `<label>${s.label}</label><div class="row">${s.options.map((o) =>
          `<button class="opt ${o.id === s.value ? 'active' : ''}" data-v="${o.id}">${o.label}</button>`).join('')}</div>`;
        el.querySelectorAll('button.opt').forEach((b) => {
          b.addEventListener('click', () => {
            el.querySelectorAll('button.opt').forEach((bb) => bb.classList.remove('active'));
            b.classList.add('active');
            this.onControl?.(s.key, (b as HTMLElement).dataset.v);
          });
        });
      } else if (s.kind === 'range') {
        el.innerHTML = `<label>${s.label} <span class="val">${s.value}${s.unit ?? ''}</span></label>
          <input type="range" min="${s.min}" max="${s.max}" step="${s.step ?? 1}" value="${s.value}" />`;
        const input = el.querySelector('input') as HTMLInputElement;
        const val = el.querySelector('.val') as HTMLElement;
        input.addEventListener('input', () => {
          val.textContent = input.value + (s.unit ?? '');
          this.onControl?.(s.key, Number(input.value));
        });
      }
      this.controls.appendChild(el);
    }
  }

  setOutput(metrics: MetricSpec[]) {
    if (metrics.length === 0) {
      this.output.innerHTML = '<div style="font-size:12px;color:var(--muted)">No output yet — run the steps.</div>';
      return;
    }
    this.output.innerHTML = metrics.map((m) => {
      const bar = m.bar ? `<div class="bar">${
        m.bar.good ? `<span class="good" style="width:${m.bar.good}%"></span>` : ''
      }${m.bar.warn ? `<span class="warn" style="width:${m.bar.warn}%"></span>` : ''
      }${m.bar.bad ? `<span class="bad" style="width:${m.bar.bad}%"></span>` : ''}</div>` : '';
      return `<div class="metric-row"><span class="k">${m.k}</span><span class="v ${m.class ?? ''}">${m.v}</span></div>${bar}`;
    }).join('');
  }

  setDelta(html: string) {
    this.delta.innerHTML = html || '<i>No change yet.</i>';
  }
}
