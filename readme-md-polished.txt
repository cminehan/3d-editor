# 3D Design Tool

A browser-based 3D modeling tool inspired by Tinkercad, built with Three.js. This tool allows you to create, modify, and combine 3D shapes for design and 3D printing purposes.

![3D Design Tool Screenshot](https://via.placeholder.com/800x400?text=3D+Design+Tool)

## Features

- **Basic Shape Creation:** Cubes, spheres, cylinders, cones, and tori
- **Text Tools:** Create 3D text with adjustable height and depth
- **Component Library:** Pre-made parts like gears, brackets, screws, and electronics
- **Boolean Operations:** Unite, subtract, and intersect shapes
- **Object Manipulation:** Move, rotate, and scale objects
- **Grouping:** Group and ungroup objects for easier manipulation
- **Color Control:** Change the color of objects
- **Camera Controls:** Rotate, pan, and zoom your view

## Getting Started

### Local Development

1. Clone this repository
   ```
   git clone https://github.com/yourusername/3d-editor.git
   cd 3d-editor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`

### Project Structure

```
3d-editor/
├── index.html     # Main HTML file
├── css/           # Stylesheets
│   └── style.css
├── js/            # JavaScript modules
│   ├── core.js            # Core functionality and setup
│   ├── shapes.js          # Shape creation functions
│   ├── components.js      # Component library items
│   ├── boolean-operations.js # Boolean operations
│   ├── ui.js              # UI interactions
│   └── main.js            # Application entry point
├── assets/
│   └── favicon.ico
├── package.json
└── README.md
```

## Deployment

This project is designed for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Deploy with a single click

## How to Use

### Adding Objects
- Use the **Shapes** tab to add basic 3D shapes
- Use the **Text** tab to create 3D text
- Use the **Components** tab to add pre-made components

### Selection and Manipulation
- Click on an object to select it
- Hold Shift to select multiple objects
- Drag selected objects to move them
- Use the control panel to adjust properties (color, position, rotation, scale)

### Boolean Operations
1. Select two objects (hold Shift to select multiple)
2. Click one of the operation buttons:
   - **Unite:** Combine objects into one
   - **Subtract:** Remove the second object from the first
   - **Intersect:** Keep only the overlapping parts

### Grouping
- Select multiple objects
- Click "Group" to combine them
- Select a group and click "Ungroup" to separate

## Technologies Used

- **Three.js:** For 3D rendering
- **dat.GUI:** For the property control interface
- **CSG.js:** For boolean operations (Constructive Solid Geometry)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Future Improvements

- Export to STL for 3D printing
- Undo/Redo functionality
- Save designs to local storage
- User accounts and cloud storage
- More complex shapes and components

## License

MIT

## Acknowledgements

- Three.js team for the amazing 3D library
- Inspiration from Tinkercad and other CAD tools