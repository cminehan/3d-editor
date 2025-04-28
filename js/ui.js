/**
 * UI interactions for the 3D Editor
 * Contains event handlers and UI-related functions
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing UI event handlers...');

    // Mouse event handlers
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleMouseWheel);

    // Initialize UI elements
    initializeUIElements();
    updateObjectList();
});

function initializeUIElements() {
    console.log('Initializing UI elements...');

    // Button event listeners for shape creation
    const cubeBtn = document.getElementById('cubeBtn');
    if (cubeBtn) {
        console.log('Found cube button');
        cubeBtn.addEventListener('click', () => {
            console.log('Cube button clicked');
            const cube = createCube();
            if (cube) {
                clearSelection();
                selectedObject = cube;
                selectedObjects = [cube];
                cube.material.emissive.setHex(0x555555);
                updateGUI(cube);
                updateObjectList();
                console.log('Cube added and selected');
            }
        });
    } else {
        console.error('Cube button not found');
    }

    const sphereBtn = document.getElementById('sphereBtn');
    if (sphereBtn) {
        console.log('Found sphere button');
        sphereBtn.addEventListener('click', () => {
            console.log('Sphere button clicked');
            const sphere = createSphere();
            if (sphere) {
                clearSelection();
                selectedObject = sphere;
                selectedObjects = [sphere];
                sphere.material.emissive.setHex(0x555555);
                updateGUI(sphere);
                updateObjectList();
                console.log('Sphere added and selected');
            }
        });
    } else {
        console.error('Sphere button not found');
    }

    const cylinderBtn = document.getElementById('cylinderBtn');
    if (cylinderBtn) {
        console.log('Found cylinder button');
        cylinderBtn.addEventListener('click', () => {
            console.log('Cylinder button clicked');
            const cylinder = createCylinder();
            if (cylinder) {
                clearSelection();
                selectedObject = cylinder;
                selectedObjects = [cylinder];
                cylinder.material.emissive.setHex(0x555555);
                updateGUI(cylinder);
                updateObjectList();
                console.log('Cylinder added and selected');
            }
        });
    } else {
        console.error('Cylinder button not found');
    }

    const coneBtn = document.getElementById('coneBtn');
    if (coneBtn) {
        console.log('Found cone button');
        coneBtn.addEventListener('click', () => {
            console.log('Cone button clicked');
            const cone = createCone();
            if (cone) {
                clearSelection();
                selectedObject = cone;
                selectedObjects = [cone];
                cone.material.emissive.setHex(0x555555);
                updateGUI(cone);
                updateObjectList();
                console.log('Cone added and selected');
            }
        });
    } else {
        console.error('Cone button not found');
    }

    const pyramidBtn = document.getElementById('pyramidBtn');
    if (pyramidBtn) {
        console.log('Found pyramid button');
        pyramidBtn.addEventListener('click', () => {
            console.log('Pyramid button clicked');
            const pyramid = createPyramid();
            if (pyramid) {
                clearSelection();
                selectedObject = pyramid;
                selectedObjects = [pyramid];
                pyramid.material.emissive.setHex(0x555555);
                updateGUI(pyramid);
                updateObjectList();
                console.log('Pyramid added and selected');
            }
        });
    } else {
        console.error('Pyramid button not found');
    }

    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
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
    }

    // Boolean operation buttons
    const unionBtn = document.getElementById('unionBtn');
    if (unionBtn) {
        unionBtn.addEventListener('click', performUnion);
    }

    const subtractBtn = document.getElementById('subtractBtn');
    if (subtractBtn) {
        subtractBtn.addEventListener('click', performSubtract);
    }

    const groupBtn = document.getElementById('groupBtn');
    if (groupBtn) {
        groupBtn.addEventListener('click', groupObjects);
    }

    // View control buttons
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

    // Transform control buttons (right panel only)
    const moveBtnPanel = document.getElementById('moveBtnPanel');
    const rotateBtnPanel = document.getElementById('rotateBtnPanel');
    const scaleBtnPanel = document.getElementById('scaleBtnPanel');
    
    if (moveBtnPanel) {
        moveBtnPanel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (selectedObject) {
                transformControls.setMode('translate');
                moveBtnPanel.classList.add('active');
                rotateBtnPanel.classList.remove('active');
                scaleBtnPanel.classList.remove('active');
            }
        });
    }
    
    if (rotateBtnPanel) {
        rotateBtnPanel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (selectedObject) {
                transformControls.setMode('rotate');
                rotateBtnPanel.classList.add('active');
                moveBtnPanel.classList.remove('active');
                scaleBtnPanel.classList.remove('active');
            }
        });
    }
    
    if (scaleBtnPanel) {
        scaleBtnPanel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (selectedObject) {
                transformControls.setMode('scale');
                scaleBtnPanel.classList.add('active');
                moveBtnPanel.classList.remove('active');
                rotateBtnPanel.classList.remove('active');
            }
        });
    }

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

    // Template buttons
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

    // Tab switching
    const shapesTab = document.getElementById('shapesTab');
    if (shapesTab) {
        shapesTab.addEventListener('click', () => {
            switchTab('shapes');
        });
    }

    const textTab = document.getElementById('textTab');
    if (textTab) {
        textTab.addEventListener('click', () => {
            switchTab('text');
        });
    }

    const componentsTab = document.getElementById('componentsTab');
    if (componentsTab) {
        componentsTab.addEventListener('click', () => {
            switchTab('components');
        });
    }

    // Text tool handlers
    const textHeightValue = document.getElementById('textHeightValue');
    const textHeight = document.getElementById('textHeight');
    const textDepthValue = document.getElementById('textDepthValue');
    const textDepth = document.getElementById('textDepth');
    const addTextBtn = document.getElementById('addTextBtn');

    if (textHeightValue && textHeight) {
        textHeightValue.textContent = textHeight.value;
        textHeight.addEventListener('input', (event) => {
            textHeightValue.textContent = event.target.value;
        });
    }

    if (textDepthValue && textDepth) {
        textDepthValue.textContent = textDepth.value;
        textDepth.addEventListener('input', (event) => {
            textDepthValue.textContent = event.target.value;
        });
    }

    if (addTextBtn) {
        addTextBtn.addEventListener('click', () => {
            const textInput = document.getElementById('textInput');
            if (!textInput || !textInput.value) {
                alert("Please enter text");
                return;
            }
            
            const height = parseFloat(textHeight.value);
            const depth = parseFloat(textDepth.value);
    
            const textMesh = createText(textInput.value, height, depth);
            if (textMesh) {
                clearSelection();
                selectedObject = textMesh;
                selectedObjects = [textMesh];
                textMesh.material.emissive.setHex(0x555555);
                updateGUI(textMesh);
            }
        });
    }

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

    console.log('UI event handlers initialized successfully');
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
    
    // Calculate objects intersecting the picking ray, exclude the grid
    const intersects = raycaster.intersectObjects(objectsGroup.children, true)
        .filter(intersect => !(intersect.object === gridHelper));
    
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

// Populate the Objects list and handle selection
function updateObjectList() {
    const objectList = document.getElementById('objectList');
    if (!objectList) return;
    objectList.innerHTML = '';
    objectsGroup.children.forEach((obj, idx) => {
        const li = document.createElement('li');
        li.textContent = obj.name || obj.userData.type || `Object ${idx+1}`;
        li.className = 'object-list-item' + (selectedObject === obj ? ' selected' : '');
        li.style.cursor = 'pointer';
        li.onclick = (e) => {
            e.stopPropagation();
            selectObject(obj);
        };
        objectList.appendChild(li);
    });
}