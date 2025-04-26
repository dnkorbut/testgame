import { Application, Container, Graphics } from 'pixi.js';
import { BaseScene } from '../../core/BaseScene';
import { SceneManager } from '../../core/SceneManager';

export class PhoenixFlameScene extends BaseScene {
    private gameContainer: Container;
    private particles: Graphics[] = [];
    private readonly MAX_PARTICLES = 100;

    constructor(app: Application, sceneManager: SceneManager) {
        super(app, sceneManager);
        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
    }

    protected async onInit(): Promise<void> {
        // Create initial particles
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            this.createParticle();
        }
    }

    private createParticle(): void {
        const particle = new Graphics();
        particle.fill({ color: 0xFF3300 });
        particle.circle(0, 0, 2);

        // Random starting position at the bottom of the screen
        particle.x = Math.random() * this.app.screen.width;
        particle.y = this.app.screen.height;

        // Random velocity
        (particle as any).vx = (Math.random() - 0.5) * 2;
        (particle as any).vy = -Math.random() * 5 - 2;

        this.particles.push(particle);
        this.gameContainer.addChild(particle);
    }

    protected onUpdate(delta: number): void {
        // Update particle positions
        this.particles.forEach((particle, index) => {
            particle.x += (particle as any).vx;
            particle.y += (particle as any).vy;

            // Add some random movement
            (particle as any).vx += (Math.random() - 0.5) * 0.1;
            (particle as any).vy -= 0.1; // Accelerate upwards

            // If particle is off screen, reset it
            if (particle.y < 0) {
                particle.x = Math.random() * this.app.screen.width;
                particle.y = this.app.screen.height;
                (particle as any).vx = (Math.random() - 0.5) * 2;
                (particle as any).vy = -Math.random() * 5 - 2;
            }
        });
    }

    protected onResize(width: number, height: number): void {
        this.gameContainer.x = width / 2 - this.gameContainer.width / 2;
        this.gameContainer.y = height / 2 - this.gameContainer.height / 2;
    }

    protected onDestroy(): void {
        this.particles.forEach(particle => particle.destroy());
        this.particles = [];
        this.gameContainer.destroy();
    }
} 