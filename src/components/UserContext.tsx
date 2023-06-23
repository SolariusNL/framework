import {
  ActionIcon,
  Anchor,
  Avatar,
  Group,
  HoverCard,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import { HiFlag } from "react-icons/hi";
import { useFrameworkUser } from "../contexts/FrameworkUser";
import getMediaUrl from "../util/get-media";
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
        <HoverCard.Dropdown
          p="lg"
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "all",
            cursor: "default",
          }}
        >
          <Group position="apart">
            <Group>
              <Avatar src={getMediaUrl(user.avatarUri)} radius="xl" />
              <Stack spacing={5}>
                <Text size="sm" weight={700} sx={{ lineHeight: 1 }}>
                  {user.alias ? user.alias : user.username}
                </Text>
                <Link
                  href={`/profile/${user.username}`}
                  passHref
                  onClick={(e) => e.stopPropagation()}
                >
                  <Anchor color="dimmed" size="xs" sx={{ lineHeight: 1 }}>
                    @{user.username}
                  </Anchor>
                </Link>
              </Stack>
            </Group>
            <ActionIcon
              color="red"
              onClick={() => setReportOpened(true)}
              variant="light"
              disabled={currentUser?.id === user.id}
            >
              <HiFlag />
            </ActionIcon>
          </Group>

          <Text size="sm" mt="md" lineClamp={3}>
            {user.bio ? user.bio : "No bio provided."}
          </Text>

          <Group mt="md" spacing="xl">
            <Text size="sm">
              <b>{user._count.following}</b> Following
            </Text>
            <Text size="sm">
              <b>{user._count.followers}</b> Followers
            </Text>
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
};

export default UserContext;
