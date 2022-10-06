import { Divider, Text, Title } from "@mantine/core";

interface SideBySideProps {
  title: string;
  description: string;
  right: React.ReactNode;
}

const SideBySide = ({ title, description, right }: SideBySideProps) => {
  return (
    <>
      <Divider mt={26} mb={26} />
      <div
        style={{
          display: "flex",
          gap: 32,
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          <Title order={4} mb={16}>
            {title}
          </Title>
          <Text>{description}</Text>
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
