# My Video

A video generation project using Remotion, integrated into the Amber monorepo.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the preview server:

```bash
npm start
```

This will open the Remotion preview interface at `http://localhost:3000`.

### Rendering

To render the video as an MP4 file:

```bash
npm run render
```

The output will be saved to `out/video.mp4`.

## Configuration

Video settings can be adjusted in `remotion.config.ts`:

- **Frame Rate**: 24 FPS
- **Duration**: 240 frames (10 seconds)
- **Resolution**: 1080×1920px (9:16 - Instagram Reels format)
- **Image Format**: PNG

## Project Structure

```
src/
├── index.tsx          # Entry point
├── MyComposition.tsx  # Main video composition
└── ...                # Additional components
```

## About Remotion

Remotion is a framework for creating videos programmatically using React. Learn more at [remotion.dev](https://www.remotion.dev).
