import React from 'react';
import { performUnion, performSubtract, groupObjects } from '../../js/boolean-operations';
import { useEditor } from '../context/EditorContext';

const BooleanToolbar = () => {
  const { state, dispatch } = useEditor();

  const handleBooleanOperation = (operation) => {
    if (state.selectedObjects.length < 2) {
      alert('Please select at least two objects for boolean operations');
      return;
    }

    const result = operation(state.selectedObjects[0], state.selectedObjects[1]);
    if (result) {
      // Remove the original objects
      state.selectedObjects.forEach(obj => {
        dispatch({ type: 'REMOVE_OBJECT', payload: obj });
      });

      // Add the result
      dispatch({ type: 'ADD_OBJECT', payload: result });
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: result });
      dispatch({ type: 'SET_SELECTED_OBJECTS', payload: [result] });
    }
  };

  const handleGroup = () => {
    if (state.selectedObjects.length < 2) {
      alert('Please select at least two objects to group');
      return;
    }

    const result = groupObjects(state.selectedObjects);
    if (result) {
      // Remove the original objects
      state.selectedObjects.forEach(obj => {
        dispatch({ type: 'REMOVE_OBJECT', payload: obj });
      });

      // Add the result
      dispatch({ type: 'ADD_OBJECT', payload: result });
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: result });
      dispatch({ type: 'SET_SELECTED_OBJECTS', payload: [result] });
    }
  };

  return (
    <div className="boolean-toolbar">
      <button 
        id="unionBtn" 
        onClick={() => handleBooleanOperation(performUnion)}
        className="toolbar-btn"
      >
        Union
      </button>
      <button 
        id="subtractBtn" 
        onClick={() => handleBooleanOperation(performSubtract)}
        className="toolbar-btn"
      >
        Subtract
      </button>
      <button 
        id="groupBtn" 
        onClick={handleGroup}
        className="toolbar-btn"
      >
        Group
      </button>
    </div>
  );
};

export default BooleanToolbar; 