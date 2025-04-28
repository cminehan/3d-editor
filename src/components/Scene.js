import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEditor } from '../context/EditorContext';

const Scene = () => {
  const containerRef = useRef(null);
  const { state, dispatch } = useEditor();
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  // Update scene when objects change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing objects
    while (sceneRef.current.children.length > 0) {
      const child = sceneRef.current.children[0];
      if (child instanceof THREE.Light) {
        sceneRef.current.remove(child);
      }
    }

    // Add objects from state
    state.objects.forEach(obj => {
      sceneRef.current.add(obj);
    });

    // Add lights back
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    sceneRef.current.add(directionalLight);
  }, [state.objects]);

  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      onMouseDown={(e) => {
        dispatch({ type: 'SET_MOUSE_POSITION', payload: { x: e.clientX, y: e.clientY } });
        dispatch({ type: 'SET_DRAGGING', payload: true });
      }}
      onMouseUp={() => {
        dispatch({ type: 'SET_DRAGGING', payload: false });
      }}
      onMouseMove={(e) => {
        dispatch({ type: 'SET_MOUSE_POSITION', payload: { x: e.clientX, y: e.clientY } });
      }}
    />
  );
};

export default Scene; 