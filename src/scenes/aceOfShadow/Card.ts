import { Container, Sprite, Texture } from 'pixi.js';
import { CardTextureGrid } from './main';

export enum Suit {
    Spades = 0,
    Hearts = 1,
    Clubs = 2,
    Diamonds = 3
}

export enum Value {
    Ace = 0,
    Two = 1,
    Three = 2,
    Four = 3,
    Five = 4,
    Six = 5,
    Seven = 6,
    Eight = 7,
    Nine = 8,
    Ten = 9,
    Jack = 10,
    Queen = 11,
    King = 12
}

export class Card extends Container {
    private frontSprite: Sprite;
    private backSprite: Sprite;
    private highlight_overlay: Sprite | null = null;
    private isFlipping = false;
    private flipProgress = 0;
    private readonly FLIP_SPEED = 0.1;
    private readonly value: number;
    private readonly suit: number;
    private isFaceUp = false;

    constructor(value: number, suit: number, textures: CardTextureGrid, backTexture: Texture) {
        super();

        this.value = value;
        this.suit = suit;

        this.frontSprite = new Sprite(textures[suit][value]);
        this.backSprite = new Sprite(backTexture);

        this.frontSprite.anchor.set(0.5);
        this.backSprite.anchor.set(0.5);

        this.addChild(this.frontSprite);
        this.addChild(this.backSprite);

        this.frontSprite.visible = false;
        this.backSprite.visible = true;

        this.eventMode = 'static';
        this.cursor = 'pointer';
    }

    public flipToState(faceUp: boolean): void {
        if (!this.isFlipping && this.isFaceUp !== faceUp) {
            this.isFlipping = true;
            this.flipProgress = 0;
            this.isFaceUp = faceUp;
        }
    }

    public update(delta: number): void {
        if (!this.isFlipping) return;

        this.flipProgress += this.FLIP_SPEED * delta;

        if (this.flipProgress >= 1) {
            this.flipProgress = 0;
            this.isFlipping = false;
            return;
        }

        const scale = Math.abs(Math.cos(this.flipProgress * Math.PI));
        this.scale.x = scale;

        if (this.flipProgress < 0.5) {
            this.frontSprite.visible = !this.isFaceUp;
            this.backSprite.visible = this.isFaceUp;
        } else {
            this.frontSprite.visible = this.isFaceUp;
            this.backSprite.visible = !this.isFaceUp;
        }
    }

    public get isAnimating(): boolean {
        return this.isFlipping;
    }

    public destroy(): void {
        if (this.highlight_overlay) {
            this.highlight_overlay.destroy();
        }
        this.frontSprite.destroy();
        this.backSprite.destroy();
        super.destroy();
    }
}
