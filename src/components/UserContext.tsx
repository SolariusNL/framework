import {
  Avatar,
  Button,
  Center,
  Group,
  HoverCard,
  Indicator,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import { HiFlag, HiUser } from "react-icons/hi";
import { useFrameworkUser } from "../contexts/FrameworkUser";
import { NonUser } from "../util/prisma-types";
import ReportUser from "./ReportUser";

interface UserContextProps {
  user: NonUser;
  children: React.ReactNode;
  customHref?: string;
}

const UserContext = ({ user, children, customHref }: UserContextProps) => {
  const [reportOpened, setReportOpened] = React.useState(false);
  const currentUser = useFrameworkUser();

  return (
    <>
      <ReportUser
        user={user}
        opened={reportOpened}
        setOpened={setReportOpened}
      />
      <HoverCard shadow="md" withArrow openDelay={200} closeDelay={400}>
        <HoverCard.Target>
          <div style={{ cursor: "pointer" }}>{children}</div>
        </HoverCard.Target>
        <HoverCard.Dropdown p="lg">
          <Center
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Indicator
              color="green"
              position="bottom-end"
              disabled={
                Date.now() - new Date(user.lastSeen).getTime() > 5 * 60 * 1000
              }
              mb={16}
            >
              <Avatar src={user.avatarUri} alt={user.username} radius="xl" />
            </Indicator>

            <Stack spacing={5} align="center" mb={16}>
              <Link href={customHref || `/profile/${user.username}`} passHref>
                <div className="text-center cursor-pointer">
                  <Text size="sm" weight={700} mb={6} sx={{ lineHeight: 1 }}>
                    {user.username}
                  </Text>
                  <Text color="dimmed" size="xs" lineClamp={1}>
                    {user.bio}
                  </Text>
                </div>
              </Link>
            </Stack>

            <Group spacing="xl" mb={16}>
              <Text size="sm">
                <b>{user.following.length}</b> Following
              </Text>
              <Text size="sm">
                <b>{user.followers.length}</b> Followers
              </Text>
            </Group>

            <Button.Group>
              <Link passHref href={customHref || `/profile/${user.username}`}>
                <Button fullWidth size="xs">
                  <HiUser />
                </Button>
              </Link>
              <Button
                disabled={currentUser?.id === user.id}
                color="red"
                fullWidth
                size="xs"
                onClick={() => setReportOpened(true)}
              >
                <HiFlag />
              </Button>
            </Button.Group>
          </Center>
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
};

export default UserContext;
