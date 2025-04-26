import { Application, Container, Assets, Texture, Rectangle } from 'pixi.js';
import { BaseScene } from '../../core/BaseScene';
import { SceneManager } from '../../core/SceneManager';
import { Card } from './Card';
import { Stack, StackPosition } from './Stack';

export type CardTextureGrid = Texture[][];

export class AceOfShadowsScene extends BaseScene {
    private gameContainer: Container;
    private cardStacks: Stack[] = [];
    private cardTextures!: CardTextureGrid;
    private cardBackTexture!: Texture;
    private cards: Card[] = [];

    private readonly MARGIN = 70;
    private readonly MARGIN_TOP = 140;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app, sceneManager);
        this.gameContainer = new Container();
    }

    protected async onInit(): Promise<void> {
        const spriteSheet = await Assets.load('assets/cards.png');

        this.cardTextures = [];

        const cardWidth = spriteSheet.width / 13;
        const cardHeight = spriteSheet.height / 5;

        this.cardBackTexture = new Texture({
            source: spriteSheet.source,
            frame: new Rectangle(
                0,
                4 * cardHeight,
                cardWidth,
                cardHeight
            )
        });

        for (let suit = 0; suit < 4; suit++) {
            this.cardTextures[suit] = [];
            for (let value = 0; value < 13; value++) {
                const texture = new Texture({
                    source: spriteSheet.source,
                    frame: new Rectangle(
                        value * cardWidth,
                        suit * cardHeight,
                        cardWidth,
                        cardHeight
                    )
                });
                this.cardTextures[suit][value] = texture;
            }
        }

        this.cardStacks.push(new Stack(StackPosition.TopLeft));

        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.cardStacks[0].position.set(this.MARGIN, this.MARGIN_TOP);
        this.cardStacks[0].updateWidth(width / 3);

        for (let i = 0; i < 144; i++) {
            const suit = i % 4;
            const value = i % 13;
            const card = new Card(value, suit, this.cardTextures, this.cardBackTexture);
            this.cards.push(card);
            this.cardStacks[0].push(card);
        }

        this.gameContainer.addChild(this.cardStacks[0]);

        this.cardStacks.push(new Stack(StackPosition.TopRight));
        this.cardStacks[1].position.set(width - this.MARGIN, this.MARGIN_TOP);
        this.cardStacks[1].updateWidth(width / 3);
        this.gameContainer.addChild(this.cardStacks[1]);

        this.cardStacks.push(new Stack(StackPosition.BottomLeft));
        this.cardStacks[2].position.set(this.MARGIN, height - this.MARGIN_TOP);
        this.cardStacks[2].updateWidth(width / 3);
        this.gameContainer.addChild(this.cardStacks[2]);

        this.cardStacks.push(new Stack(StackPosition.BottomRight));
        this.cardStacks[3].position.set(width - this.MARGIN, height - this.MARGIN_TOP);
        this.cardStacks[3].updateWidth(width / 3);
        this.gameContainer.addChild(this.cardStacks[3]);

        this.addChild(this.gameContainer);
    }

    protected onUpdate(delta: number): void {
        for (const card of this.cards) {
            card.update(delta);
        }

        const deltaMS = delta * (1000 / 60);
        for (const stack of this.cardStacks) {
            stack.update(deltaMS);
        }
    }

    protected onResize(width: number, height: number): void {
        // Top left
        this.cardStacks[0].position.set(this.MARGIN, this.MARGIN_TOP);
        this.cardStacks[0].updateWidth(width / 3);

        // Top right
        this.cardStacks[1].position.set(width - this.MARGIN, this.MARGIN_TOP);
        this.cardStacks[1].updateWidth(width / 3);

        // Bottom left
        this.cardStacks[2].position.set(this.MARGIN, height - this.MARGIN_TOP);
        this.cardStacks[2].updateWidth(width / 3);

        // Bottom right
        this.cardStacks[3].position.set(width - this.MARGIN, height - this.MARGIN_TOP);
        this.cardStacks[3].updateWidth(width / 3);
    }

    protected onDestroy(): void {
        this.gameContainer.destroy();
    }
}
