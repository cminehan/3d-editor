import React from 'react';
import { createComponent } from '../../js/components';
import { useEditor } from '../context/EditorContext';

const ComponentLibrary = () => {
  const { dispatch } = useEditor();
  const components = [
    { type: 'chair', label: 'Chair' },
    { type: 'table', label: 'Table' },
    { type: 'bed', label: 'Bed' },
    { type: 'cabinet', label: 'Cabinet' },
    { type: 'shelf', label: 'Shelf' }
  ];

  const handleComponentClick = (type) => {
    const component = createComponent(type);
    if (component) {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: component });
      dispatch({ type: 'SET_SELECTED_OBJECTS', payload: [component] });
      dispatch({ type: 'ADD_OBJECT', payload: component });
    }
  };

  return (
    <div className="component-library">
      <h3>Component Library</h3>
      <div className="component-grid">
        {components.map((component) => (
          <div
            key={component.type}
            className="component-item"
            onClick={() => handleComponentClick(component.type)}
            data-type={component.type}
          >
            {component.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentLibrary; 