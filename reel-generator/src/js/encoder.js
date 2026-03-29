import { VIDEO_SPEC } from './config.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg = null;

/**
 * Initialize FFmpeg.wasm
 */
export async function initFFmpeg() {
  if (ffmpeg && ffmpeg.isLoaded()) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  try {
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  }
}

/**
 * Encode canvas frames to MP4 video
 * Uses Canvas 2D context to capture frames and FFmpeg to encode
 */
export class VideoEncoder {
  constructor(canvasElement, fps = VIDEO_SPEC.fps) {
    this.canvas = canvasElement;
    this.fps = fps;
    this.frameDelay = 1000 / fps; // milliseconds per frame
    this.frames = [];
    this.isRecording = false;
    this.startTime = null;
  }

  /**
   * Start recording frames from canvas
   */
  startRecording() {
    this.frames = [];
    this.isRecording = true;
    this.startTime = performance.now();
    console.log(`Started recording at ${this.fps} FPS`);
  }

  /**
   * Capture current canvas frame
   */
  captureFrame() {
    if (!this.isRecording) return;

    try {
      // Get canvas data as blob
      this.canvas.toBlob((blob) => {
        this.frames.push(blob);
      });
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }

  /**
   * Stop recording and return collected frames
   */
  stopRecording() {
    this.isRecording = false;
    const duration = performance.now() - this.startTime;
    console.log(`Stopped recording. Captured ${this.frames.length} frames in ${(duration / 1000).toFixed(2)}s`);
    return this.frames;
  }

  /**
   * Encode frames to MP4 using FFmpeg
   * @param {Array} frames - Array of frame blobs
   * @param {string} outputFileName - Output file name (without extension)
   * @returns {Promise<Blob>} MP4 video blob
   */
  async encodeToMP4(frames, outputFileName = 'reel') {
    if (!ffmpeg) {
      throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
    }

    if (frames.length === 0) {
      throw new Error('No frames to encode');
    }

    console.log(`Encoding ${frames.length} frames to MP4...`);

    try {
      // Write each frame as an image file to FFmpeg's filesystem
      for (let i = 0; i < frames.length; i++) {
        const frameBuffer = await frames[i].arrayBuffer();
        ffmpeg.FS('writeFile', `frame_${String(i).padStart(6, '0')}.png`, new Uint8Array(frameBuffer));
      }

      // Create input pattern for FFmpeg
      const inputPattern = 'frame_%06d.png';
      const outputFileName2 = `${outputFileName}.mp4`;

      // Run FFmpeg to encode
      // Input: 24fps PNG frames, Output: H.264 MP4 at specific bitrate
      await ffmpeg.run(
        '-framerate', String(this.fps),
        '-i', inputPattern,
        '-pix_fmt', 'yuv420p',
        '-c:v', 'libx264',
        '-preset', 'medium', // balance speed vs quality
        '-b:v', '5M', // bitrate
        '-y', // overwrite output file
        outputFileName2
      );

      // Read the output file
      const data = ffmpeg.FS('readFile', outputFileName2);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Cleanup FFmpeg filesystem
      for (let i = 0; i < frames.length; i++) {
        ffmpeg.FS('unlink', `frame_${String(i).padStart(6, '0')}.png`);
      }
      ffmpeg.FS('unlink', outputFileName2);

      console.log(`Successfully encoded to MP4 (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
      return blob;
    } catch (error) {
      console.error('Error encoding video:', error);
      throw error;
    }
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Blob to download
   * @param {string} fileName - File name with extension
   */
  static downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`Downloaded ${fileName}`);
  }

  /**
   * Calculate expected frame count for duration
   * @param {number} durationSeconds - Duration in seconds
   * @returns {number} Expected frame count
   */
  getExpectedFrameCount(durationSeconds) {
    return Math.ceil(durationSeconds * this.fps);
  }
}

/**
 * Create a simple PNG image blob from canvas
 * Used for frame capture
 */
export async function canvasToPNG(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
