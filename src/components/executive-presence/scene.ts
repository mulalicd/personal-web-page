/**
 * scene.ts — the "Executive Presence" WebGL scene (Sprint 02, PDL-004).
 *
 * Framework-free three.js: React only mounts/unmounts it. The canvas sits ON
 * TOP of the HTML portrait; an invisible depth-only disc exactly covering the
 * portrait makes the back half of every orbit disappear behind Davor and the
 * front half pass in front of him. Units are CSS pixels (orthographic camera),
 * so the disc matches the <img> circle exactly.
 *
 * Every node represents a real employer from profile.experience — no
 * decorative "data" (project CONSTITUTION P-2.5).
 */
import * as THREE from "three";
import type { AccentColor, CareerEraId } from "@/types";

/** One employer shown as a node on its era's orbit. */
export interface OrbitNode {
  era: CareerEraId;
  organization: string;
  title: string;
  period: string;
  /** First year of the role — drives the chronological ignite order. */
  startYear: number;
}

export interface OrbitEra {
  id: CareerEraId;
  name: string;
  color: AccentColor;
}

/** Portrait circle in canvas CSS pixels (origin top-left). */
export interface PortraitCircle {
  centerX: number;
  centerY: number;
  radius: number;
}

export interface HoverInfo {
  node: OrbitNode;
  eraName: string;
  /** Node position in canvas CSS pixels. */
  x: number;
  y: number;
}

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  eras: OrbitEra[];
  nodes: OrbitNode[];
  measurePortrait: () => PortraitCircle | null;
  reducedMotion: boolean;
  onHover: (info: HoverInfo | null) => void;
}

// ---- Tuning constants (Commander E-11: no magic numbers) --------------------
const MAX_PIXEL_RATIO = 2;
/** Orbit radius of era i = portrait radius × (BASE + i × STEP). */
const ORBIT_RADIUS_BASE = 1.14;
const ORBIT_RADIUS_STEP = 0.12;
/**
 * Orbit tilt (radians): X makes the ellipse, Z gives each orbit its own angle.
 * X is NEGATIVE so the upper arc recedes behind the head and the lower arc
 * passes in front of the body — never across the face.
 */
const ORBIT_TILTS: ReadonlyArray<{ x: number; z: number }> = [
  { x: -1.16, z: -0.42 },
  { x: -1.3, z: 0.08 },
  { x: -1.02, z: 0.52 },
];
/** Orbit spin (rad/s) — slow, alternating directions. */
const ORBIT_SPIN = [0.05, -0.036, 0.028];
const CORE_TUBE_PX = 1.1;
const GLOW_TUBE_PX = 5;
const TORUS_RADIAL_SEGMENTS = 8;
const TORUS_TUBULAR_SEGMENTS = 256;
const NODE_RADIUS_PX = 7;
const NODE_HALO_PX = 70;
/** 4-point light flare around each node. */
const NODE_FLARE_PX = 54;
const NODE_FLARE_SPIN = 0.35;
/** Expanding "signal" pulse: starts at the node size, grows ×PULSE_GROWTH while fading. */
const NODE_PULSE_PX = 18;
const NODE_PULSE_GROWTH = 3.2;
const NODE_PULSE_PERIOD_S = 2.6;
const NODE_HIT_RADIUS_PX = 22;
const DUST_COUNT = 140;
const DUST_SIZE_PX = 2;
const RIM_GLOW_SCALE = 2.7;
const PARALLAX_MAX_RAD = 0.1;
const PARALLAX_EASE = 0.06;
const MAX_FRAME_DT_S = 0.05;
const HOVER_MIN_MOVE_PX = 0.5;
// Intro choreography (seconds)
const INTRO_GLOW_DURATION = 0.8;
const INTRO_RING_DELAY = 0.15;
const INTRO_RING_STAGGER = 0.2;
const INTRO_RING_DURATION = 0.7;
const INTRO_NODE_DELAY = 0.7;
const INTRO_NODE_STAGGER = 0.09;
const INTRO_NODE_DURATION = 0.35;
const INTRO_END = 2.2;

const TOKEN_FOR_COLOR: Record<AccentColor, string> = {
  primary: "--primary",
  accent: "--accent",
  purple: "--accent-purple",
  amber: "--accent-amber",
};

/** Read an HSL design token ("210 82% 55%") from :root into a THREE.Color. */
function tokenColor(token: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const match = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(raw);
  const color = new THREE.Color();
  if (!match) return color.setHSL(0.58, 0.8, 0.55);
  return color.setHSL(Number(match[1]) / 360, Number(match[2]) / 100, Number(match[3]) / 100);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

/** Overshoot pop 0 → 1.25 → 1 for node ignition. */
function easeOutBack(t: number): number {
  const c = 1.9;
  const x = Math.min(Math.max(t, 0), 1) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
}

/** Soft radial gradient texture used for halos, the rim light and dust. */
function radialTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Thin glowing circle outline for the node pulse. */
function ringTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.strokeStyle = "rgba(255,255,255,1)";
    context.shadowColor = "rgba(255,255,255,1)";
    context.shadowBlur = 10;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 14, 0, Math.PI * 2);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Four-point star flare (two soft light streaks crossing). */
function flareTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const c = size / 2;
    for (const horizontal of [true, false]) {
      const gradient = horizontal
        ? context.createLinearGradient(0, c, size, c)
        : context.createLinearGradient(c, 0, c, size);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      if (horizontal) context.fillRect(0, c - 1.5, size, 3);
      else context.fillRect(c - 1.5, 0, 3, size);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface Orbit {
  era: OrbitEra;
  tilt: THREE.Group;
  spinner: THREE.Group;
  core: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  glow: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  coreOpacity: number;
  glowOpacity: number;
}

interface NodeVisual {
  data: OrbitNode;
  eraName: string;
  anchor: THREE.Group;
  dot: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  halo: THREE.Sprite;
  flare: THREE.Sprite;
  pulse: THREE.Sprite;
  hit: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  igniteAt: number;
  phase: number;
}

/** Owns the renderer, the scene graph and the animation loop. */
export class ExecutivePresenceScene {
  private readonly options: SceneOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000);
  private readonly anchor = new THREE.Group(); // positioned at the portrait centre
  private readonly parallax = new THREE.Group(); // rotated by the pointer
  private readonly occluder: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  private readonly rimGlow: THREE.Sprite;
  private readonly dust: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private readonly texture = radialTexture();
  private readonly ringMap = ringTexture();
  private readonly flareMap = flareTexture();
  private readonly raycaster = new THREE.Raycaster();
  private readonly orbits: Orbit[] = [];
  private readonly nodes: NodeVisual[] = [];
  private readonly clock = new THREE.Clock(false);
  private portrait: PortraitCircle = { centerX: 0, centerY: 0, radius: 100 };
  private width = 1;
  private height = 1;
  private elapsed = 0;
  private frameId: number | null = null;
  private running = false;
  private pointerTarget = new THREE.Vector2();
  private hovered: NodeVisual | null = null;
  private dustOpacity = 0.45;
  private lastHoverPosition: { x: number; y: number } | null = null;

  constructor(options: SceneOptions) {
    this.options = options;
    this.renderer = new THREE.WebGLRenderer({ canvas: options.canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    this.camera.position.set(0, 0, 2000);

    // Depth-only disc: hides whatever is behind the portrait without drawing colour.
    this.occluder = new THREE.Mesh(
      new THREE.CircleGeometry(1, 96),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true }),
    );
    this.occluder.renderOrder = -1;

    this.rimGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.texture, transparent: true, depthWrite: false, opacity: 0 }),
    );
    this.rimGlow.position.z = -1500;

    this.dust = this.createDust();

    this.anchor.add(this.rimGlow, this.occluder, this.parallax);
    this.parallax.add(this.dust);
    this.scene.add(this.anchor);

    this.buildOrbits();
    this.applyTheme();
    this.resize();

    options.canvas.addEventListener("pointermove", this.handlePointer);
    options.canvas.addEventListener("pointerdown", this.handlePointer);
    options.canvas.addEventListener("pointerleave", this.handlePointerLeave);

    if (options.reducedMotion) this.elapsed = INTRO_END;
  }

  /** Start (or resume) the animation loop. Reduced motion renders one still frame. */
  start(): void {
    if (this.options.reducedMotion) {
      this.update(0);
      this.renderer.render(this.scene, this.camera);
      return;
    }
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.update(Math.min(this.clock.getDelta(), MAX_FRAME_DT_S));
      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  /** Pause the loop (hero off-screen or tab hidden). */
  stop(): void {
    this.running = false;
    this.clock.stop();
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  /** Re-measure canvas and portrait after a layout change. */
  resize(): void {
    const { canvas } = this.options;
    this.width = Math.max(canvas.clientWidth, 1);
    this.height = Math.max(canvas.clientHeight, 1);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();

    const measured = this.options.measurePortrait();
    if (measured) this.portrait = measured;
    const radius = this.portrait.radius;
    this.anchor.position.set(this.portrait.centerX - this.width / 2, this.height / 2 - this.portrait.centerY, 0);
    this.occluder.scale.setScalar(radius);
    this.rimGlow.scale.setScalar(radius * RIM_GLOW_SCALE);
    this.orbits.forEach((orbit, index) => {
      const orbitRadius = radius * (ORBIT_RADIUS_BASE + index * ORBIT_RADIUS_STEP);
      orbit.core.geometry.dispose();
      orbit.glow.geometry.dispose();
      orbit.core.geometry = new THREE.TorusGeometry(orbitRadius, CORE_TUBE_PX, TORUS_RADIAL_SEGMENTS, TORUS_TUBULAR_SEGMENTS);
      orbit.glow.geometry = new THREE.TorusGeometry(orbitRadius, GLOW_TUBE_PX, TORUS_RADIAL_SEGMENTS, TORUS_TUBULAR_SEGMENTS);
    });
    this.placeNodes();
    this.dust.scale.setScalar(radius);
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  /** Re-read colour tokens and blending after a light/dark theme switch. */
  applyTheme(): void {
    const dark = document.documentElement.classList.contains("dark");
    // Additive light only reads on a dark background; on white it would vanish.
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    const eraColor = new Map(this.options.eras.map((era) => [era.id, tokenColor(TOKEN_FOR_COLOR[era.color])]));

    for (const orbit of this.orbits) {
      const color = eraColor.get(orbit.era.id) ?? new THREE.Color();
      orbit.core.material.color.copy(color);
      orbit.glow.material.color.copy(color);
      orbit.core.material.blending = blending;
      orbit.glow.material.blending = blending;
      orbit.coreOpacity = dark ? 0.9 : 0.75;
      orbit.glowOpacity = dark ? 0.12 : 0.1;
      orbit.core.material.needsUpdate = true;
      orbit.glow.material.needsUpdate = true;
    }
    for (const node of this.nodes) {
      const color = eraColor.get(node.data.era) ?? new THREE.Color();
      // White-hot core on dark; saturated core on light so it still pops on white.
      node.dot.material.color.copy(color).lerp(new THREE.Color(0xffffff), dark ? 0.7 : 0.05);
      for (const sprite of [node.halo, node.flare, node.pulse]) {
        (sprite.material as THREE.SpriteMaterial).color.copy(color);
        (sprite.material as THREE.SpriteMaterial).blending = blending;
      }
      (node.flare.material as THREE.SpriteMaterial).color.lerp(new THREE.Color(0xffffff), dark ? 0.5 : 0);
    }
    const rimColor = tokenColor(TOKEN_FOR_COLOR.primary);
    (this.rimGlow.material as THREE.SpriteMaterial).color.copy(rimColor);
    (this.rimGlow.material as THREE.SpriteMaterial).blending = blending;
    this.dust.material.color.copy(tokenColor(TOKEN_FOR_COLOR.accent));
    this.dust.material.blending = blending;
    this.dustOpacity = dark ? 0.45 : 0.3;
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  /** Free every GPU resource and listener. */
  dispose(): void {
    this.stop();
    const { canvas } = this.options;
    canvas.removeEventListener("pointermove", this.handlePointer);
    canvas.removeEventListener("pointerdown", this.handlePointer);
    canvas.removeEventListener("pointerleave", this.handlePointerLeave);
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Sprite) {
        object.geometry.dispose();
        const material = object.material as THREE.Material | THREE.Material[];
        (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
      }
    });
    this.texture.dispose();
    this.ringMap.dispose();
    this.flareMap.dispose();
    this.renderer.dispose();
  }

  // ---- construction ---------------------------------------------------------

  private buildOrbits(): void {
    const chronological = [...this.options.nodes].sort((a, b) => a.startYear - b.startYear);
    this.options.eras.forEach((era, index) => {
      const tilt = new THREE.Group();
      const tiltValues = ORBIT_TILTS[index % ORBIT_TILTS.length];
      tilt.rotation.set(tiltValues.x, 0, tiltValues.z);
      const spinner = new THREE.Group();
      tilt.add(spinner);

      const core = new THREE.Mesh(
        new THREE.TorusGeometry(1, CORE_TUBE_PX, TORUS_RADIAL_SEGMENTS, TORUS_TUBULAR_SEGMENTS),
        new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }),
      );
      const glow = new THREE.Mesh(
        new THREE.TorusGeometry(1, GLOW_TUBE_PX, TORUS_RADIAL_SEGMENTS, TORUS_TUBULAR_SEGMENTS),
        new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }),
      );
      tilt.add(core, glow);
      this.parallax.add(tilt);
      this.orbits.push({ era, tilt, spinner, core, glow, coreOpacity: 0.9, glowOpacity: 0.12 });

      for (const data of this.options.nodes.filter((node) => node.era === era.id)) {
        const anchor = new THREE.Group();
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(NODE_RADIUS_PX, 16, 12),
          new THREE.MeshBasicMaterial({ transparent: true }),
        );
        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: this.texture, transparent: true, depthWrite: false, opacity: 0 }),
        );
        halo.scale.setScalar(NODE_HALO_PX);
        const flare = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: this.flareMap, transparent: true, depthWrite: false, opacity: 0 }),
        );
        flare.scale.setScalar(NODE_FLARE_PX);
        const pulse = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: this.ringMap, transparent: true, depthWrite: false, opacity: 0 }),
        );
        // Invisible, larger sphere so the node is easy to hover or tap.
        const hit = new THREE.Mesh(
          new THREE.SphereGeometry(NODE_HIT_RADIUS_PX, 8, 6),
          new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 }),
        );
        anchor.add(halo, pulse, flare, dot, hit);
        spinner.add(anchor);
        const order = chronological.indexOf(data);
        this.nodes.push({
          data,
          eraName: era.name,
          anchor,
          dot,
          halo,
          flare,
          pulse,
          hit,
          igniteAt: INTRO_NODE_DELAY + order * INTRO_NODE_STAGGER,
          phase: order * 0.9,
        });
      }
    });
  }

  /** Spread each era's nodes evenly around its orbit. */
  private placeNodes(): void {
    this.orbits.forEach((orbit, index) => {
      const orbitRadius = this.portrait.radius * (ORBIT_RADIUS_BASE + index * ORBIT_RADIUS_STEP);
      const eraNodes = this.nodes.filter((node) => node.data.era === orbit.era.id);
      eraNodes.forEach((node, k) => {
        const angle = (index * Math.PI) / 3 + (k * 2 * Math.PI) / Math.max(eraNodes.length, 1);
        node.anchor.position.set(orbitRadius * Math.cos(angle), orbitRadius * Math.sin(angle), 0);
      });
    });
  }

  private createDust(): THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> {
    // Positions are in portrait radii; the group is scaled by the radius on resize.
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 1.05 + Math.random() * 0.55;
      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = Math.sin(angle) * distance;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: DUST_SIZE_PX,
        sizeAttenuation: false,
        map: this.texture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    );
  }

  // ---- per frame -----------------------------------------------------------------

  private update(dt: number): void {
    this.elapsed += dt;
    const t = this.elapsed;

    const glowIn = easeOutCubic(t / INTRO_GLOW_DURATION);
    (this.rimGlow.material as THREE.SpriteMaterial).opacity = 0.55 * glowIn * (0.92 + 0.08 * Math.sin(t * 0.9));
    this.dust.rotation.z += dt * 0.012;

    this.orbits.forEach((orbit, index) => {
      const progress = easeOutCubic((t - INTRO_RING_DELAY - index * INTRO_RING_STAGGER) / INTRO_RING_DURATION);
      const scale = 0.82 + 0.18 * progress;
      orbit.core.scale.setScalar(scale);
      orbit.glow.scale.setScalar(scale);
      orbit.spinner.scale.setScalar(scale);
      orbit.core.material.opacity = orbit.coreOpacity * progress;
      orbit.glow.material.opacity = orbit.glowOpacity * progress;
      orbit.spinner.rotation.z += dt * ORBIT_SPIN[index % ORBIT_SPIN.length];
    });
    this.dust.material.opacity = this.dustOpacity * glowIn;

    for (const node of this.nodes) {
      const ignite = (t - node.igniteAt) / INTRO_NODE_DURATION;
      const pop = ignite <= 0 ? 0 : easeOutBack(ignite);
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.6 + node.phase);
      const emphasis = node === this.hovered ? 1.6 : 1;
      const visible = Math.min(Math.max(ignite, 0), 1);
      node.dot.scale.setScalar(Math.max(pop, 0.0001) * emphasis);
      node.dot.material.opacity = visible;
      (node.halo.material as THREE.SpriteMaterial).opacity = visible * 0.85 * pulse * Math.min(emphasis, 1.2);
      node.halo.scale.setScalar(NODE_HALO_PX * (0.9 + 0.1 * pulse) * emphasis);
      (node.flare.material as THREE.SpriteMaterial).opacity = visible * 0.75 * pulse;
      (node.flare.material as THREE.SpriteMaterial).rotation = t * NODE_FLARE_SPIN + node.phase;
      node.flare.scale.setScalar(NODE_FLARE_PX * Math.max(pop, 0.0001) * emphasis);
      // Signal pulse: expands and fades, staggered per node.
      const cycle = ((t + node.phase) % NODE_PULSE_PERIOD_S) / NODE_PULSE_PERIOD_S;
      node.pulse.scale.setScalar(NODE_PULSE_PX * (1 + cycle * (NODE_PULSE_GROWTH - 1)));
      (node.pulse.material as THREE.SpriteMaterial).opacity = visible * (1 - cycle) * 0.8;
    }

    if (this.hovered) this.reportHover(this.hovered);

    if (!this.options.reducedMotion) {
      this.parallax.rotation.x += (this.pointerTarget.y * PARALLAX_MAX_RAD - this.parallax.rotation.x) * PARALLAX_EASE;
      this.parallax.rotation.y += (this.pointerTarget.x * PARALLAX_MAX_RAD - this.parallax.rotation.y) * PARALLAX_EASE;
    }
  }

  // ---- interaction ---------------------------------------------------------------

  private readonly handlePointer = (event: PointerEvent): void => {
    const rect = this.options.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    if (event.pointerType === "mouse") this.pointerTarget.set(ndc.x, -ndc.y);

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.nodes.map((node) => node.hit), false);
    const hit = hits.find((candidate) => this.isVisibleNode(candidate));
    const node = hit ? this.nodes.find((candidate) => candidate.hit === hit.object) ?? null : null;
    this.setHovered(node);
  };

  private readonly handlePointerLeave = (): void => {
    this.pointerTarget.set(0, 0);
    this.setHovered(null);
  };

  /** Tell React where the hovered node is, so the label follows it as it orbits. */
  private reportHover(node: NodeVisual): void {
    const world = node.anchor.getWorldPosition(new THREE.Vector3());
    const x = world.x + this.width / 2;
    const y = this.height / 2 - world.y;
    const last = this.lastHoverPosition;
    // Skip sub-pixel moves: avoids a React re-render every frame for nothing.
    if (last && Math.abs(last.x - x) < HOVER_MIN_MOVE_PX && Math.abs(last.y - y) < HOVER_MIN_MOVE_PX) return;
    this.lastHoverPosition = { x, y };
    this.options.onHover({ node: node.data, eraName: node.eraName, x, y });
  }

  /** A node hidden behind the portrait must not be hoverable. */
  private isVisibleNode(hit: THREE.Intersection): boolean {
    const world = new THREE.Vector3();
    hit.object.getWorldPosition(world);
    const local = world.clone().sub(this.anchor.getWorldPosition(new THREE.Vector3()));
    const insidePortrait = Math.hypot(local.x, local.y) < this.portrait.radius;
    return !(insidePortrait && local.z < 0);
  }

  private setHovered(node: NodeVisual | null): void {
    if (node === this.hovered) return;
    this.hovered = node;
    this.lastHoverPosition = null;
    this.options.canvas.style.cursor = node ? "pointer" : "default";
    if (!node) {
      this.options.onHover(null);
      return;
    }
    this.reportHover(node);
    if (!this.running) {
      this.update(0);
      this.renderer.render(this.scene, this.camera);
    }
  }
}
