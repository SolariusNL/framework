import { ButtonProps, UnstyledButton } from "@mantine/core";
import useAmoled from "../stores/useAmoled";
import { AMOLED_COLORS } from "../util/constants";

const ShadedButton: React.FC<
  ButtonProps & {
    onClick?: () => void;
  }
> = (props) => {
  const { enabled: amoled } = useAmoled();

  return (
    <UnstyledButton
      sx={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? amoled
                ? AMOLED_COLORS.paper
                : theme.colors.dark[6]
              : theme.colors.gray[0],
        },
        width: "100%",
        display: "flex",
        transition: "background-color 0.05s ease",
      })}
      {...props}
    />
  );
};

export default ShadedButton;
