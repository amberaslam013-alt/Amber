import { VIDEO_SPEC, TIMELINE } from './config.js';
import { SCENES } from './scenes.js';
import { CanvasRenderer } from './renderer.js';
import { TextRenderer } from './text.js';
import { VideoEncoder, initFFmpeg } from './encoder.js';

class ReelGenerator {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.renderer = new CanvasRenderer(this.canvas);
    this.textRenderer = new TextRenderer(this.renderer.getContext(), VIDEO_SPEC.width, VIDEO_SPEC.height);
    this.encoder = new VideoEncoder(this.canvas, VIDEO_SPEC.fps);

    this.isPlaying = false;
    this.isPreviewing = false;
    this.currentTime = 0;
    this.startTime = null;
    this.animationId = null;
  }

  /**
   * Initialize the generator
   */
  async init() {
    try {
      await initFFmpeg();
      console.log('ReelGenerator initialized');
    } catch (error) {
      console.error('Failed to initialize ReelGenerator:', error);
      throw error;
    }
  }

  /**
   * Preview the reel in real-time
   */
  startPreview() {
    this.isPreviewing = true;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.currentTime = 0;

    const render = (timestamp) => {
      if (!this.isPlaying) return;

      const elapsed = (timestamp - this.startTime) / 1000; // Convert to seconds
      this.currentTime = elapsed;

      // Render the frame
      this.renderFrame(elapsed);

      // Stop at 10 seconds
      if (elapsed < VIDEO_SPEC.duration) {
        this.animationId = requestAnimationFrame(render);
      } else {
        this.isPlaying = false;
        this.isPreviewing = false;
        console.log('Preview complete');
      }
    };

    this.animationId = requestAnimationFrame(render);
    console.log('Preview started');
  }

  /**
   * Stop preview
   */
  stopPreview() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('Preview stopped');
  }

  /**
   * Generate and export the video
   */
  async generateVideo() {
    console.log('Starting video generation...');
    this.encoder.startRecording();

    return new Promise((resolve, reject) => {
      let frameCount = 0;
      const expectedFrames = this.encoder.getExpectedFrameCount(VIDEO_SPEC.duration);
      const frameTime = 1 / VIDEO_SPEC.fps;

      const generateFrame = () => {
        const currentTime = frameCount * frameTime;

        if (currentTime < VIDEO_SPEC.duration) {
          // Render frame
          this.renderFrame(currentTime);

          // Capture frame
          this.encoder.captureFrame();

          frameCount++;

          // Progress update
          const progress = ((frameCount / expectedFrames) * 100).toFixed(1);
          console.log(`Generating frames: ${frameCount}/${expectedFrames} (${progress}%)`);

          // Use setTimeout to avoid blocking
          setTimeout(generateFrame, 0);
        } else {
          // All frames captured
          console.log(`Captured all ${frameCount} frames`);
          const frames = this.encoder.stopRecording();

          // Encode to MP4
          this.encoder
            .encodeToMP4(frames, 'grand-hotel-reel')
            .then((mp4Blob) => {
              console.log('Video encoding complete!');
              VideoEncoder.downloadBlob(mp4Blob, 'grand-hotel-reel.mp4');
              resolve(mp4Blob);
            })
            .catch(reject);
        }
      };

      generateFrame();
    });
  }

  /**
   * Render a single frame
   * @param {number} currentTime - Time in seconds
   */
  renderFrame(currentTime) {
    // Render scene background
    this.renderer.renderFrame(currentTime);

    // Render text overlay
    this.textRenderer.render(currentTime);
  }

  /**
   * Reset playback
   */
  reset() {
    this.stopPreview();
    this.currentTime = 0;
    this.renderer.clear();
  }
}

// Initialize on page load
let reelGenerator = null;

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('reel-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    reelGenerator = new ReelGenerator(canvas);
    await reelGenerator.init();
    console.log('Application ready');

    // Setup button event listeners
    const previewBtn = document.getElementById('preview-btn');
    const generateBtn = document.getElementById('generate-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        if (reelGenerator.isPreviewing) {
          reelGenerator.stopPreview();
          previewBtn.textContent = 'Preview';
        } else {
          reelGenerator.reset();
          reelGenerator.startPreview();
          previewBtn.textContent = 'Stop Preview';
        }
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        try {
          await reelGenerator.generateVideo();
          generateBtn.textContent = 'Generate Video';
          generateBtn.disabled = false;
        } catch (error) {
          console.error('Video generation failed:', error);
          generateBtn.textContent = 'Error - Try Again';
          generateBtn.disabled = false;
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        reelGenerator.reset();
        previewBtn.textContent = 'Preview';
      });
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

export { reelGenerator };
