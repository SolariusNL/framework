import { Paper } from "@mantine/core";
import { Game } from "../util/prisma-types";
import { gradientPairs } from "./GameCard";

interface PlaceholderGameResourceProps {
  height?: number;
  radius?: number;
  width?: number;
  game?: Game;
  className?: string;
  noBottomRadius?: boolean;
}

const PlaceholderGameResource = ({
  height,
  radius,
  width,
  game,
  noBottomRadius,
  className,
}: PlaceholderGameResourceProps) => {
  function rand() {
    return gradientPairs[
      Math.abs(
        Array.from(`${game?.name}${String(game?.id)}${String(game?.author.username)}` ?? "placeholder")
          .map((char) => char.charCodeAt(0))
          .reduce((a, b) => a + b, 0)
      ) % gradientPairs.length
    ];
  }

  return (
    <Paper
      sx={(theme) => ({
        background: theme.fn.gradient({
          from: rand()[0],
          to: rand()[1],
        }),
        height: `${height}px`,
        width: `${width}px`,
        ...(radius ? { borderRadius: `${radius}px` } : {}),
        ...(noBottomRadius
          ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
          : {}),
      })}
      className={className}
    />
  );
};

export default PlaceholderGameResource;
