import React, { useEffect, useState } from "react";
import clsx from "../util/clsx";

const GRID_SIZE = 20;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

interface Coordinate {
  x: number;
  y: number;
}

interface GameState {
  snake: Coordinate[];
  food: Coordinate;
  direction: Direction;
  gameOver: boolean;
}

const Snake: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 10 },
    direction: Direction.Right,
    gameOver: false,
  });

  // Move the snake every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      moveSnake();
    }, 100);
    return () => clearInterval(interval);
  });

  // Handle arrow key press to change direction
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          setGameState((state) =>
            state.direction !== Direction.Down
              ? { ...state, direction: Direction.Up }
              : state
          );
          break;
        case "ArrowDown":
          setGameState((state) =>
            state.direction !== Direction.Up
              ? { ...state, direction: Direction.Down }
              : state
          );
          break;
        case "ArrowLeft":
          setGameState((state) =>
            state.direction !== Direction.Right
              ? { ...state, direction: Direction.Left }
              : state
          );
          break;
        case "ArrowRight":
          setGameState((state) =>
            state.direction !== Direction.Left
              ? { ...state, direction: Direction.Right }
              : state
          );
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Move the snake in the current direction
  const moveSnake = () => {
    setGameState((state) => {
      // Calculate the new head position
      const head = state.snake[state.snake.length - 1];
      const newHead =
        state.direction === Direction.Up
          ? { x: head.x, y: head.y - 1 }
          : state.direction === Direction.Down
          ? { x: head.x, y: head.y + 1 }
          : state.direction === Direction.Left
          ? { x: head.x - 1, y: head.y }
          : { x: head.x + 1, y: head.y };

      // Check if the snake collided with a wall
      if (
        newHead.x < 0 ||
        newHead.x >= BOARD_WIDTH ||
        newHead.y < 0 ||
        newHead.y >= BOARD_HEIGHT
      ) {
        return { ...state, gameOver: true };
      }

      // Check if the snake collided with its own tail
      if (
        state.snake.some((part) => part.x === newHead.x && part.y === newHead.y)
      ) {
        return { ...state, gameOver: true };
      }
      // Check if the snake ate the food
      const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;

      // Update the snake
      const newSnake = [...state.snake, newHead];
      if (!ateFood) {
        newSnake.shift();
      }

      // Generate new food location if needed
      let newFood = state.food;
      while (
        newSnake.some((part) => part.x === newFood.x && part.y === newFood.y)
      ) {
        newFood = {
          x: Math.floor(Math.random() * BOARD_WIDTH),
          y: Math.floor(Math.random() * BOARD_HEIGHT),
        };
      }

      return {
        ...state,
        snake: newSnake,
        food: newFood,
        gameOver: false,
      };
    });
  };

  const renderBoard = () => {
    const board = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const isSnake = gameState.snake.some(
          (part) => part.x === x && part.y === y
        );
        const isFood = gameState.food.x === x && gameState.food.y === y;
        const className = clsx(
          isSnake && "bg-green-500",
          isFood && "bg-red-500",
          "border border-gray-200"
        );
        board.push(
          <div
            key={`${x},${y}`}
            className={className}
            style={{ width: GRID_SIZE, height: GRID_SIZE }}
          />
        );
      }
    }

    return board;
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="grid grid-cols-20 gap-1">{renderBoard()}</div>
      {gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg font-bold">Game Over!</p>
            <p className="text-sm">Score: {gameState.snake.length - 1}</p>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-lg mt-4"
              onClick={() =>
                setGameState({
                  snake: [{ x: 10, y: 10 }],
                  food: { x: 15, y: 10 },
                  direction: Direction.Right,
                  gameOver: false,
                })
              }
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Snake;
