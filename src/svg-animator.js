export class SVGAnimator {
  animateHandwriting(svgElement, speed = 1.0) {
    // Remove any existing animations
    this.clearAnimations(svgElement);

    const paths = svgElement.querySelectorAll('path');
    if (paths.length === 0) return;

    let totalDelay = 0;
    const baseStrokeDuration = 2000 / speed; // Base duration in ms

    paths.forEach((path, index) => {
      const pathLength = path.getTotalLength();
      const strokeDuration = Math.max(500, pathLength * 3) / speed;

      // Set up the path for animation
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;
      path.style.opacity = '1';

      // Create the animation
      const animation = path.animate([
        {
          strokeDashoffset: pathLength,
          opacity: 1
        },
        {
          strokeDashoffset: 0,
          opacity: 1
        }
      ], {
        duration: strokeDuration,
        delay: totalDelay,
        easing: 'ease-out',
        fill: 'forwards'
      });

      // Add a small delay between strokes for more natural writing
      totalDelay += strokeDuration * 0.1;

      // Store animation reference for cleanup
      if (!path._animations) path._animations = [];
      path._animations.push(animation);
    });

    // Add a subtle fade-in effect to the entire SVG
    svgElement.style.opacity = '0';
    svgElement.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: 300,
      fill: 'forwards'
    });
  }

  clearAnimations(svgElement) {
    const paths = svgElement.querySelectorAll('path');
    paths.forEach(path => {
      if (path._animations) {
        path._animations.forEach(animation => animation.cancel());
        path._animations = [];
      }
      
      // Reset path styles
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
      path.style.opacity = '';
    });

    // Reset SVG opacity
    svgElement.style.opacity = '';
  }
}