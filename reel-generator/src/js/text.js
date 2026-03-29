import { FONTS, COLORS, VIDEO_SPEC, ANIMATION_TIMING } from './config.js';
import { getSceneAtTime } from './scenes.js';

export class TextRenderer {
  constructor(ctx, canvasWidth, canvasHeight) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Calculate opacity for text fade animations
   * @param {number} currentTime - Current time in seconds
   * @param {number} fadeInStart - Time when fade in starts
   * @param {number} fadeOutStart - Time when fade out starts
   * @returns {number} Opacity value 0-1
   */
  calculateTextOpacity(currentTime, fadeInStart, fadeOutStart) {
    const fadeInDuration = ANIMATION_TIMING.textFadeUpDuration;
    const fadeOutDuration = ANIMATION_TIMING.textFadeOutDuration;

    if (currentTime < fadeInStart) {
      return 0;
    }

    const fadeInEnd = fadeInStart + fadeInDuration;
    if (currentTime < fadeInEnd) {
      // Fade in phase: ease-out
      const progress = (currentTime - fadeInStart) / fadeInDuration;
      return this.easeOut(progress);
    }

    if (currentTime >= fadeOutStart) {
      // Fade out phase
      const fadeOutEnd = fadeOutStart + fadeOutDuration;
      if (currentTime >= fadeOutEnd) {
        return 0;
      }
      const progress = (currentTime - fadeOutStart) / fadeOutDuration;
      return 1 - this.easeOut(progress);
    }

    // Full opacity between fade in and fade out
    return 1;
  }

  /**
   * Ease-out function (from concept: ease-out, no bounce)
   * @param {number} t - Progress 0-1
   * @returns {number} Eased value
   */
  easeOut(t) {
    // Cubic ease-out
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Draw a text string with proper styling
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Options: { fontFamily, fontSize, color, align, style }
   */
  drawText(text, x, y, options = {}) {
    const {
      fontFamily = FONTS.body,
      fontSize = 24,
      color = COLORS.cream,
      align = 'center',
      weight = '400',
      style = 'normal',
    } = options;

    this.ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';

    // No stroke per spec
    this.ctx.fillText(text, x, y);
  }

  /**
   * Render text overlay for a scene at given time
   * @param {number} currentTime - Current time in seconds
   */
  renderSceneText(currentTime) {
    const scene = getSceneAtTime(currentTime);
    if (!scene || !scene.text) return;

    const textConfig = scene.text;
    const opacity = this.calculateTextOpacity(currentTime, textConfig.fadeIn, textConfig.fadeOut);

    if (opacity <= 0) return;

    this.ctx.globalAlpha = opacity;

    const centerX = this.canvasWidth / 2;
    let yPosition;

    if (textConfig.position === 'lower-third') {
      // Position in lower third with safe zone (250px from bottom)
      yPosition = this.canvasHeight - VIDEO_SPEC.safeZone + 40;
    } else if (textConfig.position === 'center-frame') {
      // Center of canvas
      yPosition = this.canvasHeight / 2;
    } else {
      yPosition = this.canvasHeight * 0.7; // Default to lower area
    }

    // Draw main text (Cormorant Garamond Italic - serif, large)
    this.drawText(textConfig.main, centerX, yPosition, {
      fontFamily: FONTS.serif,
      fontSize: this.calculateFontSize(this.canvasWidth, 'main'),
      color: COLORS.goldLight,
      align: 'center',
      weight: '300',
      style: 'italic',
    });

    // Draw sub text if present (Cinzel Caps - smaller, gold)
    if (textConfig.sub) {
      const subYOffset = this.calculateFontSize(this.canvasWidth, 'main') * 1.2;
      this.drawText(textConfig.sub, centerX, yPosition + subYOffset, {
        fontFamily: FONTS.display,
        fontSize: this.calculateFontSize(this.canvasWidth, 'sub'),
        color: COLORS.stone,
        align: 'center',
        weight: '400',
        style: 'normal',
      });
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Calculate responsive font sizes based on canvas width
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {string} type - 'main' or 'sub'
   * @returns {number} Font size in pixels
   */
  calculateFontSize(canvasWidth, type) {
    // For 1080px width, scale accordingly
    // Main text: 42px for 1080px (3.9% of width)
    // Sub text: 18px for 1080px (1.7% of width)
    if (type === 'main') {
      return Math.ceil(canvasWidth * 0.039);
    } else {
      return Math.ceil(canvasWidth * 0.017);
    }
  }

  /**
   * Render all text for the current frame
   * @param {number} currentTime - Current time in seconds
   */
  render(currentTime) {
    this.renderSceneText(currentTime);
  }
}
