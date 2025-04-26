/**
 * Core functionality for the 3D Editor
 * Sets up the Three.js scene, camera, renderer, and shared variables
 */

// Main Three.js components
let scene, camera, renderer;
let orbitControls, transformControls;

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
let gridHelper;

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

// Initialize the 3D environment
function initScene() {
    console.log('Initializing 3D scene...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    // Create viewport container
    const viewportContainer = document.getElementById('view3d');
    if (!viewportContainer) {
        console.error('Viewport container not found!');
        return;
    }
    
    // Force viewport container to have proper dimensions
    viewportContainer.style.width = '100%';
    viewportContainer.style.height = '100%';
    viewportContainer.style.position = 'relative';
    viewportContainer.style.backgroundColor = '#ffffff';
    
    console.log('Viewport container dimensions:', {
        width: viewportContainer.clientWidth,
        height: viewportContainer.clientHeight
    });
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(viewportContainer.clientWidth, viewportContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewportContainer.appendChild(renderer.domElement);
    
    // Ensure canvas takes full container size
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    
    console.log('Renderer initialized with size:', {
        width: renderer.domElement.width,
        height: renderer.domElement.height
    });
    
    // Setup camera
    const aspect = viewportContainer.clientWidth / viewportContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    console.log('Camera initialized at position:', camera.position);
    
    // Setup orbit controls
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 50;
    orbitControls.maxPolarAngle = Math.PI / 2;
    
    // Setup transform controls
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', function(event) {
        orbitControls.enabled = !event.value;
    });
    scene.add(transformControls);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add grid and ground plane
    gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.01;
    plane.receiveShadow = true;
    scene.add(plane);
    
    // Add objects group
    scene.add(objectsGroup);
    
    // Load default font
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/fonts/helvetiker_regular.typeface.json', function (font) {
        defaultFont = font;
    });
    
    // Init GUI
    gui = new dat.GUI();
    
    // Setup animation loop
    animate();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);
    
    // Add a test cube to verify rendering
    const testCube = createCube();
    if (testCube) {
        console.log('Test cube created successfully at position:', testCube.position);
        selectObject(testCube);
    }
    
    console.log('Scene initialization complete');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    orbitControls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    const viewportContainer = document.getElementById('view3d');
    if (!viewportContainer) return;
    
    const width = viewportContainer.clientWidth;
    const height = viewportContainer.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    
    console.log('Window resized:', { width, height });
}

// Canvas click handler for object selection
function onCanvasClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(objectsGroup.children, true);
    
    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        selectObject(selectedMesh);
    } else {
        clearSelection();
    }
}

// Select an object
function selectObject(mesh) {
    clearSelection();
    selectedObject = mesh;
    selectedObjects.push(mesh);
    
    // Highlight selected object
    if (mesh.material) {
        mesh.material.emissive.setHex(0x666666);
    }
    
    // Attach transform controls to selected object
    transformControls.attach(mesh);
    
    // Update GUI
    updateGUI(mesh);
}

// Clear selection
function clearSelection() {
    if (selectedObjects.length > 0) {
        for (let obj of selectedObjects) {
            if (obj.material) {
                obj.material.emissive.setHex(0x000000);
            }
        }
        selectedObjects = [];
    }
    
    selectedObject = null;
    transformControls.detach();
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
    transformControls.addEventListener('objectChange', function(event) {
        const object = event.target.object;
        if (object) {
            // Snap position
            object.position.copy(snapToGrid(object.position));
            
            // Snap rotation
            object.rotation.copy(snapRotation(object.rotation));
            
            // Snap scale
            object.scale.copy(snapScale(object.scale));
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