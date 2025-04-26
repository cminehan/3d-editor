/**
 * Shape creation functions for the 3D Editor
 * Contains functions to create basic geometries
 */

// Create a cube
function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: getRandomColor(),
        shininess: 30
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    objectsGroup.add(cube);
    
    const obj = new DesignObject(cube, 'cube');
    objects.push(obj);
    
    return cube;
}

// Create a sphere
function createSphere() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: getRandomColor(),
        shininess: 30
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0.5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    objectsGroup.add(sphere);
    
    const obj = new DesignObject(sphere, 'sphere');
    objects.push(obj);
    
    return sphere;
}

// Create a cylinder
function createCylinder() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: getRandomColor(),
        shininess: 30
    });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, 0.5, 0);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    objectsGroup.add(cylinder);
    
    const obj = new DesignObject(cylinder, 'cylinder');
    objects.push(obj);
    
    return cylinder;
}

// Create a cone
function createCone() {
    const geometry = new THREE.ConeGeometry(0.5, 1, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: getRandomColor(),
        shininess: 30
    });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.set(0, 0.5, 0);
    cone.castShadow = true;
    cone.receiveShadow = true;
    objectsGroup.add(cone);
    
    const obj = new DesignObject(cone, 'cone');
    objects.push(obj);
    
    return cone;
}

// Create a torus
function createTorus() {
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    torus.castShadow = true;
    torus.receiveShadow = true;
    objectsGroup.add(torus);
    
    const obj = new DesignObject(torus, 'torus');
    objects.push(obj);
    
    return torus;
}

// Create 3D text
function createText(text, height, depth) {
    if (!defaultFont) {
        alert("Font not loaded yet. Please try again in a moment.");
        return null;
    }
    
    const geometry = new THREE.TextGeometry(text, {
        font: defaultFont,
        size: height,
        height: depth,
        curveSegments: 12,
        bevelEnabled: false
    });
    
    geometry.computeBoundingBox();
    const centerOffset = new THREE.Vector3();
    geometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
    
    const material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
    const textMesh = new THREE.Mesh(geometry, material);
    
    textMesh.position.set(
        Math.random() * 3 - 1.5,
        0.5,
        Math.random() * 3 - 1.5
    );
    
    textMesh.castShadow = true;
    textMesh.receiveShadow = true;
    objectsGroup.add(textMesh);
    
    const obj = new DesignObject(textMesh, 'text');
    objects.push(obj);
    
    return textMesh;
}

// Group object functions
function groupObjects() {
    if (!selectedObjects || selectedObjects.length < 2) {
        alert("Please select at least two objects to group");
        return;
    }
    
    // Create a new group
    const group = new THREE.Group();
    
    // Create a new object data
    const groupObj = new DesignObject(group, 'group', true);
    
    // Add selected objects to the group
    for (let object of selectedObjects) {
        const obj = findObjectFromMesh(object);
        if (obj) {
            // Remove the object from the scene but keep its position
            objectsGroup.remove(object);
            
            // Add it to the group, maintaining its world position
            object.updateMatrixWorld();
            const worldPosition = new THREE.Vector3();
            object.getWorldPosition(worldPosition);
            
            group.add(object);
            
            // Store child reference
            groupObj.children.push(obj);
            
            // Remove from objects array but don't delete the object data
            const index = objects.indexOf(obj);
            if (index > -1) {
                objects.splice(index, 1);
            }
        }
    }
    
    // Add the group to the scene
    objectsGroup.add(group);
    objects.push(groupObj);
    
    // Select the new group
    clearSelection();
    selectedObject = group;
    selectedObjects = [group];
    updateGUI(group);
}

function ungroupObjects() {
    if (!selectedObject) {
        alert("Please select a group to ungroup");
        return;
    }
    
    const obj = findObjectFromMesh(selectedObject);
    if (!obj || !obj.isGroup) {
        alert("Selected object is not a group");
        return;
    }
    
    // Get world positions of all children
    const worldPositions = [];
    for (let i = 0; i < selectedObject.children.length; i++) {
        const child = selectedObject.children[i];
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        worldPositions.push(worldPos);
    }
    
    // Add all children back to the scene
    for (let i = 0; i < obj.children.length; i++) {
        const childObj = obj.children[i];
        const childMesh = childObj.mesh;
        
        // Remove from group (which would reset its position)
        selectedObject.remove(childMesh);
        
        // Add back to scene at its world position
        childMesh.position.copy(worldPositions[i]);
        objectsGroup.add(childMesh);
        
        // Add back to objects array
        objects.push(childObj);
    }
    
    // Remove the group
    objectsGroup.remove(selectedObject);
    objects.splice(objects.indexOf(obj), 1);
    
    // Clear selection
    clearSelection();
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