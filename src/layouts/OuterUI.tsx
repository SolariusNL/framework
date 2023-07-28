import Background from "@/assets/subtlebackground.png";
import MinimalFooter from "@/components/minimal-footer";
import {
  Container,
  Paper,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { FC, ReactNode } from "react";

type OuterUIProps = {
  description: ReactNode;
  children: ReactNode;
  title?: string;
  wide?: boolean;
  container?: boolean;
};

const OuterUI: FC<OuterUIProps> = (props) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <>
      <style jsx global>
        {`
          body {
            background-color: ${colorScheme === "dark"
              ? "#121212"
              : "000"} !important;
          }
        `}
      </style>
      <span className="fixed inset-0 bg-background" />
      <span
        style={{
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top right",
          backgroundAttachment: "fixed",
          backgroundImage: `url(${Background.src})`,
        }}
        className="fixed inset-0"
      />
      <div className="relative">
        <Container size={props.wide ? 800 : 420} my={40}>
          <Title align="center">
            {props.title ? props.title : "Framework"}
          </Title>
          <Text color="dimmed" size="sm" align="center" mt={5}>
            {props.description}
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md" mb={30}>
            {props.container ? (
              <Container className="max-w-md">{props.children}</Container>
            ) : (
              props.children
            )}
          </Paper>

          <MinimalFooter />
        </Container>
      </div>
    </>
  );
};

export default OuterUI;
