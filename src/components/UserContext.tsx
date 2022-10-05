import {
  ActionIcon,
  Anchor,
  Avatar,
  Group,
  HoverCard,
  Indicator,
  Stack,
  Text,
} from "@mantine/core";
import { NonUser } from "../util/prisma-types";
import Link from "next/link";
import { HiFlag } from "react-icons/hi";
import ReportUser from "./ReportUser";
import React from "react";
import { useFrameworkUser } from "../contexts/FrameworkUser";

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
      <HoverCard
        width={320}
        shadow="md"
        withArrow
        openDelay={200}
        closeDelay={400}
      >
        <HoverCard.Target>
          <div style={{ cursor: "pointer" }}>{children}</div>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Group position="apart">
            <Group>
              <Indicator
                color="green"
                position="bottom-end"
                disabled={
                  Date.now() - new Date(user.lastSeen).getTime() > 5 * 60 * 1000
                }
              >
                <Avatar src={user.avatarUri} alt={user.username} radius="xl" />
              </Indicator>
              <Stack spacing={5}>
                <Text size="sm" weight={700} sx={{ lineHeight: 1 }}>
                  {user.username}
                </Text>
                <Link href={customHref || `/profile/${user.username}`} passHref>
                  <Anchor color="dimmed" size="xs" sx={{ lineHeight: 1 }}>
                    @{user.username}
                  </Anchor>
                </Link>
              </Stack>
            </Group>
            {currentUser?.id !== user.id && (
              <Group>
                <ActionIcon color="red" onClick={() => setReportOpened(true)}>
                  <HiFlag />
                </ActionIcon>
              </Group>
            )}
          </Group>

          <Text size="sm" mt="md" lineClamp={3}>
            {user.bio || "No bio"}
          </Text>

          <Group mt="md" spacing="xl">
            <Text size="sm">
              <b>{user.following.length}</b> Following
            </Text>
            <Text size="sm">
              <b>{user.followers.length}</b> Followers
            </Text>
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
};

export default UserContext;
