import { playableZone } from "../config";
import { gameOver } from "./gameOver";

export function resetSpawnTimer(scene: Phaser.Scene): void {
    const spawnTimer = scene.data.get('spawnTimer');
    if (spawnTimer) {
        spawnTimer.remove(false);
        scene.data.set('spawnTimer', null);
    }
}

export function setNewCorrectTarget(scene: Phaser.Scene): number {
    const currentCorrectTargetID = scene.data.get('correctTargetID');
    let correctTargetID = getRandomTargedId();
    
    do {
        correctTargetID = getRandomTargedId();
    } while (correctTargetID === currentCorrectTargetID);

    const correctTargetImage = scene.data.get('correctTargetImage');
    scene.data.set('correctTargetID', correctTargetID);
    correctTargetImage.setTexture(`target${correctTargetID}`);

    return correctTargetID;
}

export function clearActiveTargets(scene: Phaser.Scene, dataItems: Array<"activeTargets" | "activeTargetsTimer">): void {
    dataItems.forEach((dataItem) => {
        const activeTargets = scene.data.get(dataItem);
        activeTargets.forEach((target: Phaser.GameObjects.Sprite) => {
            if (target && target.active) {
                target.destroy();
            }
        });
        scene.data.set(dataItem, []);
    })
}

export function findFreeRandomPosition(
    scene: Phaser.Scene,
    minDistance: number,
    maxAttempts: number = 50
): { x: number, y: number } | null {
    const activeTargets = scene.data.get('activeTargets') as Phaser.GameObjects.Sprite[];

    let attempts = 0;
    let x: number, y: number;

    do {
        x = Phaser.Math.Between(playableZone.xMin, playableZone.xMax);
        y = Phaser.Math.Between(playableZone.yMin, playableZone.yMax);

        attempts++;

        if (attempts >= maxAttempts) {
            console.warn('Nepodarilo sa nájsť voľnú pozíciu po maximálnom počte pokusov.');
            return null;
        }
    } while (isOverlapping(x, y, minDistance, activeTargets));

    return { x, y };
}

function isOverlapping(
    newX: number,
    newY: number,
    minDistance: number,
    targets: Phaser.GameObjects.Sprite[]
): boolean {
    return targets.some(target => {
        const distance = Phaser.Math.Distance.Between(newX, newY, target.x, target.y);
        return distance < minDistance;
    });
}

export function setupGlobalClickTrigger(scene: Phaser.Scene): void {
    const { width, height } = scene.scale;

    const background = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
    background.setOrigin(0, 0);
    background.setInteractive();

    background.on('pointerdown', () => {
        gameOver(scene);
    });

    background.setDepth(-1);
}

export function getRandomTargedId() {
    const targetId = Phaser.Math.Between(1, 4);

    return targetId;
}