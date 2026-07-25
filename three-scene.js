// Three.js 3D Background & Animation Logic (Figma MCP Stepper Focus)

let scene, camera, renderer, controls;
let clientNode, mcpServerNode, figmaCloudNode, codeWorkspaceNode;
let connections = {}; // Store curve paths
let backgroundParticles;
let activePackets = []; // Track spawned packets for cleanup

// Camera targets for each slide (0-indexed)
const cameraTargets = [
    { pos: { x: 0, y: 1, z: 8 }, look: { x: 0, y: 0, z: 0 } },         // Slide 0: Title
    { pos: { x: -3.5, y: 0.8, z: 4.5 }, look: { x: -3, y: 0, z: 0 } },  // Slide 1: What is Figma MCP (Focus Client)
    { pos: { x: 0, y: 4, z: 6 }, look: { x: 0, y: 0, z: 0 } },         // Slide 2: Architecture
    { pos: { x: 1.5, y: 1.5, z: 4.5 }, look: { x: 1, y: 0, z: 0 } },    // Slide 3: Data Flow (Focus Cloud & Server)
    { pos: { x: 1.5, y: 1.2, z: 6.8 }, look: { x: 1.8, y: 0, z: 0 } },  // Slide 4: Interactive Simulator (Shifted right)
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
    clientGroup.position.set(-3.2, 0, 0);

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
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.3
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 3;
    clientGroup.add(orbitRing);

    scene.add(clientGroup);
    clientNode = clientGroup;

    // B. FIGMA MCP SERVER (Broker - Middle center)
    const mcpGroup = new THREE.Group();
    mcpGroup.position.set(0, 0.5, 0);

    const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const boxMat = new THREE.MeshPhongMaterial({
        color: 0xbd5eff,
        emissive: 0x8a2be2,
        emissiveIntensity: 0.4,
        shininess: 50,
        flatShading: true
    });
    const mcpBox = new THREE.Mesh(boxGeo, boxMat);
    mcpGroup.add(mcpBox);

    // Outer wire frame
    const mcpWireGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const mcpWireMat = new THREE.MeshBasicMaterial({ color: 0xbd5eff, wireframe: true, transparent: true, opacity: 0.25 });
    const mcpWire = new THREE.Mesh(mcpWireGeo, mcpWireMat);
    mcpGroup.add(mcpWire);

    scene.add(mcpGroup);
    mcpServerNode = mcpGroup;

    // C. FIGMA CLOUD API (Top right)
    const figmaGroup = new THREE.Group();
    figmaGroup.position.set(3, 1.6, -0.6);

    // Mock Figma stacked layers representation
    for (let i = 0; i < 3; i++) {
        const layerGeo = new THREE.BoxGeometry(0.9, 0.06, 0.6);
        const colors = [0xff4b2b, 0xa259ff, 0x1abc9c];
        const layerMat = new THREE.MeshPhongMaterial({
            color: colors[i],
            emissive: colors[i],
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.8
        });
        const layer = new THREE.Mesh(layerGeo, layerMat);
        layer.position.y = (i - 1) * 0.25;
        figmaGroup.add(layer);
    }

    scene.add(figmaGroup);
    figmaCloudNode = figmaGroup;

    // D. LOCAL CODE EDITOR / WORKSPACE (Bottom right)
    const codeGroup = new THREE.Group();
    codeGroup.position.set(3, -1.2, 0.6);

    const docGeo = new THREE.BoxGeometry(0.75, 0.9, 0.1);
    const docMat = new THREE.MeshPhongMaterial({
        color: 0x00f5d4,
        emissive: 0x00c4a9,
        emissiveIntensity: 0.3,
        shininess: 30
    });
    const docMesh = new THREE.Mesh(docGeo, docMat);
    codeGroup.add(docMesh);

    // Decorative floating brackets
    const bracketGeo = new THREE.BoxGeometry(0.1, 0.96, 0.15);
    const bracketMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const b1 = new THREE.Mesh(bracketGeo, bracketMat);
    b1.position.x = -0.45;
    const b2 = new THREE.Mesh(bracketGeo, bracketMat);
    b2.position.x = 0.45;
    codeGroup.add(b1);
    codeGroup.add(b2);

    scene.add(codeGroup);
    codeWorkspaceNode = codeGroup;
}

function createConnections() {
    const pClient = clientNode.position;
    const pMcp = mcpServerNode.position;
    const pFigma = figmaCloudNode.position;
    const pCode = codeWorkspaceNode.position;

    // 1. Client to MCP Server Path (JSON-RPC)
    const ctrl1 = new THREE.Vector3((pClient.x + pMcp.x) / 2, (pClient.y + pMcp.y) / 2 + 0.3, 0);
    connections['client-to-mcp'] = new THREE.QuadraticBezierCurve3(pClient, ctrl1, pMcp);

    // 2. MCP Server to Figma Cloud Path (REST API)
    const ctrl2 = new THREE.Vector3((pMcp.x + pFigma.x) / 2, (pMcp.y + pFigma.y) / 2 + 0.3, -0.3);
    connections['mcp-to-figma'] = new THREE.QuadraticBezierCurve3(pMcp, ctrl2, pFigma);

    // 3. Figma Cloud to MCP Server Path (Return Design Data)
    const ctrl3 = new THREE.Vector3((pFigma.x + pMcp.x) / 2, (pFigma.y + pMcp.y) / 2 - 0.3, -0.3);
    connections['figma-to-mcp'] = new THREE.QuadraticBezierCurve3(pFigma, ctrl3, pMcp);

    // 4. MCP Server to Client Path (Return Context)
    const ctrl4 = new THREE.Vector3((pMcp.x + pClient.x) / 2, (pMcp.y + pClient.y) / 2 - 0.3, 0);
    connections['mcp-to-client'] = new THREE.QuadraticBezierCurve3(pMcp, ctrl4, pClient);

    // 5. Client to Code Workspace (Generate code output)
    const ctrl5 = new THREE.Vector3((pClient.x + pCode.x) / 2, (pClient.y + pCode.y) / 2 - 0.4, 0.3);
    connections['client-to-code'] = new THREE.QuadraticBezierCurve3(pClient, ctrl5, pCode);

    // Draw lines for visual representation
    const paths = [
        { curve: connections['client-to-mcp'], color: 0x00f0ff },
        { curve: connections['mcp-to-figma'], color: 0xbd5eff },
        { curve: connections['client-to-code'], color: 0x00f5d4 }
    ];

    paths.forEach(p => {
        const tubeGeo = new THREE.TubeGeometry(p.curve, 32, 0.015, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: p.color,
            transparent: true,
            opacity: 0.2
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

        // Figma branding colors (Red, Orange, Purple, Blue, Green)
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

// Animates a packet along a specific curve, then runs a callback
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

// Custom animation starting from Camera viewport to a target position
function animatePacketFromViewport(targetPos, color, duration, callback) {
    const pGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const pMat = new THREE.MeshBasicMaterial({ color: color });
    const packet = new THREE.Mesh(pGeo, pMat);
    
    // Position packet in front of the camera
    const startPos = new THREE.Vector3(0, 0, -2);
    startPos.applyMatrix4(camera.matrixWorld); // project into world space in front of camera
    packet.position.copy(startPos);
    scene.add(packet);
    activePackets.push(packet);

    const pLight = new THREE.PointLight(color, 1.5, 2);
    packet.add(pLight);

    gsap.to(packet.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: duration,
        ease: "power2.out",
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
        // Step 1: User/Interface (viewport) sends link & node_id to AI Client
        animatePacketFromViewport(clientNode.position, 0x00f0ff, 0.7, () => {
            gsap.to(clientNode.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.1, yoyo: true, repeat: 1 });
        });
    } 
    else if (actionType === 'step-2') {
        // Step 2: AI Client sends request to local MCP server -> Figma Cloud API
        animatePacket('client-to-mcp', 0x00f0ff, 0.4, () => {
            gsap.to(mcpServerNode.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.08, yoyo: true, repeat: 1 });
            
            animatePacket('mcp-to-figma', 0xbd5eff, 0.5, () => {
                gsap.to(figmaCloudNode.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
            });
        });
    } 
    else if (actionType === 'step-3') {
        // Step 3: Figma Cloud API returns design JSON -> MCP Server -> AI Client
        animatePacket('figma-to-mcp', 0xff4b2b, 0.5, () => {
            gsap.to(mcpServerNode.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.08, yoyo: true, repeat: 1 });
            
            animatePacket('mcp-to-client', 0x00f5d4, 0.4, () => {
                gsap.to(clientNode.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.1, yoyo: true, repeat: 1 });
            });
        });
    } 
    else if (actionType === 'step-4') {
        // Step 4: AI Client writes code to local workspace files
        // Pulse AI Client internally for compilation
        gsap.to(clientNode.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.1, yoyo: true, repeat: 2 });
        
        setTimeout(() => {
            animatePacket('client-to-code', 0x00f5d4, 0.7, () => {
                gsap.to(codeWorkspaceNode.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.1, yoyo: true, repeat: 1 });
            });
        }, 300);
    }
    else if (actionType === 'reset') {
        // Clear active packets
        activePackets.forEach(p => scene.remove(p));
        activePackets = [];

        // Reset scales
        gsap.to(clientNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(mcpServerNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(figmaCloudNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
        gsap.to(codeWorkspaceNode.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
    }
};

// Periodic auto-packets on Slide 3 (Data Flow) - visual loop representing figma connection
let dataFlowInterval = null;
function startAutoPackets() {
    if (dataFlowInterval) return;
    
    dataFlowInterval = setInterval(() => {
        // Run full cycle
        animatePacket('client-to-mcp', 0.4, 0x00f0ff, () => {
            animatePacket('mcp-to-figma', 0xbd5eff, 0.4, () => {
                animatePacket('figma-to-mcp', 0xff4b2b, 0.4, () => {
                    animatePacket('mcp-to-client', 0x00f5d4, 0.4);
                });
            });
        });
    }, 4500);
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
    
    if (clientNode) {
        clientNode.rotation.y += speedFactor;
        clientNode.children[2].rotation.z -= speedFactor * 1.5;
    }
    
    if (mcpServerNode) {
        mcpServerNode.rotation.x += speedFactor * 1.1;
        mcpServerNode.rotation.y += speedFactor * 1.8;
    }
    
    if (figmaCloudNode) {
        figmaCloudNode.rotation.y += speedFactor * 0.6;
        figmaCloudNode.position.y = 1.6 + Math.sin(time * 0.0015) * 0.06;
    }
    
    if (codeWorkspaceNode) {
        codeWorkspaceNode.rotation.y += speedFactor * 0.8;
        codeWorkspaceNode.position.y = -1.2 + Math.sin(time * 0.001) * 0.04;
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
