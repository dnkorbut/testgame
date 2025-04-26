import { Application, Container, AnimatedSprite, Assets, Texture, Graphics } from 'pixi.js';
import { BaseScene } from '../../core/BaseScene';
import { SceneManager } from '../../core/SceneManager';

export class PhoenixFlameScene extends BaseScene {
    private gameContainer: Container;
    private flameSprites: AnimatedSprite[] = [];
    private readonly MAX_FLAMES = 10;
    private readonly SPREAD = 150;
    private flameTextures: Texture[] = [];

    constructor(app: Application, sceneManager: SceneManager) {
        super(app, sceneManager);
        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
    }

    protected async onInit(): Promise<void> {
        this.app.renderer.background.color = 0x000000;
        await Assets.load('https://pixijs.com/assets/spritesheet/mc.json');

        for (let i = 0; i < 26; i++) {
            const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);
            this.flameTextures.push(texture);
        }

        for (let i = 0; i < this.MAX_FLAMES; i++) {
            this.createFlame();
        }
    }

    private createFlame(): void {
        const flame = new AnimatedSprite(this.flameTextures);

        const flameProps = {
            baseScale: 0.5 + Math.random() * 0.5,
            moveSpeed: 0.3 + Math.random() * 0.4,
            sineFreq: 0.001 + Math.random() * 0.002,
            sineAmp: 0.2 + Math.random() * 0.3,
            alpha: 0.7 + Math.random() * 0.3
        };

        const resetPosition = () => {
            flame.x = Math.random() * this.SPREAD - this.SPREAD / 2;
            flame.y = Math.random() * this.SPREAD - this.SPREAD / 2 + this.app.screen.height / 2 - this.SPREAD;
            flame.scale.set(flameProps.baseScale * (0.9 + Math.random() * 0.2));
            flame.alpha = flameProps.alpha * (0.9 + Math.random() * 0.2);
            flame.gotoAndPlay(Math.floor(Math.random() * this.flameTextures.length));
        };

        flame.x = Math.random() * this.SPREAD - this.SPREAD / 2;
        flame.y = Math.random() * this.SPREAD - this.SPREAD / 2 + this.app.screen.height / 2 - this.SPREAD;

        flame.anchor.set(0.5);
        flame.rotation = Math.random() * Math.PI;
        flame.animationSpeed = 0.25 + Math.random() * 0.1;
        flame.loop = false;
        flame.onComplete = resetPosition;

        flame.scale.set(flameProps.baseScale);
        flame.alpha = flameProps.alpha;

        (flame as any).customProps = flameProps;

        flame.gotoAndPlay(Math.floor(Math.random() * this.flameTextures.length));

        this.flameSprites.push(flame);
        this.gameContainer.addChild(flame);
    }

    protected onUpdate(_delta: number): void {
        this.flameSprites.forEach((flame) => {
            if (flame.playing) {
                const props = (flame as any).customProps;

                flame.y -= props.moveSpeed;

                flame.x += Math.sin(Date.now() * props.sineFreq) * props.sineAmp;

                flame.scale.set(
                    props.baseScale * (1 + Math.sin(Date.now() * 0.003) * 0.1)
                );

                flame.alpha = props.alpha * (0.9 + Math.sin(Date.now() * 0.004) * 0.1);
            }
        });
    }

    protected onResize(width: number, height: number): void {
        this.gameContainer.x = width / 2;
        this.gameContainer.y = height / 2;

        this.flameSprites.forEach((flame) => {
            flame.x = Math.random() * this.SPREAD - this.SPREAD / 2;
            flame.y = Math.random() * this.SPREAD - this.SPREAD / 2 + this.app.screen.height / 2 - this.SPREAD;
        });
    }

    protected onDestroy(): void {
        this.app.renderer.background.color = 0x1099bb;

        this.flameSprites.forEach(flame => flame.destroy());
        this.flameSprites = [];
        this.flameTextures = [];
        this.gameContainer.destroy();
    }
} 