import { Divider, Text, Title } from "@mantine/core";
import useMediaQuery from "../../util/useMediaQuery";

interface SideBySideProps {
  title: string;
  description: string;
  right: React.ReactNode;
  actions?: React.ReactNode;
}

const SideBySide = ({
  title,
  description,
  right,
  actions,
}: SideBySideProps) => {
  const mobile = useMediaQuery("768");

  return (
    <>
      <Divider mt={26} mb={26} />
      <div
        style={{
          display: mobile ? "block" : "flex",
          gap: 32,
        }}
      >
        <div
          style={{
            flex: 1,
            ...(mobile ? { marginBottom: 16 } : {}),
          }}
        >
          <Title order={4} mb={16}>
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
