import {getRandomTargedId, findFreeRandomPosition } from './helpers';
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

    const targetTimer = scene.add.graphics();
    const activeTargetsTimer = scene.data.get('activeTargetsTimer') as Phaser.GameObjects.Graphics[];
    activeTargetsTimer.push(targetTimer);
    const timerRadius = 44.5; // Polomer kruhu
    const timerDuration = 3000; // Trvanie časomiery v ms (rovnaké ako v delay)

    function drawTimer(percent: number) {
        targetTimer.clear();
        targetTimer.lineStyle(12, 0xFFA500, 1); // Nastavenie hrúbky a farby kruhu
        targetTimer.beginPath();
        targetTimer.arc(target.x, target.y, timerRadius, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360 * percent), false);
        targetTimer.strokePath();
    }

    let elapsed = 0;
    const timerEvent = scene.time.addEvent({
        delay: 30, // Interval na aktualizáciu grafiky
        callback: () => {
            elapsed += 30;
            const percent = 1 - elapsed / timerDuration; // Percento zostávajúceho času
            drawTimer(percent);

            if (elapsed >= timerDuration) {
                targetTimer.destroy(); // Zničenie časomiery
            }
        },
        loop: true
    });

    target.on('pointerdown', () => {
        const correctTargetID = scene.data.get('correctTargetID');
        const isCurrentlyCorrect = texture === `target${correctTargetID}`;

        if (isCurrentlyCorrect) {
            const scoreText = scene.data.get('scoreText');
            const updatedScore = scene.data.get('score') as number + 1;
            scene.data.set('score', updatedScore);
            scoreText.setText('Score: ' + updatedScore);

            timerEvent.remove();
            targetTimer.destroy();
            
            removeTargetFromActiveTargets(target, activeTargets, scene, ["activeTargets", "activeTargetsTimer"])
            scene.tweens.add({
                targets: target,
                scale: 0.3,
                duration: 50,
                onComplete: () => {
                    scene.tweens.add({
                        targets: target,
                        alpha: 0,
                        duration: 100,
                        onComplete: () => {
                            target.destroy();
                        }
                    });
                }
            });
        } else {
            gameOver(scene);
        }
    });

    scene.time.addEvent({
        delay: timerDuration,
        callback: () => {
            if (!target.scene) return;
            removeTargetFromActiveTargets(target, activeTargets, scene, ["activeTargets", "activeTargetsTimer"])

            targetTimer.destroy();
            target.destroy();
        }
    });
}

function removeTargetFromActiveTargets(
    target: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | Phaser.GameObjects.Graphics, 
    activeTargets: Phaser.GameObjects.Sprite[] | Phaser.GameObjects.Graphics[], 
    scene: Phaser.Scene,
    dataItems: Array<"activeTargets" | "activeTargetsTimer">
) {
    dataItems.forEach((dataItem) => {
        const index = activeTargets.indexOf(target as any);

        if (index > -1) {
            activeTargets.splice(index, 1);
            scene.data.set(dataItem, activeTargets);
        }
    })
}