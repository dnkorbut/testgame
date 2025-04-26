import { Text, Container, Application } from 'pixi.js';

export class FpsCounter extends Container {
    private fpsText: Text;
    private lastTime: number;
    private frames: number;

    constructor(app: Application) {
        super();

        this.lastTime = performance.now();
        this.frames = 0;

        // Create FPS text
        this.fpsText = new Text({
            text: 'FPS: 0',
            style: {
                fontSize: 24,
                fill: 0xffffff
            }
        });
        this.fpsText.resolution = window.devicePixelRatio || 1;
        this.fpsText.x = 10;
        this.fpsText.y = 10;
        this.addChild(this.fpsText);

        // Add update ticker
        app.ticker.add(this.update, this);
    }

    private update(): void {
        this.frames++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fpsText.text = `FPS: ${this.frames}`;
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }

    public destroy(): void {
        if (this.fpsText) {
            this.fpsText.destroy();
        }
        super.destroy();
    }
} 