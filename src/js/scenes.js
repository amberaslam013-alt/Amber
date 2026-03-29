import {
  SCENE_TEXT,
  TIMELINE,
  GRADIENTS,
  SCENE_BASE_COLORS,
  TRANSITIONS,
  COLORS,
} from './config.js';

// Define all 5 scenes with their complete configurations
export const SCENES = [
  {
    id: 1,
    start: 0,
    duration: 2,
    name: 'Opening — Forest & Architecture',
    description: 'Slow drone push-in over misty German forest canopy into hotel façade at golden hour.',
    text: SCENE_TEXT[1],
    gradient: GRADIENTS[1],
    backgroundColor: SCENE_BASE_COLORS[1],
    transitionOut: TRANSITIONS.liquidDissolve,
    tags: ['Fade In / Slow Push', 'Text Fade Up', 'VO: Breathe in…', 'Drone Aerial'],
  },
  {
    id: 2,
    start: 2,
    duration: 2,
    name: 'Spa — Pool & Steam Ritual',
    description: 'Silky underwater shot of legs gliding through thermal pool, transitioning to warm sauna steam.',
    text: SCENE_TEXT[2],
    gradient: GRADIENTS[2],
    backgroundColor: SCENE_BASE_COLORS[2],
    transitionIn: TRANSITIONS.liquidDissolve,
    transitionOut: TRANSITIONS.matchCut,
    tags: ['Cross-Dissolve', 'Text Slide Left', 'VO: …let the water carry you.', 'Slow Motion · Macro'],
  },
  {
    id: 3,
    start: 4,
    duration: 2,
    name: 'Wellness — Ayurvedic Touch',
    description: 'Extreme close-up of therapist hands with botanical oils, followed by guest portrait mid-treatment.',
    text: SCENE_TEXT[3],
    gradient: GRADIENTS[3],
    backgroundColor: SCENE_BASE_COLORS[3],
    transitionIn: TRANSITIONS.matchCut,
    transitionOut: TRANSITIONS.whipTilt,
    tags: ['Cinematic Cut', 'Text Fade In', 'VO: Restore your body…', 'Shallow DoF · Macro'],
  },
  {
    id: 4,
    start: 6,
    duration: 2,
    name: 'Fine Dining — Healthy Gourmet',
    description: 'Overhead rotating shot of immaculately plated seasonal dish with micro herbs and edible flowers.',
    text: SCENE_TEXT[4],
    gradient: GRADIENTS[4],
    backgroundColor: SCENE_BASE_COLORS[4],
    transitionIn: TRANSITIONS.whipTilt,
    transitionOut: TRANSITIONS.lumaFade,
    tags: ['Overhead Pan', 'Text Scale Up', 'VO: …and nourish your soul.', 'Rotating Overhead'],
  },
  {
    id: 5,
    start: 8,
    duration: 2,
    name: 'Close — Brand Identity',
    description: 'Pull back from candle flame to reveal logo, fade to suite window, then to gold, then black.',
    text: SCENE_TEXT[5],
    gradient: GRADIENTS[5],
    backgroundColor: SCENE_BASE_COLORS[5],
    transitionIn: TRANSITIONS.lumaFade,
    transitionOut: TRANSITIONS.goldFade, // then TRANSITIONS.blackFade
    tags: ['Fade to Gold · Fade to Black', 'Logo Lock-Up', 'VO: Grand Hotel Bad Pyrmont.', 'Slow Pull-Back'],
  },
];

// Helper function to get scene by time
export function getSceneAtTime(time) {
  return SCENES.find((scene) => time >= scene.start && time < scene.start + scene.duration);
}

// Helper function to get transition at time
export function getTransitionAtTime(time) {
  // Check if we're at a transition boundary
  for (let i = 0; i < SCENES.length - 1; i++) {
    const currentScene = SCENES[i];
    const transitionEnd = currentScene.start + currentScene.duration;
    if (time >= transitionEnd && time < transitionEnd + (currentScene.transitionOut?.duration || 0.4)) {
      return {
        from: currentScene,
        to: SCENES[i + 1],
        transition: currentScene.transitionOut,
        progress: (time - transitionEnd) / (currentScene.transitionOut?.duration || 0.4),
      };
    }
  }
  return null;
}

// Helper to check if we're in a transition
export function isInTransition(time) {
  return getTransitionAtTime(time) !== null;
}

// Helper to get next scene
export function getNextScene(time) {
  const currentScene = getSceneAtTime(time);
  if (currentScene && currentScene.id < SCENES.length) {
    return SCENES.find((s) => s.id === currentScene.id + 1);
  }
  return null;
}

// Helper to format time for debugging
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${minutes}:${secs}`;
}
