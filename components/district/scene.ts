import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { parcels, parcelCondition } from './parcels';
import type { State } from '../../engine/model';
export type DistrictView = {
  update: (state: State) => void;
  select: (index: number) => void;
  reset: () => void;
  zoom: (factor: number) => void;
  rotate: (angle: number) => void;
  dispose: () => void;
};
export function createDistrict(
  host: HTMLElement,
  state: State,
  onSelect: (index: number) => void,
): DistrictView {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(11, 12, 14);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.2, 0);
  controls.minDistance = 8;
  controls.maxDistance = 27;
  controls.maxPolarAngle = Math.PI / 2.25;
  controls.minPolarAngle = 0.16;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.update();
  controls.saveState();
  const hemi = new THREE.HemisphereLight('#e5f5ff', '#586270', 3);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffddb0', 4);
  sun.position.set(-6, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  const world = new THREE.Group();
  scene.add(world);
  let selected = 0;
  let pickables: THREE.Object3D[] = [];
  let outline: THREE.Mesh | undefined;
  let disposed = false;
  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };
  const mat = (color: string | THREE.Color) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  function mesh(
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = world,
  ) {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  function box(
    w: number,
    h: number,
    d: number,
    color: string | THREE.Color,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = world,
  ) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat(color), x, y, z, parent);
  }
  function release(root: THREE.Object3D) {
    const gs = new Set<THREE.BufferGeometry>(),
      ms = new Set<THREE.Material>();
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        gs.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          ms.add(m);
      }
    });
    gs.forEach((g) => g.dispose());
    ms.forEach((m) => m.dispose());
    root.clear();
  }
  function tree(x: number, z: number, health: number, parent: THREE.Object3D) {
    mesh(
      new THREE.CylinderGeometry(0.035, 0.055, 0.45, 6),
      mat('#826146'),
      x,
      0.32,
      z,
      parent,
    );
    mesh(
      new THREE.IcosahedronGeometry(0.28 + health * 0.17, 1),
      mat(new THREE.Color('#6b6552').lerp(new THREE.Color('#43856d'), health)),
      x,
      0.75,
      z,
      parent,
    );
  }
  function rebuild(s: State) {
    release(world);
    pickables = [];
    box(11.8, 0.36, 9.6, '#283947', 0, -0.32, 0);
    box(11.5, 0.08, 9.3, '#c2b390', 0, -0.1, 0);
    box(11.2, 0.015, 0.5, '#57716e', 0, -0.045, -1.22);
    box(11.2, 0.015, 0.5, '#57716e', 0, -0.045, 1.4);
    box(0.55, 0.016, 8.7, '#57716e', -1.75, -0.043, 0);
    box(0.55, 0.016, 8.7, '#57716e', 1.75, -0.043, 0);
    parcels.forEach((p, i) => {
      const health = parcelCondition(s, i);
      const block = new THREE.Group();
      block.position.set(p.x, 0, p.z);
      block.userData.parcel = i;
      world.add(block);
      const color = new THREE.Color('#827f77').lerp(
        new THREE.Color(p.color),
        0.18 + health * 0.82,
      );
      const pad = box(p.width, 0.1, p.depth, color, 0, 0.015, 0, block);
      pad.userData.parcel = i;
      if (p.kind === 'park') {
        box(p.width - 0.25, 0.05, p.depth - 0.2, '#798c6c', 0, 0.09, 0, block);
        const count = 2 + Math.round(health * 5);
        for (let j = 0; j < count; j++)
          tree(
            -0.95 + (j % 3) * 0.9,
            -0.5 + Math.floor(j / 3) * 0.5,
            health,
            block,
          );
        box(1.45, 0.09, 0.2, '#c8bb94', 0, 0.16, 0.63, block);
      } else if (p.kind === 'landmark') {
        box(1.65, 0.65, 1.1, '#e3d6b6', 0, 0.4, 0, block);
        box(1.8, 0.1, 1.2, '#b79d6b', 0, 0.76, 0, block);
        mesh(
          new THREE.SphereGeometry(
            0.53,
            24,
            12,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ),
          mat('#c99a37'),
          0,
          0.82,
          0,
          block,
        );
        mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8),
          mat('#e2bc66'),
          0,
          1.49,
          0,
          block,
        );
        for (const x of [-0.85, 0.85]) {
          mesh(
            new THREE.CylinderGeometry(0.1, 0.13, 1.15, 8),
            mat('#e4d6b5'),
            x,
            0.65,
            -0.43,
            block,
          );
          mesh(
            new THREE.ConeGeometry(0.17, 0.25, 8),
            mat('#c99a37'),
            x,
            1.35,
            -0.43,
            block,
          );
        }
        for (const x of [-0.5, 0, 0.5])
          box(0.19, 0.34, 0.03, '#35595b', x, 0.28, 0.566, block);
      } else {
        const count = p.width > 3 ? 5 : 3;
        const w = (p.width - 0.32) / count;
        for (let j = 0; j < count; j++) {
          const x = -p.width / 2 + 0.16 + w * (j + 0.5);
          const h = 0.85 + (j % 2) * 0.18;
          const facade = color
            .clone()
            .lerp(new THREE.Color('#ecdfb9'), (j % 3) * 0.14);
          box(w - 0.04, h, 1.1, facade, x, h / 2 + 0.09, -0.13, block);
          const roof = mesh(
            new THREE.CylinderGeometry(0.6, 0.6, w - 0.015, 3, 1),
            mat('#865b48'),
            x,
            h + 0.14,
            -0.13,
            block,
          );
          roof.rotation.z = Math.PI / 2;
          roof.rotation.x = Math.PI / 2;
          roof.scale.set(0.62, 1, 1.13);
          box(w - 0.04, 0.07, 0.22, '#e1d4b6', x, h * 0.53, 0.51, block);
          const open = (j + 0.35) / count < health;
          box(
            w * 0.57,
            0.34,
            0.035,
            open ? '#254b4b' : '#75716a',
            x,
            0.29,
            0.434,
            block,
          );
          box(
            w * 0.64,
            0.065,
            0.28,
            open ? p.color : '#77766f',
            x,
            0.51,
            0.56,
            block,
          );
          for (const dx of [-0.2, 0.2]) {
            box(
              w * 0.2,
              0.25,
              0.035,
              '#315657',
              x + w * dx,
              h * 0.76,
              0.435,
              block,
            );
          }
          box(
            0.04,
            h,
            0.05,
            '#e9dcc1',
            x - w * 0.45,
            h / 2 + 0.09,
            0.43,
            block,
          );
        }
      }
      const has = (id: string) => s.investments?.some((x) => x === id);
      // Policy symbols illustrate investment, not surveyed buildings or individual outcomes.
      if (p.id === 'arab' && (has('rent_covenant') || has('land_trust'))) {
        box(
          0.5,
          0.28,
          0.035,
          health > 0.4 ? '#e6b948' : '#85765d',
          0,
          0.3,
          p.depth * 0.43,
          block,
        );
        box(0.035, 0.3, 0.035, '#735944', -0.19, 0.15, p.depth * 0.43, block);
        box(0.035, 0.3, 0.035, '#735944', 0.19, 0.15, p.depth * 0.43, block);
      }
      if (p.id === 'trades' && has('trade_grant')) {
        box(0.9, 0.08, 0.32, '#c5915b', 0, 0.25, 0.64, block);
        for (const x of [-0.35, 0.35]) {
          box(0.08, 0.2, 0.08, '#765432', x, 0.12, 0.64, block);
          mesh(
            new THREE.CylinderGeometry(0.065, 0.08, 0.23, 8),
            mat(health > 0.4 ? '#5fc5b3' : '#81766a'),
            x,
            0.22,
            0.92,
            block,
          );
          mesh(
            new THREE.SphereGeometry(0.075, 8, 6),
            mat('#c69c73'),
            x,
            0.39,
            0.92,
            block,
          );
        }
        box(0.6, 0.018, 0.22, '#567bb5', 0, 0.3, 0.64, block);
      }
      if (
        (p.id === 'shade' || p.id === 'food') &&
        (has('cooling_retrofit') || has('pedestrianise'))
      ) {
        for (const x of [-0.65, 0.65])
          box(0.045, 0.72, 0.045, '#85948d', x, 0.42, 0.4, block);
        box(
          1.6,
          0.06,
          0.72,
          health > 0.4 ? '#6fbcb0' : '#86887c',
          0,
          0.81,
          0.4,
          block,
        );
      }
      if (p.id === 'commons' && (has('land_trust') || has('visitor_levy'))) {
        box(0.7, 0.08, 0.4, '#bd9663', 0, 0.26, 0.82, block);
        for (const x of [-0.5, 0.5])
          box(0.22, 0.16, 0.22, '#78ac9b', x, 0.15, 0.82, block);
      }
      if (p.id === 'bussorah' && has('adaptive_reuse')) {
        box(0.6, 0.18, 0.04, '#828fc7', 0, 0.7, 0.46, block);
      }
      if (p.id === 'food' && has('night_economy')) {
        for (const x of [-1.2, -0.6, 0, 0.6, 1.2])
          mesh(
            new THREE.SphereGeometry(0.055, 6, 4),
            mat('#ffbf55'),
            x,
            1.4,
            0.5,
            block,
          );
      }
      // Activity markers are illustrative, not counts of real residents.
      for (let j = 0; j < Math.round(s.vitality * 4); j++) {
        const x = -p.width * 0.35 + j * 0.38;
        mesh(
          new THREE.CylinderGeometry(0.035, 0.04, 0.13, 5),
          mat(j % 2 ? '#d9a323' : '#456d81'),
          x,
          0.15,
          p.depth * 0.4,
          block,
        );
        mesh(
          new THREE.SphereGeometry(0.047, 6, 4),
          mat('#bb8d68'),
          x,
          0.26,
          p.depth * 0.4,
          block,
        );
      }
      block.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.userData.parcel = i;
          pickables.push(o);
        }
      });
    });
    const ring = new THREE.MeshBasicMaterial({
      color: '#ffe2a0',
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    outline = mesh(new THREE.PlaneGeometry(1, 1), ring, 0, 0.09, 0);
    outline.rotation.x = -Math.PI / 2;
    outline.castShadow = false;
    highlight();
    render();
  }
  function highlight() {
    if (!outline) return;
    const p = parcels[selected];
    outline.position.set(p.x, 0.077, p.z);
    outline.scale.set(p.width + 0.13, p.depth + 0.13, 1);
  }
  const resize = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  controls.addEventListener('change', render);
  let down = { x: 0, y: 0 };
  const pointerDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const pointerUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    const hit = ray.intersectObjects(pickables, false)[0];
    if (hit) {
      selected = hit.object.userData.parcel;
      highlight();
      render();
      onSelect(selected);
    }
  };
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  const lost = (e: Event) => {
    e.preventDefault();
  };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  const restored = () => render();
  renderer.domElement.addEventListener('webglcontextrestored', restored);
  rebuild(state);
  resize();
  return {
    update: rebuild,
    select(i) {
      selected = i;
      highlight();
      render();
    },
    reset() {
      controls.reset();
      render();
    },
    zoom(f) {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(
        THREE.MathUtils.clamp(
          offset.length() * f,
          controls.minDistance,
          controls.maxDistance,
        ),
      );
      camera.position.copy(controls.target).add(offset);
      controls.update();
      render();
    },
    rotate(angle) {
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      render();
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('webglcontextrestored', restored);
      release(world);
      sun.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
