import { useMantineTheme } from "@mantine/core";

interface PlaceholderGameResourceProps {
  height: number;
  radius?: number;
  width?: number;
}

const PlaceholderGameResource = ({
  height,
  radius,
  width,
}: PlaceholderGameResourceProps) => {
  const theme = useMantineTheme();

  return (
    <div
      style={{
        background: `linear-gradient(
          ${Math.floor(Math.random() * 360)}deg,
          ${theme.colors.grape[3]},
          ${theme.colors.indigo[5]},
          ${theme.colors.green[3]}
        )`,
        height: `${height}px`,
        width: `${width}px`,
        ...(radius ? { borderRadius: `${radius}px` } : {}),
      }}
    />
  );
};

export default PlaceholderGameResource;
