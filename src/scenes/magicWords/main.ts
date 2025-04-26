import { Application, Container, Texture } from 'pixi.js';
import { BaseScene } from '../../core/BaseScene';
import { SceneManager } from '../../core/SceneManager';
import { Character, CharacterData, CharacterPosition } from "./Character";
import { loadTextureFromURL } from '../../core/textureLoader';

interface DialogueEntry {
    name: string;
    text: string;
}

interface MagicWordsData {
    dialogue: DialogueEntry[];
    emojies: Array<{
        name: string;
        url: string;
    }>;
    avatars: CharacterData[];
}

export class MagicWordsScene extends BaseScene {
    private gameContainer: Container;
    private characters: Map<string, Character> = new Map();
    private emojiTextures: Map<string, Texture> = new Map();
    private readonly API_URL = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";
    private dialogue: DialogueEntry[] = [];
    private currentDialogueIndex: number = 0;
    private dialogueTimeout: number | null = null;
    private readonly DIALOGUE_DELAY = 3000; // 3 seconds between messages
    private readonly RESTART_DELAY = 5000; // 5 seconds before restarting

    constructor(app: Application, sceneManager: SceneManager) {
        super(app, sceneManager);
        this.gameContainer = new Container();
        this.addChild(this.gameContainer);
    }

    protected async onInit(): Promise<void> {
        await this.loadCharacters();
        this.startDialogue();
    }

    private async loadCharacters(): Promise<void> {
        try {
            const response = await fetch(this.API_URL);
            const data: MagicWordsData = await response.json();

            // Load emoji textures first
            console.log('Loading emoji textures...');
            for (const emoji of data.emojies) {
                try {
                    const texture = await loadTextureFromURL(emoji.url);
                    this.emojiTextures.set(emoji.name, texture);
                    console.log(`Loaded emoji texture: ${emoji.name}`);
                } catch (error) {
                    console.error(`Failed to load emoji texture: ${emoji.name}`, error);
                }
            }

            // Store dialogue for later use
            this.dialogue = data.dialogue;

            // Create character mapping
            const positionMap: { [key: string]: number } = {
                "Sheldon": CharacterPosition.TopLeft,
                "Leonard": CharacterPosition.BottomLeft,
                "Penny": CharacterPosition.BottomRight,
                "": CharacterPosition.TopRight
            };

            // Create characters
            data.avatars.forEach((avatar) => {
                const position = positionMap[avatar.name] ?? 0;
                const character = new Character(this.app, avatar, position);
                this.gameContainer.addChild(character);
                character.updateDimensions(this.app.screen.width, this.app.screen.height);
                this.characters.set(avatar.name, character);
            });

            // Add dummy character
            const dummyCharacter = new Character(this.app, {
                name: "",
                url: "", // Empty URL for dummy character
                position: "topright"
            }, CharacterPosition.TopRight);
            this.gameContainer.addChild(dummyCharacter);
            dummyCharacter.updateDimensions(this.app.screen.width, this.app.screen.height);
            this.characters.set("", dummyCharacter);

        } catch (error) {
            console.error("Failed to load characters:", error);
        }
    }

    public getEmojiTexture(name: string): Texture | undefined {
        return this.emojiTextures.get(name);
    }

    private startDialogue(): void {
        this.showNextDialogue();
    }

    private showNextDialogue(): void {
        // Clear any existing timeout
        if (this.dialogueTimeout !== null) {
            window.clearTimeout(this.dialogueTimeout);
            this.dialogueTimeout = null;
        }

        // Stop all characters from talking
        this.characters.forEach(character => character.stopTalking());

        // Check if we've reached the end of the dialogue
        if (this.currentDialogueIndex >= this.dialogue.length) {
            console.log("Dialogue finished, restarting after delay...");
            this.currentDialogueIndex = 0;
            this.dialogueTimeout = window.setTimeout(() => {
                this.showNextDialogue();
            }, this.RESTART_DELAY);
            return;
        }

        // Get current dialogue entry
        const entry = this.dialogue[this.currentDialogueIndex];
        const character = this.characters.get(entry.name) || this.characters.get("");

        if (character) {
            // Show the dialogue text with emoji textures
            character.say(entry.text, this.emojiTextures);

            // Schedule next dialogue
            this.dialogueTimeout = window.setTimeout(() => {
                this.currentDialogueIndex++;
                this.showNextDialogue();
            }, this.DIALOGUE_DELAY);
        }
    }

    protected onResize(width: number, height: number): void {
        this.characters.forEach(character => {
            character.updateDimensions(width, height);
        });
    }

    protected onDestroy(): void {
        if (this.dialogueTimeout !== null) {
            window.clearTimeout(this.dialogueTimeout);
        }
        this.characters.forEach(character => character.destroy());
        this.characters.clear();
        this.gameContainer.destroy();
        super.onDestroy();
    }
} 