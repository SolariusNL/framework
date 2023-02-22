import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Modal,
  Text,
  Tooltip,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import React from "react";
import { HiDesktopComputer, HiEye, HiFlag, HiStar } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import getMediaUrl from "../../util/get-media";
import { Message } from "../../util/prisma-types";
import { getRelativeTime } from "../../util/relative-time";
import ReportUser from "../ReportUser";
import ShadedCard from "../ShadedCard";
import Stateful from "../Stateful";
import UserContext from "../UserContext";

interface MessageProps {
  message: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const Message: React.FC<MessageProps> = ({ message, setMessages }) => {
  const [reportOpen, setReportOpen] = React.useState(false);
  const user = useFrameworkUser()!;

  const read = async () => {
    setMessages((messages) =>
      messages.map((msg) => {
        if (msg.id === message.id) {
          return { ...msg, read: !msg.read };
        }
        return msg;
      })
    );

    await fetch(`/api/messages/msg/${message.id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });
  };

  return (
    <>
      <ReportUser
        user={message.sender}
        opened={reportOpen}
        setOpened={setReportOpen}
      />
      <Stateful>
        {(opened, setOpened) => (
          <>
            <Modal
              title={message.title}
              opened={opened}
              onClose={() => setOpened(false)}
            >
              <div className="mb-6">
                <Text color="dimmed" weight={500} mb={6}>
                  Body
                </Text>
                <Text>{message.message}</Text>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  [
                    "Important",
                    <Badge
                      color={message.important ? "red" : "gray"}
                      variant="dot"
                      key="important"
                    >
                      {message.important ? "Yes" : "No"}
                    </Badge>,
                  ],
                  [
                    "System",
                    <Badge
                      color={message.system ? "orange" : "gray"}
                      variant="dot"
                      key="system"
                    >
                      {message.system ? "Yes" : "No"}
                    </Badge>,
                  ],
                  [
                    "Author",
                    <div className="flex items-center gap-4" key="author">
                      <UserContext user={message.sender}>
                        <Avatar
                          src={getMediaUrl(message.sender.avatarUri)}
                          radius={999}
                        />
                      </UserContext>
                      <Text>{message.sender.username}</Text>
                    </div>,
                  ],
                  [
                    "Recipient",
                    <div className="flex items-center gap-4" key="recipient">
                      <UserContext user={message.recipient}>
                        <Avatar
                          src={getMediaUrl(message.recipient.avatarUri)}
                          radius={999}
                        />
                      </UserContext>
                      <Text>{message.recipient.username}</Text>
                    </div>,
                  ],
                ].map(([title, content]) => (
                  <div key={String(title)}>
                    <Text color="dimmed" weight={500} mb={6}>
                      {title}
                    </Text>
                    {content}
                  </div>
                ))}
              </div>
              <Divider mt={32} mb={32} label="Actions" labelPosition="center" />
              <div className="flex justify-between items-center">
                <Button
                  leftIcon={<HiEye />}
                  onClick={read}
                  disabled={message.recipientId !== user.id}
                >
                  Mark as {message.read ? "Unread" : "Read"}
                </Button>
                <Button
                  color="red"
                  leftIcon={<HiFlag />}
                  onClick={() => {
                    setReportOpen(true);
                    setOpened(false);
                  }}
                >
                  Report
                </Button>
              </div>
            </Modal>
            <motion.div whileHover={{ scale: 1.02 }}>
              <ShadedCard
                withBorder
                shadow="sm"
                p="md"
                className="cursor-pointer"
                onClick={() => setOpened(true)}
              >
                <Card.Section p="md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(message.sender.avatarUri)}
                        alt={message.sender.username}
                        size={28}
                      />
                      <Text color="dimmed">{message.sender.username}</Text>
                    </div>
                    <div>
                      <Badge>{message.read ? "Read" : "Unread"}</Badge>
                    </div>
                  </div>
                </Card.Section>
                <Card.Section p="md" withBorder>
                  <Text size="lg" weight={700} mb={12}>
                    {message.title}
                  </Text>
                  <Text color="dimmed" lineClamp={2}>
                    {message.message}
                  </Text>
                </Card.Section>
                <Card.Section p="md" withBorder>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Tooltip
                        label={
                          message.important
                            ? "Marked as important"
                            : "Not important"
                        }
                      >
                        <ActionIcon color={message.important ? "red" : "gray"}>
                          <HiStar />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip
                        label={message.system ? "From Framework" : "From User"}
                      >
                        <ActionIcon color={message.system ? "orange" : "gray"}>
                          <HiDesktopComputer />
                        </ActionIcon>
                      </Tooltip>
                    </div>
                    <div>
                      <Text color="dimmed" size="sm" weight={500}>
                        {getRelativeTime(new Date(message.createdAt))}
                      </Text>
                    </div>
                  </div>
                </Card.Section>
              </ShadedCard>
            </motion.div>
          </>
        )}
      </Stateful>
    </>
  );
};

export default Message;
