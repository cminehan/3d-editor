import React from 'react';
import { createText } from '../../js/shapes';
import { useEditor } from '../context/EditorContext';

const TextTools = () => {
  const { dispatch } = useEditor();
  const [text, setText] = React.useState('');
  const [height, setHeight] = React.useState(1);
  const [depth, setDepth] = React.useState(0.2);

  const handleAddText = () => {
    if (!text) {
      alert("Please enter text");
      return;
    }
    
    const textMesh = createText(text, height, depth);
    if (textMesh) {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: textMesh });
      dispatch({ type: 'SET_SELECTED_OBJECTS', payload: [textMesh] });
      dispatch({ type: 'ADD_OBJECT', payload: textMesh });
      textMesh.material.emissive.setHex(0x555555);
    }
  };

  return (
    <div className="text-tools">
      <h3>Text Tools</h3>
      <div className="text-input-group">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="text-input"
        />
      </div>
      
      <div className="text-properties">
        <div className="property-row">
          <label>Height:</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
          />
        </div>
        
        <div className="property-row">
          <label>Depth:</label>
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
          />
        </div>
      </div>

      <button onClick={handleAddText} className="toolbar-btn">
        Add Text
      </button>
    </div>
  );
};

export default TextTools; 