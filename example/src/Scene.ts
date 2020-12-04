import Phaser  from 'phaser';
import { StateScene } from './StateScene';

interface State {
  draggable?: Phaser.GameObjects.Sprite;
  count: number;
}

export let ExampleScene = class ExampleScene extends StateScene<State> {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig, state: State) {
    super(config, state)
  }

  preload() {
    this.load.image('orb', 'assets/sprites/orb-blue.png');
    this.load.image('orb-red', 'assets/sprites/orb-red.png');
  }

  create() {
    // Re-use the x, y from state instead of any position
    const dx = this.state.draggable?.x || 20;
    const dy = this.state.draggable?.y || 20;

    // Just a shape which you can drag anywhere which 
    // should retain its position across the 
    const draggable = this.add.sprite(dx, dy, 'orb');
    const shape = new Phaser.Geom.Circle(20, 20, 20);
    draggable.setInteractive(shape, Phaser.Geom.Circle.Contains);
    this.input.setDraggable(draggable);

    draggable.on('pointerover', function () {
      draggable.setTint(0x7878ff);
    });

    draggable.on('pointerout', function () {
      draggable.clearTint();
    });

    draggable.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      draggable.x = dragX;
      draggable.y = dragY;
    });

    this.state.draggable = draggable;

    //  Create 300 sprites (they all start life at 0x0)
    const gConfig: Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      key: 'orb-red',
      frameQuantity: 10,
    };
    const randoSprites = this.add.group(gConfig);

    //  Randomly position the sprites within the circle
    const circle = new Phaser.Geom.Circle(200, 300, 130);
    Phaser.Actions.RandomCircle(randoSprites.getChildren(), circle);
  }
};
