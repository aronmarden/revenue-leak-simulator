import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PRIMARY = 0x1ce783;
const CYAN = 0x00e5ff;
const RED = 0xff3344;
const AMBER = 0xffaa00;

const STATUS_COLORS = {
  success: PRIMARY,
  warning: AMBER,
  critical: RED,
  unknown: PRIMARY,
};

export function createScene(canvas, initialLevels = []) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'default' });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000508);

  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(10, 6, 12);
  camera.lookAt(0, 3, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 8;
  controls.maxDistance = 28;
  controls.target.set(0, 3, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  scene.add(new THREE.AmbientLight(0x0a1510, 0.3));

  const spineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0, 7.5, 0),
  ]);
  const spineMat = new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.35 });
  scene.add(new THREE.Line(spineGeo, spineMat));

  const coreGeo = new THREE.IcosahedronGeometry(0.3, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.2, wireframe: true });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 3.5;
  scene.add(core);

  const coreGlow = new THREE.PointLight(PRIMARY, 1.5, 15);
  coreGlow.position.y = 3.5;
  scene.add(coreGlow);

  const containGeo = new THREE.TorusGeometry(5, 0.02, 8, 64);
  const containMat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.08 });
  const containRing = new THREE.Mesh(containGeo, containMat);
  containRing.rotation.x = Math.PI / 2;
  containRing.position.y = -0.2;
  scene.add(containRing);

  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 150;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 20;
    dustPos[i * 3 + 1] = Math.random() * 10;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: PRIMARY, size: 0.025, transparent: true, opacity: 0.2 });
  const dustMesh = new THREE.Points(dustGeo, dustMat);
  scene.add(dustMesh);

  const dataParticles = [];
  for (let i = 0; i < 15; i++) {
    const geo = new THREE.SphereGeometry(0.06, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { offset: Math.random(), speed: 0.15 + Math.random() * 0.2 };
    scene.add(mesh);
    dataParticles.push({ mesh, mat });
  }

  const sectionMaterials = {};
  const sectionLights = {};
  const levelGroups = [];

  function buildFunnelLevels(levels) {
    levelGroups.forEach(g => scene.remove(g));
    levelGroups.length = 0;
    Object.keys(sectionLights).forEach(k => {
      scene.remove(sectionLights[k]);
      delete sectionLights[k];
      delete sectionMaterials[k];
    });

    levels.forEach(lev => {
      const group = new THREE.Group();
      const geo = new THREE.CylinderGeometry(lev.radius, lev.radius, lev.height, 6, 1, false);
      const edges = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.6 });
      const wireframe = new THREE.LineSegments(edges, wireMat);
      wireframe.position.y = lev.y + lev.height / 2;
      group.add(wireframe);

      const fillMat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.02, side: THREE.DoubleSide, depthWrite: false });
      const fill = new THREE.Mesh(geo, fillMat);
      fill.position.y = lev.y + lev.height / 2;
      group.add(fill);

      const topGeo = new THREE.CircleGeometry(lev.radius, 6);
      const topMat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.035, side: THREE.DoubleSide, depthWrite: false });
      const top = new THREE.Mesh(topGeo, topMat);
      top.rotation.x = -Math.PI / 2;
      top.position.y = lev.y + lev.height;
      group.add(top);

      const ringGeo = new THREE.RingGeometry(lev.radius - 0.05, lev.radius + 0.05, 6);
      const ringMat = new THREE.MeshBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = lev.y + lev.height;
      group.add(ring);

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const points = [
          new THREE.Vector3(0, lev.y + 0.01, 0),
          new THREE.Vector3(Math.cos(angle) * lev.radius, lev.y + 0.01, Math.sin(angle) * lev.radius),
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.1 })));
      }

      scene.add(group);
      levelGroups.push(group);
      sectionMaterials[lev.id] = { wireMat, fillMat, topMat, ringMat };

      const light = new THREE.PointLight(PRIMARY, 0.3, 4);
      light.position.set(lev.radius * 0.5, lev.y + lev.height / 2, 0);
      scene.add(light);
      sectionLights[lev.id] = light;
    });
  }

  if (initialLevels.length) buildFunnelLevels(initialLevels);

  function setSectionColor(id, color, intensity) {
    const m = sectionMaterials[id];
    if (!m) return;
    m.wireMat.color.setHex(color);
    m.wireMat.opacity = intensity;
    m.fillMat.color.setHex(color);
    m.fillMat.opacity = color === RED ? 0.05 : 0.02;
    m.topMat.color.setHex(color);
    m.topMat.opacity = color === RED ? 0.07 : 0.035;
    m.ringMat.color.setHex(color);
    m.ringMat.opacity = color === RED ? 0.22 : 0.1;
    if (sectionLights[id]) {
      sectionLights[id].color.setHex(color);
      sectionLights[id].intensity = color === RED ? 2.5 : color === AMBER ? 1.5 : 0.3;
    }
  }

  function updateStageStatuses(levels) {
    levels.forEach(lev => {
      const color = STATUS_COLORS[lev.status] || PRIMARY;
      setSectionColor(lev.id, color, lev.status === 'critical' ? 0.8 : 0.6);
    });
  }

  let time = 0;
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30;
  let animationId;

  function animate(now) {
    animationId = requestAnimationFrame(animate);
    if (now - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = now;
    time += 0.033;
    controls.update();

    core.rotation.x = time * 0.4;
    core.rotation.y = time * 0.6;
    containRing.rotation.z = time * 0.08;
    dustMesh.rotation.y = time * 0.02;

    dataParticles.forEach(p => {
      const d = p.mesh.userData;
      d.offset += 0.002 * d.speed;
      if (d.offset > 1) d.offset = 0;
      const t = d.offset;
      const r = 4.0 - 2.8 * t;
      const y = 7.0 - t * 7.5;
      const angle = t * Math.PI * 4 + d.speed * 20;
      p.mesh.position.set(Math.cos(angle) * r * 0.6, y, Math.sin(angle) * r * 0.6);
    });

    coreGlow.color.setHex(PRIMARY);
    coreGlow.intensity = 1.5;
    coreMat.color.setHex(PRIMARY);
    spineMat.color.setHex(PRIMARY);
    spineMat.opacity = 0.35;
    containMat.color.setHex(PRIMARY);
    containMat.opacity = 0.08;

    renderer.render(scene, camera);
  }

  function start() { animate(0); }
  function stop() { if (animationId) cancelAnimationFrame(animationId); }

  function resize(width, height) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function projectToScreen(worldY, width, height) {
    const worldPos = new THREE.Vector3(0, worldY, 0);
    const screenPos = worldPos.clone().project(camera);
    return {
      x: (screenPos.x * 0.5 + 0.5) * width,
      y: (-screenPos.y * 0.5 + 0.5) * height,
    };
  }

  function getParticleScreenPositions(width, height) {
    return dataParticles.map(p => {
      const sp = p.mesh.position.clone().project(camera);
      return {
        x: (sp.x * 0.5 + 0.5) * width,
        y: (-sp.y * 0.5 + 0.5) * height,
        visible: sp.z <= 1,
      };
    });
  }

  return {
    start,
    stop,
    resize,
    buildFunnelLevels,
    setSectionColor,
    updateStageStatuses,
    projectToScreen,
    getParticleScreenPositions,
    STATUS_COLORS,
    PRIMARY,
    CYAN,
    RED,
    AMBER,
  };
}

export function stagesToFunnelLevels(stages) {
  const count = stages.length;
  if (count === 0) return [];
  if (count === 1) return [{ id: stages[0].id, label: stages[0].name, y: 3.5, radius: 3.0, height: 0.8, status: stages[0].status || 'unknown' }];

  const maxRadius = 4.0;
  const minRadius = 1.2;
  const totalHeight = 7.0;

  return stages.map((stage, i) => ({
    id: stage.id,
    label: stage.name,
    y: totalHeight - (i / (count - 1)) * totalHeight,
    radius: maxRadius - (i / (count - 1)) * (maxRadius - minRadius),
    height: 0.8,
    status: stage.status || 'unknown',
  }));
}
