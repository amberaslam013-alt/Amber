// Color Palette (from concept document)
export const COLORS = {
  gold: '#B8924A',
  goldLight: '#D4AF7A',
  goldPale: '#F0E4CC',
  cream: '#FAF6EF',
  deep: '#1A1712',
  muted: '#6B5F4E',
  sage: '#7A8C6E',
  stone: '#C8BEB0',
  softBg: '#F5EFE6',
  // Scene-specific colors
  teal: '#A8C0C8',
  blue: '#648CA0',
  green: '#7A8C6E',
  purple: '#C8A8C0',
};

// Typography
export const FONTS = {
  serif: 'Cormorant Garamond, serif',
  display: 'Cinzel, serif',
  body: 'Jost, sans-serif',
};

// Video Specifications
export const VIDEO_SPEC = {
  width: 1080,
  height: 1920,
  fps: 24,
  duration: 10, // seconds
  bitrate: '5M', // MP4 bitrate
  safeZone: 250, // pixels from top/bottom for text
};

// Timeline configuration
export const TIMELINE = {
  totalDuration: 10,
  scenes: [
    { id: 1, start: 0, duration: 2 },
    { id: 2, start: 2, duration: 2 },
    { id: 3, start: 4, duration: 2 },
    { id: 4, start: 6, duration: 2 },
    { id: 5, start: 8, duration: 2 },
  ],
};

// Scene Text Overlays (from concept document)
export const SCENE_TEXT = {
  1: {
    main: 'Where Healing Begins.',
    sub: null,
    fadeIn: 0.2,
    fadeOut: 1.8,
    position: 'lower-third',
    alignment: 'center',
  },
  2: {
    main: '1,500 m² of Pure Stillness.',
    sub: null,
    fadeIn: 2.2,
    fadeOut: 3.8,
    position: 'lower-third',
    alignment: 'center',
  },
  3: {
    main: 'Ancient Wisdom. Modern Healing.',
    sub: null,
    fadeIn: 4.2,
    fadeOut: 5.8,
    position: 'lower-third',
    alignment: 'center',
  },
  4: {
    main: 'Nourish Every Cell.',
    sub: null,
    fadeIn: 6.2,
    fadeOut: 7.8,
    position: 'lower-third',
    alignment: 'center',
  },
  5: {
    main: 'Grand Hotel Bad Pyrmont',
    sub: 'Longevity Wellness · Bad Pyrmont, Germany',
    fadeIn: 8.2,
    fadeOut: 9.8,
    position: 'center-frame',
    alignment: 'center',
  },
};

// Voice-over timing (9 seconds of narration spread across 10-second reel)
export const VOICE_OVER = {
  script: 'Breathe in… let the water carry you. Restore your body and nourish your soul. Grand Hotel Bad Pyrmont — where health meets luxury.',
  cues: [
    { time: 0.3, text: 'Breathe in…' },
    { time: 1.5, text: '…let the water carry you.' },
    { time: 3.2, text: 'Restore your body' },
    { time: 4.5, text: '…and nourish your soul.' },
    { time: 6.0, text: 'Grand Hotel Bad Pyrmont' },
    { time: 8.2, text: '— where health meets luxury.' },
  ],
};

// Transition configuration (all transitions 0.4s or less per spec)
export const TRANSITIONS = {
  liquidDissolve: {
    name: 'liquidDissolve',
    duration: 0.4,
    type: 'dissolve',
  },
  matchCut: {
    name: 'matchCut',
    duration: 0.3,
    type: 'crossfade',
  },
  whipTilt: {
    name: 'whipTilt',
    duration: 0.35,
    type: 'motion',
  },
  lumaFade: {
    name: 'lumaFade',
    duration: 0.4,
    type: 'fade-through-color',
  },
  goldFade: {
    name: 'goldFade',
    duration: 0.4,
    type: 'fade-to-color',
    color: COLORS.gold,
  },
  blackFade: {
    name: 'blackFade',
    duration: 0.8,
    type: 'fade-to-color',
    color: '#000000',
  },
};

// Gradient definitions for each scene
export const GRADIENTS = {
  1: {
    type: 'multiple',
    layers: [
      {
        type: 'radial',
        colors: [
          { color: 'rgba(184,146,74,0.18)', stop: 0 },
          { color: 'transparent', stop: 0.7 },
        ],
        position: { x: 0.5, y: 0 },
      },
      {
        type: 'radial',
        colors: [
          { color: 'rgba(122,140,110,0.12)', stop: 0 },
          { color: 'transparent', stop: 0.6 },
        ],
        position: { x: 0.8, y: 1 },
      },
    ],
  },
  2: {
    type: 'multiple',
    layers: [
      {
        type: 'radial',
        colors: [
          { color: 'rgba(100,150,180,0.25)', stop: 0 },
          { color: 'transparent', stop: 0.6 },
        ],
        position: { x: 0.3, y: 0.6 },
      },
      {
        type: 'radial',
        colors: [
          { color: 'rgba(184,146,74,0.15)', stop: 0 },
          { color: 'transparent', stop: 0.5 },
        ],
        position: { x: 0.7, y: 0.2 },
      },
    ],
  },
  3: {
    type: 'multiple',
    layers: [
      {
        type: 'radial',
        colors: [
          { color: 'rgba(122,140,110,0.3)', stop: 0 },
          { color: 'transparent', stop: 0.6 },
        ],
        position: { x: 0.5, y: 0.8 },
      },
      {
        type: 'radial',
        colors: [
          { color: 'rgba(200,180,130,0.15)', stop: 0 },
          { color: 'transparent', stop: 0.5 },
        ],
        position: { x: 0.3, y: 0.2 },
      },
    ],
  },
  4: {
    type: 'multiple',
    layers: [
      {
        type: 'radial',
        colors: [
          { color: 'rgba(184,146,74,0.25)', stop: 0 },
          { color: 'transparent', stop: 0.6 },
        ],
        position: { x: 0.5, y: 0.3 },
      },
      {
        type: 'radial',
        colors: [
          { color: 'rgba(122,140,110,0.2)', stop: 0 },
          { color: 'transparent', stop: 0.5 },
        ],
        position: { x: 0.7, y: 0.7 },
      },
    ],
  },
  5: {
    type: 'multiple',
    layers: [
      {
        type: 'radial',
        colors: [
          { color: 'rgba(184,146,74,0.30)', stop: 0 },
          { color: 'transparent', stop: 0.6 },
        ],
        position: { x: 0.5, y: 0.2 },
      },
    ],
  },
};

// Background base colors for scenes (after gradients fade)
export const SCENE_BASE_COLORS = {
  1: '#1a1208',
  2: '#0e1a1c',
  3: '#141a10',
  4: '#1a1410',
  5: '#0a0905',
};

// Animation timings (in seconds)
export const ANIMATION_TIMING = {
  textFadeUpDuration: 0.4,
  textFadeOutDuration: 0.4,
  transitionDuration: 0.4,
  easing: 'ease-out', // for text entrance
};
