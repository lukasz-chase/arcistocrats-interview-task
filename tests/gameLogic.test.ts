import { Application, Container, Text, Texture, Ticker } from "pixi.js";
import {
  checkGameState,
  onChestClick,
  setChestsInteractive,
  showBonusScreen,
  startGame,
  type Chest,
  type GameState,
} from "../utils/gameLogic";

// Helper to create a mock chest
const createMockChest = (isOpened = false): Chest =>
  ({
    isOpened,
    textures: [],
    play: jest.fn(),
    onComplete: undefined,
    eventMode: "none",
    alpha: 1,
    cursor: "default",
  }) as unknown as Chest;

// Helper to create a mock GameState
const createMockGameState = (chestCount = 6): GameState => {
  const chests = Array.from({ length: chestCount }, createMockChest);
  return {
    app: {
      ticker: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    } as unknown as Application,
    chests,
    openedChestsCount: 0,
    playButton: {
      disabled: false,
      innerText: "Play",
    } as HTMLButtonElement,
    bonusContainer: {
      visible: false,
      scale: { set: jest.fn() },
    } as unknown as Container,
    bonusAmount: {
      scale: { set: jest.fn() },
    } as unknown as Text,
    textures: {
      texClosed: {} as Texture,
      texWin: {} as Texture,
      texBonus: {} as Texture,
      texLose: {} as Texture,
    },
  };
};

describe("gameLogic", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createMockGameState();
  });

  describe("startGame", () => {
    it("should reset the game state and make chests interactive", () => {
      // Arrange
      gameState.playButton.disabled = false;
      gameState.openedChestsCount = 3;
      gameState.chests[0].isOpened = true;

      // Act
      startGame(gameState);

      // Assert
      expect(gameState.playButton.disabled).toBe(true);
      expect(gameState.openedChestsCount).toBe(0);
      expect(gameState.playButton.innerText).toBe("Play");
      gameState.chests.forEach((chest) => {
        expect(chest.isOpened).toBe(false);
        expect(chest.textures).toEqual([gameState.textures.texClosed]);
        expect(chest.eventMode).toBe("static");
      });
    });
  });

  describe("setChestsInteractive", () => {
    it("should make unopened chests interactive", () => {
      gameState.chests[0].isOpened = true;
      setChestsInteractive(gameState, true);
      expect(gameState.chests[0].eventMode).toBe("none"); // opened should not change
      expect(gameState.chests[1].eventMode).toBe("static");
      expect(gameState.chests[1].alpha).toBe(1);
      expect(gameState.chests[1].cursor).toBe("pointer");
    });

    it("should make unopened chests non-interactive", () => {
      gameState.chests[0].isOpened = true;
      setChestsInteractive(gameState, false);
      expect(gameState.chests[0].eventMode).toBe("none"); // opened should not change
      expect(gameState.chests[1].eventMode).toBe("none");
      expect(gameState.chests[1].alpha).toBe(0.5);
      expect(gameState.chests[1].cursor).toBe("default");
    });
  });

  describe("onChestClick", () => {
    it("should do nothing if the chest is already opened", () => {
      const chest = gameState.chests[0];
      chest.isOpened = true;
      const initialCount = gameState.openedChestsCount;

      onChestClick(gameState, chest);

      expect(gameState.openedChestsCount).toBe(initialCount);
      expect(chest.play).not.toHaveBeenCalled();
    });

    it("should open a chest and handle a win result", () => {
      const chest = gameState.chests[0];
      jest.spyOn(Math, "random").mockReturnValue(0.6); // win, then win again

      onChestClick(gameState, chest);

      expect(chest.isOpened).toBe(true);
      expect(gameState.openedChestsCount).toBe(1);
      expect(chest.play).toHaveBeenCalled();
      expect(chest.textures).toEqual([
        gameState.textures.texClosed,
        gameState.textures.texWin,
      ]);

      // Simulate animation complete
      chest.onComplete!();
      expect(gameState.chests[1].eventMode).toBe("static"); // checkGameState was called
    });

    it("should open a chest and handle a bonus result", () => {
      const chest = gameState.chests[0];
      const randomSpy = jest.spyOn(Math, "random");
      randomSpy.mockReturnValueOnce(0.6); // isWinner = true
      randomSpy.mockReturnValueOnce(0.4); // resultType = BONUS

      onChestClick(gameState, chest);
      expect(chest.textures).toEqual([
        gameState.textures.texClosed,
        gameState.textures.texBonus,
      ]);

      // Mock ticker for showBonusScreen
      const tickerAddSpy = jest
        .spyOn(gameState.app.ticker, "add")
        .mockImplementation((fn: (ticker: { deltaMS: number }) => void) => {
          // Immediately finish animation
          fn({ deltaMS: 2000 });
          return gameState.app.ticker as unknown as Ticker;
        });

      // Simulate animation complete
      chest.onComplete!();

      expect(gameState.bonusContainer.visible).toBe(false); // It becomes visible then invisible
      expect(tickerAddSpy).toHaveBeenCalled();
    });

    it("should open a chest and handle a lose result", () => {
      const chest = gameState.chests[0];
      jest.spyOn(Math, "random").mockReturnValue(0.4); // lose

      onChestClick(gameState, chest);
      expect(chest.textures).toEqual([
        gameState.textures.texClosed,
        gameState.textures.texLose,
      ]);

      // Simulate animation complete
      chest.onComplete!();
      expect(gameState.chests[1].eventMode).toBe("static"); // checkGameState was called
    });
  });

  describe("checkGameState", () => {
    it("should re-enable the play button when all chests are opened", () => {
      gameState.openedChestsCount = 6;
      checkGameState(gameState);
      expect(gameState.playButton.disabled).toBe(false);
      expect(gameState.playButton.innerText).toBe("Play Again");
    });

    it("should keep chests interactive if not all are opened", () => {
      gameState.openedChestsCount = 5;
      checkGameState(gameState);
      expect(gameState.playButton.disabled).toBe(false); // Remains as it was
      expect(gameState.chests[0].eventMode).toBe("static");
    });
  });

  describe("showBonusScreen", () => {
    it("should show and then hide the bonus screen", () => {
      const tickerAddSpy = jest
        .spyOn(gameState.app.ticker, "add")
        .mockImplementation((fn: (ticker: { deltaMS: number }) => void) => {
          // Immediately finish animation
          fn({ deltaMS: 2000 });
          return gameState.app.ticker as unknown as Ticker;
        });

      showBonusScreen(gameState);

      expect(tickerAddSpy).toHaveBeenCalled();
      expect(gameState.bonusContainer.visible).toBe(false);
      expect(gameState.chests[0].eventMode).toBe("static"); // checkGameState was called
    });
  });
});
