import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';
import { SpeechBubble } from './SpeechBubble';
import { Application } from 'pixi.js';

export enum CharacterPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
}

export interface CharacterData {
    name: string;
    url: string;
    position: string;
}

export interface EmojiData {
    name: string;
    url: string;
}

export class Character extends Container {
    private sprite: Sprite | null = null;
    private characterWidth: number = 100;
    private characterHeight: number = 100;
    private containerWidth: number = 800;
    private containerHeight: number = 600;
    private readonly characterPosition: number;
    private readonly MARGIN = 70;
    private readonly MARGIN_TOP = 140;
    private speechBubble: SpeechBubble | null = null;
    private spriteLoadingPromise: Promise<void> | null = null;
    private nameLabel: Text | null = null;
    private readonly characterName: string;
    private facing: 'left' | 'right';
    private readonly app: Application;

    constructor(app: Application, data: CharacterData, position: number) {
        super();
        this.app = app;
        console.log("Character constructor called with:", data);
        this.characterPosition = position;
        this.characterName = data.name;
        this.facing = position === 0 ? 'right' : 'left';
        if (data.url) {
            this.spriteLoadingPromise = this.loadImage(data.url);
        } else {
            this.sprite = new Sprite(Texture.EMPTY);
            this.sprite.width = this.characterWidth;
            this.sprite.height = this.characterHeight;
            this.sprite.anchor.set(0.5);
            this.addChild(this.sprite);
            this.createNameLabel();
        }
    }

    private createNameLabel(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0x000000,
            align: 'center'
        });

        this.nameLabel = new Text({ text: this.characterName, style });
        this.nameLabel.anchor.set(0.5, 0);
        this.addChild(this.nameLabel);
        this.updateNamePosition();
    }

    private updateNamePosition(): void {
        if (!this.nameLabel) return;

        // Center horizontally
        this.nameLabel.x = 0;

        // Position vertically based on character position
        if (this.characterPosition === CharacterPosition.TopLeft) {
            // For top character, name appears below
            this.nameLabel.y = this.characterHeight / 2 + 10;
        } else {
            // For bottom characters, name appears above
            this.nameLabel.y = -this.characterHeight / 2 - 30;
        }
    }

    private async loadImage(url: string): Promise<void> {
        try {
            // Create a new Image element
            const image = new Image();
            image.crossOrigin = 'anonymous';  // Enable CORS

            // Create a promise to handle image loading
            await new Promise((resolve, reject) => {
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = url;
            });

            this.characterWidth = image.width;
            this.characterHeight = image.height;

            // Create a texture from the loaded image
            const texture = Texture.from(image);

            if (!this.destroyed) {
                this.sprite = new Sprite(texture);

                this.sprite.width = this.characterWidth;
                this.sprite.height = this.characterHeight;
                this.sprite.scale.x = this.facing === 'left' ? -1 : 1;
                this.sprite.anchor.set(0.5);
                this.addChild(this.sprite);
                this.updatePosition();

                this.createNameLabel();
            }
        } catch (error) {
            console.error('Error loading character image:', error);
            // Create a fallback colored rectangle if image fails to load
            const graphics = new Graphics();
            graphics.fill({ color: 0x808080 }); // Gray color
            graphics.rect(-this.characterWidth / 2, -this.characterHeight / 2, this.characterWidth, this.characterHeight);

            this.sprite = new Sprite(this.app.renderer.generateTexture(graphics));
            this.sprite.anchor.set(0.5);
            this.addChild(this.sprite);
            this.updatePosition();
        }
    }

    private updatePosition(): void {
        if (!this.sprite) return;

        switch (this.characterPosition) {
            case CharacterPosition.TopLeft:
                this.x = this.MARGIN;
                this.y = this.MARGIN_TOP;
                break;
            case CharacterPosition.TopRight:
                this.x = this.containerWidth - this.MARGIN;
                this.y = this.MARGIN_TOP;
                break;
            case CharacterPosition.BottomLeft:
                this.x = this.MARGIN;
                this.y = this.containerHeight - this.MARGIN;
                break;
            case CharacterPosition.BottomRight:
                this.x = this.containerWidth - this.MARGIN;
                this.y = this.containerHeight - this.MARGIN;
                break;
        }
    }

    public updateDimensions(width: number, height: number): void {
        this.containerWidth = width;
        this.containerHeight = height;
        this.updatePosition();
    }

    public async say(message: string): Promise<void> {
        try {
            // Wait for sprite to load if it hasn't already
            if (this.spriteLoadingPromise) {
                await this.spriteLoadingPromise;
            }

            if (!this.sprite) {
                throw new Error("Sprite not loaded");
            }

            if (this.speechBubble) {
                this.removeChild(this.speechBubble);
                this.speechBubble.destroy();
            }

            console.log("Creating speech bubble with message:", message);
            const isTopCharacter = this.characterPosition === CharacterPosition.TopLeft ||
                this.characterPosition === CharacterPosition.TopRight;
            this.speechBubble = new SpeechBubble(message, isTopCharacter);

            if (this.characterPosition === CharacterPosition.BottomRight ||
                this.characterPosition === CharacterPosition.TopRight) {
                this.speechBubble.x = -this.speechBubble.width - this.sprite.width / 2;
            } else {
                this.speechBubble.x = this.sprite.width / 2;
            }

            if (isTopCharacter) {
                this.speechBubble.y = this.characterHeight;
            } else {
                this.speechBubble.y = -this.sprite.height - this.speechBubble.height;
            }

            console.log("Speech bubble position:", this.speechBubble.x, this.speechBubble.y);
            console.log("Character dimensions:", this.sprite.width, this.sprite.height);

            this.addChild(this.speechBubble);
        } catch (error) {
            console.error("Error in say method:", error);
            throw error;
        }
    }

    public stopTalking(): void {
        if (this.speechBubble) {
            this.removeChild(this.speechBubble);
            this.speechBubble.destroy();
            this.speechBubble = null;
        }
    }

    public destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
        if (this.speechBubble) {
            this.speechBubble.destroy();
        }
        if (this.nameLabel) {
            this.nameLabel.destroy();
        }
        super.destroy();
    }
} 