/**
 * UI interactions for the 3D Editor
 * Contains event handlers and UI-related functions
 */

// Object selection - raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse event handlers
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('wheel', handleMouseWheel);

// Button event listeners for shape creation
document.getElementById('cubeBtn').addEventListener('click', () => {
    const cube = createCube();
    clearSelection();
    selectedObject = cube;
    selectedObjects = [cube];
    cube.material.emissive.setHex(0x555555);
    updateGUI(cube);
});

document.getElementById('sphereBtn').addEventListener('click', () => {
    const sphere = createSphere();
    clearSelection();
    selectedObject = sphere;
    selectedObjects = [sphere];
    sphere.material.emissive.setHex(0x555555);
    updateGUI(sphere);
});

document.getElementById('cylinderBtn').addEventListener('click', () => {
    const cylinder = createCylinder();
    clearSelection();
    selectedObject = cylinder;
    selectedObjects = [cylinder];
    cylinder.material.emissive.setHex(0x555555);
    updateGUI(cylinder);
});

document.getElementById('coneBtn').addEventListener('click', () => {
    const cone = createCone();
    clearSelection();
    selectedObject = cone;
    selectedObjects = [cone];
    cone.material.emissive.setHex(0x555555);
    updateGUI(cone);
});

document.getElementById('torusBtn').addEventListener('click', () => {
    const torus = createTorus();
    clearSelection();
    selectedObject = torus;
    selectedObjects = [torus];
    torus.material.emissive.setHex(0x555555);
    updateGUI(torus);
});

document.getElementById('deleteBtn').addEventListener('click', () => {
    if (selectedObjects.length > 0) {
        for (let obj of selectedObjects) {
            const objData = findObjectFromMesh(obj);
            if (objData) {
                objects.splice(objects.indexOf(objData), 1);
            }
            objectsGroup.remove(obj);
        }
        selectedObject = null;
        selectedObjects = [];
        resetGUI();
    }
});

// Boolean operation buttons
document.getElementById('unionBtn').addEventListener('click', performUnion);
document.getElementById('subtractBtn').addEventListener('click', performSubtract);
document.getElementById('intersectBtn').addEventListener('click', performIntersect);
document.getElementById('groupBtn').addEventListener('click', groupObjects);
document.getElementById('ungroupBtn').addEventListener('click', ungroupObjects);

// Tab switching
document.getElementById('shapesTab').addEventListener('click', () => {
    switchTab('shapes');
});

document.getElementById('textTab').addEventListener('click', () => {
    switchTab('text');
});

document.getElementById('componentsTab').addEventListener('click', () => {
    switchTab('components');
});

// Text tool handlers
document.getElementById('textHeightValue').textContent = document.getElementById('textHeight').value;
document.getElementById('textDepthValue').textContent = document.getElementById('textDepth').value;

document.getElementById('textHeight').addEventListener('input', (event) => {
    document.getElementById('textHeightValue').textContent = event.target.value;
});

document.getElementById('textDepth').addEventListener('input', (event) => {
    document.getElementById('textDepthValue').textContent = event.target.value;
});

document.getElementById('addTextBtn').addEventListener('click', () => {
    const text = document.getElementById('textInput').value;
    if (!text) {
        alert("Please enter text");
        return;
    }
    
    const height = parseFloat(document.getElementById('textHeight').value);
    const depth = parseFloat(document.getElementById('textDepth').value);
    
    const textMesh = createText(text, height, depth);
    if (textMesh) {
        clearSelection();
        selectedObject = textMesh;
        selectedObjects = [textMesh];
        textMesh.material.emissive.setHex(0x555555);
        updateGUI(textMesh);
    }
});

// Component library items
const componentItems = document.querySelectorAll('.component-item');
componentItems.forEach(item => {
    item.addEventListener('click', () => {
        const type = item.getAttribute('data-type');
        const component = createComponent(type);
        if (component) {
            clearSelection();
            selectedObject = component;
            selectedObjects = [component];
            updateGUI(component);
        }
    });
});

// Switch between UI tabs
function switchTab(tabName) {
    // Hide all panels
    document.getElementById('toolbar').style.display = 'none';
    document.getElementById('textTools').style.display = 'none';
    document.getElementById('componentLibrary').style.display = 'none';
    
    // Update active tab
    document.getElementById('shapesTab').classList.remove('active');
    document.getElementById('textTab').classList.remove('active');
    document.getElementById('componentsTab').classList.remove('active');
    
    // Show selected panel
    activeTab = tabName;
    
    switch(tabName) {
        case 'shapes':
            document.getElementById('toolbar').style.display = 'block';
            document.getElementById('shapesTab').classList.add('active');
            break;
        case 'text':
            document.getElementById('textTools').style.display = 'block';
            document.getElementById('textTab').classList.add('active');
            break;
        case 'components':
            document.getElementById('componentLibrary').style.display = 'block';
            document.getElementById('componentsTab').classList.add('active');
            break;
    }
}

// Handle mouse down event
function handleMouseDown(event) {
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
        }
    } else if (!event.shiftKey) {
        // Click on empty space without shift - clear selection
        clearSelection();
    }
}

// Handle mouse up event
function handleMouseUp() {
    isDragging = false;
}

// Handle mouse move event
function handleMouseMove(event) {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        if (selectedObject) {
            // Move selected object in X-Z plane (keeping Y constant)
            const moveSpeed = 0.01;
            selectedObject.position.x += deltaMove.x * moveSpeed;
            selectedObject.position.z -= deltaMove.y * moveSpeed;
        } else {
            // Rotate camera around scene
            camera.position.x = camera.position.x * Math.cos(deltaMove.x * rotationSpeed) + camera.position.z * Math.sin(deltaMove.x * rotationSpeed);
            camera.position.z = -camera.position.x * Math.sin(deltaMove.x * rotationSpeed) + camera.position.z * Math.cos(deltaMove.x * rotationSpeed);
            
            camera.position.y += deltaMove.y * rotationSpeed;
        }
        
        camera.lookAt(scene.position);
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

// Handle mouse wheel event for zooming
function handleMouseWheel(event) {
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