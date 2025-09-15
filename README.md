# AI Handwriting Generator Web App

A modern web application that transforms text into beautiful, animated handwriting using AI. Built on top of the handwriting synthesis research by Alex Graves.

## Features

- **Real-time handwriting generation** - Convert any text into realistic handwriting
- **Multiple writing styles** - Choose from 6 different handwriting styles
- **Customizable appearance** - Adjust neatness, color, and animation speed
- **Animated writing** - Watch the text being "written" in real-time
- **SVG output** - High-quality vector graphics that scale perfectly
- **Download capability** - Save your generated handwriting as SVG files

## Quick Start

### Prerequisites

- Python 3.6+ with the required dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Node.js (for the web interface)

### Running the Application

1. **Start the Python backend server:**
   ```bash
   python server.py
   ```
   This starts the handwriting generation API on `http://localhost:8001`

2. **Start the web development server:**
   ```bash
   npm install
   npm run dev
   ```
   This starts the web interface on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## How to Use

1. **Enter your text** in the textarea (max 75 characters per line)
2. **Choose a writing style** from the dropdown menu
3. **Adjust the neatness** using the bias slider (higher = neater)
4. **Select ink color** with the color picker
5. **Set animation speed** for the writing effect
6. **Click "Generate Handwriting"** to create your animated handwriting
7. **Use "Replay"** to watch the animation again
8. **Click "Download SVG"** to save the result

## Technical Details

### Architecture

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Python HTTP server using the original handwriting synthesis model
- **Model**: Pre-trained RNN model based on Alex Graves' research
- **Output**: Animated SVG with stroke-by-stroke drawing animation

### API Endpoints

- `POST /generate` - Generate handwriting from text
- `GET /health` - Check server health status
- `GET /` - Server status page

### Customization Options

- **Writing Styles**: 6 pre-trained styles with different characteristics
- **Bias Control**: Adjusts the "neatness" of the handwriting (0.1 = messy, 1.0 = neat)
- **Color**: Any hex color for the ink
- **Animation Speed**: Controls how fast the writing animation plays

## Development

### Project Structure

```
├── src/
│   ├── main.js              # Main application logic
│   ├── handwriting-generator.js  # API communication
│   ├── svg-animator.js      # Animation handling
│   └── style.css           # Styling
├── server.py               # Python backend server
├── demo.py                 # Original handwriting model
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files that can be served by any web server.

## Troubleshooting

### Common Issues

1. **"Cannot connect to handwriting server"**
   - Make sure the Python server is running on port 8001
   - Check that all Python dependencies are installed

2. **"Model not loaded" error**
   - Ensure the checkpoint files are in the `checkpoints/` directory
   - Verify all required model files are present

3. **Long generation times**
   - This is normal for the first generation as the model loads
   - Subsequent generations should be faster

### Performance Tips

- Keep text reasonably short for faster generation
- The model works best with English text
- Longer lines (closer to 75 characters) may take more time to generate

## Credits

Based on the research paper "Generating Sequences with Recurrent Neural Networks" by Alex Graves and the original implementation by Sean Vasquez.

## License

This project maintains the same license as the original handwriting synthesis implementation.