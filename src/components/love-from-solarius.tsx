import { Container, Text } from "@mantine/core";
import { FC } from "react";

const LoveFromSolarius: FC = () => {
  return (
    <Container className="my-24 flex justify-center text-center">
      <Text size="sm" color="dimmed">
        Made with ❤️ by Solarius B.V. We have no affiliation with Roblox
        Corporation or its partners. Roblox, and all associated trademarks, are
        property of Roblox Corporation. Love from Solarius and contributors.
      </Text>
    </Container>
  );
};

export default LoveFromSolarius;
