import { Application, Container, Ticker } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { LobbyScene } from '../scenes/lobby/main';
import { FpsCounter } from './FpsCounter';

export interface SceneConstructor {
    new(app: Application, sceneManager: SceneManager): BaseScene;
}

export interface SceneConfig {
    id: string;
    sceneClass: SceneConstructor;
}

export class SceneManager {
    private currentScene: Container | null = null;
    private app: Application;
    private resizeListener: (event: UIEvent) => void;
    private fpsCounter: FpsCounter;
    private updateTicker: ((ticker: Ticker) => void) | null = null;
    private scenes: Map<string, SceneConstructor>;

    constructor(app: Application, scenes: SceneConfig[]) {
        this.app = app;
        this.scenes = new Map(scenes.map(config => [config.id, config.sceneClass]));
        this.resizeListener = this.handleResize.bind(this);

        // Initialize FPS counter
        this.fpsCounter = new FpsCounter(app);
        this.app.stage.addChild(this.fpsCounter);

        // Listen for scene change events
        window.addEventListener('scene-change', ((event: CustomEvent) => {
            console.log('Scene change event received:', event.detail.scene);
            this.switchScene(event.detail.scene);
        }) as EventListener);
    }

    private handleResize(_event: UIEvent): void {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        if (this.currentScene && 'resize' in this.currentScene) {
            (this.currentScene as any).resize(window.innerWidth, window.innerHeight);
        }
    }

    public async exitToMenu(): Promise<void> {
        await this.switchScene('lobby');
    }

    public async switchScene(sceneId: string): Promise<void> {
        console.log('Starting scene switch to:', sceneId);

        // Remove update ticker
        if (this.updateTicker) {
            this.app.ticker.remove(this.updateTicker);
            this.updateTicker = null;
        }

        // Clean up current scene
        if (this.currentScene) {
            console.log('Cleaning up current scene');
            if (this.currentScene instanceof BaseScene || this.currentScene instanceof LobbyScene) {
                this.currentScene.destroy();
            }
            this.currentScene = null;
        }

        let newScene: Container;

        if (sceneId === 'lobby') {
            console.log('Creating lobby scene');
            const scene = new LobbyScene(this.app);
            await scene.init();
            newScene = scene;
        } else {
            const SceneClass = this.scenes.get(sceneId);
            if (!SceneClass) {
                throw new Error(`Unknown scene ID: ${sceneId}`);
            }

            console.log('Creating scene instance');
            const scene = new SceneClass(this.app, this);
            console.log('Initializing scene');
            await scene.init();
            newScene = scene;

            // Set up update ticker for game scenes
            if (scene instanceof BaseScene) {
                this.updateTicker = (ticker: Ticker) => scene.update(ticker.deltaTime);
                this.app.ticker.add(this.updateTicker);
            }
        }

        this.currentScene = newScene;
        window.addEventListener('resize', this.resizeListener);

        // Initial resize call
        this.handleResize(new UIEvent('resize'));
        console.log('Scene switch completed');
    }

    public async destroy(): Promise<void> {
        window.removeEventListener('resize', this.resizeListener);

        if (this.updateTicker) {
            this.app.ticker.remove(this.updateTicker);
            this.updateTicker = null;
        }

        if (this.currentScene) {
            if (this.currentScene instanceof BaseScene || this.currentScene instanceof LobbyScene) {
                this.currentScene.destroy();
            }
            this.currentScene = null;
        }

        // Clean up FPS counter
        if (this.fpsCounter) {
            this.fpsCounter.destroy();
            this.app.stage.removeChild(this.fpsCounter);
        }
    }
} 