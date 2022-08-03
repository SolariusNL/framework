import { useMantineTheme } from "@mantine/core";

interface PlaceholderGameResourceProps {
  height: number;
}

const PlaceholderGameResource = ({ height }: PlaceholderGameResourceProps) => {
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
        height: `${height}px`
      }}
    />
  );
};

export default PlaceholderGameResource;