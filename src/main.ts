import Phaser from "phaser";
import GameSettings from "./consts/GameSettings";

import Game from "./scenes/game";
import GameOver from "./scenes/GameOver";
import Preloader from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 640,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: GameSettings.GravityY },
			debug: false,
		},
	},
	scene: [Preloader, Game, GameOver],
};

export default new Phaser.Game(config);
