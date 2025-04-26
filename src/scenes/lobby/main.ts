import { Container, Application, Text, TextStyle } from 'pixi.js';
import { Scene } from '../../core/Scene';

export class LobbyScene extends Container implements Scene {
    private menuItems: Text[] = [];
    private readonly normalStyle: TextStyle;
    private readonly hoverStyle: TextStyle;

    constructor(private app: Application) {
        super();
        console.log('LobbyScene constructor');

        this.normalStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF,
            dropShadow: {
                color: 0x000000,
                blur: 4,
                distance: 2
            }
        });

        this.hoverStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFF00,
            dropShadow: {
                color: 0x000000,
                blur: 4,
                distance: 2
            }
        });
    }

    public async init(): Promise<void> {
        console.log('LobbyScene init start');
        const scenes = ['Ace of Shadows', 'Magic Words', 'Phoenix Flame'];
        scenes.forEach((sceneName, index) => {
            const text = new Text({
                text: sceneName,
                style: this.normalStyle
            });

            text.x = this.app.screen.width / 2;
            text.y = 200 + index * 60;
            text.anchor.set(0.5);
            text.eventMode = 'static';
            text.cursor = 'pointer';

            // Add hover effects
            text.on('pointerenter', () => {
                text.style = this.hoverStyle;
                text.scale.set(1.1);
            });

            text.on('pointerleave', () => {
                text.style = this.normalStyle;
                text.scale.set(1.0);
            });

            text.on('pointerdown', () => {
                const sceneId = sceneName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
                console.log('Menu item clicked:', sceneId);
                // Dispatch a custom event that SceneManager will listen to
                window.dispatchEvent(new CustomEvent('scene-change', {
                    detail: { scene: sceneId }
                }));
            });

            this.menuItems.push(text);
            this.addChild(text);
        });

        // Add title
        const titleText = new Text({
            text: 'Lobby Menu',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0x00FF00,
                dropShadow: {
                    color: 0x000000,
                    blur: 4,
                    distance: 2
                },
                fontWeight: 'bold'
            })
        });

        titleText.x = this.app.screen.width / 2;
        titleText.y = 100;
        titleText.anchor.set(0.5);
        this.addChild(titleText);
        this.menuItems.push(titleText);

        // Add the lobby scene to the stage
        this.app.stage.addChild(this);
        console.log('LobbyScene init complete');
    }

    public update(delta: number): void {
        // No update needed for lobby
    }

    public resize(width: number, height: number): void {
        this.menuItems.forEach((text, index) => {
            text.x = width / 2;
            if (index === this.menuItems.length - 1) {
                // Title position
                text.y = 100;
            } else {
                // Menu items position
                text.y = 200 + index * 60;
            }
        });
    }

    public destroy(): void {
        console.log('LobbyScene destroy start');
        this.menuItems.forEach(item => {
            item.removeAllListeners();
            item.destroy();
        });
        this.menuItems = [];
        if (this.parent) {
            this.parent.removeChild(this);
        }
        super.destroy();
        console.log('LobbyScene destroy complete');
    }
}

export const metadata = {
    id: 'lobby',
    name: 'Lobby'
}; 