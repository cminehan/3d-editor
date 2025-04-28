import React, { createContext, useContext, useReducer } from 'react';

const EditorContext = createContext();

const initialState = {
  selectedObject: null,
  selectedObjects: [],
  objects: [],
  activeViewport: 'perspective',
  isDragging: false,
  isRotating: false,
  isScaling: false,
  mousePosition: { x: 0, y: 0 },
  lastMousePosition: { x: 0, y: 0 }
};

function editorReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_OBJECT':
      return { ...state, selectedObject: action.payload };
    case 'SET_SELECTED_OBJECTS':
      return { ...state, selectedObjects: action.payload };
    case 'ADD_OBJECT':
      return { ...state, objects: [...state.objects, action.payload] };
    case 'REMOVE_OBJECT':
      return { 
        ...state, 
        objects: state.objects.filter(obj => obj !== action.payload),
        selectedObject: state.selectedObject === action.payload ? null : state.selectedObject,
        selectedObjects: state.selectedObjects.filter(obj => obj !== action.payload)
      };
    case 'SET_ACTIVE_VIEWPORT':
      return { ...state, activeViewport: action.payload };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'SET_ROTATING':
      return { ...state, isRotating: action.payload };
    case 'SET_SCALING':
      return { ...state, isScaling: action.payload };
    case 'SET_MOUSE_POSITION':
      return { 
        ...state, 
        mousePosition: action.payload,
        lastMousePosition: state.mousePosition
      };
    default:
      return state;
  }
}

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
} 