import { useMantineColorScheme } from "@mantine/core";

const VerticalDivider: React.FC<React.HTMLAttributes<HTMLDivElement>> = () => {
  const theme = useMantineColorScheme().colorScheme;

  return (
    <div
      className={`w-px h-8 ${
        theme === "dark" ? "bg-gray-700" : "bg-gray-300"
      } opacity-50 mx-4`}
    />
  );
};

export default VerticalDivider;
