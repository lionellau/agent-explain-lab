import {
  Mesh, MeshStandardMaterial, MeshBasicMaterial, SphereGeometry, BoxGeometry,
  IcosahedronGeometry, TorusGeometry, CylinderGeometry, ConeGeometry, RingGeometry,
  Group, Vector3, CanvasTexture, PlaneGeometry, DoubleSide, Color, AdditiveBlending,
  BufferGeometry, BufferAttribute, LineSegments, LineBasicMaterial, CatmullRomCurve3,
  TubeGeometry, Points, PointsMaterial, Object3D, Line, Float32BufferAttribute,
  Sprite, SpriteMaterial
} from 'three';

export function orb(opts: { color: Color | number; r?: number; emissive?: number }): Group {
  const g = new Group();
  const r = opts.r ?? 0.55;
  const core = new Mesh(new IcosahedronGeometry(r, 2), new MeshStandardMaterial({
    color: opts.color, emissive: opts.color, emissiveIntensity: opts.emissive ?? 0.7, roughness: 0.3, metalness: 0.2
  }));
  const halo = new Mesh(new SphereGeometry(r * 1.6, 24, 24), new MeshBasicMaterial({
    color: opts.color, transparent: true, opacity: 0.13, blending: AdditiveBlending, depthWrite: false
  }));
  g.add(core); g.add(halo);
  (g as any).core = core; (g as any).halo = halo;
  return g;
}

export function brain(color: Color, size = 1.2): Group {
  const g = new Group();
  const sphere = new Mesh(new IcosahedronGeometry(size, 1), new MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.5, roughness: 0.25, metalness: 0.4, flatShading: true
  }));
  g.add(sphere);
  for (let i = 0; i < 3; i++) {
    const ring = new Mesh(new TorusGeometry(size * (1.25 + i * 0.18), 0.015, 8, 64), new MeshBasicMaterial({
      color, transparent: true, opacity: 0.25 - i * 0.05, depthWrite: false
    }));
    ring.rotation.x = Math.PI / 2 + i * 0.6; ring.rotation.y = i * 0.7;
    g.add(ring);
    (g as any)[`ring${i}`] = ring;
  }
  (g as any).core = sphere;
  return g;
}

export function toolNode(color: Color, label: string): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(1.1, 1.1, 1.1), new MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.25, roughness: 0.4, metalness: 0.5
  }));
  const ring = new Mesh(new RingGeometry(0.85, 0.95, 32), new MeshBasicMaterial({ color, side: DoubleSide, transparent: true, opacity: 0.6 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -0.6;
  g.add(base); g.add(ring);
  g.add(makeLabel(label, color));
  (g as any).core = base;
  return g;
}

export function makeLabel(text: string, color: Color = new Color('#ffffff'), opts: { scale?: number } = {}): Sprite {
  const w = 512, h = 128;
  const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h;
  const ctx = cvs.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.font = '600 56px ui-sans-serif, "SF Pro Text", "Inter", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#' + color.getHexString();
  ctx.fillText(text, w / 2, h / 2);
  const tex = new CanvasTexture(cvs); tex.anisotropy = 4;
  const mat = new SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const s = new Sprite(mat);
  const scl = opts.scale ?? 1;
  s.scale.set(2.6 * scl, 0.65 * scl, 1);
  s.position.y = 1.0;
  return s;
}

export function dataCard(lines: string[], color: Color, opts: { w?: number; h?: number } = {}): Group {
  const w = opts.w ?? 2.2;
  const h = opts.h ?? Math.max(0.7, 0.35 + lines.length * 0.28);
  const cvsW = 512, cvsH = Math.round((h / w) * cvsW);
  const cvs = document.createElement('canvas'); cvs.width = cvsW; cvs.height = cvsH;
  const ctx = cvs.getContext('2d')!;
  ctx.fillStyle = 'rgba(15,22,35,0.92)'; ctx.fillRect(0, 0, cvsW, cvsH);
  ctx.strokeStyle = '#' + color.getHexString(); ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, cvsW - 4, cvsH - 4);
  ctx.fillStyle = '#e7ecf3';
  ctx.font = '32px ui-monospace, Menlo, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const pad = 24; let y = pad;
  for (const line of lines) {
    if (line.startsWith('#')) {
      ctx.fillStyle = '#' + color.getHexString();
      ctx.font = 'bold 30px ui-sans-serif, "Inter", sans-serif';
      ctx.fillText(line.slice(1).trim(), pad, y);
      ctx.fillStyle = '#e7ecf3'; ctx.font = '28px ui-monospace, Menlo, monospace';
    } else {
      ctx.fillText(line, pad, y);
    }
    y += 38;
  }
  const tex = new CanvasTexture(cvs); tex.anisotropy = 4;
  const mat = new MeshBasicMaterial({ map: tex, transparent: true, side: DoubleSide, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(w, h), mat);
  const g = new Group(); g.add(mesh);
  (g as any).plane = mesh;
  return g;
}

export function beam(from: Vector3, to: Vector3, color: Color, opts: { radius?: number; segments?: number } = {}): Mesh {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.y += from.distanceTo(to) * 0.15;
  const curve = new CatmullRomCurve3([from.clone(), mid, to.clone()]);
  const geo = new TubeGeometry(curve, opts.segments ?? 32, opts.radius ?? 0.035, 8, false);
  const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.0, blending: AdditiveBlending, depthWrite: false });
  return new Mesh(geo, mat);
}

export function gridFloor(color: Color, size = 40, divisions = 40): Group {
  const g = new Group();
  const half = size / 2;
  const step = size / divisions;
  const positions: number[] = [];
  for (let i = 0; i <= divisions; i++) {
    const p = -half + i * step;
    positions.push(p, 0, -half, p, 0, half);
    positions.push(-half, 0, p, half, 0, p);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const mat = new LineBasicMaterial({ color, transparent: true, opacity: 0.18 });
  const lines = new LineSegments(geo, mat);
  lines.position.y = -3;
  g.add(lines);
  return g;
}

export function particles(count: number, color: Color, radius: number): Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.cbrt(Math.random()) * radius;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
    positions[i * 3 + 1] = r * Math.cos(ph);
    positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const mat = new PointsMaterial({ color, size: 0.05, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false });
  return new Points(geo, mat);
}

export function track(points: Vector3[], color: Color, radius = 0.04): Mesh {
  const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.4);
  const geo = new TubeGeometry(curve, 64, radius, 8, false);
  const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false });
  return new Mesh(geo, mat);
}

export function pulseRing(color: Color, r = 1): Mesh {
  const m = new Mesh(new RingGeometry(r * 0.95, r, 64), new MeshBasicMaterial({
    color, transparent: true, opacity: 0.6, side: DoubleSide, blending: AdditiveBlending, depthWrite: false
  }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

export function arrow(color: Color, len = 0.8): Group {
  const g = new Group();
  const shaft = new Mesh(new CylinderGeometry(0.04, 0.04, len, 8), new MeshBasicMaterial({ color }));
  shaft.rotation.z = -Math.PI / 2; shaft.position.x = len / 2;
  const head = new Mesh(new ConeGeometry(0.12, 0.22, 8), new MeshBasicMaterial({ color }));
  head.rotation.z = -Math.PI / 2; head.position.x = len + 0.08;
  g.add(shaft); g.add(head);
  return g;
}
