/**
 * Component library for the 3D Editor
 * Contains pre-built complex objects
 */

// Create a component based on type
function createComponent(type) {
    let component;
    
    switch(type) {
        case 'gear':
            component = createGear();
            break;
        case 'bracket':
            component = createBracket();
            break;
        case 'screw':
            component = createScrew();
            break;
        case 'wheel':
            component = createWheel();
            break;
        case 'button':
            component = createButton();
            break;
        case 'switch':
            component = createSwitch();
            break;
        case 'motor':
            component = createMotor();
            break;
        case 'battery':
            component = createBattery();
            break;
        default:
            return null;
    }
    
    if (component) {
        component.castShadow = true;
        component.receiveShadow = true;
        objectsGroup.add(component);
        
        const obj = new DesignObject(component, type);
        objects.push(obj);
        
        return component;
    }
    
    return null;
}

// Create a gear component
function createGear() {
    const outerRadius = 0.8;
    const innerRadius = 0.6;
    const teeth = 12;
    const height = 0.2;
    
    const group = new THREE.Group();
    
    // Base cylinder
    const baseGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, height, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);
    
    // Teeth
    for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2;
        const toothGeometry = new THREE.BoxGeometry(0.2, height, 0.1);
        const tooth = new THREE.Mesh(toothGeometry, baseMaterial);
        
        tooth.position.x = Math.cos(angle) * outerRadius;
        tooth.position.z = Math.sin(angle) * outerRadius;
        tooth.rotation.y = angle;
        
        group.add(tooth);
    }
    
    // Center hole
    const holeGeometry = new THREE.CylinderGeometry(0.2, 0.2, height + 0.05, 32);
    const holeMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    group.add(hole);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a bracket component
function createBracket() {
    const group = new THREE.Group();
    
    // Main body
    const baseGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
    const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const base = new THREE.Mesh(baseGeometry, material);
    group.add(base);
    
    // Side walls
    const sideGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.4);
    
    const leftSide = new THREE.Mesh(sideGeometry, material);
    leftSide.position.set(-0.35, 0.25, 0);
    group.add(leftSide);
    
    const rightSide = new THREE.Mesh(sideGeometry, material);
    rightSide.position.set(0.35, 0.25, 0);
    group.add(rightSide);
    
    // Holes
    const holeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);
    holeGeometry.rotateX(Math.PI/2);
    
    const hole1 = new THREE.Mesh(holeGeometry, material);
    hole1.position.set(-0.35, 0.3, 0);
    group.add(hole1);
    
    const hole2 = new THREE.Mesh(holeGeometry, material);
    hole2.position.set(0.35, 0.3, 0);
    group.add(hole2);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a screw component
function createScrew() {
    const group = new THREE.Group();
    
    // Head
    const headGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 6);
    const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 0.25;
    group.add(head);
    
    // Thread
    const threadGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 16);
    const thread = new THREE.Mesh(threadGeometry, material);
    thread.position.y = -0.05;
    group.add(thread);
    
    // Slot
    const slotGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.05);
    const slotMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.y = 0.3;
    group.add(slot);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a wheel component
function createWheel() {
    const group = new THREE.Group();
    
    // Rim
    const rimGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    group.add(rim);
    
    // Tire
    const tireGeometry = new THREE.TorusGeometry(0.5, 0.15, 16, 32);
    const tireMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.rotation.x = Math.PI/2;
    group.add(tire);
    
    // Hub
    const hubGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.22, 16);
    const hubMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    group.add(hub);
    
    // Spokes
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spokeGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.6);
        const spoke = new THREE.Mesh(spokeGeometry, hubMaterial);
        spoke.rotation.y = angle;
        spoke.position.x = Math.cos(angle) * 0.25;
        spoke.position.z = Math.sin(angle) * 0.25;
        group.add(spoke);
    }
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a button component
function createButton() {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.05;
    group.add(base);
    
    // Button top
    const topGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32);
    const topMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.05;
    group.add(top);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a switch component
function createSwitch() {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.3);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);
    
    // Switch lever
    const leverGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    const leverMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const lever = new THREE.Mesh(leverGeometry, leverMaterial);
    lever.position.set(0.15, 0.15, 0);
    lever.rotation.z = Math.PI / 6;
    group.add(lever);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a motor component
function createMotor() {
    const group = new THREE.Group();
    
    // Motor body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 0.45;
    group.add(shaft);
    
    // Terminals
    const terminalGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
    const terminalMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
    
    const terminal1 = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal1.position.set(0.2, -0.3, 0.15);
    group.add(terminal1);
    
    const terminal2 = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal2.position.set(0.2, -0.3, -0.15);
    group.add(terminal2);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}

// Create a battery component
function createBattery() {
    const group = new THREE.Group();
    
    // Battery body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Terminal
    const terminalGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
    const terminalMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal.position.y = 0.325;
    group.add(terminal);
    
    // Label
    const labelGeometry = new THREE.CylinderGeometry(0.202, 0.202, 0.4, 32, 1, true);
    const labelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0066ff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 0;
    group.add(label);
    
    group.position.set(Math.random() * 3 - 1.5, 0.5, Math.random() * 3 - 1.5);
    return group;
}