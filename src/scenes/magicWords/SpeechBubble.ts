import { Container, Graphics, Text, TextStyle, Sprite, Texture, CanvasTextMetrics } from 'pixi.js';

export class SpeechBubble extends Container {
    private background: Graphics;
    private textContainer: Container;
    private text: Text;
    private readonly padding = 10;
    private readonly cornerRadius = 10;
    private readonly triangleHeight = 10;
    private pointUp: boolean = false;

    constructor(message: string, pointUp: boolean = false, emojiTextures?: Map<string, Texture>) {
        super();

        this.pointUp = pointUp;

        // Create text container
        this.textContainer = new Container();
        this.addChild(this.textContainer);

        // Create text with style
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0x000000,
            wordWrap: true,
            wordWrapWidth: 200
        });

        // First replace emojis with placeholders and store their info
        const emojiPositions: { name: string, index: number }[] = [];
        let modifiedMessage = message;
        const regex = /\{(\w+)\}/g;
        let match;

        while ((match = regex.exec(message)) !== null) {
            const emojiName = match[1];
            if (emojiTextures?.has(emojiName)) {
                emojiPositions.push({
                    name: emojiName,
                    index: match.index
                });
                modifiedMessage = modifiedMessage.replace(match[0], '\u00A0\u00A0\u00A0\u00A0');
            } else {
                modifiedMessage = modifiedMessage.replace(match[0], '');
            }
        }

        this.text = new Text({ text: modifiedMessage, style });
        this.textContainer.addChild(this.text);

        // If we have emoji textures, add them
        if (emojiTextures) {
            const lineHeight = this.text.style.fontSize || 16;

            emojiPositions.forEach(({ name, index }) => {
                const texture = emojiTextures.get(name);
                if (texture) {
                    // Create emoji sprite
                    const emoji = new Sprite(texture);

                    // Scale emoji to match text height
                    const scale = lineHeight / emoji.height;
                    emoji.scale.set(scale);

                    const textMetrics = CanvasTextMetrics.measureText(this.text.text.substring(0, index), this.text.style);
                    console.log(textMetrics);
                    emoji.x = this.text.x + textMetrics.lineWidths[textMetrics.lineWidths.length - 1] + emoji.width
                    emoji.y = this.text.y + textMetrics.height - emoji.height / 2

                    this.textContainer.addChild(emoji);

                    // this.text.text = this.text.text.substring(0, index) + '    ' + this.text.text.substring(index + 4);
                }
            });
        }

        // Create bubble background
        this.background = new Graphics();
        this.addChild(this.background);

        // Move text container above background
        this.swapChildren(this.background, this.textContainer);

        // Position text relative to the bubble
        this.updateTextPosition();

        // Draw the bubble
        this.drawBubble();

        // Adjust container position if pointing up
        if (this.pointUp) {
            this.y = -this.triangleHeight / 2;
            this.textContainer.y = this.triangleHeight / 2;
        }
    }

    private updateTextPosition(): void {
        // Position text relative to the bubble's shape
        this.text.x = this.padding;
        this.text.y = this.padding;
    }

    private drawBubble(): void {
        const width = this.text.width + this.padding * 2;
        const height = this.text.height + this.padding * 2;

        this.background.clear();

        // Draw filled shape
        this.background.setFillStyle({ color: 0xFFFFFF });

        if (this.pointUp) {
            // Draw bubble with triangle pointing up
            this.background
                .moveTo(width / 2 - 10, this.triangleHeight)
                .lineTo(width / 2, 0)
                .lineTo(width / 2 + 10, this.triangleHeight)
                .roundRect(0, this.triangleHeight, width, height - this.triangleHeight, this.cornerRadius)
                .fill();
        } else {
            // Draw bubble with triangle pointing down
            this.background
                .roundRect(0, 0, width, height, this.cornerRadius)
                .moveTo(width / 2 - 10, height)
                .lineTo(width / 2, height + this.triangleHeight)
                .lineTo(width / 2 + 10, height)
                .fill();
        }

        // Draw stroke separately
        this.background
            .setStrokeStyle({
                width: 2,
                color: 0x000000,
                alignment: 0
            });

        if (this.pointUp) {
            // Stroke for upward pointing bubble
            this.background
                .moveTo(width / 2 - 10, this.triangleHeight)
                .lineTo(width / 2, 0)
                .lineTo(width / 2 + 10, this.triangleHeight)
                .roundRect(0, this.triangleHeight, width, height - this.triangleHeight, this.cornerRadius)
                .stroke();
        } else {
            // Stroke for downward pointing bubble
            this.background
                .roundRect(0, 0, width, height, this.cornerRadius)
                .moveTo(width / 2 - 10, height)
                .lineTo(width / 2, height + this.triangleHeight)
                .lineTo(width / 2 + 10, height)
                .stroke();
        }
    }

    public setText(message: string): void {
        this.text.text = message;
        this.updateTextPosition();
        this.drawBubble();
    }

    public destroy(): void {
        this.text.destroy();
        this.background.destroy();
        this.textContainer.destroy();
        super.destroy();
    }
} 