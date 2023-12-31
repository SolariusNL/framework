import { Divider, Text, Title, useMantineTheme } from "@mantine/core";
import useAmoled from "@/stores/useAmoled";
import { AMOLED_COLORS } from "@/util/constants";
import useMediaQuery from "@/util/media-query";
import clsx from "@/util/clsx";

interface SideBySideProps {
  title: string;
  description: string;
  right: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  shaded?: boolean;
  noUpperBorder?: boolean;
  classNames?: {
    title: string;
  }
}

const SideBySide = ({
  title,
  description,
  right,
  actions,
  icon,
  shaded,
  noUpperBorder,
  classNames,
}: SideBySideProps) => {
  const mobile = useMediaQuery("768");
  const theme = useMantineTheme();
  const { enabled: amoled } = useAmoled();

  return (
    <>
      {!noUpperBorder && <Divider mt={26} mb={26} />}
      <div
        style={{
          display: mobile ? "block" : "flex",
          gap: 32,
          ...(shaded && {
            backgroundColor: amoled
              ? AMOLED_COLORS.paper
              : theme.colorScheme == "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
            padding: 16,
          }),
          borderRadius: theme.radius.md,
          overflow: "visible",
        }}
      >
        <div
          style={{
            flex: 1,
            ...(mobile ? { marginBottom: 16 } : {}),
          }}
        >
          <Title order={4} mb={16} className={clsx(
            "flex items-center gap-2",
            classNames?.title,
          )}>
            {icon && icon}
            {title}
          </Title>
          <Text
            sx={{
              ...(actions ? { marginBottom: 16 } : {}),
            }}
          >
            {description}
          </Text>
          {actions}
        </div>
        <div
          style={{
            flex: 1,
          }}
        >
          {right}
        </div>
      </div>
    </>
  );
};

export default SideBySide;
