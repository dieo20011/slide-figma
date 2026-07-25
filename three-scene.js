// Three.js 3D Background & Animation Logic (Figma MCP Stepper Focus - 4 Nodes Diamond Flow)

let scene, camera, renderer, controls;
let codeWorkspaceNode, clientNode, mcpServerNode, figmaCloudNode;
let connections = {}; // Store curve paths
let backgroundParticles;
let activePackets = []; // Track spawned packets for cleanup

// Camera targets for each slide (0-indexed)
const cameraTargets = [
    { pos: { x: 0, y: 0.5, z: 8.5 }, look: { x: 0, y: 0, z: 0 } },         // Slide 0: Title
    { pos: { x: -2.0, y: 0.5, z: 4.8 }, look: { x: -2.2, y: 0, z: 0 } },  // Slide 1: Focus Computer/IDE
    { pos: { x: 0, y: 4, z: 7.2 }, look: { x: 0, y: 0, z: 0 } },         // Slide 2: Architecture (Diamond View)
    { pos: { x: 1.0, y: 1.0, z: 5.6 }, look: { x: 0.8, y: 0, z: 0 } },    // Slide 3: Data Flow (Focus Right/Figma API)
    { pos: { x: 1.6, y: 1.0, z: 7.0 }, look: { x: 1.4, y: 0, z: 0 } },  // Slide 4: Interactive Simulator (Shifted right for drawer)
    { pos: { x: -2.0, y: -0.4, z: 4.8 }, look: { x: -2.5, y: -0.2, z: 0 } }  // Slide 5: Summary (Focus Local Computer/IDE)
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
    controls.enabled = false;

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
    // 1. LOCAL COMPUTER / IDE (Left Node: x: -3.0, y: 0, z: 0)
    // 3D Computer Monitor Display
    const codeGroup = new THREE.Group();
    codeGroup.position.set(-3.0, 0, 0);

    const standGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.22, 12);
    const standMat = new THREE.MeshPhongMaterial({ color: 0x374151, shininess: 30 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = -0.35;
    codeGroup.add(stand);

    const baseGeo = new THREE.BoxGeometry(0.35, 0.02, 0.25);
    const base = new THREE.Mesh(baseGeo, standMat);
    base.position.y = -0.45;
    codeGroup.add(base);

    // Screen base panel
    const panelGeo = new THREE.BoxGeometry(0.85, 0.58, 0.06);
    const panelMat = new THREE.MeshPhongMaterial({ color: 0x1f2937, shininess: 40 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    codeGroup.add(panel);

    // Glowing screen
    const screenGeo = new THREE.PlaneGeometry(0.78, 0.5);
    const screenMat = new THREE.MeshBasicMaterial({
        color: 0x00f5d4,
        transparent: true,
        opacity: 0.15
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.031;
    codeGroup.add(screen);

    // Glowing green frame
    const wireGeo = new THREE.BoxGeometry(0.85, 0.58, 0.06);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.7 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    codeGroup.add(wire);

    scene.add(codeGroup);
    codeWorkspaceNode = codeGroup;

    // 2. AI MODEL (Top Node: x: 0, y: 1.6, z: 0)
    // Friendly AI Bot Head
    const clientGroup = new THREE.Group();
    clientGroup.position.set(0, 1.6, 0);

    const headGeo = new THREE.BoxGeometry(0.65, 0.55, 0.55);
    const headMat = new THREE.MeshPhongMaterial({
        color: 0x00f0ff,
        emissive: 0x00a2ff,
        emissiveIntensity: 0.4,
        shininess: 30
    });
    const head = new THREE.Mesh(headGeo, headMat);
    clientGroup.add(head);

    // Eyes
    const eyeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-0.16, 0.05, 0.28);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(0.16, 0.05, 0.28);
    
    clientGroup.add(leftEye);
    clientGroup.add(rightEye);

    // Cute Antenna
    const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8);
    const antMat = new THREE.MeshPhongMaterial({ color: 0xbd5eff, shininess: 50 });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.set(0, 0.36, 0);
    clientGroup.add(antenna);

    const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, 0.45, 0);
    clientGroup.add(tip);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(0.8, 0.012, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.3
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2.5;
    clientGroup.add(orbitRing);

    scene.add(clientGroup);
    clientNode = clientGroup;

    // 3. FIGMA MCP SERVER (Bottom Node: x: 0, y: -1.6, z: 0)
    // Spinning Gyroscope Translation Crystal
    const mcpGroup = new THREE.Group();
    mcpGroup.position.set(0, -1.6, 0);

    const crystalGeo = new THREE.OctahedronGeometry(0.35, 0);
    const crystalMat = new THREE.MeshPhongMaterial({
        color: 0xbd5eff,
        emissive: 0x8a2be2,
        emissiveIntensity: 0.5,
        shininess: 60,
        flatShading: true
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    mcpGroup.add(crystalMesh);

    // Gyro Rings
    const ring1Geo = new THREE.TorusGeometry(0.6, 0.012, 8, 48);
    const mcpRingMat = new THREE.MeshBasicMaterial({ color: 0xbd5eff, transparent: true, opacity: 0.4 });
    
    const ring1 = new THREE.Mesh(ring1Geo, mcpRingMat);
    mcpGroup.add(ring1);
    
    const ring2 = new THREE.Mesh(ring1Geo, mcpRingMat);
    ring2.rotation.y = Math.PI / 2;
    mcpGroup.add(ring2);

    scene.add(mcpGroup);
    mcpServerNode = mcpGroup;
    mcpServerNode.ring1 = ring1;
    mcpServerNode.ring2 = ring2;

    // 4. FIGMA CLOUD API (Right Node: x: 3.0, y: 0, z: 0)
    // Detailed 3D Figma Logo
    const figmaGroup = new THREE.Group();
    figmaGroup.position.set(3.0, 0, 0);

    const sphereGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const spacing = 0.36;

    // Top-Left (Figma Red)
    const redMat = new THREE.MeshPhongMaterial({ color: 0xf24e1e, emissive: 0xf24e1e, emissiveIntensity: 0.3, shininess: 30 });
    const topLeft = new THREE.Mesh(sphereGeo, redMat);
    topLeft.position.set(-spacing/2, spacing, 0);
    figmaGroup.add(topLeft);

    // Top-Right (Figma Orange)
    const orangeMat = new THREE.MeshPhongMaterial({ color: 0xff7262, emissive: 0xff7262, emissiveIntensity: 0.3, shininess: 30 });
    const topRight = new THREE.Mesh(sphereGeo, orangeMat);
    topRight.position.set(spacing/2, spacing, 0);
    figmaGroup.add(topRight);

    // Mid-Left (Figma Purple)
    const purpleMat = new THREE.MeshPhongMaterial({ color: 0xa259ff, emissive: 0xa259ff, emissiveIntensity: 0.3, shininess: 30 });
    const midLeft = new THREE.Mesh(sphereGeo, purpleMat);
    midLeft.position.set(-spacing/2, 0, 0);
    figmaGroup.add(midLeft);

    // Mid-Right (Figma Blue)
    const blueMat = new THREE.MeshPhongMaterial({ color: 0x1abc9c, emissive: 0x1abc9c, emissiveIntensity: 0.3, shininess: 30 });
    const midRight = new THREE.Mesh(sphereGeo, blueMat);
    midRight.position.set(spacing/2, 0, 0);
    figmaGroup.add(midRight);

    // Bot-Left Teardrop (Figma Green)
    const greenMat = new THREE.MeshPhongMaterial({ color: 0x0acf83, emissive: 0x0acf83, emissiveIntensity: 0.3, shininess: 30 });
    const botLeftGroup = new THREE.Group();
    botLeftGroup.position.set(-spacing/2, -spacing, 0);
    
    const botLeftSphere = new THREE.Mesh(sphereGeo, greenMat);
    botLeftGroup.add(botLeftSphere);
    
    const tailGeo = new THREE.ConeGeometry(0.12, 0.22, 4);
    const figmaTail = new THREE.Mesh(tailGeo, greenMat);
    figmaTail.rotation.z = Math.PI / 2;
    figmaTail.position.set(0.08, 0, 0);
    botLeftGroup.add(figmaTail);
    figmaGroup.add(botLeftGroup);

    scene.add(figmaGroup);
    figmaCloudNode = figmaGroup;
}

function createConnections() {
    const pCode = codeWorkspaceNode.position; // Computer (Left)
    const pClient = clientNode.position;      // AI Model (Top)
    const pMcp = mcpServerNode.position;      // MCP Server (Bottom)
    const pFigma = figmaCloudNode.position;   // Figma API (Right)

    // A. Computer -> AI Model Path (Send prompt link)
    const ctrl1 = new THREE.Vector3((pCode.x + pClient.x) / 2 - 0.2, (pCode.y + pClient.y) / 2 + 0.2, 0.2);
    connections['computer-to-ai'] = new THREE.QuadraticBezierCurve3(pCode, ctrl1, pClient);

    // B. AI Model -> Computer Path (Request tool_call)
    const ctrl2 = new THREE.Vector3((pClient.x + pCode.x) / 2 + 0.2, (pClient.y + pCode.y) / 2 - 0.2, -0.2);
    connections['ai-to-computer'] = new THREE.QuadraticBezierCurve3(pClient, ctrl2, pCode);

    // C. Computer -> MCP Server Path (Forward tool_call)
    const ctrl3 = new THREE.Vector3((pCode.x + pMcp.x) / 2 - 0.2, (pCode.y + pMcp.y) / 2 - 0.2, 0.2);
    connections['computer-to-mcp'] = new THREE.QuadraticBezierCurve3(pCode, ctrl3, pMcp);

    // D. MCP Server -> Figma Cloud Path (REST request)
    const ctrl4 = new THREE.Vector3((pMcp.x + pFigma.x) / 2 + 0.2, (pMcp.y + pFigma.y) / 2 - 0.2, -0.2);
    connections['mcp-to-figma'] = new THREE.QuadraticBezierCurve3(pMcp, ctrl4, pFigma);

    // E. Figma Cloud -> MCP Server Path (Return design JSON)
    const ctrl5 = new THREE.Vector3((pFigma.x + pMcp.x) / 2 - 0.2, (pFigma.y + pMcp.y) / 2 + 0.2, 0.2);
    connections['figma-to-mcp'] = new THREE.QuadraticBezierCurve3(pFigma, ctrl5, pMcp);

    // F. MCP Server -> Computer Path (Forward design JSON)
    const ctrl6 = new THREE.Vector3((pMcp.x + pCode.x) / 2 + 0.2, (pMcp.y + pCode.y) / 2 + 0.2, -0.2);
    connections['mcp-to-computer'] = new THREE.QuadraticBezierCurve3(pMcp, ctrl6, pCode);

    // Draw static connecting loops
    const paths = [
        { curve: connections['computer-to-ai'], color: 0x00f0ff },
        { curve: connections['computer-to-mcp'], color: 0xbd5eff },
        { curve: connections['mcp-to-figma'], color: 0xff7262 }
    ];

    paths.forEach(p => {
        const tubeGeo = new THREE.TubeGeometry(p.curve, 32, 0.015, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: p.color,
            transparent: true,
            opacity: 0.15
        });
        const tubeLine = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(tubeLine);
    });
}

function createBackgroundParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 12;
        positions[i + 2] = (Math.random() - 0.7) * 15;

        const rand = Math.random();
        if (rand < 0.2) {
            colors[i] = 0.95; colors[i+1] = 0.29; colors[i+2] = 0.17; // Figma Red
        } else if (rand < 0.4) {
            colors[i] = 0.64; colors[i+1] = 0.35; colors[i+2] = 1.0; // Figma Purple
        } else if (rand < 0.6) {
            colors[i] = 0.1; colors[i+1] = 0.74; colors[i+2] = 0.61; // Figma Green
        } else {
            colors[i] = 0.0; colors[i+1] = 0.94; colors[i+2] = 1.0; // Cyan
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

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
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    backgroundParticles = new THREE.Points(geometry, material);
    scene.add(backgroundParticles);
}

// ----------------------------------------------------
// Animation Triggers
// ----------------------------------------------------

function animatePacket(curveName, color, duration, callback) {
    const curve = connections[curveName];
    if (!curve) return;

    const pGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pMat = new THREE.MeshBasicMaterial({ color: color });
    const packet = new THREE.Mesh(pGeo, pMat);
    scene.add(packet);
    activePackets.push(packet);

    const pLight = new THREE.PointLight(color, 1.5, 2);
    packet.add(pLight);

    const animateData = { progress: 0 };
    gsap.to(animateData, {
        progress: 1,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: () => {
            const point = curve.getPointAt(animateData.progress);
            packet.position.copy(point);
        },
        onComplete: () => {
            scene.remove(packet);
            activePackets = activePackets.filter(p => p !== packet);
            pGeo.dispose();
            pMat.dispose();
            if (typeof callback === 'function') callback();
        }
    });
}

window.trigger3DAnimation = function(actionType) {
    if (actionType === 'step-1') {
        // Step 1: Computer -> AI Model (User submits link prompt)
        gsap.to(codeWorkspaceNode.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.1, yoyo: true, repeat: 1 });
        
        animatePacket('computer-to-ai', 0x00f0ff, 0.7, () => {
            gsap.to(clientNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
        });
    } 
    else if (actionType === 'step-2') {
        // Step 2: AI Model -> Computer -> MCP Server (AI triggers tool call)
        animatePacket('ai-to-computer', 0xbd5eff, 0.5, () => {
            gsap.to(codeWorkspaceNode.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.08, yoyo: true, repeat: 1 });
            
            animatePacket('computer-to-mcp', 0xbd5eff, 0.5, () => {
                gsap.to(mcpServerNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.08, yoyo: true, repeat: 1 });
            });
        });
    } 
    else if (actionType === 'step-3') {
        // Step 3: MCP Server -> Figma -> MCP Server -> Computer (Fetch design layout JSON)
        animatePacket('mcp-to-figma', 0xff7262, 0.5, () => {
            gsap.to(figmaCloudNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
            
            animatePacket('figma-to-mcp', 0xff7262, 0.5, () => {
                gsap.to(mcpServerNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.08, yoyo: true, repeat: 1 });
                
                animatePacket('mcp-to-computer', 0x00f5d4, 0.5, () => {
                    gsap.to(codeWorkspaceNode.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.08, yoyo: true, repeat: 1 });
                });
            });
        });
    } 
    else if (actionType === 'step-4') {
        // Step 4: Computer -> AI Model -> Computer (Compile code & write to local monitor workspace)
        animatePacket('computer-to-ai', 0x00f5d4, 0.5, () => {
            gsap.to(clientNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 2 });
            
            setTimeout(() => {
                animatePacket('ai-to-computer', 0x00f5d4, 0.6, () => {
                    gsap.to(codeWorkspaceNode.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.1, yoyo: true, repeat: 1 });
                    // Screen flash indicator
                    const screen = codeWorkspaceNode.children[3];
                    gsap.to(screen.material, { opacity: 0.7, duration: 0.15, yoyo: true, repeat: 1 });
                });
            }, 300);
        });
    }
    else if (actionType === 'reset') {
        activePackets.forEach(p => scene.remove(p));
        activePackets = [];

        gsap.to(codeWorkspaceNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(clientNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(mcpServerNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(figmaCloudNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
    }
};

let dataFlowInterval = null;
function startAutoPackets() {
    if (dataFlowInterval) return;
    
    // Auto loop cycle representing active MCP communication
    dataFlowInterval = setInterval(() => {
        animatePacket('computer-to-ai', 0x00f0ff, 0.5, () => {
            animatePacket('ai-to-computer', 0xbd5eff, 0.4, () => {
                animatePacket('computer-to-mcp', 0xbd5eff, 0.4, () => {
                    animatePacket('mcp-to-figma', 0xff7262, 0.4, () => {
                        animatePacket('figma-to-mcp', 0xff7262, 0.4, () => {
                            animatePacket('mcp-to-computer', 0x00f5d4, 0.4);
                        });
                    });
                });
            });
        });
    }, 6000);
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

    if (slideIndex === 4) {
        controls.enabled = true;
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

    const speedFactor = 0.003;
    
    // Auto-rotations and floats for the 4 custom diamond models
    if (codeWorkspaceNode) {
        codeWorkspaceNode.position.y = Math.sin(time * 0.0008) * 0.03;
    }

    if (clientNode) {
        clientNode.position.y = 1.6 + Math.sin(time * 0.001) * 0.04;
        clientNode.children[4].rotation.z -= speedFactor * 1.2;
    }
    
    if (mcpServerNode) {
        mcpServerNode.position.y = -1.6 + Math.sin(time * 0.0009) * 0.04;
        mcpServerNode.rotation.y += speedFactor * 1.5;
        if (mcpServerNode.ring1) mcpServerNode.ring1.rotation.x += 0.015;
        if (mcpServerNode.ring2) mcpServerNode.ring2.rotation.z -= 0.015;
    }
    
    if (figmaCloudNode) {
        figmaCloudNode.rotation.y += speedFactor * 0.8;
        figmaCloudNode.position.y = Math.sin(time * 0.0012) * 0.05;
    }

    // Slowly rotate background starfield
    if (backgroundParticles) {
        backgroundParticles.rotation.y += 0.0002;
        backgroundParticles.rotation.x += 0.00015;
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
