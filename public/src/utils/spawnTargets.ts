import {clearActiveTargets, getRandomTargedId, findFreeRandomPosition } from './helpers';
import { gameOver } from './gameOver';

export function spawnTargets(scene: Phaser.Scene): void {
    if (scene.data.get('isGameOver')) return;

    const targetId = getRandomTargedId();
    spawnTarget(scene, `target${targetId}`);
}

function spawnTarget(scene: Phaser.Scene, texture: string): void {
    const minDistance = 100;
    const freePosition = findFreeRandomPosition(scene, minDistance);

    if (!freePosition) return;

    const target = scene.physics.add.sprite(freePosition.x, freePosition.y, texture);
    target.setInteractive();
    target.setDisplaySize(100, 100);

    const activeTargets = scene.data.get('activeTargets') as Phaser.GameObjects.Sprite[];
    activeTargets.push(target);

    target.on('pointerdown', () => {
        const correctTargetID = scene.data.get('correctTargetID');
        const isCurrentlyCorrect = texture === `target${correctTargetID}`;

        console.log("isCurrentlyCorrect", isCurrentlyCorrect)
        console.log(texture, "=", `target${correctTargetID}`)

        if (isCurrentlyCorrect) {
            const scoreText = scene.data.get('scoreText');
            const updatedScore = scene.data.get('score') as number + 1;
            scene.data.set('score', updatedScore);
            scoreText.setText('Score: ' + updatedScore);
            
            removeTargetFromActiveTargets(target, activeTargets, scene);
            scene.tweens.add({
                targets: target,
                scale: 0.3, // Zvýšenie mierky (1.5x väčšie)
                duration: 50, // Doba animácie v ms
                onComplete: () => {
                    // Po zväčšení spustite animáciu zmiznutia
                    scene.tweens.add({
                        targets: target,
                        alpha: 0, // Nastavenie priehľadnosti na 0
                        duration: 100, // Doba animácie zmiznutia
                        onComplete: () => {
                            // Po dokončení odstráňte objekt
                            target.destroy();
                        }
                    });
                }
            });
            //target.destroy();
        } else {
            clearActiveTargets(scene);
            gameOver(scene);
        }
    });

    scene.time.addEvent({
        delay: 3000,
        callback: () => {
            if (!target.scene) return;
            removeTargetFromActiveTargets(target, activeTargets, scene)

            target.destroy();
        }
    });
}

function removeTargetFromActiveTargets(
    target: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, 
    activeTargets: Phaser.GameObjects.Sprite[], 
    scene: Phaser.Scene
) {
    const index = activeTargets.indexOf(target);

    if (index > -1) {
        activeTargets.splice(index, 1);
        scene.data.set('activeTargets', activeTargets);
    }
}