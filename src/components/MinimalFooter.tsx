import {
  ActionIcon,
  Anchor,
  ColorScheme,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { HiMoon, HiSun } from "react-icons/hi";

const MinimalFooter = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const [_, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
  });

  const toggleColorScheme = () =>
    setColorScheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <>
      <Text size="sm" align="center" mb={5} weight={500} color="dimmed">
        Copyright © 2022 Soodam.re. All rights reserved.
      </Text>

      <Stack>
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

          <Link href="/tos">
            <Anchor size="sm">Terms of Service</Anchor>
          </Link>

          <Link href="/guidelines">
            <Anchor size="sm">Guidelines</Anchor>
          </Link>
        </Group>

        <Group
          sx={{
            justifyContent: "center",
            display: "flex",
          }}
        >
          <ActionIcon
            color={dark ? "yellow" : "blue"}
            sx={(theme) => ({
              border: "1px solid",
              borderColor: dark ? theme.colors.yellow[5] : theme.colors.blue[5],
            })}
            onClick={toggleColorScheme}
          >
            {dark ? <HiSun /> : <HiMoon />}
          </ActionIcon>
        </Group>
      </Stack>
    </>
  );
};

export default MinimalFooter;
