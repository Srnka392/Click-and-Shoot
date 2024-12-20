import { clearActiveTargets, resetSpawnTimer } from './helpers';
import { createButton } from '../ui/createButtons';

export function gameOver(scene: Phaser.Scene): void {
    if (scene.data.get('isGameOver')) return;

    scene.data.set('isGameOver', true);

    // Vymazanie všetkých časovačov a aktívnych cieľov
    scene.data.get('changeTargetTimer').destroy();
    scene.time.clearPendingEvents();
    resetSpawnTimer(scene);
    clearActiveTargets(scene, ["activeTargets", "activeTargetsTimer"]);

    // Zobrazenie Game Over textu
    const gameOverText = scene.add.text(
        window.innerWidth / 2,
        window.innerHeight / 3,
        'Game Over',
        {
            fontSize: '64px',
            color: '#ff0000',
        }
    ).setOrigin(0.5);

    // Tlačidlo Restart
    createButton(scene, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        text: 'Restart',
        backgroundColor: '#1e90ff',
        callback: () => {
            gameOverText.destroy(); // Zničí Game Over text
            location.reload();
        },
    });

    // Tlačidlo Continue
    createButton(scene, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 60,
        text: 'Continue [Watch Ad]',
        backgroundColor: '#32cd32',
        callback: () => {
            gameOverText.destroy(); // Zničí Game Over text
            continueGame(scene);
        },
    });
}

function continueGame(scene: Phaser.Scene): void {
    scene.data.set('isGameOver', false);

    // Vymazanie Game Over UI
    const gameOverUI: Phaser.GameObjects.Text[] = [];
    scene.children.list.forEach((child) => {
        if (
            child instanceof Phaser.GameObjects.Text &&
            (child.text === 'Game Over' ||
                child.text === 'Restart' ||
                child.text === 'Continue [Watch Ad]')
        ) {
            gameOverUI.push(child);
        }
    });
    gameOverUI.forEach((uiElement) => uiElement.destroy());

    clearActiveTargets(scene, ["activeTargets", "activeTargetsTimer"]);

    // Obnovenie časovača
    scene.time.addEvent({
        delay: 1000,
        callback: () => {
            resetSpawnTimer(scene);
        },
    });
}