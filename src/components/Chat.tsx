import Picker from "@emoji-mart/react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Card,
  Indicator,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useHotkeys } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiChatAlt2,
  HiChevronDown,
  HiChevronUp,
  HiEmojiHappy,
  HiXCircle,
} from "react-icons/hi";
import SocketContext from "../contexts/Socket";
import useAuthorizedUserStore from "../stores/useAuthorizedUser";
import useChatStore from "../stores/useChatStore";
import getMediaUrl from "../util/getMedia";
import { ChatMessage, NonUser } from "../util/prisma-types";
import { getMyFriends } from "../util/universe/friends";
import { useOnClickOutside } from "../util/useOnClickOutside";
import ShadedButton from "./ShadedButton";

const Chat: React.FC = () => {
  const {
    opened: chatOpened,
    setOpened: setChatOpened,
    currentConversation,
    setCurrentConversation,
  } = useChatStore();
  const [friends, setFriends] = useState<NonUser[]>([]);
  const [friendsSearch, setFriendsSearch] = useState("");
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversating, setConversating] = useState<NonUser | null>(null);
  const [conversationData, setConversationData] = useState<ChatMessage[]>([]);
  const { user } = useAuthorizedUserStore()!;
  const messageForm = useForm<{
    message: string;
  }>({
    initialValues: {
      message: "",
    },
    validate: {
      message: (value) => {
        if (!value) return "Message cannot be empty";
        if (value.length > 1000)
          return "Message cannot be longer than 1000 characters";
      },
    },
  });
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {}
  );
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [picker, setPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const socket = useContext(SocketContext);

  useOnClickOutside(pickerRef, () => setPicker(false));

  const getConversationData = async (id: number) => {
    const res = await fetch(`/api/chat/conversation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });

    const data = await res.json();
    setConversationData(data);
  };

  const sendMessage = async (values: { message: string }) => {
    const { message } = values;
    if (conversating) {
      const res = await fetch(
        `/api/chat/conversation/${conversating.id}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: String(getCookie(".frameworksession")),
          },
          body: JSON.stringify({
            content: message,
          }),
        }
      );

      const data = await res.json();
      setConversationData((prev) => [...prev, data]);
      messageForm.reset();
    }
  };

  const getUnreadMessages = async () => {
    const res = await fetch("/api/chat/unread", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });

    const data = await res.json();
    setUnreadMessages(
      Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          (value as ChatMessage[]).length,
        ])
      )
    );
  };

  const markAsRead = async () => {
    await fetch(`/api/chat/conversation/${conversating?.id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });

    setUnreadMessages((prev) => {
      const copy = { ...prev };
      delete copy[conversating?.id!];
      return copy;
    });
  };

  useHotkeys([
    [
      "Slash",
      () => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      },
    ],
  ]);

  useEffect(() => {
    getMyFriends(1, friendsSearch).then((friends) => {
      setFriends(friends);
      if (currentConversation) {
        setConversating(
          friends.find((friend) => friend.id === currentConversation) as NonUser
        );
        setConversationOpen(true);
      }
    });
    getUnreadMessages();
  }, [chatOpened, friendsSearch]);

  useEffect(() => {
    getUnreadMessages();
  }, []);

  useEffect(() => {
    if (conversating) {
      getConversationData(conversating.id);
      markAsRead();
    }
  }, [conversating]);

  React.useEffect(() => {
    if (socket) {
      socket?.on("@user/chat", (data) => {
        if (currentConversation === data.authorId) {
          setConversationData((prev) => [...prev, data]);
          markAsRead();
        } else {
          showNotification({
            title: "New chat",
            message: `You have a new chat from ${data.author.username}.`,
            icon: <HiChatAlt2 />,
          });
          setUnreadMessages((prev) => ({
            ...prev,
            [data.authorId]: prev[data.authorId] ? prev[data.authorId] + 1 : 1,
          }));
        }
      });
    }

    return () => {
      socket?.off("@user/chat");
    };
  }, [socket, currentConversation]);

  return (
    <Card
      sx={{
        borderBottomLeftRadius: "0 !important",
        borderBottomRightRadius: "0 !important",
        width: 280,
        ...(chatOpened && {
          paddingBottom: "0 !important",
        }),
        overflow: "visible",
      }}
      withBorder
      p="md"
    >
      <Card.Section px={10} py={6} withBorder={chatOpened}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HiChatAlt2 size={18} />
            <Text weight={600} size="sm">
              Chat
            </Text>
            {Object.values(unreadMessages).reduce(
              (prev, curr) => prev + curr,
              0
            ) > 0 && (
              <Indicator
                inline
                label={String(
                  Object.values(unreadMessages).reduce(
                    (prev, curr) => prev + curr,
                    0
                  )
                )}
                size={16}
                color="red"
                ml={10}
              >
                <></>
              </Indicator>
            )}
          </div>
          <ActionIcon onClick={() => setChatOpened(!chatOpened)}>
            {chatOpened ? <HiChevronDown /> : <HiChevronUp />}
          </ActionIcon>
        </div>
      </Card.Section>
      {chatOpened && (
        <>
          {conversationOpen && (
            <Card.Section px={16} py={10}>
              <div className="flex justify-between items-center">
                <Anchor
                  className="flex gap-1 items-center"
                  size="sm"
                  onClick={() => {
                    setConversationOpen(false);
                    setConversating(null);
                    setCurrentConversation(null);
                  }}
                >
                  <HiArrowLeft />
                  Go back
                </Anchor>
                <div className="flex gap-2 items-center">
                  <Text color="dimmed" size="sm">
                    @{conversating?.username}
                  </Text>
                  <Avatar src={conversating?.avatarUri} size="sm" radius="xl" />
                </div>
              </div>
            </Card.Section>
          )}
          {!conversationOpen && (
            <Card.Section
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[1],
              })}
              px={4}
              py={2}
            >
              <TextInput
                placeholder="Search for friends..."
                className="flex-1"
                variant="unstyled"
                sx={(theme) => ({
                  lineHeight: "0px",
                  "& input": {
                    paddingLeft: theme.spacing.sm,
                    paddingRight: theme.spacing.sm,
                  },
                  "&::placeholder": {
                    paddingLeft: theme.spacing.sm,
                    paddingRight: theme.spacing.sm,
                  },
                })}
                autoComplete="off"
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
              />
            </Card.Section>
          )}
          <Card.Section
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[9]
                  : theme.colors.gray[1],
            })}
            p={conversationOpen ? "md" : 0}
            withBorder={conversationOpen}
          >
            {conversationOpen ? (
              <div
                style={{
                  height: 210,
                  display: "flex",
                  flexDirection: "column-reverse",
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <Stack spacing={12}>
                  {conversationData &&
                    conversationData.map((message) =>
                      message.authorId === user?.id ? (
                        <Paper
                          sx={(theme) => ({
                            backgroundColor:
                              theme.colorScheme === "dark"
                                ? theme.colors.blue[9]
                                : theme.colors.blue[1],
                            textAlign: "right",
                            width: "fit-content",
                            alignSelf: "flex-end",
                          })}
                          p="sm"
                        >
                          <Text size="sm">{message.content}</Text>
                        </Paper>
                      ) : (
                        <Paper
                          sx={(theme) => ({
                            backgroundColor:
                              theme.colorScheme === "dark"
                                ? theme.colors.dark[8]
                                : theme.colors.gray[1],
                            textAlign: "left",
                            width: "fit-content",
                            alignSelf: "flex-start",
                          })}
                          p="sm"
                        >
                          <Text size="sm">{message.content}</Text>
                        </Paper>
                      )
                    )}
                </Stack>
              </div>
            ) : (
              <>
                <Stack spacing={5} p={0}>
                  {friends.map((friend) => (
                    <ShadedButton
                      key={friend.id}
                      onClick={() => {
                        setConversating(friend);
                        setConversationOpen(true);
                        setCurrentConversation(friend.id);
                      }}
                      className="rounded-none px-4"
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={getMediaUrl(friend.avatarUri)}
                          size={24}
                          className="mr-2 rounded-full"
                        />
                        <div className="flex items-center">
                          <Text size="sm" mr={6}>
                            {friend.alias || friend.username}
                          </Text>
                          <Text size="sm" color="dimmed" mr={16}>
                            @{friend.username}
                          </Text>
                        </div>
                        {unreadMessages[friend.id] > 0 && (
                          <Indicator
                            inline
                            label={String(unreadMessages[friend.id])}
                            size={16}
                            color="red"
                          >
                            <></>
                          </Indicator>
                        )}
                      </div>
                    </ShadedButton>
                  ))}
                  {friends.length === 0 && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 p-8">
                        <HiXCircle size={12} className="flex-shrink-0" />
                        <Text size="sm" color="dimmed">
                          No friends found
                        </Text>
                      </div>
                    </div>
                  )}
                </Stack>
              </>
            )}
          </Card.Section>
          {conversationOpen && (
            <Card.Section
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[1],
              })}
            >
              <form onSubmit={messageForm.onSubmit(sendMessage)}>
                <TextInput
                  placeholder="Type a message..."
                  className="flex-1"
                  variant="unstyled"
                  sx={(theme) => ({
                    lineHeight: "0px",
                    "& input": {
                      paddingLeft: theme.spacing.sm,
                      paddingRight: theme.spacing.md,
                      width: "calc(100% - 20px)",
                    },
                    "&::placeholder": {
                      paddingLeft: theme.spacing.sm,
                      paddingRight: theme.spacing.md,
                    },
                  })}
                  autoComplete="off"
                  ref={messageInputRef}
                  rightSection={
                    <>
                      <div ref={pickerRef} style={{ position: "relative" }}>
                        <Box
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: 50,
                          }}
                        >
                          {picker && (
                            <Picker
                              navPosition="bottom"
                              native
                              onEmojiSelect={(emoji: any) => {
                                messageForm.setFieldValue(
                                  "message",
                                  messageForm.values.message + emoji.native
                                );
                              }}
                              previewPosition="none"
                              autoFocus
                            />
                          )}
                        </Box>
                        <ActionIcon onClick={() => setPicker(!picker)}>
                          <HiEmojiHappy />
                        </ActionIcon>
                      </div>
                    </>
                  }
                  {...messageForm.getInputProps("message")}
                />
              </form>
            </Card.Section>
          )}
        </>
      )}
    </Card>
  );
};

export default Chat;
