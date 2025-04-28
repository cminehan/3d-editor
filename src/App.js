import React from 'react';
import { EditorProvider } from './context/EditorContext';
import ShapeToolbar from './components/ShapeToolbar';
import BooleanToolbar from './components/BooleanToolbar';
import ViewportControls from './components/ViewportControls';
import PropertyPanel from './components/PropertyPanel';
import TextTools from './components/TextTools';
import ComponentLibrary from './components/ComponentLibrary';
import Scene from './components/Scene';
import './index.css';

function App() {
  return (
    <EditorProvider>
      <div className="app">
        <div className="toolbar-container">
          <ShapeToolbar />
          <BooleanToolbar />
          <ViewportControls />
        </div>
        
        <div className="main-content">
          <Scene />
          
          <div className="side-panel">
            <PropertyPanel />
            <TextTools />
            <ComponentLibrary />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

export default App; 