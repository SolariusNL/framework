import { Anchor, Group, Text } from "@mantine/core";
import Link from "next/link";

const MinimalFooter = () => (
  <>
    <Text size="sm" align="center" mb={5} weight={500} color="dimmed">
      Copyright © 2022 Soodam.re. All rights reserved.
    </Text>

    <Group
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
      spacing={14}
    >
      <Link href="/privacy">
        <Anchor size="sm">Privacy</Anchor>
      </Link>

      <Link href="/tos">
        <Anchor size="sm">Terms of Service</Anchor>
      </Link>

      <Link href="/guidelines">
        <Anchor size="sm">Guidelines</Anchor>
      </Link>
    </Group>
  </>
);

export default MinimalFooter;
