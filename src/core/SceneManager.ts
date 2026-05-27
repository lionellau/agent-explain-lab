import {
  WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, DirectionalLight,
  Clock, Color, Fog, PointLight, Vector3
} from 'three';
import { C } from './Theme';

export class SceneManager {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  clock = new Clock();
  rafId = 0;
  onUpdate: ((dt: number, t: number) => void) | null = null;
  pointer = { x: 0, y: 0 };
  targetCamPos = new Vector3(0, 4, 14);
  targetCamLook = new Vector3(0, 0, 0);
  private camPos = new Vector3(0, 4, 14);
  private camLook = new Vector3(0, 0, 0);

  constructor(public canvas: HTMLCanvasElement) {
    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      console.error('WebGL unavailable — 3D scene disabled. UI still works.', e);
      this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, failIfMajorPerformanceCaveat: false });
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(C.bg, 1);

    this.scene = new Scene();
    this.scene.fog = new Fog(C.bg.getHex(), 18, 60);

    this.camera = new PerspectiveCamera(45, 1, 0.1, 200);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    this.scene.add(new AmbientLight(0xffffff, 0.55));
    const key = new DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 10, 8);
    this.scene.add(key);
    const fill = new PointLight(C.accent.getHex(), 0.6, 30);
    fill.position.set(-8, 4, 6);
    this.scene.add(fill);
    const rim = new PointLight(C.agent.getHex(), 0.5, 30);
    rim.position.set(8, -2, -6);
    this.scene.add(rim);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer);
    this.onResize();
  }

  private onResize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private onPointer = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  setCamera(pos: [number, number, number], look: [number, number, number]) {
    this.targetCamPos.set(...pos);
    this.targetCamLook.set(...look);
  }

  start() {
    this.clock.start();
    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      this.camPos.lerp(this.targetCamPos, 0.05);
      this.camLook.lerp(this.targetCamLook, 0.05);
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);
      this.onUpdate?.(dt, t);
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  clearScene() {
    const keep = new Set<any>();
    this.scene.traverse((o) => {
      if (o.type === 'AmbientLight' || o.type === 'DirectionalLight' || o.type === 'PointLight') keep.add(o);
    });
    const toRemove = this.scene.children.filter((c) => !keep.has(c));
    for (const c of toRemove) this.scene.remove(c);
  }

  setBgColor(c: Color) {
    this.renderer.setClearColor(c, 1);
    if (this.scene.fog) (this.scene.fog as Fog).color.copy(c);
  }
}
