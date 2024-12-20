import Phaser from "phaser";
import preload from "./scenes/preload";
import create from "./scenes/create";
import update from "./scenes/update";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: function createScene(this: Phaser.Scene) {
      const globalData = this.data;
      globalData.set("score", 0);
      globalData.set("scoreText", "");
      globalData.set("isGameOver", false);
      globalData.set("correctTargetID", "");
      globalData.set("correctTargetImage", "");
      globalData.set("activeTargets", []);
      globalData.set("activeTargetsTimer", []);
      globalData.set("spawnTimer", null);
      globalData.set("isPaused", false);
      globalData.set("changeTargetTimer", null);

      create.call(this);
    },
    update: update,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export const playableZone = {
  xMin: 50,
  xMax: window.innerWidth - 50,
  yMin: 150,
  yMax: window.innerHeight - 50
};