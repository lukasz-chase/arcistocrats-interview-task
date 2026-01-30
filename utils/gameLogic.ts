import {
  Application,
  Container,
  Text,
  Texture,
  Ticker,
  AnimatedSprite,
} from "pixi.js";

export type Chest = AnimatedSprite & { isOpened: boolean };

export const GAME_STATES = {
  LOSE: "lose",
  WIN: "win",
  BONUS: "bonus",
};

export interface GameState {
  app: Application;
  chests: Chest[];
  openedChestsCount: number;
  playButton: HTMLButtonElement;
  bonusContainer: Container;
  bonusAmount: Text;
  textures: {
    texClosed: Texture;
    texWin: Texture;
    texBonus: Texture;
    texLose: Texture;
  };
}

export const setChestsInteractive = (
  gameState: GameState,
  interactive: boolean,
): void => {
  gameState.chests.forEach((chest) => {
    if (!chest.isOpened) {
      chest.eventMode = interactive ? "static" : "none";
      chest.alpha = interactive ? 1 : 0.5;
      chest.cursor = interactive ? "pointer" : "default";
    } else {
      chest.eventMode = "none";
      chest.alpha = 1;
      chest.cursor = "default";
    }
  });
};

export const checkGameState = (gameState: GameState): void => {
  if (gameState.openedChestsCount === gameState.chests.length) {
    gameState.playButton.disabled = false;
    gameState.playButton.innerText = "Play Again";
    setChestsInteractive(gameState, false);
  } else {
    setChestsInteractive(gameState, true);
  }
};

export const showBonusScreen = (gameState: GameState): void => {
  gameState.bonusContainer.visible = true;
  gameState.bonusAmount.scale.set(1);

  let elapsed = 0;
  const duration = 2000;

  const animate = (ticker: Ticker) => {
    elapsed += ticker.deltaMS;
    const scale = 1 + Math.sin((elapsed / duration) * Math.PI * 4) * 0.5;
    gameState.bonusAmount.scale.set(scale);

    if (elapsed >= duration) {
      gameState.app.ticker.remove(animate);
      gameState.bonusContainer.visible = false;
      checkGameState(gameState);
    }
  };

  gameState.app.ticker.add(animate);
};

export const onChestClick = (gameState: GameState, chest: Chest): void => {
  if (chest.isOpened) return;

  // Disable all elements
  setChestsInteractive(gameState, false);

  chest.isOpened = true;
  gameState.openedChestsCount++;

  // Determine result
  const isWinner = Math.random() > 0.5;
  let resultType = GAME_STATES.LOSE;

  if (isWinner) {
    resultType = Math.random() > 0.5 ? GAME_STATES.WIN : GAME_STATES.BONUS;
  }

  const { texClosed, texWin, texBonus, texLose } = gameState.textures;

  // Setup animation textures
  if (resultType === GAME_STATES.WIN) {
    chest.textures = [texClosed, texWin];
  } else if (resultType === GAME_STATES.BONUS) {
    chest.textures = [texClosed, texBonus];
  } else {
    chest.textures = [texClosed, texLose];
  }

  chest.play();

  chest.onComplete = () => {
    chest.onComplete = undefined;

    if (resultType === GAME_STATES.BONUS) {
      showBonusScreen(gameState);
    } else {
      checkGameState(gameState);
    }
  };
};

export const startGame = (gameState: GameState): void => {
  gameState.playButton.disabled = true;
  gameState.openedChestsCount = 0;
  gameState.playButton.innerText = "Play";
  // Reset chests
  gameState.chests.forEach((chest) => {
    chest.textures = [gameState.textures.texClosed];
    chest.isOpened = false;
  });

  setChestsInteractive(gameState, true);
};
