export class HandwritingGenerator {
  constructor() {
    this.baseUrl = 'http://localhost:8001'; // Python server
  }

  async generateHandwriting(lines, options = {}) {
    const {
      style = 7,
      bias = 0.7,
      color = '#2563eb'
    } = options;

    // Validate input
    if (!lines || lines.length === 0) {
      throw new Error('Please enter some text to generate');
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 75) {
        throw new Error(`Line ${i + 1} is too long (${lines[i].length} characters). Maximum is 75 characters per line.`);
      }
    }

    try {
      // Create a unique filename for this generation
      const timestamp = Date.now();
      const filename = `handwriting_${timestamp}.svg`;

      // Prepare the request data
      const requestData = {
        lines: lines,
        biases: lines.map(() => bias),
        styles: lines.map(() => style),
        stroke_colors: lines.map(() => color),
        stroke_widths: lines.map(() => 2),
        filename: filename
      };

      // Make request to Python backend
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const svgContent = await response.text();
      
      if (!svgContent || !svgContent.includes('<svg')) {
        throw new Error('Invalid SVG content received from server');
      }

      return svgContent;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to the handwriting server. Please make sure the Python server is running on port 8001.');
      }
      throw error;
    }
  }
}