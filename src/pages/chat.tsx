import Picker from "@emoji-mart/react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Drawer,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useHotkeys } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { useContext, useEffect, useRef, useState } from "react";
import { HiChatAlt2, HiEmojiHappy } from "react-icons/hi";
import ChatMsg from "../components/Chat/ChatMessage";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import Owner from "../components/Owner";
import sanitizeInappropriateContent from "../components/ReconsiderationPrompt";
import ShadedCard from "../components/ShadedCard";
import SocketContext from "../contexts/Socket";
import SidebarTabNavigation from "../layouts/SidebarTabNavigation";
import useChatStore from "../stores/useChatStore";
import usePreferences from "../stores/usePreferences";
import authorizedRoute from "../util/auth";
import { useOnClickOutside } from "../util/click-outside";
import getMediaUrl from "../util/get-media";
import useMediaQuery from "../util/media-query";
import { ChatMessage, NonUser, User } from "../util/prisma-types";
import { getRelativeTime } from "../util/relative-time";
import { getMyFriends } from "../util/universe/friends";

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [drawer, setDrawer] = useState(false);
  const mobile = useMediaQuery("768");
  const { currentConversation, setCurrentConversation } = useChatStore();
  const { preferences } = usePreferences();
  const [friends, setFriends] = useState<NonUser[]>([]);
  const [friendsSearch, setFriendsSearch] = useState("");
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversating, setConversating] = useState<NonUser | null>(null);
  const [conversationData, setConversationData] = useState<ChatMessage[]>([]);
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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

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
    if (!conversating) return;

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
        if (friends.find((friend) => friend.id === currentConversation)) {
          setConversationOpen(true);
        } else {
          setConversationOpen(false);
        }
      }
    });
    getUnreadMessages();
  }, [friendsSearch]);

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

  useEffect(() => {
    if (socket) {
      socket?.on("@user/chat", (data) => {
        if (!document.hasFocus() && preferences["message-bell"] && audio) {
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
          console.log("read!");
          setConversationData((prev) =>
            prev.map((message) =>
              message.authorId === user.id
                ? { ...message, seen: true }
                : message
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
      socket?.off("@user/chat/delete");
      socket?.off("@user/chat/read");
    };
  }, [socket, currentConversation]);

  const friendsList = (
    <Stack spacing="sm">
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
      {friends.map((friend) => (
        <NavLink
          key={friend.id}
          onClick={() => {
            setConversating(friend);
            setConversationOpen(true);
            setCurrentConversation(friend.id);
          }}
          className="rounded-md"
          label={friend.username}
          description={
            new Date(friend.lastSeen).getTime() >
            new Date().getTime() - 1000 * 60 * 5
              ? "Currently online"
              : `Last seen ${getRelativeTime(new Date(friend.lastSeen))}`
          }
          icon={
            unreadMessages[friend.id] > 0 ? (
              <Badge
                variant="filled"
                color="red"
                sx={{ width: 26, height: 26, padding: 0 }}
              >
                {String(unreadMessages[friend.id])}
              </Badge>
            ) : (
              <Avatar
                src={getMediaUrl(friend.avatarUri)}
                size="sm"
                className="rounded-full"
              />
            )
          }
          active={conversating?.id === friend.id}
        />
      ))}
      {friends.length == 0 && (
        <ShadedCard>
          <ModernEmptyState
            title="No friends yet"
            body="Search for friends to chat with!"
          />
        </ShadedCard>
      )}
    </Stack>
  );

  return (
    <>
      <Drawer
        position="right"
        opened={drawer}
        onClose={() => setDrawer(false)}
        zIndex={10000}
        padding="md"
      >
        <ScrollArea
          sx={{
            height: "calc(100vh - 100px)",
          }}
        >
          {friendsList}
        </ScrollArea>
      </Drawer>
      <Framework
        beta
        activeTab="chat"
        user={user}
        modernTitle="Chat"
        modernSubtitle="Chat with your friends in real time."
        {...(mobile && {
          actions: [
            [
              <Burger
                opened={drawer}
                onClick={() => setDrawer(!drawer)}
                size="sm"
                key="friends-dropdown"
              />,
              () => setDrawer(!drawer),
            ],
          ],
        })}
      >
        <SidebarTabNavigation>
          {!mobile && (
            <SidebarTabNavigation.Sidebar>
              <ScrollArea sx={{ height: "calc(100vh - 200px)" }}>
                {friendsList}
              </ScrollArea>
            </SidebarTabNavigation.Sidebar>
          )}
          <SidebarTabNavigation.Content>
            {conversationOpen ? (
              <ShadedCard>
                <ShadedCard
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[8]
                        : theme.colors.gray[1],
                  })}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Owner user={conversating!} />
                    </div>
                    <Text size="sm" color="dimmed" weight="500">
                      Last seen{" "}
                      {getRelativeTime(new Date(conversating?.lastSeen!))}
                    </Text>
                  </div>
                </ShadedCard>
                <div
                  style={{
                    height: "calc(100vh - 300px)",
                    display: "flex",
                    flexDirection: "column-reverse",
                    overflowX: "hidden",
                    overflowY: "auto",
                  }}
                  ref={messagesRef}
                  className="dark:scrollbar-track-zinc-900/20 dark:scrollbar-thumb-zinc-700 scrollbar-track-gray-100/20 scrollbar-thumb-gray-500 scrollbar-thumb-rounded-md scrollbar-thin"
                >
                  <Stack spacing={12} pb="md" pt="md">
                    {conversationData &&
                      conversationData
                        .sort((a, b) => {
                          const aA = new Date(a.createdAt);
                          const bB = new Date(b.createdAt);
                          return aA.getTime() - bB.getTime();
                        })
                        .map((message) => (
                          <ChatMsg message={message} key={message.id} />
                        ))}
                    {conversationData?.length === 0 && (
                      <ModernEmptyState
                        title="No messages"
                        body="Send the first message to start a conversation."
                      />
                    )}
                    <form
                      onSubmit={messageForm.onSubmit((values) =>
                        sanitizeInappropriateContent(values.message, () =>
                          sendMessage(values)
                        )
                      )}
                      className="mt-10"
                    >
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
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          zIndex: 100,
                          padding: theme.spacing.md,
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[8]
                              : theme.colors.gray[0],
                          borderBottomLeftRadius: theme.radius.md,
                          borderBottomRightRadius: theme.radius.md,
                          borderTopWidth: 1,
                          borderTopColor:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[8]
                              : theme.colors.gray[1],
                          borderTopStyle: "solid",
                        })}
                        autoComplete="off"
                        ref={messageInputRef}
                        rightSection={
                          <>
                            <div
                              ref={pickerRef}
                              style={{ position: "relative" }}
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
                                        messageForm.values.message +
                                          emoji.native
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
                  </Stack>
                </div>
              </ShadedCard>
            ) : (
              <ModernEmptyState
                title="No conversation selected"
                body="Select a conversation to start chatting."
              />
            )}
          </SidebarTabNavigation.Content>
        </SidebarTabNavigation>
      </Framework>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default Chat;
