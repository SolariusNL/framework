import { useMantineColorScheme } from "@mantine/core";

const VerticalDivider: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const theme = useMantineColorScheme().colorScheme;

  return (
    <div
      className={`w-px h-8 ${
        theme === "dark" ? "bg-[#373A40]" : "bg-[#ced4da]"
      } mx-4 ${props.className}`}
    />
  );
};

export default VerticalDivider;
