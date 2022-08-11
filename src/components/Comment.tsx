import {
  createStyles,
  Text,
  Avatar,
  Group,
  TypographyStylesProvider,
  Paper,
} from "@mantine/core";
import { NonUser } from "../util/prisma-types";

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
      <Group>
        <Avatar
          src={
            user.avatarUri ||
            `https://avatars.dicebear.com/api/identicon/${user.id}.png`
          }
          alt={user.username}
          radius="xl"
        />
        <div>
          <Text size="sm">{user.username}</Text>
          <Text size="xs" color="dimmed">
            {new Date(postedAt).toLocaleDateString()}
          </Text>
        </div>
      </Group>
      <TypographyStylesProvider className={classes.body}>
        <div
          className={classes.content}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </TypographyStylesProvider>
    </Paper>
  );
};

export default Comment;
