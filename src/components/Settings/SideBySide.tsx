import { Divider, Text, Title, useMantineTheme } from "@mantine/core";
import useMediaQuery from "../../util/useMediaQuery";

interface SideBySideProps {
  title: string;
  description: string;
  right: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  shaded?: boolean;
  noUpperBorder?: boolean;
}

const SideBySide = ({
  title,
  description,
  right,
  actions,
  icon,
  shaded,
  noUpperBorder,
}: SideBySideProps) => {
  const mobile = useMediaQuery("768");
  const theme = useMantineTheme();

  return (
    <>
      {!noUpperBorder && <Divider mt={26} mb={26} />}
      <div
        style={{
          display: mobile ? "block" : "flex",
          gap: 32,
          ...(shaded && {
            backgroundColor:
              theme.colorScheme == "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
            padding: 16,
          }),
          borderRadius: theme.radius.md,
        }}
      >
        <div
          style={{
            flex: 1,
            ...(mobile ? { marginBottom: 16 } : {}),
          }}
        >
          <Title order={4} mb={16}>
            {icon && (
              <div style={{ display: "inline-block", marginRight: 8 }}>
                {icon}
              </div>
            )}
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
