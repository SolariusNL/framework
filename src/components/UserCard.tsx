import {
  Avatar,
  Button,
  Group,
  Indicator,
  Paper,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { HiXCircle } from "react-icons/hi";
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
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
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
          <Avatar src={user.avatarUri} size={120} radius={120} mx="auto" />
        </Indicator>
      </Group>
      <Text align="center" size="lg" weight={500} mt="md">
        {user.username}{" "}
        {user.banned && (
          <Tooltip label="User is banned from Framework">
            <ThemeIcon color="red" variant="light" radius={999} size={24}>
              <HiXCircle />
            </ThemeIcon>
          </Tooltip>
        )}
      </Text>
      {!minimal && (
        <>
          <Text align="center" color="dimmed" size="sm">
            {user.followers.length} followers • {user.following.length}{" "}
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
