import { Checkbox, createStyles, Text, UnstyledButton } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import useAmoled from "../stores/useAmoled";
import { AMOLED_COLORS } from "../util/constants";

const useStyles = createStyles((theme) => ({
  button: {
    display: "flex",
    width: "100%",
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    }`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[0],
    },
    "&[data-selected=true]": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[9] + "60"
          : theme.colors.blue[1],
      border: `1px solid ${theme.colors.blue[4]} !important`,
    },
  },
}));

interface CheckboxCardProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?(checked: boolean): void;
  title: React.ReactNode;
  description: React.ReactNode;
}

const CheckboxCard = ({
  checked,
  defaultChecked,
  onChange,
  title,
  description,
  className,
  ...others
}: CheckboxCardProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof CheckboxCardProps>) => {
  const { classes, cx } = useStyles();
  const { enabled: amoled } = useAmoled();

  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  return (
    <UnstyledButton
      {...others}
      onClick={() => handleChange(!value)}
      className={cx(classes.button, className)}
      sx={{
        ...(amoled && {
          backgroundColor: AMOLED_COLORS.paper,
        }),
      }}
      data-selected={value}
    >
      <Checkbox
        checked={value}
        onChange={() => {}}
        tabIndex={-1}
        // @ts-ignore
        size="md"
        mr="xl"
        styles={{ input: { cursor: "pointer" } }}
      />

      <div>
        <Text weight={500} mb={7} sx={{ lineHeight: 1 }}>
          {title}
        </Text>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </div>
    </UnstyledButton>
  );
};

export default CheckboxCard;
