import { VIDEO_SPEC, COLORS } from './config.js';
import { getSceneAtTime, isInTransition, getTransitionAtTime } from './scenes.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: false, willReadFrequently: true });

    // Set canvas size
    this.canvas.width = VIDEO_SPEC.width;
    this.canvas.height = VIDEO_SPEC.height;

    // Setup rendering
    this.frameCount = 0;
    this.isRecording = false;
  }

  /**
   * Create a radial gradient on canvas
   * @param {Object} gradientConfig - Gradient configuration from GRADIENTS
   * @returns {CanvasGradient}
   */
  createRadialGradient(gradientConfig, width, height) {
    if (gradientConfig.type === 'radial') {
      const x = gradientConfig.position.x * width;
      const y = gradientConfig.position.y * height;
      const radius = Math.max(width, height) * 0.6; // 60% of max dimension

      const grad = this.ctx.createRadialGradient(x, y, 0, x, y, radius);

      gradientConfig.colors.forEach((colorStop) => {
        grad.addColorStop(colorStop.stop, colorStop.color);
      });

      return grad;
    }
    return null;
  }

  /**
   * Draw a scene background with gradients
   * @param {Object} scene - Scene object from SCENES
   * @param {number} opacity - Opacity of gradients (0-1)
   */
  drawSceneBackground(scene, opacity = 1) {
    const { width, height } = this.canvas;

    // Fill base background color
    this.ctx.fillStyle = scene.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // Draw gradient layers with opacity
    if (scene.gradient && scene.gradient.layers) {
      scene.gradient.layers.forEach((layer) => {
        const grad = this.createRadialGradient(layer, width, height);
        if (grad) {
          this.ctx.globalAlpha = opacity;
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(0, 0, width, height);
        }
      });
    }
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Draw a single scene at given time
   * @param {number} elapsedTime - Elapsed time in seconds
   */
  renderFrame(elapsedTime) {
    const scene = getSceneAtTime(elapsedTime);
    if (!scene) return;

    // Check if we're in a transition
    const transitionInfo = getTransitionAtTime(elapsedTime);

    if (transitionInfo) {
      // In a transition: blend between two scenes
      const { from, to, progress } = transitionInfo;

      // Draw the "from" scene at full opacity
      this.drawSceneBackground(from, 1.0);

      // Apply transition effect
      this.applyTransitionEffect(from, to, progress, transitionInfo.transition);
    } else {
      // Normal scene rendering
      this.drawSceneBackground(scene, 1.0);
    }

    this.frameCount++;
  }

  /**
   * Apply transition effects between scenes
   * @param {Object} fromScene - Scene we're transitioning from
   * @param {Object} toScene - Scene we're transitioning to
   * @param {number} progress - Transition progress (0-1)
   * @param {Object} transitionConfig - Transition configuration
   */
  applyTransitionEffect(fromScene, toScene, progress, transitionConfig) {
    const { width, height } = this.canvas;

    if (!transitionConfig) return;

    switch (transitionConfig.type) {
      case 'dissolve':
      case 'crossfade':
        // Simple crossfade: draw "to" scene on top with increasing opacity
        this.ctx.globalAlpha = progress;
        this.drawSceneBackground(toScene, 1.0);
        this.ctx.globalAlpha = 1.0;
        break;

      case 'fade-through-color':
        // Fade through a color (usually gold)
        const fadeColor = transitionConfig.color || COLORS.gold;
        const halfProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        this.ctx.globalAlpha = halfProgress * 0.7;
        this.ctx.fillStyle = fadeColor;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.globalAlpha = 1.0;

        // Blend in next scene after halfway point
        if (progress > 0.5) {
          this.ctx.globalAlpha = (progress - 0.5) * 2;
          this.drawSceneBackground(toScene, 1.0);
          this.ctx.globalAlpha = 1.0;
        }
        break;

      case 'fade-to-color':
        // Fade to a specific color (final fade to gold/black)
        const targetColor = transitionConfig.color || COLORS.gold;
        this.ctx.globalAlpha = progress;
        this.ctx.fillStyle = targetColor;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.globalAlpha = 1.0;
        break;

      case 'motion':
        // Simple motion effect: whip tilt simulation with opacity
        this.ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.3; // Sine wave for motion blur feel
        this.drawSceneBackground(toScene, 0.8);
        this.ctx.globalAlpha = 1.0;

        // After halfway, blend in normally
        if (progress > 0.5) {
          this.ctx.globalAlpha = (progress - 0.5) * 2;
          this.drawSceneBackground(toScene, 1.0);
          this.ctx.globalAlpha = 1.0;
        }
        break;

      default:
        // Default to crossfade
        this.ctx.globalAlpha = progress;
        this.drawSceneBackground(toScene, 1.0);
        this.ctx.globalAlpha = 1.0;
    }
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Get the canvas context for text rendering
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas dimensions
   */
  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
