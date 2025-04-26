import { Container, Graphics } from 'pixi.js';
import { Card } from './Card';
import { Point } from 'pixi.js';

export enum StackPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight
}

export class Stack extends Container {
    private cards: Card[] = [];
    private stackWidth: number = 0;
    private readonly MAX_CARD_OFFSET = 20;
    private readonly MAX_CARDS_SHOWN = 20;
    private readonly STACK_OFFSET = 1;
    private readonly cardWidth: number;
    private readonly cardHeight: number;
    private placeholder: Graphics;
    private isAnimating = false;
    private movingCard: Card | null = null;
    private animationSpeed = 0.05; // 2 sec
    private autoMoveTimer: number = 0;
    private readonly AUTO_MOVE_INTERVAL = 1000; // 1 sec
    private stackPosition: StackPosition;

    constructor(position: StackPosition, cardWidth: number = 70, cardHeight: number = 98) {
        super();
        this.cardWidth = cardWidth;
        this.cardHeight = cardHeight;
        this.stackPosition = position;

        this.placeholder = new Graphics();
        this.updatePlaceholder();
        this.addChild(this.placeholder);

        if (position === StackPosition.TopLeft) {
            this.startAutoMove();
        }
    }

    private updatePlaceholder(): void {
        this.placeholder.clear();
        this.placeholder
            .setStrokeStyle({
                width: 4,
                color: 0xffffff,
                alpha: 0.5
            })
            .fill({
                color: 0xffffff,
                alpha: 0.25
            })
            .roundRect(
                -this.cardWidth / 2,
                -this.cardHeight / 2,
                this.cardWidth,
                this.cardHeight,
                10
            ).stroke().fill();
    }
    public updateWidth(width: number): void {
        this.stackWidth = width;
        this.updateCardsPosition();
    }

    private updateCardsPosition(): void {
        console.log('updateCardsPosition', this.cards.length);
        this.placeholder.visible = this.cards.length === 0;

        if (this.cards.length === 0) {
            return;
        }

        const cardsToShow = Math.min(this.MAX_CARDS_SHOWN, this.cards.length);

        const calculatedOffset = (this.stackWidth - this.cardWidth) / Math.max(1, cardsToShow - 1);
        const offset = Math.min(calculatedOffset, this.MAX_CARD_OFFSET);

        this.removeChildren();
        this.addChild(this.placeholder);

        const baseSpreadY = 0;

        this.cards.forEach((card, index) => {
            let x = 0;
            let y = baseSpreadY;
            let isVisible = true;

            if (index < this.cards.length - cardsToShow) {
                const stackIndex = (this.cards.length - cardsToShow - 1) - index;
                const stackOffset = this.STACK_OFFSET;

                if (this.stackPosition === StackPosition.BottomLeft || this.stackPosition === StackPosition.BottomRight) {
                    y = baseSpreadY - stackIndex * stackOffset;
                } else {
                    y = stackIndex * stackOffset;
                }

                if (this.stackPosition === StackPosition.TopRight || this.stackPosition === StackPosition.BottomRight) {
                    x = -stackIndex * stackOffset;
                } else {
                    x = stackIndex * stackOffset;
                }
            } else {
                const visibleIndex = index - (this.cards.length - cardsToShow);

                if (this.stackPosition === StackPosition.TopRight || this.stackPosition === StackPosition.BottomRight) {
                    x = -visibleIndex * offset;
                } else {
                    x = visibleIndex * offset;
                }
            }

            card.position.set(x, y);
            card.visible = isVisible;
            this.addChild(card);
        });
    }

    public push(card: Card): boolean {
        this.cards.push(card);
        this.addChild(card);
        this.updateCardsPosition();
        return true;
    }

    public pop(): Card | null {
        if (this.cards.length === 0) {
            return null;
        }

        const card = this.cards.pop()!;
        this.removeChild(card);
        this.updateCardsPosition();
        return card;
    }

    public peek(): Card | null {
        return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
    }

    public get size(): number {
        return this.cards.length;
    }

    public get isEmpty(): boolean {
        return this.cards.length === 0;
    }

    public clear(): void {
        while (this.cards.length > 0) {
            const card = this.cards.pop()!;
            this.removeChild(card);
            card.destroy();
        }
        this.removeChildren();
        this.addChild(this.placeholder);
        this.placeholder.visible = true;
    }

    public destroy(): void {
        this.clear();
        this.placeholder.destroy();
        super.destroy();
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public get stackSize(): number {
        return this.cards.length;
    }

    private startAutoMove(): void {
        this.autoMoveTimer = 0;
    }

    public update(deltaMS: number): void {
        for (const card of this.cards) {
            card.update(deltaMS / (1000 / 60));
        }

        if (this.stackPosition !== StackPosition.TopLeft || this.isAnimating) {
            return;
        }

        this.autoMoveTimer += deltaMS;
        if (this.autoMoveTimer >= this.AUTO_MOVE_INTERVAL) {
            this.autoMoveTimer = 0;
            this.moveCardToRandomStack();
        }
    }

    private moveCardToRandomStack(): void {
        const allStacks = this.parent?.children.filter(
            child => child instanceof Stack && child !== this
        ) as Stack[];

        if (!allStacks?.length || this.isEmpty) {
            return;
        }

        const targetStack = allStacks[Math.floor(Math.random() * allStacks.length)];
        this.moveTo(targetStack);
    }

    public moveTo(targetStack: Stack, onComplete?: () => void): boolean {
        if (this.isAnimating || this.isEmpty) return false;

        const card = this.pop();
        if (!card) return false;

        const lastTargetCard = targetStack.peek();

        const targetCardsCount = targetStack.stackSize;
        let targetLocalX = 0;
        let targetLocalY = 0;

        const newTotalCards = targetCardsCount + 1;
        const cardsToShow = Math.min(targetStack.MAX_CARDS_SHOWN, newTotalCards);

        const calculatedOffset = (targetStack.stackWidth - this.cardWidth) / Math.max(1, cardsToShow - 1);
        const offset = Math.min(calculatedOffset, targetStack.MAX_CARD_OFFSET);

        const visibleIndex = cardsToShow - 1;  // Index of the last visible card

        if (targetStack.stackPosition === StackPosition.TopRight || targetStack.stackPosition === StackPosition.BottomRight) {
            targetLocalX = -visibleIndex * offset;
        } else {
            targetLocalX = visibleIndex * offset;
        }

        const targetGlobalPos = targetStack.toGlobal(new Point(targetLocalX, targetLocalY));
        const startGlobalPos = this.toGlobal(new Point(card.x, card.y));
        card.position.copyFrom(startGlobalPos);

        this.parent.addChild(card);

        this.movingCard = card;
        this.isAnimating = true;

        this.movingCard.flipToState(true);
        if (lastTargetCard) {
            lastTargetCard.flipToState(false);
        }

        const animate = () => {
            if (!this.movingCard || !this.isAnimating) return;

            const dx = targetGlobalPos.x - this.movingCard.x;
            const dy = targetGlobalPos.y - this.movingCard.y;

            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                this.isAnimating = false;
                this.movingCard.position.set(targetLocalX, targetLocalY); // Set final local position
                targetStack.push(this.movingCard);
                this.movingCard = null;
                if (onComplete) onComplete();
            } else {
                this.movingCard.x += dx * this.animationSpeed;
                this.movingCard.y += dy * this.animationSpeed;
                requestAnimationFrame(animate);
            }
        };

        animate();
        return true;
    }

    public get isMoving(): boolean {
        return this.isAnimating;
    }
} 