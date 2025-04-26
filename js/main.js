/**
 * Main entry point for the 3D Editor
 * Initializes the application and sets up event listeners
 */

// Version information
const VERSION = '1.0.4';

// Initialize the application on document load
document.addEventListener('DOMContentLoaded', function() {
    console.log('3D Editor initializing...');
    
    // Initialize Three.js scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Set up renderer
    const container = document.getElementById('view3d');
    if (container) {
        container.appendChild(renderer.domElement);
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    // Set up controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Set up initial camera position
    camera.position.z = 5;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
    
    // Initialize 3D scene
    initScene();
    
    // Set up event listeners for shape creation
    setupShapeButtons();
    
    // Set up event listeners for view controls
    setupViewControls();
    
    // Set up event listeners for transform controls
    setupTransformControls();
    
    // Set up event listeners for template buttons
    setupTemplateButtons();
    
    // Set up version history modal
    setupVersionHistory();
    
    console.log('3D Editor initialized successfully.');
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    const container = document.getElementById('view3d');
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// Set up version history modal
function setupVersionHistory() {
    const modal = document.getElementById('versionHistoryModal');
    const btn = document.getElementById('versionHistoryBtn');
    const span = document.getElementsByClassName('close')[0];
    
    // Update version display
    document.querySelector('.version').textContent = `v${VERSION}`;
    
    // Open modal
    btn.onclick = function() {
        modal.style.display = 'block';
    };
    
    // Close modal
    span.onclick = function() {
        modal.style.display = 'none';
    };
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Set up shape creation buttons
function setupShapeButtons() {
    // Cube button
    document.getElementById('cubeBtn').addEventListener('click', function() {
        const cube = createCube();
        if (cube) {
            selectObject(cube);
            showCreationEffect(cube);
        }
    });
    
    // Sphere button
    document.getElementById('sphereBtn').addEventListener('click', function() {
        const sphere = createSphere();
        if (sphere) {
            selectObject(sphere);
            showCreationEffect(sphere);
        }
    });
    
    // Cylinder button
    document.getElementById('cylinderBtn').addEventListener('click', function() {
        const cylinder = createCylinder();
        if (cylinder) {
            selectObject(cylinder);
            showCreationEffect(cylinder);
        }
    });
    
    // Cone button
    document.getElementById('coneBtn').addEventListener('click', function() {
        const cone = createCone();
        if (cone) {
            selectObject(cone);
            showCreationEffect(cone);
        }
    });
    
    // Delete button
    document.getElementById('deleteBtn').addEventListener('click', function() {
        if (selectedObject) {
            deleteSelectedObject();
        }
    });
}

// Set up view control buttons
function setupViewControls() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            setActiveViewport(view);
            
            // Update active state
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Set up transform control buttons
function setupTransformControls() {
    document.getElementById('moveBtn').addEventListener('click', function() {
        transformControls.setMode('translate');
        this.classList.add('active');
    });
    
    document.getElementById('rotateBtn').addEventListener('click', function() {
        transformControls.setMode('rotate');
        this.classList.add('active');
    });
    
    document.getElementById('scaleBtn').addEventListener('click', function() {
        transformControls.setMode('scale');
        this.classList.add('active');
    });
}

// Set up template buttons
function setupTemplateButtons() {
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const template = this.dataset.template;
            createTemplate(template);
        });
    });
}

// Show creation effect for new objects
function showCreationEffect(object) {
    // Scale up animation
    object.scale.set(0.1, 0.1, 0.1);
    const targetScale = new THREE.Vector3(1, 1, 1);
    
    // Create animation
    const animate = function() {
        if (object.scale.x < 0.95) {
            object.scale.lerp(targetScale, 0.1);
            requestAnimationFrame(animate);
        } else {
            object.scale.copy(targetScale);
        }
    };
    
    animate();
    
    // Add highlight effect
    const originalColor = object.material.color.clone();
    object.material.emissive.setHex(0x666666);
    
    setTimeout(() => {
        object.material.emissive.setHex(0x000000);
    }, 1000);
}

// Delete selected object
function deleteSelectedObject() {
    if (selectedObject) {
        // Fade out animation
        const fadeOut = function() {
            if (selectedObject.material.opacity > 0.1) {
                selectedObject.material.opacity -= 0.1;
                selectedObject.material.transparent = true;
                requestAnimationFrame(fadeOut);
            } else {
                objectsGroup.remove(selectedObject);
                const index = objects.findIndex(obj => obj.mesh === selectedObject);
                if (index > -1) {
                    objects.splice(index, 1);
                }
                clearSelection();
            }
        };
        
        fadeOut();
    }
}

// Create template objects
function createTemplate(template) {
    switch(template) {
        case 'house':
            createHouse();
            break;
        case 'robot':
            createRobot();
            break;
        case 'car':
            createCar();
            break;
        case 'castle':
            createCastle();
            break;
    }
}

// Template creation functions
function createHouse() {
    // Create base
    const base = createCube();
    base.scale.set(2, 0.2, 2);
    base.position.y = 0.1;
    
    // Create walls
    const walls = createCube();
    walls.scale.set(1.8, 1, 1.8);
    walls.position.y = 0.7;
    
    // Create roof
    const roof = createCone();
    roof.scale.set(1.5, 1, 1.5);
    roof.position.y = 1.7;
    
    // Group all parts
    const house = new THREE.Group();
    house.add(base, walls, roof);
    objectsGroup.add(house);
    
    const obj = new DesignObject(house, 'house', true);
    objects.push(obj);
    
    selectObject(house);
    showCreationEffect(house);
}

function createRobot() {
    // Create body
    const body = createCube();
    body.scale.set(1, 1.2, 0.8);
    body.position.y = 1.2;
    
    // Create head
    const head = createCube();
    head.scale.set(0.8, 0.8, 0.8);
    head.position.y = 2.2;
    
    // Create arms
    const leftArm = createCube();
    leftArm.scale.set(0.3, 0.8, 0.3);
    leftArm.position.set(-1.2, 1.2, 0);
    
    const rightArm = createCube();
    rightArm.scale.set(0.3, 0.8, 0.3);
    rightArm.position.set(1.2, 1.2, 0);
    
    // Create legs
    const leftLeg = createCube();
    leftLeg.scale.set(0.3, 0.8, 0.3);
    leftLeg.position.set(-0.4, 0.4, 0);
    
    const rightLeg = createCube();
    rightLeg.scale.set(0.3, 0.8, 0.3);
    rightLeg.position.set(0.4, 0.4, 0);
    
    // Group all parts
    const robot = new THREE.Group();
    robot.add(body, head, leftArm, rightArm, leftLeg, rightLeg);
    objectsGroup.add(robot);
    
    const obj = new DesignObject(robot, 'robot', true);
    objects.push(obj);
    
    selectObject(robot);
    showCreationEffect(robot);
}

function createCar() {
    // Create body
    const body = createCube();
    body.scale.set(2, 0.5, 1);
    body.position.y = 0.5;
    
    // Create cabin
    const cabin = createCube();
    cabin.scale.set(1, 0.5, 0.8);
    cabin.position.set(-0.3, 0.75, 0);
    
    // Create wheels
    const wheelPositions = [
        [-0.8, 0.3, 0.6],
        [0.8, 0.3, 0.6],
        [-0.8, 0.3, -0.6],
        [0.8, 0.3, -0.6]
    ];
    
    const wheels = wheelPositions.map(pos => {
        const wheel = createCylinder();
        wheel.scale.set(0.3, 0.1, 0.3);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        return wheel;
    });
    
    // Group all parts
    const car = new THREE.Group();
    car.add(body, cabin, ...wheels);
    objectsGroup.add(car);
    
    const obj = new DesignObject(car, 'car', true);
    objects.push(obj);
    
    selectObject(car);
    showCreationEffect(car);
}

function createCastle() {
    // Create base
    const base = createCube();
    base.scale.set(3, 0.2, 3);
    base.position.y = 0.1;
    
    // Create main tower
    const mainTower = createCube();
    mainTower.scale.set(1.5, 2, 1.5);
    mainTower.position.y = 1.2;
    
    // Create corner towers
    const towerPositions = [
        [-1, 0, -1],
        [1, 0, -1],
        [-1, 0, 1],
        [1, 0, 1]
    ];
    
    const towers = towerPositions.map(pos => {
        const tower = createCylinder();
        tower.scale.set(0.5, 1.5, 0.5);
        tower.position.set(...pos);
        tower.position.y = 0.85;
        return tower;
    });
    
    // Create walls
    const wallPositions = [
        [0, 0, -1.5],
        [0, 0, 1.5],
        [-1.5, 0, 0],
        [1.5, 0, 0]
    ];
    
    const walls = wallPositions.map(pos => {
        const wall = createCube();
        wall.scale.set(3, 0.8, 0.2);
        wall.position.set(...pos);
        wall.position.y = 0.5;
        return wall;
    });
    
    // Group all parts
    const castle = new THREE.Group();
    castle.add(base, mainTower, ...towers, ...walls);
    objectsGroup.add(castle);
    
    const obj = new DesignObject(castle, 'castle', true);
    objects.push(obj);
    
    selectObject(castle);
    showCreationEffect(castle);
}