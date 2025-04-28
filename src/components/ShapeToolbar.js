import React from 'react';
import { createCube, createSphere, createCylinder, createCone, createPyramid } from '../../js/shapes';
import { useEditor } from '../context/EditorContext';

const ShapeToolbar = () => {
  const { dispatch } = useEditor();

  const handleShapeCreation = (createShapeFunction) => {
    const shape = createShapeFunction();
    if (shape) {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: shape });
      dispatch({ type: 'SET_SELECTED_OBJECTS', payload: [shape] });
      dispatch({ type: 'ADD_OBJECT', payload: shape });
      shape.material.emissive.setHex(0x555555);
    }
  };

  return (
    <div className="shape-toolbar">
      <button 
        id="cubeBtn" 
        onClick={() => handleShapeCreation(createCube)}
        className="toolbar-btn"
      >
        Cube
      </button>
      <button 
        id="sphereBtn" 
        onClick={() => handleShapeCreation(createSphere)}
        className="toolbar-btn"
      >
        Sphere
      </button>
      <button 
        id="cylinderBtn" 
        onClick={() => handleShapeCreation(createCylinder)}
        className="toolbar-btn"
      >
        Cylinder
      </button>
      <button 
        id="coneBtn" 
        onClick={() => handleShapeCreation(createCone)}
        className="toolbar-btn"
      >
        Cone
      </button>
      <button 
        id="pyramidBtn" 
        onClick={() => handleShapeCreation(createPyramid)}
        className="toolbar-btn"
      >
        Pyramid
      </button>
    </div>
  );
};

export default ShapeToolbar; 