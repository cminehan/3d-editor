import React from 'react';
import { useEditor } from '../context/EditorContext';

const ViewportControls = () => {
  const { state, dispatch } = useEditor();
  const views = ['front', 'top', 'side', 'perspective'];

  const handleViewChange = (view) => {
    dispatch({ type: 'SET_ACTIVE_VIEWPORT', payload: view });
  };

  return (
    <div className="viewport-controls">
      {views.map((view) => (
        <button
          key={view}
          className={`view-btn ${state.activeViewport === view ? 'active' : ''}`}
          onClick={() => handleViewChange(view)}
          data-view={view}
        >
          {view.charAt(0).toUpperCase() + view.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ViewportControls; 