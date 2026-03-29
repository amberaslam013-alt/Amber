# Grand Hotel Bad Pyrmont — Instagram Reel Generator

A browser-based video generator that creates a 10-second Instagram Reel (9:16 vertical format) for Grand Hotel Bad Pyrmont's luxury wellness brand based on an interactive concept brief.

## Features

- **Interactive Canvas Rendering**: Real-time preview of all 5 scenes with animated gradients and text overlays
- **Scene Automation**: Automatically sequences through 5 carefully-designed scenes (0-2s, 2-4s, 4-6s, 6-8s, 8-10s)
- **Professional Text Animations**: Fade-up/fade-out text with custom typography (Cormorant Garamond, Cinzel)
- **Cinematic Transitions**: Liquid dissolve, match cuts, whip tilts, and fade-through-color effects (≤ 0.4s per spec)
- **MP4 Video Export**: Generate high-quality 1080×1920 MP4 video (H.264, 24 FPS) using FFmpeg.wasm
- **Download Ready**: Direct download of final video to your machine

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This opens a development server at `http://localhost:3000` with live reload.

### Build for Production

```bash
npm run build
```

## Usage

### Preview the Reel

1. Click the **Preview** button to watch the 10-second reel in real-time
2. The canvas updates every frame with scene transitions and text animations
3. Click **Stop Preview** to halt

### Generate the Video

1. Click the **Generate Video** button
2. The generator captures 240 frames (24 FPS × 10 seconds) from the canvas
3. FFmpeg encodes frames to MP4 (may take 30-60 seconds)
4. Video automatically downloads as `grand-hotel-reel.mp4`

### Reset

Click **Reset** to clear the canvas and stop any playback.

## Project Structure

```
/Amber/
├── src/
│   ├── index.html              # Entry point with canvas and controls
│   ├── css/
│   │   └── styles.css          # UI styling (dark luxury theme)
│   ├── js/
│   │   ├── main.js             # App orchestration & event handlers
│   │   ├── renderer.js         # Canvas rendering & gradients
│   │   ├── scenes.js           # Scene definitions (5 scenes, timings)
│   │   ├── text.js             # Text rendering & animations
│   │   ├── encoder.js          # FFmpeg video encoding
│   │   └── config.js           # Colors, fonts, timings, text content
│   └── fonts/                  # (Optional) Local font files
├── package.json
├── vite.config.js
└── README.md
```

## Configuration

Edit `src/js/config.js` to customize:

- **Colors**: Adjust the gold, cream, and scene gradients
- **Timings**: Modify scene durations, text fade-in/out times
- **Text Content**: Change on-screen text, fonts, positioning
- **Transitions**: Customize transition types and durations
- **Video Specs**: Change resolution, FPS, bitrate

## Scene Breakdown

| Scene | Time | Description |
|-------|------|-------------|
| **1** | 0-2s | Forest & Architecture — Misty canopy to hotel façade at golden hour |
| **2** | 2-4s | Spa — Underwater pool glide + steam rituals |
| **3** | 4-6s | Wellness — Close-up of therapist hands + guest treatment |
| **4** | 6-8s | Fine Dining — Overhead plate rotation with herbs and flowers |
| **5** | 8-10s | Brand Close — Candle fade to logo + suite window + gold fade to black |

## Technical Details

### Video Specifications

- **Resolution**: 1080 × 1920 px (9:16 aspect ratio)
- **Frame Rate**: 24 FPS (cinematic)
- **Duration**: 10 seconds (240 frames)
- **Codec**: H.264 (MP4)
- **Bitrate**: 5 Mbps
- **Safe Zone**: Text positioned 250px from top/bottom (per Instagram specs)

### Rendering Pipeline

1. **Scene Renderer** (`renderer.js`): Draws gradient backgrounds for each scene
2. **Text Renderer** (`text.js`): Overlays animated text with fade-in/fade-out
3. **Transition Manager** (`scenes.js`): Handles scene transitions (dissolves, fades)
4. **Frame Capturer** (`main.js`): Captures each frame to PNG
5. **Video Encoder** (`encoder.js`): Converts PNG frames to MP4 via FFmpeg.wasm

### Color Palette

```
Gold:        #B8924A
Gold Light:  #D4AF7A
Gold Pale:   #F0E4CC
Cream:       #FAF6EF
Deep:        #1A1712 (background)
Stone:       #C8BEB0 (muted text)
Sage:        #7A8C6E (natural accent)
```

### Typography

- **Display (Headlines)**: Cormorant Garamond, 300 weight, italic (serif)
- **Labels**: Cinzel, 400 weight, uppercase (serif)
- **Body**: Jost, 300 weight (sans-serif)

## Dependencies

- **vite**: ^8.0.3 — Lightning-fast build tool
- **@ffmpeg/ffmpeg**: ^0.12.15 — WebAssembly FFmpeg for video encoding
- **canvas**: ^3.2.2 — Node.js Canvas API (for potential server-side rendering)

## Browser Compatibility

Works best on modern browsers with WebAssembly support:
- Chrome/Edge 57+
- Firefox 52+
- Safari 14.1+

## Known Limitations

- **FFmpeg.wasm**: First load may take 10-20s to download wasm binary (~30MB)
- **Large frame count**: Encoding 240 frames may consume 500MB+ RAM during generation
- **Canvas size**: Mobile browsers may have canvas size limitations on older devices

## Future Enhancements

- [ ] Add audio/voice-over support
- [ ] Implement real image/video asset support
- [ ] Add custom gradient editor UI
- [ ] Support animated elements (particles, flowing water)
- [ ] Add music background layer option
- [ ] Create batch export for multiple variations

## Troubleshooting

### FFmpeg fails to load
- **Issue**: "Failed to load FFmpeg"
- **Solution**: Check network access (FFmpeg.wasm ~30MB download); may need HTTPS on production

### Video generation is slow
- **Issue**: Takes > 2 minutes to export
- **Solution**: This is normal for 240 frames. FFmpeg is CPU-intensive. Close other apps to speed up.

### Text not rendering
- **Issue**: Blank canvas with no text
- **Solution**: Check browser console for font loading errors; ensure Google Fonts CDN is accessible

### Canvas appears blank
- **Issue**: Preview shows nothing
- **Solution**: Browser may be blocking Canvas. Try a different browser or check console for errors.

## Credits

**Concept Brief**: Grand Hotel Bad Pyrmont Instagram Content Strategy 2025
**Implementation**: AI-assisted video generation with Canvas + FFmpeg.wasm

---

**License**: MIT — Feel free to fork and adapt for other projects

**Support**: For issues or questions, check the browser console for error messages and refer to the Vite/FFmpeg documentation.
