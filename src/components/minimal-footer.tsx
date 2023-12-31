import useAmoled from "@/stores/useAmoled";
import {
  ActionIcon,
  Anchor,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { HiMoon, HiSun } from "react-icons/hi";

const MinimalFooter: React.FC<{
  noLinks?: boolean;
}> = ({ noLinks }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const { enabled: amoled } = useAmoled();

  return (
    <>
      <Text size="sm" align="center" mb={5} weight={500} color="dimmed">
        Copyright © 2024 Solarius. All rights reserved.
      </Text>

      <Stack>
        {!noLinks && (
          <Group
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
            spacing={14}
            mb={6}
          >
            <Link href="/privacy">
              <Anchor size="sm">Privacy</Anchor>
            </Link>

            <Link href="/terms">
              <Anchor size="sm">Terms of Service</Anchor>
            </Link>

            <Link href="/guidelines">
              <Anchor size="sm">Guidelines</Anchor>
            </Link>
          </Group>
        )}

        <Group
          sx={{
            justifyContent: "center",
            display: "flex",
          }}
          {...(noLinks && { mt: 12 })}
        >
          <ActionIcon
            color={dark ? "yellow" : "blue"}
            sx={(theme) => ({
              border: "1px solid",
              borderColor: dark ? theme.colors.yellow[5] : theme.colors.blue[5],
            })}
            onClick={() => toggleColorScheme()}
            disabled={amoled}
          >
            {dark ? <HiSun /> : <HiMoon />}
          </ActionIcon>
        </Group>
      </Stack>
    </>
  );
};

export default MinimalFooter;
