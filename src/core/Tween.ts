export type Easing = (t: number) => number;
export const ease = {
  linear: (t: number) => t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inCubic: (t: number) => t * t * t,
  outBack: (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

export interface Tween {
  duration: number;
  elapsed: number;
  easing: Easing;
  update: (t: number) => void;
  onDone?: () => void;
  done?: boolean;
}

export class Tweens {
  private list: Tween[] = [];
  add(t: Omit<Tween, 'elapsed' | 'done'>) {
    const tween: Tween = { ...t, elapsed: 0, easing: t.easing ?? ease.inOutCubic };
    this.list.push(tween);
    return tween;
  }
  to(opts: { duration: number; easing?: Easing; update: (t: number) => void; onDone?: () => void }) {
    return this.add({ ...opts, easing: opts.easing ?? ease.inOutCubic });
  }
  step(dt: number) {
    for (const t of this.list) {
      if (t.done) continue;
      t.elapsed += dt;
      const p = Math.min(1, t.elapsed / t.duration);
      t.update(t.easing(p));
      if (p >= 1) {
        t.done = true;
        t.onDone?.();
      }
    }
    if (this.list.length > 200) this.list = this.list.filter((t) => !t.done);
  }
  clear() { this.list.length = 0; }
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
