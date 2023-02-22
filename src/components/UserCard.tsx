import { Avatar, Button, Group, Indicator, Paper, Text } from "@mantine/core";
import Link from "next/link";
import getMediaUrl from "../util/get-media";
import { NonUser } from "../util/prisma-types";

interface UserCardProps {
  user: NonUser;
  minimal?: boolean;
}

const UserCard = ({ user, minimal }: UserCardProps) => {
  return (
    <Paper
      radius="md"
      withBorder
      p="lg"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
      })}
      key={user.id}
    >
      <Group position="center">
        <Indicator
          color="green"
          size={10}
          disabled={
            Date.now() - new Date(user.lastSeen).getTime() > 5 * 60 * 1000
          }
          position="bottom-end"
        >
          <Avatar
            src={getMediaUrl(user.avatarUri)}
            size={120}
            radius={120}
            mx="auto"
          />
        </Indicator>
      </Group>
      <Text
        align="center"
        size="lg"
        weight={500}
        mt="md"
        sx={{
          textDecoration: user.banned ? "line-through" : "none",
          color: user.banned ? "gray" : "inherit",
        }}
      >
        {user.username}
      </Text>
      {!minimal && (
        <>
          <Text align="center" color="dimmed" size="sm">
            {user._count.followers} followers • {user._count.following}{" "}
            following
          </Text>
          <Text align="center" color="dimmed" size="sm" lineClamp={1}>
            {user.bio || "No bio"}
          </Text>
        </>
      )}

      <Link href={`/profile/${user.username}`} passHref>
        <Button component="a" variant="default" fullWidth mt="md">
          View Profile
        </Button>
      </Link>
    </Paper>
  );
};

export default UserCard;
