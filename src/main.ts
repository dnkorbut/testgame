import { Application } from 'pixi.js';
import { SceneManager, SceneConfig } from './core/SceneManager';
import { AceOfShadowsScene } from './scenes/aceOfShadow/main';
import { MagicWordsScene } from './scenes/magicWords/main';
import { PhoenixFlameScene } from './scenes/phoenixFlame/main';
import './style.css';

async function init() {
  const devicePixelRatio = window.devicePixelRatio || 1;

  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1099bb,
    antialias: true,
    autoDensity: true,
    resolution: devicePixelRatio,
    resizeTo: window,
  });

  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.innerHTML = '';
    appDiv.appendChild(app.canvas);
  }

  const scenes: SceneConfig[] = [
    { id: 'aceofshadows', sceneClass: AceOfShadowsScene },
    { id: 'magicwords', sceneClass: MagicWordsScene },
    { id: 'phoenixflame', sceneClass: PhoenixFlameScene }
  ];

  const sceneManager = new SceneManager(app, scenes);
  await sceneManager.switchScene('lobby');
}

init().catch(console.error);
