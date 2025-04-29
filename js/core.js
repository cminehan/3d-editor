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
        
        if (mesh.geometry) {
            this.originalGeometry = mesh.geometry.clone();
        }
    }
}

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

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = 0.01;

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
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Add grid helper
        gridHelper = new THREE.GridHelper(gridSize * gridDivisions, gridDivisions, 0x000000, 0x000000);
        gridHelper.position.y = 0;
        scene.add(gridHelper);
        
        // Add objectsGroup to scene
        scene.add(objectsGroup);
        
        // Initialize camera
        const aspect = viewportContainer.clientWidth / viewportContainer.clientHeight || 1;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        console.log('Camera initialized');
        
        // Initialize renderer with proper pixel ratio
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(viewportContainer.clientWidth, viewportContainer.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear any existing canvas
        while (viewportContainer.firstChild) {
            viewportContainer.removeChild(viewportContainer.firstChild);
        }
        
        // Add new canvas
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
        
        // Add event listeners for orbit controls
        viewportContainer.addEventListener('mouseenter', () => {
            orbitControls.enabled = true;
        });
        
        viewportContainer.addEventListener('mouseleave', () => {
            orbitControls.enabled = false;
        });
        
        // Prevent orbit controls from affecting other elements
        document.addEventListener('wheel', (event) => {
            if (!viewportContainer.contains(event.target)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, { passive: false });
        
        // Force initial resize
        onWindowResize();
        
        // Initialize transform controls
        initTransformControls();
        initPropertyListeners();
        
        // Initialize raycaster
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        console.log('Raycaster initialized');
        
        // Add test cube
        const testCube = createCube();
        testCube.position.set(0, 1, 0);
        testCube.name = 'test_cube';
        testCube.userData = { type: 'cube' };
        console.log('Test cube added to scene');
        
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
            
            // If shift is pressed, add to selection
            if (event.shiftKey) {
                if (!selectedObjects.includes(object)) {
                    selectedObjects.push(object);
                    if (object.material) {
                        object.material.emissive.setHex(0x666666);
                    }
                }
            } else {
                // Only clear selection if we're selecting a different object
                if (!selectedObjects.includes(object)) {
                    clearSelection();
                }
                selectObject(object);
            }
        } else {
            // Only clear selection if clicking on empty space
            if (!event.shiftKey) {
                clearSelection();
            }
        }
    } catch (error) {
        console.error('Error during canvas click handling:', error);
    }
}

// Initialize transform controls
function initTransformControls() {
    if (!transformControls) {
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        scene.add(transformControls);
        
        // Add event listeners
        transformControls.addEventListener('dragging-changed', function(event) {
            orbitControls.enabled = !event.value;
        });
        
        transformControls.addEventListener('change', function() {
            if (selectedObject) {
                updateObjectList();
            }
        });
        
        transformControls.addEventListener('mouseDown', function() {
            orbitControls.enabled = false;
        });
        
        transformControls.addEventListener('mouseUp', function() {
            orbitControls.enabled = true;
        });
        
        // Set initial mode
        transformControls.setMode('translate');
        transformControls.visible = false;
    }
}

// Set transform mode
function setTransformMode(mode) {
    if (!transformControls || !selectedObject) return;
    
    // Store current selection
    const currentObject = selectedObject;
    
    // Set transform mode
    transformControls.setMode(mode);
    transformControls.attach(currentObject);
    transformControls.visible = true;
    
    // Update button states
    const buttons = {
        'translate': document.getElementById('moveBtn'),
        'rotate': document.getElementById('rotateBtn'),
        'scale': document.getElementById('scaleBtn')
    };
    
    Object.entries(buttons).forEach(([btnMode, btn]) => {
        if (btn) {
            btn.classList.toggle('active', btnMode === mode);
        }
    });
}

// Select an object
function selectObject(mesh) {
    console.log('Selecting object:', mesh.name);
    
    // Clear previous selection
    clearSelection();
    
    // Set new selection
    selectedObject = mesh;
    selectedObjects = [mesh];
    
    // Highlight selected object
    if (mesh.material) {
        mesh.material.emissive.setHex(0x666666);
    }
    
    // Attach transform controls to selected object
    if (transformControls) {
        transformControls.attach(mesh);
        transformControls.visible = true;
        transformControls.setMode('translate'); // Default to translate mode
    }
    
    // Update object list
    updateObjectList();
}

// Update the selection indicator
function updateSelectionIndicator() {
    const indicator = document.getElementById('selection-indicator');
    if (!indicator) return;
    
    if (selectedObjects.length === 0) {
        indicator.textContent = "No objects selected";
    } else if (selectedObjects.length === 1) {
        indicator.textContent = "1 object selected";
    } else {
        indicator.textContent = `${selectedObjects.length} objects selected`;
    }
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
    updateSelectionIndicator();
}

// Handle mouse down event
function handleMouseDown(event) {
    // Ignore clicks on UI elements
    if (event.target.closest('#toolbar, #textTools, #componentLibrary, .operations, .dg')) {
        return;
    }
    
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    
    // For selection
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray, exclude the grid and plane
    const intersects = raycaster.intersectObjects(objectsGroup.children, true)
        .filter(intersect => !(intersect.object === gridHelper || intersect.object === plane));
    
    if (intersects.length > 0) {
        // If shift is pressed, add to selection
        if (event.shiftKey) {
            let targetObject = intersects[0].object;
            
            // If object is part of a group, select the top-level group
            while (targetObject.parent && targetObject.parent !== objectsGroup) {
                targetObject = targetObject.parent;
            }
            
            // Check if already selected
            const index = selectedObjects.indexOf(targetObject);
            if (index === -1) {
                // Add to selection
                selectedObjects.push(targetObject);
                if (targetObject.material) {
                    targetObject.material.emissive.setHex(0x555555);
                }
                
                // Also update the single selection
                selectedObject = targetObject;
                updateGUI(targetObject);
                
                console.log(`Selected object added. Total: ${selectedObjects.length}`);
            } else {
                // Remove from selection
                selectedObjects.splice(index, 1);
                if (targetObject.material) {
                    targetObject.material.emissive.setHex(0x000000);
                }
                
                // Update the single selection to the last selected if any
                if (selectedObjects.length > 0) {
                    selectedObject = selectedObjects[selectedObjects.length - 1];
                    updateGUI(selectedObject);
                } else {
                    selectedObject = null;
                    resetGUI();
                }
                
                console.log(`Selected object removed. Total: ${selectedObjects.length}`);
            }
        } else {
            // Clear previous selection
            clearSelection();
            
            // Select new object
            let targetObject = intersects[0].object;
            
            // If object is part of a group, select the top-level group
            while (targetObject.parent && targetObject.parent !== objectsGroup) {
                targetObject = targetObject.parent;
            }
            
            selectedObject = targetObject;
            selectedObjects = [targetObject];
            
            if (targetObject.material) {
                targetObject.material.emissive.setHex(0x555555);
            }
            
            updateGUI(targetObject);
            console.log("Single object selected");
        }
    } else if (!event.shiftKey && !event.target.closest('.dg')) {
        // Click on empty space without shift - clear selection
        // But don't clear if clicking on dat.GUI
        clearSelection();
    }
    
    updateSelectionIndicator();
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
    // Clear property inputs
    const properties = ['pos', 'rot', 'scale'];
    const axes = ['X', 'Y', 'Z'];
    
    properties.forEach(prop => {
        axes.forEach(axis => {
            const input = document.getElementById(`${prop}${axis}`);
            if (input) {
                input.value = '';
            }
        });
    });
}

// Update GUI for selected object
function updateGUI(object) {
    if (!object) return;
    
    // Update property inputs
    const properties = ['pos', 'rot', 'scale'];
    const axes = ['X', 'Y', 'Z'];
    
    properties.forEach(prop => {
        axes.forEach(axis => {
            const input = document.getElementById(`${prop}${axis}`);
            if (input) {
                let value;
                switch(prop) {
                    case 'pos':
                        value = object.position[axis.toLowerCase()];
                        break;
                    case 'rot':
                        value = THREE.MathUtils.radToDeg(object.rotation[axis.toLowerCase()]);
                        break;
                    case 'scale':
                        value = object.scale[axis.toLowerCase()];
                        break;
                }
                input.value = value.toFixed(2);
            }
        });
    });
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
    
    // Reset orbit controls target
    orbitControls.target.set(0, 0, 0);
    
    // Store current camera properties
    const currentFOV = camera.fov;
    const currentNear = camera.near;
    const currentFar = camera.far;
    
    switch(view) {
        case 'perspective':
            camera.position.set(5, 5, 5);
            camera.lookAt(0, 0, 0);
            camera.fov = 75;
            break;
        case 'top':
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
            camera.up.set(0, 0, -1); // Adjust up vector for top view
            camera.fov = 50;
            break;
        case 'front':
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
            camera.up.set(0, 1, 0); // Reset up vector
            camera.fov = 50;
            break;
        case 'side':
            camera.position.set(10, 0, 0);
            camera.lookAt(0, 0, 0);
            camera.up.set(0, 1, 0); // Reset up vector
            camera.fov = 50;
            break;
    }
    
    // Update camera if properties changed
    if (camera.fov !== currentFOV || camera.near !== currentNear || camera.far !== currentFar) {
        camera.updateProjectionMatrix();
    }
    
    // Force controls update
    orbitControls.update();
    
    // Update renderer
    if (renderer) {
        renderer.render(scene, camera);
    }
    
    console.log('Viewport updated:', view);
}

function initPropertyListeners() {
    // Transform mode buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.dataset.mode) {
            btn.addEventListener('click', () => {
                setTransformMode(btn.dataset.mode);
            });
        }
    });
    // Remove property input listeners
}

function onObjectSelected(object) {
    if (selectedObject) {
        transformControls.detach();
    }
    
    selectedObject = object;
    
    if (object) {
        transformControls.attach(object);
    }
}

// Set up combine buttons
function setupCombineButtons() {
    const unionBtn = document.getElementById('unionBtn');
    const subtractBtn = document.getElementById('subtractBtn');
    const groupBtn = document.getElementById('groupBtn');
    
    unionBtn.addEventListener('click', function() {
        if (selectedObjects.length >= 2) {
            // Perform union operation
            console.log('Performing union operation');
        } else {
            console.warn('Please select at least two objects to combine');
        }
    });
    
    subtractBtn.addEventListener('click', function() {
        if (selectedObjects.length >= 2) {
            // Perform subtract operation
            console.log('Performing subtract operation');
        } else {
            console.warn('Please select at least two objects to subtract');
        }
    });
    
    groupBtn.addEventListener('click', function() {
        if (selectedObjects.length >= 2) {
            // Perform group operation
            console.log('Performing group operation');
        } else {
            console.warn('Please select at least two objects to group');
        }
    });
}

// Handle mouse wheel event for zooming
function handleMouseWheel(event) {
    // Check if mouse is over a UI panel
    const isOverLeftPanel = event.target.closest('#toolbar, #textTools, #componentLibrary, .operations');
    const isOverRightPanel = event.target.closest('.right-panel');
    
    if (isOverLeftPanel || isOverRightPanel) {
        // Allow normal scrolling for UI panels
        return true;
    }
    
    // Prevent default for 3D view
    event.preventDefault();
    
    // Zoom the camera
    const zoomSpeed = 0.2;
    const distance = Math.sqrt(
        camera.position.x * camera.position.x + 
        camera.position.y * camera.position.y + 
        camera.position.z * camera.position.z
    );
    
    // Limit zoom in/out
    if ((distance > 3 || event.deltaY > 0) && (distance < 20 || event.deltaY < 0)) {
        camera.position.x += (camera.position.x / distance) * (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        camera.position.y += (camera.position.y / distance) * (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        camera.position.z += (camera.position.z / distance) * (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
    }
    
    camera.lookAt(scene.position);
}

// Delete selected object
function deleteSelectedObject() {
    if (!selectedObject) {
        console.warn('No object selected for deletion');
        return;
    }
    
    try {
        console.log('Deleting object:', selectedObject.name);
        
        // Remove from scene
        objectsGroup.remove(selectedObject);
        
        // Remove from objects array
        const index = objects.findIndex(obj => obj.mesh === selectedObject);
        if (index > -1) {
            objects.splice(index, 1);
        }
        
        // Clear selection and transform controls
        if (transformControls) {
            transformControls.detach();
            transformControls.visible = false;
        }
        
        selectedObject = null;
        selectedObjects = [];
        
        // Update UI
        updateObjectList();
        resetGUI();
        
        console.log('Object deleted successfully');
    } catch (error) {
        console.error('Error deleting object:', error);
    }
}