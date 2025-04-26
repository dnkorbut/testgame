import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { SpeechBubble } from './SpeechBubble';

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
    private readonly characterWidth: number = 100;
    private readonly characterHeight: number = 100;
    private containerWidth: number = 800;
    private containerHeight: number = 600;
    private readonly characterPosition: number;
    private readonly MARGIN = 70;
    private readonly MARGIN_TOP = 140;
    private speechBubble: SpeechBubble | null = null;
    private spriteLoadingPromise: Promise<void> | null = null;
    private nameLabel: Text | null = null;
    private readonly characterName: string;
    private emojiSprite: Sprite | null = null;
    private currentEmoji: string | null = null;

    constructor(data: CharacterData, position: number) {
        super();
        console.log("Character constructor called with:", data);
        this.characterPosition = position;
        this.characterName = data.name;
        if (data.url) {
            this.spriteLoadingPromise = this.loadImage(data.url);
        } else {
            this.sprite = new Sprite(Texture.EMPTY);
            this.sprite.width = this.characterWidth;
            this.sprite.height = this.characterHeight;
            this.sprite.anchor.set(0.5);
            this.addChild(this.sprite);
        }
        this.createNameLabel();
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
            console.log("Starting to load image:", url);
            const response = await fetch(url);
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            return new Promise<void>((resolve, reject) => {
                const image = new Image();
                image.src = imageUrl;

                image.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            throw new Error("Failed to get canvas context");
                        }

                        ctx.drawImage(image, 0, 0);
                        const texture = Texture.from(canvas);
                        this.sprite = new Sprite(texture);
                        this.sprite.width = this.characterWidth;  // Use fixed width
                        this.sprite.height = this.characterHeight;  // Use fixed height
                        this.sprite.anchor.set(0.5);
                        this.addChild(this.sprite);
                        this.updatePosition();
                        this.updateNamePosition();  // Update name position after sprite is loaded

                        URL.revokeObjectURL(imageUrl);
                        console.log("Image loaded successfully:", url);
                        resolve();
                    } catch (error) {
                        console.error("Error in image onload:", error);
                        reject(error);
                    }
                };

                image.onerror = (error) => {
                    console.error("Image load error:", error);
                    URL.revokeObjectURL(imageUrl);
                    reject(new Error(`Failed to load image: ${url}`));
                };
            });
        } catch (error) {
            console.error("Failed to load image:", error);
            throw error;
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

    public async setEmoji(emojiData: EmojiData | null): Promise<void> {
        // Remove existing emoji if any
        if (this.emojiSprite) {
            this.removeChild(this.emojiSprite);
            this.emojiSprite.destroy();
            this.emojiSprite = null;
        }

        // If no emoji data provided, just clear the current emoji
        if (!emojiData) {
            this.currentEmoji = null;
            return;
        }

        try {
            // Load emoji image
            const response = await fetch(emojiData.url);
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            return new Promise<void>((resolve, reject) => {
                const image = new Image();
                image.src = imageUrl;

                image.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            throw new Error("Failed to get canvas context");
                        }

                        ctx.drawImage(image, 0, 0);
                        const texture = Texture.from(canvas);
                        this.emojiSprite = new Sprite(texture);

                        // Size and position the emoji
                        const emojiSize = 40; // Fixed size for emojis
                        this.emojiSprite.width = emojiSize;
                        this.emojiSprite.height = emojiSize;
                        this.emojiSprite.anchor.set(0.5);

                        // Position emoji above character
                        this.emojiSprite.x = 0;
                        this.emojiSprite.y = -this.characterHeight / 2 - emojiSize / 2 - 10;

                        this.addChild(this.emojiSprite);
                        this.currentEmoji = emojiData.name;

                        URL.revokeObjectURL(imageUrl);
                        resolve();
                    } catch (error) {
                        console.error("Error loading emoji:", error);
                        reject(error);
                    }
                };

                image.onerror = (error) => {
                    console.error("Emoji load error:", error);
                    URL.revokeObjectURL(imageUrl);
                    reject(new Error(`Failed to load emoji: ${emojiData.url}`));
                };
            });
        } catch (error) {
            console.error("Failed to load emoji:", error);
            throw error;
        }
    }
} 