import * as THREE from "three";

const container = document.querySelector("#biology-scene");
const canvas = document.querySelector("#biology-canvas");
const loading = document.querySelector("#scene-loading");

if (container && canvas) {
  try {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const system = new THREE.Group();
    scene.add(system);

function createOrganicGeometry(radius, seed, detail = 4, strength = 0.055) {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const wave =
      Math.sin(x * 8 + seed) *
      Math.cos(y * 7 - seed) *
      Math.sin(z * 9 + seed * 0.7);

    const scale = 1 + wave * strength;
    position.setXYZ(i, x * scale, y * scale, z * scale);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function addTube(group, points, radius, material, segments = 80) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(point => new THREE.Vector3(...point))
  );

  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments, radius, 6, false),
    material
  );

  group.add(tube);
  return tube;
}

function addGlowPoint(group, position, color = 0x9de58c, size = 0.045) {
  const point = new THREE.Mesh(
    new THREE.SphereGeometry(size, 12, 10),
    new THREE.MeshBasicMaterial({ color })
  );

  point.position.set(...position);
  group.add(point);
  return point;
}

    // Iluminación suave para superficies orgánicas.
    scene.add(new THREE.HemisphereLight(0xe5ffe7, 0x173c28, 2.2));

    const keyLight = new THREE.DirectionalLight(0xe5ffe0, 3.1);
    keyLight.position.set(4, 5, 7);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x5fa147, 32, 14);
    rimLight.position.set(-4, 1, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xb4f4d0, 14, 12);
    fillLight.position.set(3, -3, 4);
    scene.add(fillLight);

    const greenMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x5fa147,
      roughness: 0.32,
      metalness: 0.02,
      clearcoat: 0.75,
      clearcoatRoughness: 0.22
    });

    const paleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc3e6b8,
      roughness: 0.25,
      clearcoat: 0.8
    });

    const membraneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8dcf83,
      roughness: 0.22,
      metalness: 0.02,
      transmission: 0.72,
      thickness: 0.55,
      ior: 1.33,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Núcleo biológico central.
    const core = new THREE.Group();
    system.add(core);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 64, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0x356d43,
        roughness: 0.4,
        metalness: 0,
        clearcoat: 0.65
      })
    );
    core.add(nucleus);

    // Membrana externa translúcida.
    const membrane = new THREE.Mesh(
      new THREE.SphereGeometry(1.43, 64, 48),
      membraneMaterial
    );
    core.add(membrane);

    // Estructuras internas con formas y tamaños diferentes.
    const organelleGroup = new THREE.Group();
    core.add(organelleGroup);

    const organelleColors = [0x8bcf75, 0xb4df91, 0x367c52, 0xd0eab3];

    for (let i = 0; i < 12; i++) {
      const angle = i * 2.399;
      const radius = 0.35 + (i % 4) * 0.12;

      const organelle = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + (i % 3) * 0.045, 24, 18),
        new THREE.MeshPhysicalMaterial({
          color: organelleColors[i % organelleColors.length],
          roughness: 0.3,
          clearcoat: 0.6
        })
      );

      organelle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.8,
        ((i % 3) - 1) * 0.28
      );

      organelle.scale.set(1.25, 0.75, 0.8);
      organelleGroup.add(organelle);
    }

    // Filamentos curvos dentro del núcleo.
    const filamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2e8a6,
      roughness: 0.45,
      transparent: true,
      opacity: 0.8
    });

    for (let j = 0; j < 5; j++) {
      const points = [];

      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const angle = t * Math.PI * 2 + j * 1.1;
        const radius = 0.3 + t * 0.42;

        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.35) * radius * 0.7,
          Math.sin(angle * 0.7 + j) * 0.22
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const filament = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 72, 0.018, 5, false),
        filamentMaterial
      );

      organelleGroup.add(filament);
    }

    // Cuatro campos representados por estructuras materiales abstractas.
    const fields = [
      { name: "ALIMENTOS", position: [-2.25, 1.25, 0.15], color: 0xb9d98a, type: 0 },
      { name: "SALUD", position: [2.15, 1.15, -0.35], color: 0x8dc9ad, type: 1 },
      { name: "LIMPIEZA E HIGIENE", position: [-2.2, -1.35, -0.25], color: 0xc4e5df, type: 2 },
      { name: "BIOMATERIALES", position: [2.25, -1.3, 0.3], color: 0x76b85d, type: 3 }
    ];

    const satellites = new THREE.Group();
    system.add(satellites);

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x7cac78,
      transparent: true,
      opacity: 0.34
    });

    const satelliteGroups = [];

    fields.forEach((field, index) => {
      const [x, y, z] = field.position;
      const node = new THREE.Group();
      node.position.set(x, y, z);
      satellites.add(node);
      satelliteGroups.push(node);

      // Línea orbital elíptica.
      const orbitPoints = [];
      for (let i = 0; i <= 120; i++) {
        const t = i / 120 * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
          Math.cos(t) * (0.68 + index * 0.025),
          Math.sin(t) * 0.38,
          0
        ));
      }

      const orbit = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(orbitPoints),
        orbitMaterial
      );
      orbit.rotation.z = index * 0.65;
      node.add(orbit);

      if (field.type === 0) {
        // Microestructura alimentaria: un conjunto de gotas.
        for (let i = 0; i < 5; i++) {
          const drop = new THREE.Mesh(
            new THREE.SphereGeometry(0.14 + (i % 2) * 0.045, 28, 20),
            new THREE.MeshPhysicalMaterial({
              color: field.color,
              roughness: 0.22,
              clearcoat: 1
            })
          );
          const a = i * 2.4;
          drop.position.set(Math.cos(a) * 0.24, Math.sin(a) * 0.22, i % 2 ? 0.1 : -0.1);
          drop.scale.set(0.85, 1.2, 0.9);
          node.add(drop);
        }
      } else if (field.type === 1) {
        // Salud: cápsula de hidrogel estilizada.
        const bead = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.16, 0.34, 8, 20),
          new THREE.MeshPhysicalMaterial({
            color: field.color,
            roughness: 0.18,
            transmission: 0.35,
            thickness: 0.5,
            clearcoat: 1
          })
        );
        bead.rotation.z = 0.65;
        node.add(bead);

        for (let i = 0; i < 4; i++) {
          const cell = new THREE.Mesh(
            new THREE.SphereGeometry(0.065, 16, 12),
            paleMaterial
          );
          cell.position.set((i - 1.5) * 0.13, 0.25 * Math.sin(i), 0.15);
          node.add(cell);
        }
      } else if (field.type === 2) {
        // Limpieza e higiene: una gota transparente con microburbujas.
        const droplet = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 36, 28),
          new THREE.MeshPhysicalMaterial({
            color: field.color,
            roughness: 0.08,
            transmission: 0.9,
            thickness: 0.8,
            ior: 1.33,
            transparent: true,
            opacity: 0.8,
            clearcoat: 1
          })
        );
        droplet.scale.set(0.8, 1.15, 0.8);
        node.add(droplet);

        for (let i = 0; i < 7; i++) {
          const bubble = new THREE.Mesh(
            new THREE.SphereGeometry(0.035 + (i % 2) * 0.018, 12, 10),
            paleMaterial
          );
          const a = i * 2.4;
          bubble.position.set(Math.cos(a) * 0.2, Math.sin(a) * 0.25, 0.1);
          node.add(bubble);
        }
      } else {
        // Biomaterial: un pequeño entramado tridimensional.
        const fiberMaterial = new THREE.MeshStandardMaterial({
          color: field.color,
          roughness: 0.38
        });

        for (let i = 0; i < 4; i++) {
          const fiber = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.04, 0.75, 10),
            fiberMaterial
          );
          fiber.rotation.z = i * Math.PI / 4;
          fiber.rotation.x = i * 0.35;
          node.add(fiber);
        }

        for (let i = 0; i < 5; i++) {
          const joint = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 16, 12),
            paleMaterial
          );
          joint.position.set(
            Math.sin(i * 2) * 0.25,
            Math.cos(i * 1.6) * 0.25,
            Math.sin(i) * 0.2
          );
          node.add(joint);
        }
      }

      // Conexión entre el núcleo y cada campo.
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(x, y, z);
      const middle = start.clone().lerp(end, 0.5);
      middle.z += index % 2 ? 0.35 : -0.35;

      const connectorCurve = new THREE.QuadraticBezierCurve3(start, middle, end);
      const connector = new THREE.Mesh(
        new THREE.TubeGeometry(connectorCurve, 48, 0.009, 5, false),
        new THREE.MeshBasicMaterial({
          color: 0x6d9f67,
          transparent: true,
          opacity: 0.5
        })
      );

      system.add(connector);
    });

    // Partículas pequeñas en el espacio.
    const particleCount = 300;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 7.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x6caa60,
        size: 0.022,
        transparent: true,
        opacity: 0.62,
        sizeAttenuation: true
      })
    );

    system.add(particles);

    // Movimiento lento e interacción con el cursor.
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let width = 1;
    let height = 1;
    let frameId;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      camera.aspect = width / height;
      camera.position.z = width < 500 ? 11.5 : 9.6;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    }

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onPointerLeave() {
      target.x = 0;
      target.y = 0;
    }

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionPreference.addEventListener?.("change", event => {
      reducedMotion = event.matches;
    });

    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const speed = reducedMotion ? 0 : 1;

      pointer.x += (target.x - pointer.x) * 0.035;
      pointer.y += (target.y - pointer.y) * 0.035;

      system.rotation.y = elapsed * 0.075 * speed + pointer.x * 0.16;
      system.rotation.x = Math.sin(elapsed * 0.18) * 0.035 * speed - pointer.y * 0.1;

      core.rotation.y = elapsed * 0.12 * speed;
      core.rotation.x = Math.sin(elapsed * 0.2) * 0.05 * speed;
      organelleGroup.rotation.y = -elapsed * 0.08 * speed;

      membrane.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.008 * speed);

      satelliteGroups.forEach((node, i) => {
        node.position.y = fields[i].position[1] +
          Math.sin(elapsed * 0.65 + i * 1.4) * 0.055 * speed;
        node.rotation.y = elapsed * 0.15 * speed * (i % 2 ? -1 : 1);
      });

      particles.rotation.y = elapsed * 0.012 * speed;

      renderer.render(scene, camera);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    loading?.setAttribute("hidden", "");
    animate();

    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
    }, { once: true });

  } catch (error) {
    console.error("No se pudo iniciar la escena 3D de Novoganic:", error);
    if (loading) {
      loading.textContent = "La visualización 3D no está disponible en este navegador.";
    }
  }
}
