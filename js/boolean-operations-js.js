/**
 * Boolean operations for the 3D Editor
 * Contains functions for CSG operations: union, subtract, intersect
 */

// Perform union operation on two selected objects
function performUnion() {
    if (!selectedObjects || selectedObjects.length < 2) {
        alert("Please select at least two objects for union operation");
        return;
    }
    
    // Get the first two selected objects
    const obj1 = findObjectFromMesh(selectedObjects[0]);
    const obj2 = findObjectFromMesh(selectedObjects[1]);
    
    if (!obj1 || !obj2) return;
    
    // Create CSG objects
    const bspA = CSG.fromMesh(selectedObjects[0]);
    const bspB = CSG.fromMesh(selectedObjects[1]);
    
    // Perform union operation
    const bspResult = bspA.union(bspB);
    
    // Convert back to mesh
    const result = CSG.toMesh(bspResult, selectedObjects[0].matrix);
    result.material = selectedObjects[0].material.clone();
    result.castShadow = true;
    result.receiveShadow = true;
    
    // Position the result at the center of the two objects
    result.position.x = (selectedObjects[0].position.x + selectedObjects[1].position.x) / 2;
    result.position.y = (selectedObjects[0].position.y + selectedObjects[1].position.y) / 2;
    result.position.z = (selectedObjects[0].position.z + selectedObjects[1].position.z) / 2;
    
    // Add to scene
    objectsGroup.add(result);
    
    // Create new object data
    const resultObj = new DesignObject(result, 'union');
    objects.push(resultObj);
    
    // Remove source objects
    objects.splice(objects.indexOf(obj1), 1);
    objects.splice(objects.indexOf(obj2), 1);
    objectsGroup.remove(selectedObjects[0]);
    objectsGroup.remove(selectedObjects[1]);
    
    // Select the new object
    clearSelection();
    selectedObject = result;
    selectedObjects = [result];
    result.material.emissive.setHex(0x555555);
    updateGUI(result);
}

// Perform subtract operation - remove the second object from the first
function performSubtract() {
    if (!selectedObjects || selectedObjects.length < 2) {
        alert("Please select two objects for subtraction operation");
        return;
    }
    
    // Get the selected objects
    const obj1 = findObjectFromMesh(selectedObjects[0]);
    const obj2 = findObjectFromMesh(selectedObjects[1]);
    
    if (!obj1 || !obj2) return;
    
    // Create CSG objects
    const bspA = CSG.fromMesh(selectedObjects[0]);
    const bspB = CSG.fromMesh(selectedObjects[1]);
    
    // Perform subtract operation
    const bspResult = bspA.subtract(bspB);
    
    // Convert back to mesh
    const result = CSG.toMesh(bspResult, selectedObjects[0].matrix);
    result.material = selectedObjects[0].material.clone();
    result.castShadow = true;
    result.receiveShadow = true;
    
    // Use the position of the first object
    result.position.copy(selectedObjects[0].position);
    
    // Add to scene
    objectsGroup.add(result);
    
    // Create new object data
    const resultObj = new DesignObject(result, 'subtract');
    objects.push(resultObj);
    
    // Remove source objects
    objects.splice(objects.indexOf(obj1), 1);
    objects.splice(objects.indexOf(obj2), 1);
    objectsGroup.remove(selectedObjects[0]);
    objectsGroup.remove(selectedObjects[1]);
    
    // Select the new object
    clearSelection();
    selectedObject = result;
    selectedObjects = [result];
    result.material.emissive.setHex(0x555555);
    updateGUI(result);
}

// Perform intersect operation - keep only the overlapping parts
function performIntersect() {
    if (!selectedObjects || selectedObjects.length < 2) {
        alert("Please select two objects for intersection operation");
        return;
    }
    
    // Get the selected objects
    const obj1 = findObjectFromMesh(selectedObjects[0]);
    const obj2 = findObjectFromMesh(selectedObjects[1]);
    
    if (!obj1 || !obj2) return;
    
    // Create CSG objects
    const bspA = CSG.fromMesh(selectedObjects[0]);
    const bspB = CSG.fromMesh(selectedObjects[1]);
    
    // Perform intersect operation
    const bspResult = bspA.intersect(bspB);
    
    // Convert back to mesh
    const result = CSG.toMesh(bspResult, selectedObjects[0].matrix);
    result.material = selectedObjects[0].material.clone();
    result.castShadow = true;
    result.receiveShadow = true;
    
    // Position at center of intersection
    result.position.x = (selectedObjects[0].position.x + selectedObjects[1].position.x) / 2;
    result.position.y = (selectedObjects[0].position.y + selectedObjects[1].position.y) / 2;
    result.position.z = (selectedObjects[0].position.z + selectedObjects[1].position.z) / 2;
    
    // Add to scene
    objectsGroup.add(result);
    
    // Create new object data
    const resultObj = new DesignObject(result, 'intersect');
    objects.push(resultObj);
    
    // Remove source objects
    objects.splice(objects.indexOf(obj1), 1);
    objects.splice(objects.indexOf(obj2), 1);
    objectsGroup.remove(selectedObjects[0]);
    objectsGroup.remove(selectedObjects[1]);
    
    // Select the new object
    clearSelection();
    selectedObject = result;
    selectedObjects = [result];
    result.material.emissive.setHex(0x555555);
    updateGUI(result);
}