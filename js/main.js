/**
 * Main entry point for the 3D Editor
 * Initializes the application and sets up event listeners
 */

// Version information - single source of truth
const VERSION = '1.1.3';
const VERSION_CACHE = '1.1.3';  // For cache busting
window.APP_VERSION = VERSION;
window.APP_VERSION_CACHE = VERSION_CACHE;

// Initialize the application on document load
document.addEventListener('DOMContentLoaded', function() {
    console.log('3D Editor initializing...');
    
    // Set version numbers immediately
    document.querySelectorAll('[id^="versionNumber"]').forEach(el => {
        el.textContent = VERSION;
    });
    
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
    if (orbitControls) {
        orbitControls.update();
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
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
            
            // Update camera position based on view
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
            
            // Update orbit controls target
            orbitControls.target.set(0, 0, 0);
            orbitControls.update();
            
            // Update active state
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Set up transform control buttons
function setupTransformControls() {
    const moveBtn = document.getElementById('moveBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const scaleBtn = document.getElementById('scaleBtn');
    
    moveBtn.addEventListener('click', function() {
        if (selectedObject) {
            setTransformMode('translate');
        }
    });
    
    rotateBtn.addEventListener('click', function() {
        if (selectedObject) {
            setTransformMode('rotate');
        }
    });
    
    scaleBtn.addEventListener('click', function() {
        if (selectedObject) {
            setTransformMode('scale');
        }
    });
}

// Set up template buttons
function setupTemplateButtons() {
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const template = this.dataset.template;
            try {
                const templateObject = createTemplate(template);
                if (templateObject) {
                    selectObject(templateObject);
                    showCreationEffect(templateObject);
                } else {
                    console.error('Failed to create template:', template);
                }
            } catch (error) {
                console.error('Error creating template:', error);
            }
        });
    });
}

// Show creation effect for new objects
function showCreationEffect(object) {
    if (!object || !object.material) {
        console.error('Invalid object or missing material:', object);
        return;
    }

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
    if (object.material) {
        const originalColor = object.material.color.clone();
        object.material.emissive.setHex(0x666666);
        
        setTimeout(() => {
            if (object.material) {
                object.material.emissive.setHex(0x000000);
            }
        }, 1000);
    }
}

// Delete selected object
function deleteSelectedObject() {
    if (!selectedObject) {
        console.warn('No object selected for deletion');
        return;
    }
    
    try {
        // Remove from scene
        objectsGroup.remove(selectedObject);
        
        // Remove from objects array
        const index = objects.findIndex(obj => obj.mesh === selectedObject);
        if (index > -1) {
            objects.splice(index, 1);
        }
        
        // Clear selection
        clearSelection();
        
        console.log('Object deleted successfully');
    } catch (error) {
        console.error('Error deleting object:', error);
    }
}

// Create template objects
function createTemplate(template) {
    console.log('Creating template:', template);
    
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
        default:
            console.error('Unknown template:', template);
            return;
    }
}

// Template creation functions
function createHouse() {
    console.log('Creating house template...');
    
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
    house.name = 'house_' + Date.now();
    house.add(base, walls, roof);
    objectsGroup.add(house);
    
    const obj = new DesignObject(house, 'house', true);
    objects.push(obj);
    
    selectObject(house);
    showCreationEffect(house);
    console.log('House template created successfully');
}

function createRobot() {
    console.log('Creating robot template...');
    
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
    robot.name = 'robot_' + Date.now();
    robot.add(body, head, leftArm, rightArm, leftLeg, rightLeg);
    objectsGroup.add(robot);
    
    const obj = new DesignObject(robot, 'robot', true);
    objects.push(obj);
    
    selectObject(robot);
    showCreationEffect(robot);
    console.log('Robot template created successfully');
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