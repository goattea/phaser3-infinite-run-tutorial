import Phaser from "phaser";
import AnimationKeys from "~/consts/AnimationKeys";
import { Events, eventCenter } from "~/consts/Events";
import { CharacterImages } from "~/consts/Images";
import SceneKeys from "~/consts/SceneKeys";

import TextureKeys from "~/consts/TextureKeys";
import LaserObstacle from "~/game/LaserObstacle";
import RocketMouse from "~/game/RocketMouse";

export default class Game extends Phaser.Scene {
	private background!: Phaser.GameObjects.TileSprite;
	private mouseHole!: Phaser.GameObjects.Image;
	private window1!: Phaser.GameObjects.Image;
	private window2!: Phaser.GameObjects.Image;
	private bookcase1!: Phaser.GameObjects.Image;
	private bookcase2!: Phaser.GameObjects.Image;
	private laser!: LaserObstacle;
	private mouse!: RocketMouse;
	private coins!: Phaser.Physics.Arcade.StaticGroup;
	private scoreLabel!: Phaser.GameObjects.Text;
	private score = 0;

	private bookcases: Phaser.GameObjects.Image[] = [];
	private windows: Phaser.GameObjects.Image[] = [];

	constructor() {
		super(SceneKeys.Game);
	}

	init() {
		this.score = 0;
	}

	create() {
		const width = this.scale.width;
		const height = this.scale.height;
		const floor = height - 55;

		this.background = this.add
			.tileSprite(0, 0, width, height, TextureKeys.Background)
			.setOrigin(0, 0)
			.setScrollFactor(0, 0);

		this.mouseHole = this.add.image(
			Phaser.Math.Between(900, 1500),
			501,
			TextureKeys.MouseHole
		);

		this.window1 = this.add.image(
			Phaser.Math.Between(900, 1300),
			200,
			TextureKeys.Window1
		);

		this.window2 = this.add.image(
			Phaser.Math.Between(1600, 2000),
			200,
			TextureKeys.Window2
		);

		this.windows = [this.window1, this.window2];

		this.bookcase1 = this.add
			.image(Phaser.Math.Between(2200, 2700), 580, TextureKeys.Bookcase1)
			.setOrigin(0.5, 1);

		this.bookcase2 = this.add
			.image(Phaser.Math.Between(2900, 3400), 580, TextureKeys.Bookcase2)
			.setOrigin(0.5, 1);

		this.bookcases = [this.bookcase1, this.bookcase2];

		this.laser = new LaserObstacle(this, 900, 100);
		this.add.existing(this.laser);

		this.mouse = new RocketMouse(this, width * 0.5, floor);
		this.add.existing(this.mouse);

		eventCenter.once(Events.MouseIsDead, () => {
			this.scene.run(SceneKeys.GameOver);
		});

		const body = this.mouse.body as Phaser.Physics.Arcade.Body;
		body.setCollideWorldBounds(true);
		body.setVelocityX(200);

		this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, floor);

		this.cameras.main.startFollow(this.mouse);
		this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

		this.physics.add.overlap(
			this.laser,
			this.mouse,
			this.handleOverlapLaser,
			undefined,
			this
		);

		this.coins = this.physics.add.staticGroup();
		this.spawnCoins();

		this.physics.add.overlap(
			this.coins,
			this.mouse,
			this.handleCollectCoin,
			undefined,
			this
		);

		this.scoreLabel = this.add
			.text(10, 10, `Score: ${this.score}`, {
				fontSize: "24px",
				color: "#080808",
				backgroundColor: "#f8e71c",
				shadow: { fill: true, blur: 0, offsetY: 0 },
				padding: { left: 15, right: 15, top: 10, bottom: 10 },
			})
			.setScrollFactor(0);
	}

	private handleCollectCoin(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const coin = obj2 as Phaser.Physics.Arcade.Sprite;
		this.coins.killAndHide(coin);
		coin.body.enable = false;

		this.score += 1;
		this.scoreLabel.text = `Score: ${this.score}`;
	}

	private cameraHelper() {
		const scrollX = this.cameras.main.scrollX;
		const rightEdge = scrollX + this.scale.width;

		return {
			scrollX,
			rightEdge,
		};
	}

	private spawnCoins() {
		// ensure all coins are inactive and hidden
		this.coins.children.each((child) => {
			const coin = child as Phaser.Physics.Arcade.Sprite;
			this.coins.killAndHide(coin);
			coin.body.enable = false;
		});

		const { scrollX, rightEdge } = this.cameraHelper();

		let x = rightEdge + 150;
		let numCoins = Phaser.Math.Between(1, 20);
		for (let i = 0; i < numCoins; i++) {
			const coin = this.coins.get(
				x,
				Phaser.Math.Between(100, this.scale.height - 100),
				TextureKeys.Coin
			) as Phaser.Physics.Arcade.Sprite;
			coin.setVisible(true);
			coin.setActive(true);

			const body = coin.body as Phaser.Physics.Arcade.StaticBody;
			body.setCircle(body.width * 0.5);
			body.enable = true;
			body.updateFromGameObject();
			x += coin.width * 1.5;
		}
	}

	private wrapLaser() {
		const { scrollX, rightEdge } = this.cameraHelper();
		const body = this.laser.body as Phaser.Physics.Arcade.StaticBody;
		const width = body.width;

		if (this.laser.x + width < scrollX) {
			this.laser.x = Phaser.Math.Between(
				rightEdge + width,
				rightEdge + width + 1000
			);
			this.laser.y = Phaser.Math.Between(0, 300);

			body.position.x = this.laser.x + body.offset.x;
			body.position.y = this.laser.y + body.offset.y;
		}
	}

	private wrapMouseHole() {
		const { scrollX, rightEdge } = this.cameraHelper();
		if (this.mouseHole.x + this.mouseHole.width < scrollX) {
			this.mouseHole.x = Phaser.Math.Between(rightEdge + 100, rightEdge + 1000);
		}
	}

	private wrapWindows() {
		const { scrollX, rightEdge } = this.cameraHelper();

		// add some padding between windows
		const windowPadding = 2;
		let width = this.window1.width * windowPadding;

		if (this.window1.x + width < scrollX) {
			this.window1.x = Phaser.Math.Between(
				rightEdge + width,
				rightEdge + width + 800
			);
			this.window1.visible = this.checkOverlap(this.window1, this.bookcases);
		}

		width = this.window2.width;
		if (this.window2.x + width < scrollX) {
			this.window2.x = Phaser.Math.Between(
				this.window1.x + width,
				this.window1.x + width + 800
			);
			this.window2.visible = this.checkOverlap(this.window2, this.bookcases);
		}
	}

	private wrapBookcases() {
		const { scrollX, rightEdge } = this.cameraHelper();

		// add some padding between windows
		const padding = 2;
		let width = this.bookcase1.width * padding;

		if (this.bookcase1.x + width < scrollX) {
			this.bookcase1.x = Phaser.Math.Between(
				rightEdge + width,
				rightEdge + width + 800
			);
			this.bookcase1.visible = this.checkOverlap(this.bookcase1, this.windows);
		}

		width = this.bookcase2.width;
		if (this.bookcase2.x + width < scrollX) {
			this.bookcase2.x = Phaser.Math.Between(
				this.bookcase1.x + width,
				this.bookcase1.x + width + 800
			);
			this.bookcase2.visible = this.checkOverlap(this.bookcase2, this.windows);
			this.spawnCoins();
		}
	}

	private checkOverlap(
		image: Phaser.GameObjects.Image,
		otherImages: Phaser.GameObjects.Image[]
	): boolean {
		const overlap = otherImages.find((o) => {
			return Math.abs(image.x - o.x) <= image.width;
		});

		return overlap == undefined;
	}

	private handleOverlapLaser(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		this.mouse.kill();
	}

	update(t: number, dt: number) {
		// scroll the background with the main camera position
		this.background.setTilePosition(this.cameras.main.scrollX);
		this.wrapMouseHole();
		this.wrapWindows();
		this.wrapBookcases();
		this.wrapLaser();
	}
}
