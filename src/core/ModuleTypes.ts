import type { SceneManager } from './SceneManager';
import type { UI, CtlSpec, MetricSpec } from './UI';
import type { Tweens } from './Tween';

export interface ModuleContext {
  sm: SceneManager;
  ui: UI;
  tweens: Tweens;
}

export interface ModuleDef {
  id: string;
  num: string;
  title: string;
  subtitle?: string;
  create: () => Module;
}

export interface Module {
  steps: { title: string; story: string; llm?: string }[];
  init(ctx: ModuleContext): void;
  goStep(i: number): void;
  onControl?(key: string, value: any): void;
  update?(dt: number, t: number): void;
  dispose?(): void;
  getControls?(): CtlSpec[];
  getOutput?(): MetricSpec[];
  getDelta?(): string;
}
