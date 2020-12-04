import Phaser from  "phaser"
import { ExampleScene } from "./Scene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#10910e',
  parent: 'phaser-example',
  scene: new ExampleScene("123", { count: 0 })
};

const game = new Phaser.Game(config);
// @ts-ignore
window.game = game
