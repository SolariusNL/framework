import {
  ActionIcon,
  Avatar,
  Button,
  createStyles,
  Menu,
  Paper,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { useState } from "react";
import {
  HiChevronDown,
  HiChevronUp,
  HiClipboard,
  HiDotsVertical,
  HiFlag,
  HiGift,
  HiPencil,
  HiShieldCheck,
  HiTrash,
} from "react-icons/hi";
import { useFrameworkUser } from "../contexts/FrameworkUser";
import { NonUser } from "../util/prisma-types";
import { getRelativeTime } from "../util/relativeTime";
import ReportUser from "./ReportUser";
import Stateful from "./Stateful";
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
  id: string;
  destroy: () => void;
  gameId: number;
}

const Comment = ({
  postedAt,
  body,
  user,
  id,
  destroy,
  gameId,
}: CommentProps) => {
  const { classes } = useStyles();
  const currentUser = useFrameworkUser();
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(body);
  const [opened, setOpened] = useState(false);
  const [oldMsg, setOldMsg] = useState(body);

  return (
    <>
      <ReportUser user={user} opened={opened} setOpened={setOpened} />
      <Paper className={classes.comment}>
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
          <div className="w-full">
            <div className="justify-between flex">
              <div className="flex gap-2">
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
                <div className="flex flex-col ml-2 gap-1">
                  <div className="flex items-center gap-2">
                    <Text size="sm" weight={500} mr={6}>
                      {user.username}
                    </Text>
                    {user.role == "ADMIN" && (
                      <HiShieldCheck title="Framework Staff Member" />
                    )}
                    {!user.premium && <HiGift title="Premium Member" />}
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
              </div>
              <div>
                <Menu>
                  <Menu.Target>
                    <ActionIcon>
                      <HiDotsVertical />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {user.id == currentUser?.id && (
                      <>
                        <Menu.Label>Comment actions</Menu.Label>
                        <Menu.Item
                          icon={<HiPencil />}
                          onClick={() => setEditing(true)}
                        >
                          Edit comment
                        </Menu.Item>
                        <Menu.Item
                          icon={<HiTrash />}
                          color="red"
                          onClick={async () => {
                            await fetch(
                              `/api/games/${gameId}/comment/${id}/delete`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: String(
                                    getCookie(".frameworksession")
                                  ),
                                },
                              }
                            );

                            destroy();
                          }}
                        >
                          Delete comment
                        </Menu.Item>
                        <Menu.Divider />
                      </>
                    )}
                    <Menu.Item
                      icon={<HiClipboard />}
                      onClick={() => {
                        navigator.clipboard.writeText(msg);
                      }}
                    >
                      Copy comment
                    </Menu.Item>
                    {user.id != currentUser?.id && (
                      <Menu.Item
                        icon={<HiFlag />}
                        color="red"
                        onClick={() => setOpened(true)}
                      >
                        Report
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>
            {editing ? (
              <>
                <Textarea
                  className={classes.body}
                  value={msg}
                  onChange={(e) => setMsg(e.currentTarget.value)}
                  maxLength={500}
                />
                <Button.Group className={classes.body}>
                  <Button
                    fullWidth
                    variant="subtle"
                    onClick={async () => {
                      setEditing(false);
                      setOldMsg(msg);

                      await fetch(`/api/games/${gameId}/comment/${id}/edit`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: String(getCookie(".frameworksession")),
                        },
                        body: JSON.stringify({
                          message: msg,
                        }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.error) {
                            setMsg(oldMsg);
                          }
                        });
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    fullWidth
                    variant="subtle"
                    onClick={() => {
                      setMsg(oldMsg);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Button.Group>
              </>
            ) : (
              <Text className={classes.body}>
                {msg.replace(/\s/g, "").length == 0 ? (
                  <span className="text-gray-400">No content</span>
                ) : (
                  msg
                )}
              </Text>
            )}
          </div>
        </div>
      </Paper>
    </>
  );
};

export default Comment;
