/**
 * Main entry point for the 3D Editor
 * Initializes the application and creates a demo object
 */

// Initialize the application on document load
document.addEventListener('DOMContentLoaded', function() {
    console.log('3D Editor initializing...');
    
    // Initialize 3D scene
    initScene();
    
    // Initialize UI state
    switchTab('shapes');
    
    // Add an initial cube to demonstrate functionality
    const initialCube = createCube();
    
    console.log('3D Editor initialized successfully.');
});