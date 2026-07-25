// Three.js 3D Background & Animation Logic

let scene, camera, renderer, controls;
let clientNode, resourceNode, toolNode, promptNode;
let connections = {}; // Store curve paths
let backgroundParticles;

// Camera targets for each slide (0-indexed)
const cameraTargets = [
    { pos: { x: 0, y: 1, z: 8 }, look: { x: 0, y: 0, z: 0 } },       // Slide 0: Title
    { pos: { x: -3.5, y: 0.8, z: 4.5 }, look: { x: -3, y: 0, z: 0 } },  // Slide 1: What is MCP (Focus Client)
    { pos: { x: 0, y: 4, z: 6 }, look: { x: 0, y: 0, z: 0 } },         // Slide 2: Architecture
    { pos: { x: 1.5, y: 1.5, z: 4.5 }, look: { x: 1, y: 0, z: 0 } },    // Slide 3: Data Flow
    { pos: { x: 0, y: 1.5, z: 7 }, look: { x: 0, y: 0, z: 0 } },        // Slide 4: Interactive Simulator (User control)
    { pos: { x: 2.5, y: -0.8, z: 5 }, look: { x: 0, y: 0, z: 0 } }     // Slide 5: Summary
];

// Current camera lookAt target vector (used for GSAP lerping)
let currentLookAt = new THREE.Vector3(0, 0, 0);

function init3D() {
    const canvas = document.getElementById('three-canvas');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Renderer Setup
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent to show CSS radial gradient background
        antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixelRatio for optimization

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(cameraTargets[0].pos);
    currentLookAt.copy(cameraTargets[0].look);

    // 3. OrbitControls (only enabled on simulator slide)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.enabled = false; // Disable initially

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xbd5eff, 0.6);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 5. Create Scene Nodes
    createNodes();

    // 6. Create Connections
    createConnections();

    // 7. Background Starfield
    createBackgroundParticles();

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);

    // Start Render Loop
    animate();
}

function createNodes() {
    // A. AI CLIENT (Large glowing wireframe sphere on the left)
    const clientGroup = new THREE.Group();
    clientGroup.position.set(-3, 0, 0);

    const innerGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const innerMat = new THREE.MeshPhongMaterial({
        color: 0x00f0ff,
        emissive: 0x00a2ff,
        emissiveIntensity: 0.5,
        shininess: 30,
        flatShading: true
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    clientGroup.add(innerSphere);

    const outerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const outerMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const outerSphere = new THREE.Mesh(outerGeo, outerMat);
    clientGroup.add(outerSphere);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(1.1, 0.02, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xbd5eff,
        transparent: true,
        opacity: 0.4
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 3;
    clientGroup.add(orbitRing);

    scene.add(clientGroup);
    clientNode = clientGroup;

    // B. RESOURCE SERVER (Database Cylinder - Top right)
    const resourceGroup = new THREE.Group();
    resourceGroup.position.set(3, 1.5, -0.5);

    const cylGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.7, 16);
    const cylMat = new THREE.MeshPhongMaterial({
        color: 0x00f5d4,
        emissive: 0x00c4a9,
        emissiveIntensity: 0.3,
        shininess: 40
    });
    const dbCylinder = new THREE.Mesh(cylGeo, cylMat);
    resourceGroup.add(dbCylinder);

    // Mini decorative disk at base
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true });
    const dbBase = new THREE.Mesh(baseGeo, baseMat);
    dbBase.position.y = -0.35;
    resourceGroup.add(dbBase);

    scene.add(resourceGroup);
    resourceNode = resourceGroup;

    // C. TOOL SERVER (Hexagonal Prism / Gear - Middle right)
    const toolGroup = new THREE.Group();
    toolGroup.position.set(3, 0, 0);

    const toolGeo = new THREE.IcosahedronGeometry(0.45, 0);
    const toolMat = new THREE.MeshPhongMaterial({
        color: 0xbd5eff,
        emissive: 0x8a2be2,
        emissiveIntensity: 0.4,
        shininess: 50,
        flatShading: true
    });
    const toolMesh = new THREE.Mesh(toolGeo, toolMat);
    toolGroup.add(toolMesh);

    // Orbiting small cube
    const subGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const subMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const toolSatellite = new THREE.Mesh(subGeo, subMat);
    toolSatellite.position.set(0.7, 0, 0);
    toolGroup.add(toolSatellite);

    scene.add(toolGroup);
    toolNode = toolGroup;
    toolNode.satellite = toolSatellite; // save reference for rotation

    // D. PROMPT SERVER (Chat Shape / Octahedron - Bottom right)
    const promptGroup = new THREE.Group();
    promptGroup.position.set(3, -1.5, 0.5);

    const promptGeo = new THREE.OctahedronGeometry(0.45, 0);
    const promptMat = new THREE.MeshPhongMaterial({
        color: 0xffe600,
        emissive: 0xd4af37,
        emissiveIntensity: 0.3,
        shininess: 30
    });
    const promptMesh = new THREE.Mesh(promptGeo, promptMat);
    promptGroup.add(promptMesh);

    // Orbiting wireframe sphere
    const promptOuterGeo = new THREE.SphereGeometry(0.65, 8, 8);
    const promptOuterMat = new THREE.MeshBasicMaterial({ color: 0xffe600, wireframe: true, transparent: true, opacity: 0.2 });
    const promptOuter = new THREE.Mesh(promptOuterGeo, promptOuterMat);
    promptGroup.add(promptOuter);

    scene.add(promptGroup);
    promptNode = promptGroup;
}

function createConnections() {
    const pClient = clientNode.position;
    
    // Server positions
    const servers = {
        resource: resourceNode.position,
        tool: toolNode.position,
        prompt: promptNode.position
    };

    // Draw a curved line (tube) from client to each server
    Object.keys(servers).forEach(key => {
        const pServer = servers[key];
        
        // Control point for quadratic bezier curve (gives curve upwards or downwards)
        const controlPoint = new THREE.Vector3(
            (pClient.x + pServer.x) / 2,
            (pClient.y + pServer.y) / 2 + (key === 'resource' ? 0.5 : key === 'prompt' ? -0.5 : 0.2),
            (pClient.z + pServer.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(pClient, controlPoint, pServer);
        connections[key] = curve;

        // Render curve as tube
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.015, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: key === 'resource' ? 0x00f5d4 : key === 'tool' ? 0xbd5eff : 0xffe600,
            transparent: true,
            opacity: 0.25
        });
        const tubeLine = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeLine);
    });
}

function createBackgroundParticles() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Random positions inside a bounding box
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 12;
        positions[i + 2] = (Math.random() - 0.7) * 15; // Put most behind the scene nodes

        // Color coding
        colors[i] = 0.5 + Math.random() * 0.5; // Red channel
        colors[i + 1] = 0.8 + Math.random() * 0.2; // Cyanish green
        colors[i + 2] = 1.0; // Blue
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glowing particle texture using raw canvas drawing
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.12,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    backgroundParticles = new THREE.Points(geometry, material);
    scene.add(backgroundParticles);
}

// ----------------------------------------------------
// Animation Triggers
// ----------------------------------------------------

// Animates a glowing data packet along the path
window.trigger3DAnimation = function(type) {
    const curve = connections[type];
    if (!curve) return;

    // Create a small glowing particle sphere
    const pGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const color = type === 'resource' ? 0x00f5d4 : type === 'tool' ? 0xbd5eff : 0xffe600;
    const pMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: false
    });
    
    const packet = new THREE.Mesh(pGeo, pMat);
    scene.add(packet);

    // Light packet helper
    const pLight = new THREE.PointLight(color, 1.5, 2);
    packet.add(pLight);

    // Animate along curve from Client (0) to Server (1)
    const animateData = { progress: 0 };
    
    gsap.to(animateData, {
        progress: 1,
        duration: 0.8,
        ease: "power1.in",
        onUpdate: () => {
            const point = curve.getPointAt(animateData.progress);
            packet.position.copy(point);
        },
        onComplete: () => {
            // Pulse Server node slightly on collision
            let targetNode = type === 'resource' ? resourceNode : type === 'tool' ? toolNode : promptNode;
            gsap.to(targetNode.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.1, yoyo: true, repeat: 1 });

            // Animate back to client
            gsap.to(animateData, {
                progress: 0,
                duration: 0.8,
                delay: 0.1,
                ease: "power1.out",
                onUpdate: () => {
                    const point = curve.getPointAt(animateData.progress);
                    packet.position.copy(point);
                },
                onComplete: () => {
                    // Pulse Client on return
                    gsap.to(clientNode.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.1, yoyo: true, repeat: 1 });
                    
                    // Clean up resources
                    scene.remove(packet);
                    pGeo.dispose();
                    pMat.dispose();
                }
            });
        }
    });
};

// Periodic auto-packets on Slide 3 (Data Flow)
let dataFlowInterval = null;
function startAutoPackets() {
    if (dataFlowInterval) return;
    
    const types = ['resource', 'tool', 'prompt'];
    let counter = 0;
    
    dataFlowInterval = setInterval(() => {
        const type = types[counter % 3];
        window.trigger3DAnimation(type);
        counter++;
    }, 2000);
}

function stopAutoPackets() {
    if (dataFlowInterval) {
        clearInterval(dataFlowInterval);
        dataFlowInterval = null;
    }
}

// Handler for slide change events (moves camera smoothly)
window.onSlideChange = function(slideIndex) {
    const target = cameraTargets[slideIndex];
    if (!target) return;

    // Enable OrbitControls only on the Interactive Simulator (Slide 4)
    if (slideIndex === 4) {
        controls.enabled = true;
        // Prompt user interaction on control setup
    } else {
        controls.enabled = false;
    }

    // Animate camera position
    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, {
        x: target.pos.x,
        y: target.pos.y,
        z: target.pos.z,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
            if (slideIndex !== 4) {
                // Keep controls target synced during transition so lookAt doesn't snap
                controls.target.copy(currentLookAt);
            }
        }
    });

    // Animate lookAt point
    gsap.killTweensOf(currentLookAt);
    gsap.to(currentLookAt, {
        x: target.look.x,
        y: target.look.y,
        z: target.look.z,
        duration: 1.6,
        ease: "power2.inOut"
    });

    // Start/Stop automated flow visualization based on slide
    if (slideIndex === 3) {
        startAutoPackets();
    } else {
        stopAutoPackets();
    }
};

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// 9. Main Render & Frame Loop
function animate(time) {
    requestAnimationFrame(animate);

    // Gentle rotational auto-animation for nodes
    const speedFactor = 0.003;
    
    if (clientNode) {
        clientNode.rotation.y += speedFactor;
        // Orbit ring counter rotation
        clientNode.children[2].rotation.z -= speedFactor * 1.5;
    }
    
    if (resourceNode) {
        resourceNode.rotation.y += speedFactor * 1.2;
    }
    
    if (toolNode) {
        toolNode.rotation.x += speedFactor * 0.8;
        toolNode.rotation.y += speedFactor * 1.5;
        
        // Spin satellite gear around tool center
        if (toolNode.satellite) {
            const satTime = time * 0.0015;
            toolNode.satellite.position.x = Math.cos(satTime) * 0.7;
            toolNode.satellite.position.z = Math.sin(satTime) * 0.7;
            toolNode.satellite.rotation.y += 0.02;
        }
    }
    
    if (promptNode) {
        promptNode.rotation.y += speedFactor;
        promptNode.rotation.z += speedFactor * 0.5;
        
        // Float prompt node up/down slightly
        promptNode.position.y = -1.5 + Math.sin(time * 0.002) * 0.08;
    }

    // Slowly rotate background starfield
    if (backgroundParticles) {
        backgroundParticles.rotation.y += 0.0003;
        backgroundParticles.rotation.x += 0.0001;
    }

    // Render updates
    if (controls && controls.enabled) {
        controls.update();
    } else {
        camera.lookAt(currentLookAt);
    }

    renderer.render(scene, camera);
}

// Initialize on DOM load
window.addEventListener('load', init3D);
