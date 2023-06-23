import { ButtonProps, UnstyledButton } from "@mantine/core";
import useAmoled from "../stores/useAmoled";
import { AMOLED_COLORS } from "../util/constants";

const ShadedButton: React.FC<
  ButtonProps & {
    onClick?: () => void;
    light?: boolean;
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
                : props.light
                ? theme.colors.dark[6] + "50"
                : theme.colors.dark[6]
              : props.light
              ? "#FFF"
              : theme.colors.gray[1],
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
