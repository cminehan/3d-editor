/**
 * Core functionality for the 3D Editor
 * Sets up the Three.js scene, camera, renderer, and shared variables
 */

// Main Three.js components
let scene, camera, renderer;

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
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 4;
    camera.position.x = 4;
    camera.lookAt(scene.position);
    
    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('view3d').appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add grid and ground plane
    const gridHelper = new THREE.GridHelper(20, 20);
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
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Helper function to get random color
function getRandomColor() {
    return Math.random() * 0xffffff;
}

// Find object data from mesh
function findObjectFromMesh(mesh) {
    return objects.find(obj => obj.mesh === mesh);
}

// Utility function to clear selection
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
    resetGUI();
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

// Setup event listeners
window.addEventListener('resize', onWindowResize);