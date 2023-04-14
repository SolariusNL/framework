import Picker from "@emoji-mart/react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Divider,
  Drawer,
  NavLink,
  Paper,
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
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import sanitizeInappropriateContent from "../components/ReconsiderationPrompt";
import ShadedCard from "../components/ShadedCard";
import SocketContext from "../contexts/Socket";
import SidebarTabNavigation from "../layouts/SidebarTabNavigation";
import useChatStore from "../stores/useChatStore";
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
  }, [friendsSearch]);

  useEffect(() => {
    getUnreadMessages();
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
    }

    return () => {
      socket?.off("@user/chat");
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
        {friendsList}
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
              {friendsList}
            </SidebarTabNavigation.Sidebar>
          )}
          <SidebarTabNavigation.Content>
            {conversationOpen ? (
              <ShadedCard>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={getMediaUrl(conversating?.avatarUri!)}
                      size="md"
                      className="rounded-full"
                    />
                    <div>
                      <Text size="lg">
                        {conversating?.alias || conversating?.username}
                      </Text>
                      <Text size="sm" color="dimmed">
                        @{conversating?.username}
                      </Text>
                    </div>
                  </div>
                  <Text size="sm" color="dimmed" weight="500">
                    Last seen{" "}
                    {getRelativeTime(new Date(conversating?.lastSeen!))}
                  </Text>
                </div>
                <Divider mt="lg" mb="lg" />
                <div
                  style={{
                    height: "calc(100vh - 300px)",
                    display: "flex",
                    flexDirection: "column-reverse",
                    overflowX: "hidden",
                    overflowY: "auto",
                  }}
                  ref={messagesRef}
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
                              ? theme.colors.dark[9]
                              : theme.colors.gray[1],
                          borderRadius: theme.radius.md,
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
