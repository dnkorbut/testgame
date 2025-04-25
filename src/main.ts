import * as PIXI from 'pixi.js';
import './style.css';

// Create PixiJS application
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});

// Add canvas to the page
document.getElementById('app')?.appendChild(app.view as HTMLCanvasElement);

// Create a container for our content
const container = new PIXI.Container();
app.stage.addChild(container);

// Add a sprite or graphics here
const graphics = new PIXI.Graphics();
graphics.beginFill(0xff0000);
graphics.drawCircle(app.screen.width / 2, app.screen.height / 2, 50);
graphics.endFill();
container.addChild(graphics);

// Animation loop
app.ticker.add(() => {
  // Add your game logic here
  graphics.rotation += 0.01;
});
