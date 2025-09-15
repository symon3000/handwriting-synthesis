import './style.css';
import { HandwritingGenerator } from './handwriting-generator.js';
import { SVGAnimator } from './svg-animator.js';

class HandwritingApp {
  constructor() {
    this.generator = new HandwritingGenerator();
    this.animator = new SVGAnimator();
    this.currentSVG = null;
    
    this.initializeElements();
    this.bindEvents();
    this.updateUI();
  }

  initializeElements() {
    this.textInput = document.getElementById('text-input');
    this.styleSelect = document.getElementById('style-select');
    this.biasSlider = document.getElementById('bias-slider');
    this.speedSlider = document.getElementById('speed-slider');
    this.colorPicker = document.getElementById('color-picker');
    this.generateBtn = document.getElementById('generate-btn');
    this.replayBtn = document.getElementById('replay-btn');
    this.downloadBtn = document.getElementById('download-btn');
    this.loadingEl = document.getElementById('loading');
    this.errorEl = document.getElementById('error');
    this.errorMessage = document.getElementById('error-message');
    this.container = document.getElementById('handwriting-container');
  }

  bindEvents() {
    this.generateBtn.addEventListener('click', () => this.generateHandwriting());
    this.replayBtn.addEventListener('click', () => this.replayAnimation());
    this.downloadBtn.addEventListener('click', () => this.downloadSVG());
    
    // Auto-resize textarea
    this.textInput.addEventListener('input', () => {
      this.textInput.style.height = 'auto';
      this.textInput.style.height = this.textInput.scrollHeight + 'px';
      this.validateInput();
    });

    // Real-time validation
    this.textInput.addEventListener('input', () => this.validateInput());
    
    // Enter key to generate (Ctrl+Enter for new line)
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        this.generateHandwriting();
      }
    });
  }

  validateInput() {
    const text = this.textInput.value.trim();
    const lines = text.split('\n');
    const hasLongLines = lines.some(line => line.length > 75);
    const isEmpty = text.length === 0;
    
    this.generateBtn.disabled = isEmpty || hasLongLines;
    
    if (hasLongLines) {
      this.textInput.classList.add('error');
      this.showError('Each line must be 75 characters or less');
    } else {
      this.textInput.classList.remove('error');
      this.hideError();
    }
  }

  async generateHandwriting() {
    const text = this.textInput.value.trim();
    if (!text) return;

    const lines = text.split('\n').filter(line => line.trim());
    const style = parseInt(this.styleSelect.value);
    const bias = parseFloat(this.biasSlider.value);
    const color = this.colorPicker.value;

    this.showLoading();
    this.hideError();

    try {
      const svgContent = await this.generator.generateHandwriting(lines, {
        style,
        bias,
        color
      });

      this.currentSVG = svgContent;
      this.displayHandwriting(svgContent);
      this.updateUI();
    } catch (error) {
      console.error('Generation failed:', error);
      this.showError(error.message || 'Failed to generate handwriting. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  displayHandwriting(svgContent) {
    this.container.innerHTML = svgContent;
    const svgElement = this.container.querySelector('svg');
    
    if (svgElement) {
      const speed = parseFloat(this.speedSlider.value);
      this.animator.animateHandwriting(svgElement, speed);
    }
  }

  replayAnimation() {
    const svgElement = this.container.querySelector('svg');
    if (svgElement) {
      const speed = parseFloat(this.speedSlider.value);
      this.animator.animateHandwriting(svgElement, speed);
    }
  }

  downloadSVG() {
    if (!this.currentSVG) return;

    const blob = new Blob([this.currentSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'handwriting.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showLoading() {
    this.loadingEl.classList.remove('hidden');
    this.generateBtn.disabled = true;
  }

  hideLoading() {
    this.loadingEl.classList.add('hidden');
    this.generateBtn.disabled = false;
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorEl.classList.remove('hidden');
  }

  hideError() {
    this.errorEl.classList.add('hidden');
  }

  updateUI() {
    const hasContent = this.currentSVG !== null;
    this.replayBtn.disabled = !hasContent;
    this.downloadBtn.disabled = !hasContent;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HandwritingApp();
});