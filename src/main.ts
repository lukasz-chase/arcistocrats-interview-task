import { initDevtools } from "@pixi/devtools";
import {
  Application,
  Container,
  Graphics,
  AnimatedSprite,
  Text,
  TextStyle,
} from "pixi.js";
import {
  onChestClick,
  startGame,
  type Chest,
  type GameState,
} from "../utils/gameLogic";

const APP_SIZE = {
  height: 500,
  width: 800,
};

(async () => {
  const app = new Application();

  await app.init({
    height: APP_SIZE.height,
    width: APP_SIZE.width,
    backgroundColor: 0xffffff,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  initDevtools(app);

  document.body.appendChild(app.canvas);

  // Re size function to maintain aspect ratio
  const resize = () => {
    const scaleX = window.innerWidth / APP_SIZE.width;
    const scaleY = (window.innerHeight * 0.75) / APP_SIZE.height;
    const scale = Math.min(scaleX, scaleY);

    const newWidth = Math.floor(APP_SIZE.width * scale);
    const newHeight = Math.floor(APP_SIZE.height * scale);

    app.canvas.style.width = `${newWidth}px`;
    app.canvas.style.height = `${newHeight}px`;
  };
  window.addEventListener("resize", resize);
  resize();

  const playButton = document.createElement("button");
  playButton.innerText = "Play";
  playButton.classList.add("play-button");

  document.body.appendChild(playButton);

  // Generate textures for chests (simulating spritesheet frames)
  const graphics = new Graphics();

  // Closed Chest
  graphics
    .rect(0, 0, 100, 100)
    .fill(0x8b4513)
    .stroke({ width: 4, color: 0x000000 });
  const texClosed = app.renderer.generateTexture(graphics);
  graphics.clear();

  // Regular Win
  graphics
    .rect(0, 0, 100, 100)
    .fill(0xffd700)
    .stroke({ width: 4, color: 0x000000 });
  graphics.circle(50, 50, 20).fill(0xffffff);
  const texWin = app.renderer.generateTexture(graphics);
  graphics.clear();

  // Bonus Win
  graphics
    .rect(0, 0, 100, 100)
    .fill(0x9932cc)
    .stroke({ width: 4, color: 0x000000 });
  graphics.star(50, 50, 5, 30, 15).fill(0xffffff);
  const texBonus = app.renderer.generateTexture(graphics);
  graphics.clear();

  // Lose
  graphics
    .rect(0, 0, 100, 100)
    .fill(0x808080)
    .stroke({ width: 4, color: 0x000000 });
  graphics.moveTo(20, 20).lineTo(80, 80).stroke({ width: 4, color: 0x000000 });
  graphics.moveTo(80, 20).lineTo(20, 80).stroke({ width: 4, color: 0x000000 });
  const texLose = app.renderer.generateTexture(graphics);

  const chests: Chest[] = [];

  const bonusContainer = new Container();
  bonusContainer.visible = false;
  const bonusBg = new Graphics()
    .rect(0, 0, APP_SIZE.width, APP_SIZE.height)
    .fill({ color: 0x000000, alpha: 0.8 });
  bonusContainer.addChild(bonusBg);

  const textStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 40,
    fill: 0xffffff,
    align: "center",
  });

  const bonusText = new Text({
    text: "BONUS WIN!",
    style: {
      ...textStyle,
      fontSize: 50,
    },
  });
  bonusText.anchor.set(0.5);
  bonusText.position.set(400, 200);
  bonusContainer.addChild(bonusText);

  const bonusAmount = new Text({
    text: "1000$",
    style: {
      ...textStyle,
      fill: 0xffd700,
    },
  });
  bonusAmount.anchor.set(0.5);
  bonusAmount.position.set(400, 300);
  bonusContainer.addChild(bonusAmount);

  app.stage.addChild(bonusContainer);

  const gameState: GameState = {
    app,
    playButton,
    bonusContainer,
    bonusAmount,
    chests: [],
    openedChestsCount: 0,
    textures: {
      texClosed,
      texWin,
      texBonus,
      texLose,
    },
  };

  // Create 6 chests
  for (let i = 0; i < 6; i++) {
    const chest = new AnimatedSprite([texClosed]) as Chest;
    chest.anchor.set(0.5);
    chest.x = 150 + (i % 3) * 250;
    chest.y = 150 + Math.floor(i / 3) * 200;
    chest.animationSpeed = 0.1;
    chest.loop = false;
    chest.eventMode = "none";
    chest.alpha = 0.5;

    chest.isOpened = false;

    chest.on("pointerdown", () => onChestClick(gameState, chest));

    app.stage.addChild(chest);
    chests.push(chest);
  }

  gameState.chests = chests;

  // Ensure bonus container is on top
  app.stage.setChildIndex(bonusContainer, app.stage.children.length - 1);

  playButton.addEventListener("click", () => startGame(gameState));
})();
