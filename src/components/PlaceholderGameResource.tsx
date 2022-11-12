import { Paper } from "@mantine/core";
import { gradientPairs } from "./GameCard";

interface PlaceholderGameResourceProps {
  height?: number;
  radius?: number;
  width?: number;
}

const PlaceholderGameResource = ({
  height,
  radius,
  width,
}: PlaceholderGameResourceProps) => {
  return (
    <Paper
      sx={(theme) => ({
        background: theme.fn.gradient({
          from: gradientPairs[
            Math.floor(Math.random() * gradientPairs.length)
          ][0],
          to: gradientPairs[
            Math.floor(Math.random() * gradientPairs.length)
          ][1],
        }),
        height: `${height}px`,
        width: `${width}px`,
        ...(radius ? { borderRadius: `${radius}px` } : {}),
      })}
    />
  );
};

export default PlaceholderGameResource;
