import { Container, Application, Graphics, Text } from 'pixi.js';
import { Scene } from './Scene';
import { SceneManager } from './SceneManager';

export abstract class BaseScene extends Container implements Scene {
    protected app: Application;
    protected sceneManager: SceneManager;
    protected backButton: Container;

    constructor(app: Application, sceneManager: SceneManager) {
        super();
        console.log('BaseScene constructor');
        this.app = app;
        this.sceneManager = sceneManager;
        this.backButton = this.createBackButton();
        this.addChild(this.backButton);
        console.log('BaseScene container created');
    }

    protected createBackButton(): Container {
        const button = new Container();

        const background = new Graphics();
        background.fill({ color: 0x2980b9 });
        background.roundRect(0, 0, 100, 40, 5);
        background.fill();

        const text = new Text({
            text: 'Back',
            style: {
                fontSize: 20,
                fill: 0xFFFFFF
            }
        });
        text.x = 50;
        text.y = 20;
        text.anchor.set(0.5);

        button.addChild(background);
        button.addChild(text);
        button.x = this.app.screen.width - button.width - 20;
        button.y = 20;
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.on('pointertap', () => this.sceneManager.exitToMenu());

        return button;
    }

    public async init(): Promise<void> {
        console.log('BaseScene init start');
        this.app.stage.addChild(this);
        console.log('BaseScene container added to stage');
        await this.onInit();
        console.log('BaseScene init complete');
    }

    protected abstract onInit(): Promise<void>;

    public update(delta: number): void {
        this.onUpdate(delta);
    }

    protected onUpdate(_delta: number): void {
        // Empty implementation
    }

    public resize(width: number, height: number): void {
        this.onResize(width, height);
        // Update back button position
        this.backButton.x = width - this.backButton.width - 20;
    }

    protected onResize(_width: number, _height: number): void {
        // Empty implementation
    }

    public destroy(): void {
        console.log('BaseScene destroy start');
        this.onDestroy();
        this.backButton.destroy();
        if (this.parent) {
            this.parent.removeChild(this);
        }
        super.destroy(true);
        console.log('BaseScene destroy complete');
    }

    protected onDestroy(): void {
        // Optional override in derived classes
    }
} 