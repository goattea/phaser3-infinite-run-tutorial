import Phaser from "phaser";
import TextureKeys from "~/consts/TextureKeys";
import AnimationKeys from "~/consts/AnimationKeys";
import SceneKeys from "~/consts/SceneKeys";
import { CharacterImages, HouseImages } from "~/consts/Images";

export default class Preloader extends Phaser.Scene {
	constructor() {
		super(SceneKeys.Preloader);
	}

	preload() {
		this.load.image(TextureKeys.Background, HouseImages.Background);
		this.load.image(TextureKeys.MouseHole, HouseImages.Mousehole);
		this.load.image(TextureKeys.Window1, HouseImages.Window1);
		this.load.image(TextureKeys.Window2, HouseImages.Window2);
		this.load.image(TextureKeys.Bookcase1, HouseImages.Bookcase1);
		this.load.image(TextureKeys.Bookcase2, HouseImages.Bookcase2);
		this.load.image(TextureKeys.LaserEnd, HouseImages.LaserEnd);
		this.load.image(TextureKeys.LaserMiddle, HouseImages.LaserMiddle);
		this.load.image(TextureKeys.Coin, HouseImages.Coin);

		this.load.atlas(
			TextureKeys.RocketMouse,
			CharacterImages.RocketMouse,
			"characters/rocket-mouse.json"
		);
	}

	create() {
		this.anims.create({
			key: AnimationKeys.RocketMouseRun,
			frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
				start: 1,
				end: 4,
				prefix: CharacterImages.RocketMouseRun,
				zeroPad: 2,
				suffix: ".png",
			}),
			frameRate: 10,
			repeat: -1, // -1 loops forever
		});

		this.anims.create({
			key: AnimationKeys.RocketMouseDead,
			frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
				start: 1,
				end: 2,
				prefix: CharacterImages.RocketMouseDead,
				zeroPad: 2,
				suffix: ".png",
			}),
			frameRate: 10,
		});

		this.anims.create({
			key: AnimationKeys.RocketMouseFly,
			frames: [
				{
					key: TextureKeys.RocketMouse,
					frame: CharacterImages.RocketMouseFly,
				},
			],
		});

		this.anims.create({
			key: AnimationKeys.RocketMouseFall,
			frames: [
				{
					key: TextureKeys.RocketMouse,
					frame: CharacterImages.RocketMouseFall,
				},
			],
		});

		this.anims.create({
			key: AnimationKeys.RocketFlamesOn,
			frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
				start: 1,
				end: 2,
				prefix: CharacterImages.Flames,
				suffix: ".png",
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.scene.start(SceneKeys.Game);
	}
}
