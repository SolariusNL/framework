import ShadedCard from "@/components/shaded-card";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import useReportAbuse from "@/stores/useReportAbuse";
import { NonUser } from "@/util/prisma-types";
import { getRelativeTime } from "@/util/relative-time";
import {
  ActionIcon,
  Button,
  createStyles,
  Menu,
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
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import Owner from "./owner";

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },

  body: {
    paddingLeft: 51,
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
  const [oldMsg, setOldMsg] = useState(body);
  const { setOpened: openReport } = useReportAbuse();

  return (
    <>
      <ShadedCard className={classes.comment}>
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
            <div className="justify-between flex mb-4">
              <div className="flex gap-2">
                <Owner user={user} />
              </div>
              <div>
                <Menu width={200}>
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
                        onClick={() => openReport(true, user)}
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
              <>
                <Text size="sm">
                  {msg.replace(/\s/g, "").length == 0 ? (
                    <span className="text-dimmed">No content</span>
                  ) : (
                    msg
                  )}
                </Text>
                <Tooltip
                  label={new Date(postedAt).toLocaleString()}
                  className="w-fit"
                >
                  <Text size="sm" color="dimmed" className="mt-2 w-fit">
                    {getRelativeTime(new Date(postedAt))}
                  </Text>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </ShadedCard>
    </>
  );
};

export default Comment;
