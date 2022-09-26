import {
  ActionIcon,
  Avatar,
  createStyles,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
  TypographyStylesProvider
} from "@mantine/core";
import {
  HiChevronDown,
  HiChevronUp,
  HiGift,
  HiShieldCheck
} from "react-icons/hi";
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <Text size="sm" weight={500} mr={6}>
                  {user.username}
                </Text>
                {user.role == "ADMIN" && (
                  <HiShieldCheck title="Framework Staff Member" />
                )}
                {user.premium && <HiGift title="Premium Member" />}
              </div>
              <Tooltip
                label={new Date(postedAt).toISOString()}
                position="bottom"
                openDelay={250}
              >
                <Text size="xs" color="dimmed">
                  {getRelativeTime(new Date(postedAt))}
                </Text>
              </Tooltip>
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
