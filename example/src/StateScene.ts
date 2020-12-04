import Phaser  from 'phaser';

export class StateScene<State> extends Phaser.Scene {
  state: State;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig, state: State) {
    super(config);
    // @ts-ignore
    state._config = config;
    this.state = state;
  }
};
