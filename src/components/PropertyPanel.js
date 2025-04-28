import React from 'react';
import { useEditor } from '../context/EditorContext';

const PropertyPanel = () => {
  const { state, dispatch } = useEditor();
  const [properties, setProperties] = React.useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });

  React.useEffect(() => {
    if (state.selectedObject) {
      setProperties({
        position: {
          x: state.selectedObject.position.x,
          y: state.selectedObject.position.y,
          z: state.selectedObject.position.z
        },
        rotation: {
          x: state.selectedObject.rotation.x * (180 / Math.PI),
          y: state.selectedObject.rotation.y * (180 / Math.PI),
          z: state.selectedObject.rotation.z * (180 / Math.PI)
        },
        scale: {
          x: state.selectedObject.scale.x,
          y: state.selectedObject.scale.y,
          z: state.selectedObject.scale.z
        }
      });
    }
  }, [state.selectedObject]);

  const handlePropertyChange = (property, axis, value) => {
    const newProperties = {
      ...properties,
      [property]: {
        ...properties[property],
        [axis]: parseFloat(value)
      }
    };
    setProperties(newProperties);

    if (state.selectedObject) {
      switch (property) {
        case 'position':
          state.selectedObject.position[axis] = parseFloat(value);
          break;
        case 'rotation':
          state.selectedObject.rotation[axis] = parseFloat(value) * (Math.PI / 180);
          break;
        case 'scale':
          state.selectedObject.scale[axis] = parseFloat(value);
          break;
        default:
          break;
      }
    }
  };

  if (!state.selectedObject) {
    return (
      <div className="property-panel">
        <h3>No object selected</h3>
      </div>
    );
  }

  return (
    <div className="property-panel">
      <h3>Properties</h3>
      <div className="property-group">
        <h4>Position</h4>
        {['x', 'y', 'z'].map((axis) => (
          <div key={axis} className="property-row">
            <label>{axis.toUpperCase()}</label>
            <input
              type="number"
              value={properties.position[axis]}
              onChange={(e) => handlePropertyChange('position', axis, e.target.value)}
              step="0.1"
            />
          </div>
        ))}
      </div>

      <div className="property-group">
        <h4>Rotation</h4>
        {['x', 'y', 'z'].map((axis) => (
          <div key={axis} className="property-row">
            <label>{axis.toUpperCase()}</label>
            <input
              type="number"
              value={properties.rotation[axis]}
              onChange={(e) => handlePropertyChange('rotation', axis, e.target.value)}
              step="1"
            />
          </div>
        ))}
      </div>

      <div className="property-group">
        <h4>Scale</h4>
        {['x', 'y', 'z'].map((axis) => (
          <div key={axis} className="property-row">
            <label>{axis.toUpperCase()}</label>
            <input
              type="number"
              value={properties.scale[axis]}
              onChange={(e) => handlePropertyChange('scale', axis, e.target.value)}
              step="0.1"
              min="0.1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyPanel; 