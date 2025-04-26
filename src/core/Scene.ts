export interface Scene {
    init(): Promise<void>;
    update(delta: number): void;
    resize(width: number, height: number): void;
    destroy(): void;
} 