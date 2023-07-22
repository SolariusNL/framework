import ChatMsg from "@/components/Chat/ChatMessage";
import ImageUploader from "@/components/ImageUploader";
import InlineError from "@/components/InlineError";
import InlineUserCard from "@/components/InlineUserCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ModernEmptyState from "@/components/ModernEmptyState";
import Owner from "@/components/Owner";
import sanitizeInappropriateContent from "@/components/ReconsiderationPrompt";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import SocketContext from "@/contexts/Socket";
import Rocket from "@/icons/Rocket";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import useAmoled from "@/stores/useAmoled";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useChatStore from "@/stores/useChatStore";
import useExperimentsStore from "@/stores/useExperimentsStore";
import useFastFlags from "@/stores/useFastFlags";
import usePreferences from "@/stores/usePreferences";
import IResponseBase from "@/types/api/IResponseBase";
import { useOnClickOutside } from "@/util/click-outside";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import getFileFromImg from "@/util/files";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { Preferences } from "@/util/preferences";
import { ChatMessage, NonUser } from "@/util/prisma-types";
import { getMyFriends } from "@/util/universe/friends";
import Picker from "@emoji-mart/react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Divider,
  Indicator,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useHotkeys } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { ChatConversation } from "@prisma/client";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  HiArrowRight,
  HiArrowSmDown,
  HiChatAlt2,
  HiCheckCircle,
  HiChevronDown,
  HiChevronUp,
  HiCog,
  HiEmojiHappy,
  HiInformationCircle,
  HiLogout,
  HiPencil,
  HiPlus,
  HiSearch,
  HiSparkles,
  HiXCircle,
} from "react-icons/hi";
import { UserItemComponent } from "./Admin/Pages/Activity";

type ChatConversationWithParticipants = ChatConversation & {
  participants: NonUser[];
  owner: NonUser;
};
type CreateConversationForm = {
  name: string;
  participants: number[];
};

const Chat: React.FC = () => {
  const {
    opened: chatOpened,
    setOpened: setChatOpened,
    currentConversation,
    setCurrentConversation,
  } = useChatStore();
  const [friends, setFriends] = useState<NonUser[]>([]);
  const [conversations, setConversations] = useState<
    ChatConversationWithParticipants[]
  >([]);
  const [friendsSearch, setFriendsSearch] = useState("");
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversation, setConversation] =
    useState<ChatConversationWithParticipants | null>();
  const [addUserOpened, setAddUserOpened] = useState(false);
  const [conversationData, setConversationData] = useState<ChatMessage[]>([]);
  const [conversationDataLoading, setConversationDataLoading] =
    useState<boolean>(true);
  const { enabled: amoled } = useAmoled();
  const { preferences } = usePreferences();
  const { flags } = useFastFlags();
  const { experiments } = useExperimentsStore();
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
  const createConvoForm = useForm<CreateConversationForm>({
    initialValues: {
      name: "",
      participants: [],
    },
    validate: {
      name: (value) => {
        if (value.length > 32)
          return "Name cannot be longer than 32 characters";
      },
      participants: (value) => {
        if (value.length === 0) return "You must select at least one user";
      },
    },
  });
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {}
  );
  const [createConvoOpened, setCreateConvoOpened] = useState(false);
  const [conversationDetailsOpened, setConversationDetailsOpened] =
    useState(false);
  const [changeNameModalOpened, setChangeNameModalOpened] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);
  const iconRef = useRef<HTMLImageElement | null>();
  const [picker, setPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const socket = useContext(SocketContext);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>();
  const [newGroupName, setNewGroupName] = useState(conversation?.name ?? "");
  const { user } = useAuthorizedUserStore();
  let previousTimestamp: number | null = null;

  useOnClickOutside(pickerRef, () => setPicker(false));

  const getConversationData = async (id: string) => {
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
    messageForm.reset();

    if (conversation) {
      const res = await fetch(
        `/api/chat/conversation/${conversation.id}/send`,
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
      setConversations((prev) =>
        prev.map((convo) =>
          convo.id === conversation.id
            ? {
                ...conversation,
                updatedAt: new Date(),
              }
            : convo
        )
      );
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
    await fetch(`/api/chat/conversation/${conversation?.id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });

    setUnreadMessages((prev) => {
      const copy = { ...prev };
      delete copy[conversation?.id!];
      return copy;
    });
  };

  const fetchConversations = async () => {
    await fetchJson<
      IResponseBase<{
        conversations: ChatConversationWithParticipants[];
      }>
    >("/api/chat/conversations", {
      method: "GET",
      auth: true,
    }).then((res) => {
      setConversations(res.data?.conversations!);
      if (currentConversation) {
        setConversation(
          res.data?.conversations.find(
            (conversation) => conversation.id! === currentConversation
          ) as ChatConversationWithParticipants
        );
        if (
          !res.data?.conversations.find(
            (conversation) => conversation.id! === currentConversation
          )
        ) {
          setCurrentConversation(null);
          setConversationOpen(false);
          setConversationData([]);
        } else {
          setConversationOpen(true);
        }
      }
    });
  };

  const uploadIcon = async () => {
    if (uploadedIcon) {
      const form = new FormData();
      form.append("convo", getFileFromImg(uploadedIcon));

      fetch(`/api/media/upload/convo/${conversation?.id}`, {
        method: "POST",
        headers: {
          authorization: String(getCookie(".frameworksession")),
        },
        body: form,
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setConversation((prev) => ({
              ...prev!,
              iconUri: uploadedIcon,
            }));
            setUploadedIcon(null);
            showNotification({
              title: "Icon uploaded",
              message:
                "Icon uploaded successfully. It may take a few minutes to propagate.",
              icon: <HiCheckCircle />,
            });
          }
        })
        .catch(() => {
          showNotification({
            title: "Failed to upload icon",
            message: "Failed to upload icon. Please try again.",
            icon: <HiXCircle />,
          });
        });
    }
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
    getMyFriends(1).then((friends) => {
      setFriends(friends);
    });
    getUnreadMessages();
    fetchConversations();
  }, [chatOpened, friendsSearch]);

  useEffect(() => {
    getUnreadMessages();
    if (typeof window !== "undefined") {
      const audio = new Audio("/audio/chat_message.wav");
      setAudio(audio);
    }
  }, []);

  useEffect(() => {
    if (conversation) {
      getConversationData(conversation.id);
      markAsRead();
    }
  }, [conversation]);

  useEffect(() => {
    if (socket) {
      socket?.on("@user/chat", (data) => {
        if (!document.hasFocus() && preferences["@chat/bell"] && audio) {
          try {
            audio.play();
          } catch {}
        }
        if (currentConversation === data.conversationId) {
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
            [data.conversationId]: prev[data.conversationId]
              ? prev[data.conversationId] + 1
              : 1,
          }));
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === data.conversationId
                ? {
                    ...conversation,
                    updatedAt: new Date(),
                  }
                : conversation
            )
          );
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

      socket?.on("@user/chat/conversation", (data: { id: string }) => {
        fetchConversations();
      });

      socket?.on("@user/chat/delete", (data) => {
        if (currentConversation && conversationData) {
          setConversationData((prev) =>
            prev.filter((message) => message.id !== data.id)
          );
        }
      });

      socket?.on(
        "@user/chat/conversation/owner-changed",
        (data: { id: string }) => {
          if (currentConversation === data.id) {
            fetchConversations();
          }
        }
      );

      socket?.on(
        "@user/chat/conversation/name-changed",
        (data: { id: string }) => {
          if (currentConversation === data.id) {
            fetchConversations();
          }
        }
      );
    }

    return () => {
      socket?.off("@user/chat");
      socket?.off("@user/chat/read");
      socket?.off("@user/chat/delete");
      socket?.off("@user/chat/conversation");
      socket?.off("@user/chat/conversation/owner-changed");
      socket?.off("@user/chat/conversation/name-changed");
    };
  }, [socket, currentConversation]);

  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const CreateConversationForm = (
    <Modal
      opened={createConvoOpened}
      onClose={() => setCreateConvoOpened(false)}
      title="Create a new conversation"
      className={colorScheme}
    >
      <form
        onSubmit={createConvoForm.onSubmit(
          async (values) =>
            await fetchJson<IResponseBase>("/api/chat/conversation", {
              method: "POST",
              auth: true,
              body: {
                name: values.name,
                participants: values.participants.map((participant) =>
                  Number(participant)
                ),
              },
            }).then((res) => {
              if (res.success) {
                setCreateConvoOpened(false);
                fetchConversations();
                createConvoForm.reset();
              } else {
                showNotification({
                  title: "Error",
                  message: res.message ?? "An unknown error occurred.",
                  icon: <HiXCircle />,
                  color: "red",
                });
              }
            })
        )}
      >
        <Stack spacing={"lg"}>
          <div className="flex flex-col gap-2">
            <Select
              classNames={BLACK}
              label="Participants"
              description="Select the users you want to add to this conversation."
              placeholder="Select users..."
              required
              itemComponent={UserItemComponent}
              nothingFound="No users found"
              data={friends
                .filter(
                  (friend) =>
                    !createConvoForm.values.participants.includes(
                      String(friend.id) as any
                    )
                )
                .map((friend) => ({
                  value: String(friend.id),
                  label: friend.alias
                    ? `${friend.alias} (@${friend.username})`
                    : `@${friend.username}`,
                  avatar: friend.avatarUri,
                }))}
              value={null}
              onChange={(value) => {
                createConvoForm.insertListItem("participants", value);
              }}
            />
            <ShadedCard className="flex flex-col gap-3">
              {createConvoForm.values.participants.length > 0 ? (
                createConvoForm.values.participants.map((participant) => (
                  <div
                    className="flex justify-between items-center"
                    key={participant}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(
                          friends.find(
                            (friend) => friend.id === Number(participant)
                          )!.avatarUri
                        )}
                        radius="xl"
                        size={24}
                      />
                      <Text size="sm" weight={500}>
                        {friends.find(
                          (friend) => friend.id === Number(participant)
                        )!.alias
                          ? friends.find(
                              (friend) => friend.id === Number(participant)
                            )!.alias
                          : friends.find(
                              (friend) => friend.id === Number(participant)
                            )!.username}
                      </Text>
                    </div>
                    <CloseButton
                      size="sm"
                      onClick={() => {
                        createConvoForm.removeListItem(
                          "participants",
                          createConvoForm.values.participants.indexOf(
                            participant
                          )
                        );
                      }}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="w-full flex items-center justify-center text-center">
                    <Text size="sm" color="dimmed">
                      Select users to add to this conversation.
                    </Text>
                  </div>
                </>
              )}
            </ShadedCard>
          </div>
          <TextInput
            icon={<Rocket />}
            placeholder="Our group"
            label="Conversation name"
            description="Give your conversation a name."
            classNames={BLACK}
            disabled={createConvoForm.values.participants.length === 1}
            {...createConvoForm.getInputProps("name")}
          />
          {createConvoForm.values.participants.length === 1 && (
            <InlineError
              title="Direct message"
              variant="info"
              icon={<HiInformationCircle />}
            >
              Direct messages cannot have a name, and will be named after the
              two members of the conversation.
            </InlineError>
          )}
          {createConvoForm.values.participants.length === 1 &&
            conversations.find(
              (conversation) =>
                conversation.participants.length === 2 &&
                conversation.direct &&
                conversation.participants.find(
                  (participant) =>
                    participant.id ===
                    Number(createConvoForm.values.participants[0])
                )
            ) && (
              <InlineError title="Conversation already exists" variant="error">
                You already have a direct message with this user.
              </InlineError>
            )}
          <Button
            mt="md"
            type="submit"
            fullWidth
            size="lg"
            disabled={
              createConvoForm.values.participants.length === 1 &&
              conversations.find(
                (conversation) =>
                  conversation.participants.length === 2 &&
                  conversation.direct &&
                  conversation.participants.find(
                    (participant) =>
                      participant.id ===
                      Number(createConvoForm.values.participants[0])
                  )
              ) !== undefined
            }
          >
            Create group
          </Button>
        </Stack>
      </form>
    </Modal>
  );
  const LeaveButton = (
    <Button
      color="red"
      fullWidth
      leftIcon={<HiLogout />}
      onClick={() => {
        setConversationDetailsOpened(false);

        openConfirmModal({
          title: "Leave conversation?",
          children: (
            <Text size="sm" color="dimmed">
              Are you sure you want to leave this conversation? If you&apos;re
              the owner, a new owner will be chosen at random unless there are
              no other participants.
            </Text>
          ),
          labels: {
            confirm: "Leave",
            cancel: "Cancel",
          },
          confirmProps: {
            color: "red",
          },
          onClose() {
            setConversationDetailsOpened(true);
          },
          async onConfirm() {
            await fetchJson<IResponseBase>(
              `/api/chat/conversation/${conversation?.id}/leave`,
              {
                method: "POST",
                auth: true,
              }
            ).then((res) => {
              if (res.success) {
                fetchConversations();
                setCurrentConversation(null);
                setConversationOpen(false);
                setConversationData([]);
                showNotification({
                  title: "Conversation left",
                  message: `You have left the conversation ${conversation?.name}.`,
                  icon: <HiCheckCircle />,
                });
              }
            });
          },
        });
      }}
    >
      Leave
    </Button>
  );
  const ChangeNameButton = (
    <Button
      leftIcon={<HiPencil />}
      fullWidth
      onClick={() => {
        setConversationDetailsOpened(false);
        setNewGroupName(conversation?.name ?? "");
        setChangeNameModalOpened(true);
      }}
    >
      Name
    </Button>
  );
  const ChangeNameModal = (
    <Modal
      opened={changeNameModalOpened}
      onClose={() => {
        setChangeNameModalOpened(false);
        setConversationDetailsOpened(true);
      }}
      title="Change conversation name"
      className={colorScheme}
    >
      <>
        <Text size="sm" color="dimmed">
          Please provide a new name for this conversation.
        </Text>
        <TextInput
          classNames={BLACK}
          icon={<HiPencil />}
          placeholder="Our group"
          label="New conversation name"
          description="Enter a new name for this conversation."
          required
          value={newGroupName}
          mt="md"
          mb="md"
          onChange={(e) => {
            setNewGroupName(e.currentTarget.value);
          }}
        />
        {newGroupName.length > 32 || newGroupName.length === 0 ? (
          <InlineError>
            Name cannot be longer than 32 characters, and cannot be empty.
          </InlineError>
        ) : null}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="default"
            onClick={() => setChangeNameModalOpened(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await fetchJson<IResponseBase>(
                `/api/chat/conversation/${conversation?.id}/name`,
                {
                  method: "PATCH",
                  auth: true,
                  body: {
                    name: newGroupName,
                  },
                }
              ).then((res) => {
                if (res.success) {
                  fetchConversations();
                  setConversation((prev) => ({
                    ...prev!,
                    name: newGroupName,
                  }));
                  showNotification({
                    title: "Conversation name changed",
                    message: `You have changed the name of this conversation to ${newGroupName}.`,
                    icon: <HiCheckCircle />,
                  });
                  setChangeNameModalOpened(false);
                }
              });
            }}
            disabled={newGroupName.length > 32 || newGroupName.length === 0}
          >
            Change name
          </Button>
        </div>
      </>
    </Modal>
  );
  const ConversationDetailsModal = (
    <Modal
      opened={conversationDetailsOpened}
      onClose={() => setConversationDetailsOpened(false)}
      title={conversation?.name}
      className={colorScheme}
    >
      {conversation && (
        <>
          <div className="mb-6 md:gap-y-4 space-y-6 md:grid flex-col md:grid-cols-2">
            <div>
              <Text size="sm" color="dimmed" weight={500} mb="sm">
                Owner
              </Text>
              <Owner user={conversation?.owner!} />
            </div>
            <div>
              <Text size="sm" color="dimmed" weight={500} mb="sm">
                Participants
              </Text>
              <Text>
                {conversation?.participants.length}{" "}
                {Fw.Strings.pluralize(
                  conversation?.participants.length,
                  "participant"
                )}
              </Text>
            </div>
            <div>
              <Text size="sm" color="dimmed" weight={500} mb="sm">
                Created
              </Text>
              <Text>
                {Fw.Dates.format(
                  new Date(conversation?.createdAt!),
                  "MMMM dd, yyyy"
                )}
              </Text>
            </div>
            {!conversation.direct && (
              <div>
                <Text size="sm" color="dimmed" weight={500} mb="sm">
                  Icon
                </Text>
                <div className="flex items-center gap-2">
                  <Avatar
                    placeholder="..."
                    src={
                      (uploadedIcon
                        ? uploadedIcon
                        : getMediaUrl(conversation?.iconUri!)) as string
                    }
                    size="md"
                    color={Fw.Strings.color(conversation?.name!)}
                    ref={iconRef as React.MutableRefObject<HTMLImageElement>}
                  >
                    {Fw.Strings.initials(conversation?.name!)}
                  </Avatar>
                  {uploadedIcon ? (
                    <Button.Group className="w-full">
                      <Button
                        fullWidth
                        color="teal"
                        onClick={() => uploadIcon()}
                      >
                        <HiCheckCircle />
                      </Button>
                      <Button
                        color="red"
                        fullWidth
                        onClick={() => {
                          setUploadedIcon(null);
                        }}
                      >
                        <HiXCircle />
                      </Button>
                    </Button.Group>
                  ) : (
                    <ImageUploader
                      onFinished={(imgStr) => {
                        setUploadedIcon(imgStr);
                      }}
                      crop
                      ratio={1}
                      imgRef={
                        iconRef as React.MutableRefObject<HTMLImageElement>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <Divider mt="lg" mb="lg" />
          <ScrollArea
            style={{
              maxHeight: 200,
            }}
          >
            <div className="flex flex-col gap-1">
              {conversation?.participants.map((participant) => (
                <InlineUserCard
                  rightSection={
                    <>
                      {user?.id === conversation?.owner.id &&
                        !conversation.direct &&
                        participant.id !== user?.id && (
                          <ActionIcon
                            color="red"
                            className="group-hover:opacity-100 md:opacity-0 opacity-100 transition-all"
                            onClick={async (e: React.MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();

                              setConversationDetailsOpened(false);

                              openConfirmModal({
                                title: `Remove ${participant.username}?`,
                                children: (
                                  <Text size="sm" color="dimmed">
                                    Are you sure you want to remove{" "}
                                    {participant.username} from this
                                    conversation? You can always add them back
                                    later.
                                  </Text>
                                ),
                                labels: {
                                  confirm: "Remove",
                                  cancel: "Cancel",
                                },
                                confirmProps: {
                                  color: "red",
                                },
                                async onConfirm() {
                                  await fetchJson<IResponseBase>(
                                    `/api/chat/conversation/${conversation?.id}/remove/${participant.id}`,
                                    {
                                      method: "POST",
                                      auth: true,
                                    }
                                  ).then((res) => {
                                    if (res.success) {
                                      fetchConversations();
                                      setConversation((prev) => ({
                                        ...prev!,
                                        participants: prev!.participants.filter(
                                          (p) => p.id !== participant.id
                                        ),
                                      }));
                                      showNotification({
                                        title: "Participant removed",
                                        message: `You have removed ${participant.username} from this conversation.`,
                                        icon: <HiCheckCircle />,
                                      });
                                    }
                                  });
                                },
                                onCancel() {
                                  setConversationDetailsOpened(true);
                                },
                              });
                            }}
                          >
                            <HiXCircle />
                          </ActionIcon>
                        )}
                    </>
                  }
                  user={participant}
                  key={participant.id}
                />
              ))}
              {conversation?.participants.length < 10 &&
                conversation?.participants.length > 2 &&
                conversation?.owner.id === user?.id &&
                conversation.direct === false && (
                  <div className="p-2 text-center">
                    <Text size="sm" weight={500} color="dimmed">
                      Add more people to this conversation!
                    </Text>
                  </div>
                )}
            </div>
          </ScrollArea>

          {!conversation.direct && (
            <>
              <Divider mt="lg" mb="lg" />
              {user?.id === conversation?.owner.id ? (
                <div className="flex gap-2">
                  {LeaveButton}
                  <Button.Group>
                    {ChangeNameButton}
                    <Button
                      leftIcon={<HiPlus />}
                      fullWidth
                      onClick={() => {
                        setAddUserOpened(true);
                        setConversationDetailsOpened(false);
                      }}
                    >
                      Add
                    </Button>
                  </Button.Group>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    {LeaveButton}
                    {ChangeNameButton}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </Modal>
  );
  const AddUserModal = (
    <Modal
      title="Add a user"
      opened={addUserOpened}
      onClose={() => {
        setAddUserOpened(false);
        setConversationDetailsOpened(true);
      }}
      className={colorScheme}
    >
      <div className="flex justify-center items-center text-center mb-2">
        <Text size="sm" color="dimmed">
          Choose users to add to this conversation.
        </Text>
      </div>
      <ScrollArea
        style={{
          maxHeight: 300,
        }}
      >
        <div className="flex flex-col gap-1">
          {friends
            .filter(
              (friend) =>
                !conversation?.participants.find(
                  (participant) => participant.id === friend.id
                )
            )
            .map((friend) => (
              <InlineUserCard
                user={friend}
                link={false}
                onClick={async () => {
                  await fetchJson<IResponseBase>(
                    `/api/chat/conversation/${conversation?.id}/add/${friend.id}`,
                    {
                      method: "POST",
                      auth: true,
                    }
                  ).then((res) => {
                    if (res.success) {
                      fetchConversations();
                      setConversation((prev) => ({
                        ...prev!,
                        participants: [...prev!.participants, friend],
                      }));
                      showNotification({
                        title: "User added",
                        message: `You have added ${friend.username} to this conversation.`,
                        icon: <HiCheckCircle />,
                      });
                    }
                  });
                }}
                key={friend.id}
              />
            ))}
          {friends.filter(
            (friend) =>
              !conversation?.participants.find(
                (participant) => participant.id === friend.id
              )
          ).length === 0 && (
            <ModernEmptyState
              title="No users found"
              body="No users were found to add to this conversation."
            />
          )}
        </div>
      </ScrollArea>
    </Modal>
  );
  const ConversationButton: FC<{
    convo: ChatConversationWithParticipants;
  }> = ({ convo }) => {
    return (
      <ShadedButton
        key={convo.id}
        onClick={() => {
          setConversation(convo);
          setConversationOpen(true);
          setCurrentConversation(convo.id);
        }}
        className="rounded-none px-4 dark:hover:bg-zinc-900/50 group flex justify-between"
      >
        <div className="flex items-start gap-2 w-[90%]">
          <div className="flex-shrink-0">
            {unreadMessages[convo.id] > 0 ? (
              <Badge
                variant="filled"
                color="red"
                sx={{
                  width: 24,
                  height: 24,
                  padding: 0,
                }}
                className="mr-2"
              >
                {String(unreadMessages[convo.id])}
              </Badge>
            ) : convo.participants.length === 2 && convo.direct ? (
              <Avatar
                src={getMediaUrl(
                  convo.participants.find(
                    (participant) => participant.id !== user?.id
                  )!.avatarUri
                )}
                size={24}
                className="mr-2 rounded-full"
              />
            ) : (
              <Avatar
                placeholder="..."
                src={getMediaUrl(convo?.iconUri!)}
                size={24}
                className="rounded-full mr-2"
                color={Fw.Strings.color(convo.name)}
              >
                {Fw.Strings.initials(convo.name)}
              </Avatar>
            )}
          </div>

          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 w-full">
              <Text
                size="sm"
                mr={6}
                weight={500}
                className="truncate"
                sx={{
                  maxWidth: "75%",
                }}
              >
                {convo.participants.length === 2 && convo.direct
                  ? convo.participants.find(
                      (participant) => participant.id !== user?.id
                    ) && (
                      <span>
                        {convo.participants.find(
                          (participant) => participant.id !== user?.id
                        )!.alias ||
                          convo.participants.find(
                            (participant) => participant.id !== user?.id
                          )!.username}
                      </span>
                    )
                  : convo.name}
                {convo.participants.length === 2 && !convo.ai && (
                  <span className="text-dimmed truncate">
                    {" "}
                    &middot; @
                    {
                      convo.participants.find(
                        (participant) => participant.id !== user?.id
                      )!.username
                    }
                  </span>
                )}
              </Text>
            </div>

            <Tooltip
              openDelay={250}
              label={convo.participants
                .map((participant) => participant.username)
                .join(", ")}
            >
              <Text size="sm" color="dimmed">
                {convo.ai ? (
                  "AI conversation"
                ) : convo.direct ? (
                  "Direct message"
                ) : (
                  <>
                    {convo.participants.length}{" "}
                    {Fw.Strings.pluralize(
                      convo.participants.length,
                      "participant"
                    )}
                  </>
                )}
              </Text>
            </Tooltip>
          </div>
        </div>
        <HiArrowRight className="text-dimmed group-hover:opacity-100 transition-all opacity-0" />
      </ShadedButton>
    );
  };

  if (router.pathname === "/chat") return null;
  return (
    <>
      {CreateConversationForm}
      {ConversationDetailsModal}
      {AddUserModal}
      {ChangeNameModal}
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
                {flags["disabled-chat"] ? (
                  <InlineError title="Temporarily disabled" className="py-4">
                    Chat has been temporarily disabled. We apologize for the
                    inconvenience.
                  </InlineError>
                ) : (
                  <>
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
                            <div className="flex justify-between items-center gap-4">
                              <div className="w-[45%]">
                                <Button
                                  variant="subtle"
                                  className="flex gap-1 text-center items-center"
                                  size="sm"
                                  onClick={() => {
                                    setConversationOpen(false);
                                    setConversation(null);
                                    setCurrentConversation(null);
                                    setConversationData([]);
                                  }}
                                  compact
                                >
                                  Go back
                                </Button>
                              </div>
                              <div
                                onClick={() => {
                                  setConversationDetailsOpened(true);
                                }}
                                className="flex gap-2 items-center justify-end cursor-pointer truncate w-full"
                              >
                                <Text
                                  color="dimmed"
                                  size="sm"
                                  className={clsx(
                                    "truncate transition-colors duration-100 cursor-pointer",
                                    conversation?.ai
                                      ? "bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold"
                                      : "hover:text-sky-600 dark:hover:text-sky-400"
                                  )}
                                >
                                  {conversation?.participants.length === 2 &&
                                  conversation?.direct
                                    ? `${conversation.ai ? "" : "@"}${
                                        conversation?.participants.find(
                                          (participant) =>
                                            participant.id !== user?.id
                                        )?.username
                                      }`
                                    : conversation?.name}
                                </Text>
                                <Avatar
                                  placeholder="..."
                                  src={
                                    conversation?.direct
                                      ? getMediaUrl(
                                          conversation?.participants.find(
                                            (participant) =>
                                              participant.id !== user?.id
                                          )?.avatarUri!
                                        )
                                      : getMediaUrl(conversation?.iconUri!)
                                  }
                                  size="sm"
                                  color={Fw.Strings.color(conversation?.name!)}
                                  className={clsx(
                                    conversation?.direct && "rounded-full"
                                  )}
                                >
                                  {Fw.Strings.initials(conversation?.name!)}
                                </Avatar>
                              </div>
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
                            <div className="flex items-center">
                              <TextInput
                                placeholder="Find conversation..."
                                className="w-[80%]"
                                variant="unstyled"
                                icon={<HiSearch />}
                                sx={(theme) => ({
                                  lineHeight: "0px",
                                  "& input": {
                                    paddingLeft: theme.spacing.md * 2.3,
                                    paddingRight: theme.spacing.sm,
                                  },
                                  "&::placeholder": {
                                    paddingLeft: theme.spacing.sm,
                                    paddingRight: theme.spacing.sm,
                                  },
                                })}
                                autoComplete="off"
                                value={friendsSearch}
                                onChange={(e) =>
                                  setFriendsSearch(e.target.value)
                                }
                              />
                              <div className="flex gap-1">
                                <Tooltip
                                  label="New conversation"
                                  withArrow
                                  {...(!preferences[
                                    "@dismissible/chat/conversation-tooltip"
                                  ] && {
                                    opened:
                                      !preferences[
                                        "@dismissible/chat/conversation-tooltip"
                                      ],
                                  })}
                                >
                                  <ActionIcon
                                    radius="xl"
                                    size="sm"
                                    onClick={() => {
                                      setCreateConvoOpened(true);
                                      Preferences.setPreferences({
                                        "@dismissible/chat/conversation-tooltip":
                                          true,
                                      });
                                    }}
                                    onMouseEnter={() => {
                                      Preferences.setPreferences({
                                        "@dismissible/chat/conversation-tooltip":
                                          true,
                                      });
                                    }}
                                  >
                                    <HiPlus />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip
                                  label="Application settings"
                                  withinPortal
                                >
                                  <div>
                                    <Link href="/settings/application" passHref>
                                      <ActionIcon radius="xl" size="sm">
                                        <HiCog />
                                      </ActionIcon>
                                    </Link>
                                  </div>
                                </Tooltip>
                              </div>
                            </div>
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
                                    .map((message, messageIndex) => {
                                      const currentTimestamp = new Date(
                                        message.createdAt
                                      ).getTime();
                                      const timeDiff = previousTimestamp
                                        ? currentTimestamp - previousTimestamp
                                        : 0;
                                      const timeDiffHrs = Math.floor(
                                        timeDiff / (1000 * 60 * 60)
                                      );
                                      let dividerLabel = null;
                                      if (timeDiffHrs >= 8) {
                                        const formattedTimestamp = new Date(
                                          currentTimestamp
                                        ).toLocaleString(undefined, {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "numeric",
                                          day: "numeric",
                                        });
                                        dividerLabel = formattedTimestamp;
                                      }
                                      previousTimestamp = currentTimestamp;
                                      return (
                                        <>
                                          {dividerLabel && (
                                            <div className="flex justify-center items-center mt-2 pointer-events-none">
                                              <Divider className="w-full" />
                                              <div className="flex justify-center items-center gap-2 px-3 w-full">
                                                <HiArrowSmDown className="text-dimmed whitespace-nowrap flex-nowrap" />
                                                <Text
                                                  color="dimmed"
                                                  size="sm"
                                                  className="whitespace-nowrap flex-nowrap"
                                                >
                                                  {dividerLabel}
                                                </Text>
                                              </div>
                                              <Divider className="w-full" />
                                            </div>
                                          )}
                                          <ChatMsg
                                            message={message}
                                            precedingMessage={
                                              conversationData[messageIndex - 1]
                                            }
                                            aiConversation={conversation?.ai}
                                          />
                                        </>
                                      );
                                    })
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
                              {conversations
                                .filter((convo) =>
                                  convo.name
                                    .toLowerCase()
                                    .includes(friendsSearch.toLowerCase())
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.updatedAt).getTime() -
                                    new Date(a.updatedAt).getTime()
                                )
                                .map((convo) => (
                                  <ConversationButton
                                    convo={convo}
                                    key={convo.id}
                                  />
                                ))}
                              {conversations.length === 0 ? (
                                <>
                                  <div className="flex justify-center">
                                    <div className="flex items-center gap-2 p-8 pb-0">
                                      <HiXCircle
                                        size={12}
                                        className="flex-shrink-0"
                                      />
                                      <Text size="sm" color="dimmed">
                                        No conversations yet.
                                      </Text>
                                    </div>
                                  </div>
                                  <div className="flex justify-center p-8 pt-0">
                                    <Button
                                      mt="md"
                                      onClick={() => {
                                        setCreateConvoOpened(true);
                                      }}
                                    >
                                      Create new conversation
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-center">
                                    <div className="flex items-center gap-2 p-8 pb-2">
                                      <HiSparkles
                                        size={12}
                                        className="flex-shrink-0"
                                      />
                                      <Text size="sm" color="dimmed">
                                        It&apos;s quiet here...
                                      </Text>
                                    </div>
                                  </div>
                                </>
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
                            autoFocus
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
                                            messageForm.values.message +
                                              emoji.native
                                          );
                                        }}
                                        previewPosition="none"
                                        autoFocus
                                      />
                                    )}
                                  </Box>
                                  <ActionIcon
                                    onClick={() => setPicker(!picker)}
                                  >
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
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </>
  );
};

export default Chat;
