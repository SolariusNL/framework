import Picker from "@emoji-mart/react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Card,
  Indicator,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useHotkeys } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiChatAlt2,
  HiChevronDown,
  HiChevronUp,
  HiCog,
  HiEmojiHappy,
  HiXCircle,
} from "react-icons/hi";
import SocketContext from "../contexts/Socket";
import useAmoled from "../stores/useAmoled";
import useChatStore from "../stores/useChatStore";
import usePreferences from "../stores/usePreferences";
import { useOnClickOutside } from "../util/click-outside";
import clsx from "../util/clsx";
import getMediaUrl from "../util/get-media";
import { ChatMessage, NonUser } from "../util/prisma-types";
import { getMyFriends } from "../util/universe/friends";
import ChatMsg from "./Chat/ChatMessage";
import LoadingIndicator from "./LoadingIndicator";
import ModernEmptyState from "./ModernEmptyState";
import sanitizeInappropriateContent from "./ReconsiderationPrompt";
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
  const [conversationDataLoading, setConversationDataLoading] =
    useState<boolean>(true);
  const { enabled: amoled } = useAmoled();
  const { preferences } = usePreferences();
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
  const messagesRef = useRef<HTMLDivElement>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>();

  useOnClickOutside(pickerRef, () => setPicker(false));

  const getConversationData = async (id: number) => {
    setConversationDataLoading(true);
    const res = await fetch(`/api/chat/conversation/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setConversationDataLoading(false);
        setConversationData(data);
      });
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
    if (typeof window !== "undefined") {
      const audio = new Audio("/audio/chat_message.wav");
      setAudio(audio);
    }
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
        if (!document.hasFocus() && preferences["@chat/bell"] && audio) {
          try {
            audio.play();
          } catch {}
        }
        if (currentConversation === data.authorId) {
          setConversationData((prev) => [...prev, data]);
          markAsRead();
          setTimeout(() => {
            messagesRef.current?.scrollTo({
              top: messagesRef.current?.scrollHeight,
              behavior: "smooth",
            });
          }, 300);
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

      socket?.on("@user/chat/read", (data) => {
        if (currentConversation === data.authorId) {
          setConversationData((prev) =>
            prev.map((message) =>
              message.id === data.id ? { ...message, read: true } : message
            )
          );
        }
      });

      socket?.on("@user/chat/delete", (data) => {
        if (currentConversation && conversationData) {
          setConversationData((prev) =>
            prev.filter((message) => message.id !== data.id)
          );
        }
      });
    }

    return () => {
      socket?.off("@user/chat");
      socket?.off("@user/chat/read");
      socket?.off("@user/chat/delete");
    };
  }, [socket, currentConversation]);

  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  if (router.pathname === "/chat") return null;
  return (
    <motion.div
      className={colorScheme}
      initial={{
        height: "100%",
      }}
      animate={{
        height: "auto",
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      <Card
        sx={{
          borderBottomLeftRadius: "0 !important",
          borderBottomRightRadius: "0 !important",
          width: 300,
          paddingBottom: "0 !important",
          overflow: "visible",
          borderBottom: "none",
        }}
        className="dark:bg-black"
        withBorder
        p="md"
      >
        <Card.Section
          px={10}
          py={6}
          withBorder={chatOpened}
          className="dark:hover:bg-zinc-900 hover:bg-gray-100 transition-all cursor-pointer rounded-t-md"
          onClick={() => setChatOpened(!chatOpened)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
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
                  zIndex={1}
                  color="red"
                  ml={10}
                  mr={10}
                >
                  <></>
                </Indicator>
              )}
              <Text weight={600} size="sm">
                Messages
              </Text>
            </div>
            <ActionIcon onClick={() => setChatOpened(!chatOpened)}>
              {chatOpened ? <HiChevronDown /> : <HiChevronUp />}
            </ActionIcon>
          </div>
        </Card.Section>
        <AnimatePresence>
          {chatOpened && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: conversationOpen ? "418px" : "330px" }}
              exit={{ height: 0 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 100,
              }}
            >
              <AnimatePresence>
                {conversationOpen ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: conversationData && "auto" }}
                    exit={{ height: 0 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    }}
                  >
                    <Card.Section px={16} py={10}>
                      <div className="flex justify-between items-center">
                        <Anchor
                          className="flex gap-1 items-center"
                          size="sm"
                          onClick={() => {
                            setConversationOpen(false);
                            setConversating(null);
                            setCurrentConversation(null);
                            setConversationData([]);
                          }}
                        >
                          <HiArrowLeft />
                          Go back
                        </Anchor>
                        <Link
                          href={`/profile/${conversating?.username}`}
                          passHref
                        >
                          <div className="flex gap-2 items-center group cursor-pointer">
                            <Text
                              color="dimmed"
                              size="sm"
                              className="group-hover:font-semibold transition-all group-hover:text-sky-600 dark:group-hover:text-sky-400"
                            >
                              @{conversating?.username}
                            </Text>
                            <Avatar
                              src={conversating?.avatarUri}
                              size="sm"
                              radius="xl"
                            />
                          </div>
                        </Link>
                      </div>
                    </Card.Section>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    }}
                  >
                    <Card.Section
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : "#FFF",
                      })}
                      className={clsx(amoled && "bg-black")}
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
                        rightSection={
                          <Link href="/settings/application" passHref>
                            <ActionIcon radius="xl" size="sm">
                              <HiCog />
                            </ActionIcon>
                          </Link>
                        }
                      />
                    </Card.Section>
                  </motion.div>
                )}
              </AnimatePresence>
              <Card.Section
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[9]
                      : "#FFF",
                })}
                className={clsx(amoled && "bg-black")}
                p={conversationOpen ? "md" : 0}
                withBorder={conversationOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {conversationOpen ? (
                    <motion.div
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      exit={{
                        y: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      key="conversation"
                    >
                      <div
                        style={{
                          height: 290,
                          display: "flex",
                          flexDirection: "column-reverse",
                          overflowX: "hidden",
                          overflowY: "auto",
                        }}
                        ref={messagesRef}
                        className="dark:scrollbar-track-zinc-900/20 dark:scrollbar-thumb-zinc-700 scrollbar-track-gray-100/20 scrollbar-thumb-gray-500 scrollbar-thumb-rounded-md scrollbar-thin"
                      >
                        <Stack spacing={12}>
                          {conversationDataLoading ? (
                            <div className="w-full flex justify-center">
                              <LoadingIndicator />
                            </div>
                          ) : (
                            conversationData &&
                            conversationData
                              .sort(
                                (a, b) =>
                                  new Date(a.createdAt).getTime() -
                                  new Date(b.createdAt).getTime()
                              )
                              .map((message) => (
                                <ChatMsg message={message} key={message.id} />
                              ))
                          )}
                          {!conversationDataLoading &&
                            conversationData?.length === 0 && (
                              <ModernEmptyState
                                title="No messages"
                                body="Send the first message to start a conversation."
                              />
                            )}
                        </Stack>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{
                        y: conversationOpen ? 20 : 0,
                      }}
                      animate={{ x: 0 }}
                      exit={{
                        y: conversationOpen ? 20 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      key="friends"
                      style={{
                        height: 290,
                        overflowX: "hidden",
                        overflowY: "auto",
                      }}
                    >
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
                              {unreadMessages[friend.id] > 0 ? (
                                <Badge
                                  variant="filled"
                                  color="red"
                                  sx={{ width: 24, height: 24, padding: 0 }}
                                  className="mr-2"
                                >
                                  {String(unreadMessages[friend.id])}
                                </Badge>
                              ) : (
                                <Avatar
                                  src={getMediaUrl(friend.avatarUri)}
                                  size={24}
                                  className="mr-2 rounded-full"
                                />
                              )}

                              <div className="flex items-center">
                                <Text size="sm" mr={6}>
                                  {friend.alias || friend.username}
                                </Text>
                                <Text size="sm" color="dimmed" mr={16}>
                                  @{friend.username}
                                </Text>
                              </div>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card.Section>
              {conversationOpen && (
                <Card.Section
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[9]
                        : "#FFF",
                  })}
                  className={clsx(amoled && "bg-black")}
                >
                  <form
                    onSubmit={messageForm.onSubmit((values) =>
                      sanitizeInappropriateContent(values.message, () =>
                        sendMessage(values)
                      )
                    )}
                  >
                    <TextInput
                      placeholder="Type a message..."
                      className="flex-1 h-12 items-center flex justify-between w-full"
                      classNames={{
                        wrapper: "w-full flex",
                      }}
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
                          <div
                            ref={pickerRef}
                            style={{ position: "relative" }}
                            className="pr-2"
                          >
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
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default Chat;
