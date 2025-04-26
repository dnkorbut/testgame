import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class SpeechBubble extends Container {
    private background: Graphics;
    private textContainer: Container;
    private text: Text;
    private readonly padding = 10;
    private readonly cornerRadius = 10;
    private readonly triangleHeight = 10;
    private pointUp: boolean = false;

    constructor(message: string, pointUp: boolean = false) {
        super();

        this.pointUp = pointUp;
        console.log('Creating speech bubble with message:', message, 'pointing up:', pointUp);

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

        this.text = new Text({ text: message, style });
        this.textContainer.addChild(this.text);

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
            // Move text container down to compensate for the triangle
            this.textContainer.y = this.triangleHeight / 2;
        }

        console.log('Final bubble dimensions:', { width: this.width, height: this.height });
    }

    private updateTextPosition(): void {
        // Position text relative to the bubble's shape
        this.text.x = this.padding;
        this.text.y = this.padding;
    }

    private drawBubble(): void {
        const width = this.text.width + this.padding * 2;
        const height = this.text.height + this.padding * 2;

        console.log('Drawing bubble with dimensions:', { width, height });

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