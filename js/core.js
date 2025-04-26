/**
 * Core functionality for the 3D Editor
 * Sets up the Three.js scene, camera, renderer, and shared variables
 */

// Main Three.js components
let scene, camera, renderer;
let orbitControls, transformControls;
let raycaster, mouse;
let viewportContainer;
let gridHelper;

// Viewport management
let viewports = {
    perspective: {
        camera: null,
        controls: null,
        element: null
    },
    top: {
        camera: null,
        controls: null,
        element: null
    },
    front: {
        camera: null,
        controls: null,
        element: null
    },
    side: {
        camera: null,
        controls: null,
        element: null
    }
};

let activeViewport = 'perspective';

// Grid settings
const gridSize = 1;
const gridDivisions = 20;

// Objects to manage in the scene
const objectsGroup = new THREE.Group();
const objects = [];

// Object metadata class
class DesignObject {
    constructor(mesh, type, isGroup = false) {
        this.mesh = mesh;
        this.type = type;
        this.isGroup = isGroup;
        this.children = [];
        this.isHole = false;
        
        // Store original geometry for CSG operations
        if (mesh.geometry) {
            this.originalGeometry = mesh.geometry.clone();
        }
    }
}

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.01;

// Selection tracking
let selectedObject = null;
let selectedObjects = [];

// UI state
let activeTab = 'shapes';

// GUI interface
let gui;
let guiParams = {
    color: '#ffffff',
    scale: 1,
    isHole: false
};

// Font for text creation
let defaultFont;

let currentMode = 'move'; // 'move', 'rotate', or 'scale'

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing 3D environment');
    
    try {
        // Check if THREE is loaded
        if (typeof THREE === 'undefined') {
            console.error('THREE is not loaded. Please check script imports.');
            throw new Error('THREE is not loaded');
        }
        
        // Initialize the scene
        initScene();
        
        // Add event listeners
        window.addEventListener('resize', onWindowResize);
        
        const canvas = renderer?.domElement;
        if (canvas) {
            canvas.addEventListener('click', onCanvasClick);
            console.log('Event listeners initialized');
        } else {
            console.error('Canvas not found during initialization');
        }
        
        // Start animation loop
        animate();
        
        console.log('3D environment initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Initialize the 3D environment
function initScene() {
    console.log('Initializing scene...');
    
    try {
        // Initialize viewport container
        viewportContainer = document.getElementById('view3d');
        if (!viewportContainer) {
            throw new Error('Viewport container not found');
        }
        
        // Initialize scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        console.log('Scene created');
        
        // Initialize camera
        const aspect = viewportContainer.clientWidth / viewportContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        console.log('Camera initialized');
        
        // Initialize renderer with proper pixel ratio
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(viewportContainer.clientWidth, viewportContainer.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        viewportContainer.appendChild(renderer.domElement);
        console.log('Renderer initialized');
        
        // Initialize orbit controls
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('OrbitControls not loaded. Please check script imports.');
            throw new Error('OrbitControls not loaded');
        }
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.screenSpacePanning = true;
        orbitControls.minDistance = 1;
        orbitControls.maxDistance = 50;
        console.log('Orbit controls initialized');
        
        // Initialize transform controls
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        transformControls.addEventListener('dragging-changed', function(event) {
            orbitControls.enabled = !event.value;
        });
        
        // Set up transform control modes
        transformControls.setMode('translate');
        transformControls.setSpace('world');
        transformControls.setSize(0.75);
        transformControls.showX = true;
        transformControls.showY = true;
        transformControls.showZ = true;
        
        // Add visual feedback for transform controls
        transformControls.addEventListener('mouseDown', function() {
            document.body.style.cursor = 'move';
        });
        
        transformControls.addEventListener('mouseUp', function() {
            document.body.style.cursor = 'auto';
        });
        
        transformControls.visible = false;
        scene.add(transformControls);
        console.log('Transform controls initialized');
        
        // Initialize raycaster
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        console.log('Raycaster initialized');
        
        // Initialize GUI
        gui = new dat.GUI();
        console.log('GUI initialized');
        
        // Add grid helper
        gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);
        console.log('Grid helper added to scene');
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);
        
        // Add test cube
        const testCube = createCube();
        testCube.position.set(0, 1, 0);
        testCube.name = 'test_cube';
        testCube.userData = { type: 'cube' };
        console.log('Test cube added to scene');
        
        initTransformControls();
        initPropertyListeners();
        
        console.log('Scene initialization complete');
    } catch (error) {
        console.error('Error during scene initialization:', error);
        throw error;
    }
}

// Animation loop
function animate() {
    try {
        // Check if all required components are initialized
        if (!scene || !camera || !renderer || !orbitControls) {
            console.error('Required components not initialized');
            return;
        }

        // Request next frame first in case of errors
        requestAnimationFrame(animate);

        // Update controls
        orbitControls.update();

        // Render scene
        renderer.render(scene, camera);

    } catch (error) {
        console.error('Error in animation loop:', error);
        // Stop animation loop on error
        cancelAnimationFrame(animate);
    }
}

// Handle window resize
function onWindowResize() {
    try {
        if (!camera || !renderer || !viewportContainer) {
            console.error('Required components not initialized for resize');
            return;
        }

        // Update camera
        camera.aspect = viewportContainer.clientWidth / viewportContainer.clientHeight;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(viewportContainer.clientWidth, viewportContainer.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        console.log('Window resize handled successfully');
    } catch (error) {
        console.error('Error handling window resize:', error);
    }
}

// Handle canvas click for object selection
function onCanvasClick(event) {
    if (!camera || !scene || !renderer) {
        console.warn('Required elements not initialized for click handler');
        return;
    }

    try {
        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Get list of intersected objects
        const intersects = raycaster.intersectObjects(objectsGroup.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            console.log('Object clicked:', object.name);
            selectObject(object);
        } else {
            console.log('No object clicked, deselecting');
            clearSelection();
        }
    } catch (error) {
        console.error('Error during canvas click handling:', error);
    }
}

// Set up transform control buttons
function setupTransformControls() {
    const moveBtn = document.getElementById('moveBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const scaleBtn = document.getElementById('scaleBtn');
    
    if (moveBtn) {
        moveBtn.addEventListener('click', function() {
            if (transformControls && selectedObject) {
                transformControls.setMode('translate');
                this.classList.add('active');
                rotateBtn.classList.remove('active');
                scaleBtn.classList.remove('active');
                document.body.style.cursor = 'move';
            }
        });
    }
    
    if (rotateBtn) {
        rotateBtn.addEventListener('click', function() {
            if (transformControls && selectedObject) {
                transformControls.setMode('rotate');
                this.classList.add('active');
                moveBtn.classList.remove('active');
                scaleBtn.classList.remove('active');
                document.body.style.cursor = 'grab';
            }
        });
    }
    
    if (scaleBtn) {
        scaleBtn.addEventListener('click', function() {
            if (transformControls && selectedObject) {
                transformControls.setMode('scale');
                this.classList.add('active');
                moveBtn.classList.remove('active');
                rotateBtn.classList.remove('active');
                document.body.style.cursor = 'nwse-resize';
            }
        });
    }
}

// Select an object
function selectObject(mesh) {
    console.log('Selecting object:', mesh.name);
    clearSelection();
    selectedObject = mesh;
    selectedObjects.push(mesh);
    
    // Highlight selected object
    if (mesh.material) {
        mesh.material.emissive.setHex(0x666666);
    }
    
    // Attach transform controls to selected object
    if (transformControls) {
        transformControls.attach(mesh);
        transformControls.visible = true;
        
        // Set default transform mode
        transformControls.setMode('translate');
        document.getElementById('moveBtn').classList.add('active');
        document.getElementById('rotateBtn').classList.remove('active');
        document.getElementById('scaleBtn').classList.remove('active');
    }
    
    // Update GUI
    updateGUI(mesh);
}

// Clear selection
function clearSelection() {
    console.log('Clearing selection');
    if (selectedObjects.length > 0) {
        for (let obj of selectedObjects) {
            if (obj.material) {
                obj.material.emissive.setHex(0x000000);
            }
        }
        selectedObjects = [];
    }
    
    selectedObject = null;
    if (transformControls) {
        transformControls.detach();
        transformControls.visible = false;
        document.body.style.cursor = 'auto';
    }
    resetGUI();
}

// Helper function to get random color
function getRandomColor() {
    const colors = [
        0x2196F3, // Blue
        0x4CAF50, // Green
        0xFFC107, // Amber
        0xF44336, // Red
        0x9C27B0, // Purple
        0x00BCD4, // Cyan
        0xFF9800, // Orange
        0x795548  // Brown
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Find object data from mesh
function findObjectFromMesh(mesh) {
    return objects.find(obj => obj.mesh === mesh);
}

// Reset the GUI controls
function resetGUI() {
    gui.destroy();
    gui = new dat.GUI();
}

// Update GUI for selected object
function updateGUI(object) {
    resetGUI();
    
    if (!object) return;
    
    // For groups without materials, just show transform props
    if (!object.material) {
        // Transform properties
        const transformFolder = gui.addFolder('Position');
        transformFolder.add(object.position, 'x', -10, 10).name('X Position');
        transformFolder.add(object.position, 'y', 0, 10).name('Y Position');
        transformFolder.add(object.position, 'z', -10, 10).name('Z Position');
        transformFolder.open();
        
        // Rotation properties
        const rotationFolder = gui.addFolder('Rotation');
        
        // Convert rotation to degrees for UI
        const rotDegrees = {
            x: THREE.MathUtils.radToDeg(object.rotation.x),
            y: THREE.MathUtils.radToDeg(object.rotation.y),
            z: THREE.MathUtils.radToDeg(object.rotation.z)
        };
        
        // Add controls and connect to rotation in radians
        rotationFolder.add(rotDegrees, 'x', 0, 360).name('X Rotation').onChange(value => {
            object.rotation.x = THREE.MathUtils.degToRad(value);
        });
        rotationFolder.add(rotDegrees, 'y', 0, 360).name('Y Rotation').onChange(value => {
            object.rotation.y = THREE.MathUtils.degToRad(value);
        });
        rotationFolder.add(rotDegrees, 'z', 0, 360).name('Z Rotation').onChange(value => {
            object.rotation.z = THREE.MathUtils.degToRad(value);
        });
        rotationFolder.open();
        
        // Scale properties
        const scaleFolder = gui.addFolder('Scale');
        scaleFolder.add(object.scale, 'x', 0.1, 5).name('X Scale');
        scaleFolder.add(object.scale, 'y', 0.1, 5).name('Y Scale');
        scaleFolder.add(object.scale, 'z', 0.1, 5).name('Z Scale');
        scaleFolder.open();
        
        return;
    }
    
    // Color properties
    const colorFolder = gui.addFolder('Color');
    guiParams.color = '#' + (object.material.color ? object.material.color.getHexString() : 'ffffff');
    colorFolder.addColor(guiParams, 'color').onChange((value) => {
        object.material.color.set(value);
    });
    
    // Hole property for boolean operations
    const objData = findObjectFromMesh(object);
    if (objData) {
        guiParams.isHole = objData.isHole;
        colorFolder.add(guiParams, 'isHole').onChange((value) => {
            objData.isHole = value;
            object.material.transparent = value;
            object.material.opacity = value ? 0.5 : 1.0;
        });
    }
    
    colorFolder.open();
    
    // Transform properties
    const transformFolder = gui.addFolder('Position');
    transformFolder.add(object.position, 'x', -10, 10).name('X Position');
    transformFolder.add(object.position, 'y', 0, 10).name('Y Position');
    transformFolder.add(object.position, 'z', -10, 10).name('Z Position');
    transformFolder.open();
    
    // Rotation properties
    const rotationFolder = gui.addFolder('Rotation');
    
    // Convert rotation to degrees for UI
    const rotDegrees = {
        x: THREE.MathUtils.radToDeg(object.rotation.x),
        y: THREE.MathUtils.radToDeg(object.rotation.y),
        z: THREE.MathUtils.radToDeg(object.rotation.z)
    };
    
    // Add controls and connect to rotation in radians
    rotationFolder.add(rotDegrees, 'x', 0, 360).name('X Rotation').onChange(value => {
        object.rotation.x = THREE.MathUtils.degToRad(value);
    });
    rotationFolder.add(rotDegrees, 'y', 0, 360).name('Y Rotation').onChange(value => {
        object.rotation.y = THREE.MathUtils.degToRad(value);
    });
    rotationFolder.add(rotDegrees, 'z', 0, 360).name('Z Rotation').onChange(value => {
        object.rotation.z = THREE.MathUtils.degToRad(value);
    });
    rotationFolder.open();
    
    // Scale properties
    const scaleFolder = gui.addFolder('Scale');
    scaleFolder.add(object.scale, 'x', 0.1, 5).name('X Scale');
    scaleFolder.add(object.scale, 'y', 0.1, 5).name('Y Scale');
    scaleFolder.add(object.scale, 'z', 0.1, 5).name('Z Scale');
    scaleFolder.open();
}

// Snap position to grid
function snapToGrid(position) {
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    position.z = Math.round(position.z / gridSize) * gridSize;
    return position;
}

// Snap rotation to grid
function snapRotation(rotation) {
    const snapAngle = Math.PI / 4; // 45 degrees
    rotation.x = Math.round(rotation.x / snapAngle) * snapAngle;
    rotation.y = Math.round(rotation.y / snapAngle) * snapAngle;
    rotation.z = Math.round(rotation.z / snapAngle) * snapAngle;
    return rotation;
}

// Snap scale to grid
function snapScale(scale) {
    const snapScale = 0.25;
    scale.x = Math.round(scale.x / snapScale) * snapScale;
    scale.y = Math.round(scale.y / snapScale) * snapScale;
    scale.z = Math.round(scale.z / snapScale) * snapScale;
    return scale;
}

// Update TransformControls with snapping
function updateTransformControls() {
    if (!transformControls) return;
    
    transformControls.addEventListener('objectChange', function(event) {
        const object = event.target.object;
        if (object) {
            // Snap position
            object.position.copy(snapToGrid(object.position));
            
            // Snap rotation
            object.rotation.copy(snapRotation(object.rotation));
            
            // Snap scale
            object.scale.copy(snapScale(object.scale));
            
            // Update GUI if this is the selected object
            if (object === selectedObject) {
                updateGUI(object);
            }
        }
    });
}

function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    return cube;
}

function createHouse() {
    const group = new THREE.Group();
    
    // Create base
    const baseGeometry = new THREE.BoxGeometry(2, 0.2, 2);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    base.receiveShadow = true;
    group.add(base);
    
    // Create walls
    const wallGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 0.95;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);
    
    // Create roof
    const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    scene.add(group);
    return group;
}

// Cleanup function to remove event listeners
function cleanup() {
    console.log('Cleaning up event listeners');
    
    window.removeEventListener('resize', onWindowResize);
    
    const canvas = renderer?.domElement;
    if (canvas) {
        canvas.removeEventListener('click', onCanvasClick);
    }
    
    // Dispose of Three.js resources
    if (renderer) {
        renderer.dispose();
    }
    if (orbitControls) {
        orbitControls.dispose();
    }
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup);

// Set active viewport
function setActiveViewport(view) {
    console.log('Setting active viewport:', view);
    
    if (!camera || !orbitControls) {
        console.error('Camera or orbit controls not initialized');
        return;
    }
    
    switch(view) {
        case 'perspective':
            camera.position.set(5, 5, 5);
            camera.lookAt(0, 0, 0);
            break;
        case 'top':
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
            break;
        case 'front':
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
            break;
        case 'side':
            camera.position.set(10, 0, 0);
            camera.lookAt(0, 0, 0);
            break;
    }
    
    orbitControls.update();
    console.log('Viewport updated:', view);
}

function initTransformControls() {
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(transformControls);
    
    transformControls.addEventListener('dragging-changed', (event) => {
        orbitControls.enabled = !event.value;
    });

    transformControls.addEventListener('change', () => {
        if (selectedObject) {
            updatePropertyInputs();
        }
    });
}

function updatePropertyInputs() {
    if (!selectedObject) return;
    
    const position = selectedObject.position;
    const rotation = selectedObject.rotation;
    const scale = selectedObject.scale;
    
    document.getElementById('posX').value = position.x.toFixed(2);
    document.getElementById('posY').value = position.y.toFixed(2);
    document.getElementById('posZ').value = position.z.toFixed(2);
    
    document.getElementById('rotX').value = THREE.MathUtils.radToDeg(rotation.x).toFixed(2);
    document.getElementById('rotY').value = THREE.MathUtils.radToDeg(rotation.y).toFixed(2);
    document.getElementById('rotZ').value = THREE.MathUtils.radToDeg(rotation.z).toFixed(2);
    
    document.getElementById('scaleX').value = scale.x.toFixed(2);
    document.getElementById('scaleY').value = scale.y.toFixed(2);
    document.getElementById('scaleZ').value = scale.z.toFixed(2);
}

function setTransformMode(mode) {
    currentMode = mode;
    if (selectedObject) {
        transformControls.setMode(mode);
    }
    
    // Update button states
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
}

function initPropertyListeners() {
    // Transform mode buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTransformMode(btn.dataset.mode);
        });
    });
    
    // Property input listeners
    const properties = ['pos', 'rot', 'scale'];
    const axes = ['X', 'Y', 'Z'];
    
    properties.forEach(prop => {
        axes.forEach(axis => {
            const input = document.getElementById(`${prop}${axis}`);
            if (input) {
                input.addEventListener('change', () => {
                    if (!selectedObject) return;
                    
                    const value = parseFloat(input.value);
                    if (isNaN(value)) return;
                    
                    switch(prop) {
                        case 'pos':
                            selectedObject.position[axis.toLowerCase()] = value;
                            break;
                        case 'rot':
                            selectedObject.rotation[axis.toLowerCase()] = THREE.MathUtils.degToRad(value);
                            break;
                        case 'scale':
                            selectedObject.scale[axis.toLowerCase()] = value;
                            break;
                    }
                });
            }
        });
    });
}

function onObjectSelected(object) {
    if (selectedObject) {
        transformControls.detach();
    }
    
    selectedObject = object;
    
    if (object) {
        transformControls.attach(object);
        updatePropertyInputs();
    }
}