import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import React, { FC } from "react";
import { BsApple, BsWindows } from "react-icons/bs";
import { FaLinux } from "react-icons/fa";
import LoadingIndicator from "./loading-indicator";

type LaunchingProps = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
};

const Launching: FC<LaunchingProps> = ({ opened, setOpened }) => {
  const [downloadClicked, setDownloadClicked] = React.useState(false);

  const downloads = [
    {
      os: "Windows 64-bit",
      hint: "Windows 8.1 or newer",
      icon: <BsWindows />,
      color: "blue",
    },
    {
      os: "macOS Intel",
      hint: "macOS 10.13.6 or newer",
      icon: <BsApple />,
      color: "indigo",
    },
    {
      os: "macOS Silicon",
      hint: "macOS 11 or newer",
      icon: <BsApple />,
      color: "grape",
    },
    {
      os: "Linux",
      hint: ".AppImage (x86_64)",
      icon: <FaLinux />,
      color: "pink",
    },
    {
      os: "Linux",
      hint: ".deb (x86_64)",
      icon: <FaLinux />,
      color: "pink",
    },
    {
      os: "Linux",
      hint: ".rpm (x86_64)",
      icon: <FaLinux />,
      color: "pink",
    },
    {
      os: "Linux",
      hint: ".snap (x86_64)",
      icon: <FaLinux />,
      color: "pink",
    },
  ];

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      withCloseButton={false}
    >
      {!downloadClicked ? (
        <Stack align="center" p={16}>
          <Stack spacing={6} align="center">
            <Title order={3} mb={10}>
              Launching Framework...
            </Title>
            <LoadingIndicator className="my-4" />
          </Stack>
          <Button
            size="sm"
            variant="light"
            radius="xl"
            onClick={() => setDownloadClicked(true)}
          >
            Download Framework
          </Button>
        </Stack>
      ) : (
        <>
          <Text mb={10}>Choose your operating system:</Text>

          <Stack spacing={8}>
            {downloads.map((d) => (
              <UnstyledButton
                sx={(theme) => ({
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.md,
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.black,

                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.colors.gray[0],
                  },
                })}
                key={d.os}
              >
                <Group>
                  <Group>
                    <ThemeIcon
                      color={d.color}
                      variant="light"
                      sx={(theme) => ({
                        border: "1px solid",
                        borderColor: theme.colors[d.color][9] + "55",
                        boxShadow: `0 0 17px ${
                          theme.colors[d.color][9] + "70"
                        }`,
                      })}
                      p={5}
                    >
                      {d.icon}
                    </ThemeIcon>
                  </Group>
                  <Group>
                    <Text weight={490}>{d.os}</Text>
                  </Group>
                  <Group>
                    <Text color="dimmed">{d.hint}</Text>
                  </Group>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        </>
      )}
    </Modal>
  );
};

export default Launching;
