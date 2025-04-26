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

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing 3D environment');
    
    try {
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
        viewportContainer.appendChild(renderer.domElement);
        console.log('Renderer initialized');
        
        // Initialize orbit controls
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        console.log('Orbit controls initialized');
        
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
        
        // Add test cube
        const testCube = createCube();
        testCube.position.set(0, 0.5, 0);
        scene.add(testCube);
        console.log('Test cube added to scene');
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        console.log('Scene initialization complete');
    } catch (error) {
        console.error('Error during scene initialization:', error);
        throw error; // Re-throw to be caught by the DOMContentLoaded handler
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
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Get list of intersected objects
        const intersects = raycaster.intersectObjects(objectsGroup.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            console.log('Object clicked:', object);
            selectObject(object);
        } else {
            console.log('No object clicked, deselecting');
            deselectAll();
        }
    } catch (error) {
        console.error('Error during canvas click handling:', error);
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