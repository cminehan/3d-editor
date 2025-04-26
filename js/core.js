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
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Create viewport container
    const viewportContainer = document.getElementById('view3d');
    viewportContainer.style.display = 'grid';
    viewportContainer.style.gridTemplateColumns = '1fr 1fr';
    viewportContainer.style.gridTemplateRows = '1fr 1fr';
    viewportContainer.style.gap = '2px';
    viewportContainer.style.backgroundColor = '#333';
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    viewportContainer.appendChild(renderer.domElement);
    
    // Create viewport elements
    createViewport('perspective', 'Perspective View', viewportContainer);
    createViewport('top', 'Top View', viewportContainer);
    createViewport('front', 'Front View', viewportContainer);
    createViewport('side', 'Side View', viewportContainer);
    
    // Setup cameras and controls for each viewport
    setupViewports();
    
    // Setup transform controls
    transformControls = new THREE.TransformControls(viewports.perspective.camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', function(event) {
        Object.values(viewports).forEach(viewport => {
            viewport.controls.enabled = !event.value;
        });
    });
    scene.add(transformControls);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add grid and ground plane
    gridHelper = new THREE.GridHelper(gridSize * gridDivisions, gridDivisions);
    scene.add(gridHelper);
    
    const planeGeometry = new THREE.PlaneGeometry(gridSize * gridDivisions, gridSize * gridDivisions);
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
    
    // Update TransformControls with snapping
    updateTransformControls();
}

// Create a viewport element
function createViewport(name, title, container) {
    const viewport = document.createElement('div');
    viewport.id = `viewport-${name}`;
    viewport.style.position = 'relative';
    viewport.style.width = '100%';
    viewport.style.height = '100%';
    viewport.style.backgroundColor = '#f0f0f0';
    
    const titleBar = document.createElement('div');
    titleBar.style.position = 'absolute';
    titleBar.style.top = '0';
    titleBar.style.left = '0';
    titleBar.style.right = '0';
    titleBar.style.padding = '5px';
    titleBar.style.backgroundColor = 'rgba(0,0,0,0.5)';
    titleBar.style.color = 'white';
    titleBar.style.fontSize = '12px';
    titleBar.textContent = title;
    
    viewport.appendChild(titleBar);
    container.appendChild(viewport);
    
    viewports[name].element = viewport;
}

// Setup cameras and controls for each viewport
function setupViewports() {
    // Perspective view
    viewports.perspective.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    viewports.perspective.camera.position.set(8, 8, 8);
    viewports.perspective.camera.lookAt(scene.position);
    
    // Top view
    viewports.top.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
    viewports.top.camera.position.set(0, 20, 0);
    viewports.top.camera.lookAt(scene.position);
    
    // Front view
    viewports.front.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
    viewports.front.camera.position.set(0, 0, 20);
    viewports.front.camera.lookAt(scene.position);
    
    // Side view
    viewports.side.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
    viewports.side.camera.position.set(20, 0, 0);
    viewports.side.camera.lookAt(scene.position);
    
    // Setup controls for each viewport
    Object.keys(viewports).forEach(name => {
        const viewport = viewports[name];
        viewport.controls = new THREE.OrbitControls(viewport.camera, renderer.domElement);
        viewport.controls.enableDamping = true;
        viewport.controls.dampingFactor = 0.05;
        
        // Lock rotation for orthographic views
        if (name !== 'perspective') {
            viewport.controls.enableRotate = false;
        }
    });
    
    // Set active viewport
    setActiveViewport('perspective');
}

// Set active viewport
function setActiveViewport(name) {
    activeViewport = name;
    const viewport = viewports[name];
    
    // Update transform controls
    transformControls.camera = viewport.camera;
    
    // Update renderer size
    const rect = viewport.element.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    
    // Update camera aspect ratio
    if (viewport.camera instanceof THREE.PerspectiveCamera) {
        viewport.camera.aspect = rect.width / rect.height;
        viewport.camera.updateProjectionMatrix();
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls for all viewports
    Object.values(viewports).forEach(viewport => {
        viewport.controls.update();
    });
    
    // Render each viewport
    Object.entries(viewports).forEach(([name, viewport]) => {
        const rect = viewport.element.getBoundingClientRect();
        renderer.setViewport(rect.left, rect.top, rect.width, rect.height);
        renderer.setScissor(rect.left, rect.top, rect.width, rect.height);
        renderer.setScissorTest(true);
        renderer.render(scene, viewport.camera);
    });
}

// Window resize handler
function onWindowResize() {
    Object.values(viewports).forEach(viewport => {
        const rect = viewport.element.getBoundingClientRect();
        if (viewport.camera instanceof THREE.PerspectiveCamera) {
            viewport.camera.aspect = rect.width / rect.height;
            viewport.camera.updateProjectionMatrix();
        }
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    return Math.random() * 0xffffff;
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