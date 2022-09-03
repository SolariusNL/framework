import {
  ActionIcon,
  Avatar,
  createStyles,
  Group,
  Paper,
  Stack,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import { NonUser } from "../util/prisma-types";
import { getRelativeTime } from "../util/relativeTime";
import UserContext from "./UserContext";

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },

  body: {
    paddingLeft: 54,
    paddingTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },

  content: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },
}));

interface CommentProps {
  postedAt: Date;
  body: string;
  user: NonUser;
}

const Comment = ({ postedAt, body, user }: CommentProps) => {
  const { classes } = useStyles();
  return (
    <Paper withBorder radius="md" className={classes.comment}>
      <div
        style={{
          display: "flex",
        }}
      >
        <div>
          <Stack spacing={3} mr={16}>
            <ActionIcon>
              <HiChevronUp />
            </ActionIcon>

            <ActionIcon>
              <HiChevronDown />
            </ActionIcon>
          </Stack>
        </div>
        <div>
          <Group>
            <UserContext user={user}>
              <Avatar
                src={
                  user.avatarUri ||
                  `https://avatars.dicebear.com/api/identicon/${user.id}.png`
                }
                alt={user.username}
                radius="xl"
              />
            </UserContext>
            <div>
              <Text size="sm" weight={500}>
                {user.username}
              </Text>
              <Text size="xs" color="dimmed">
                {getRelativeTime(new Date(postedAt))}
              </Text>
            </div>
          </Group>
          <TypographyStylesProvider className={classes.body}>
            <div
              className={classes.content}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </TypographyStylesProvider>
        </div>
      </div>
    </Paper>
  );
};

export default Comment;
