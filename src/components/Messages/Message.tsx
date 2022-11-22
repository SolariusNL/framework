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
import {
  HiArchive,
  HiDesktopComputer,
  HiEye,
  HiFlag,
  HiStar,
} from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import getMediaUrl from "../../util/getMedia";
import { Message } from "../../util/prisma-types";
import { getRelativeTime } from "../../util/relativeTime";
import ReportUser from "../ReportUser";
import ShadedCard from "../ShadedCard";
import Stateful from "../Stateful";
import UserContext from "../UserContext";

interface MessageProps {
  message: Message;
}

const Message: React.FC<MessageProps> = ({ message: msg }) => {
  const [reportOpen, setReportOpen] = React.useState(false);
  const [message, setMessage] = React.useState(msg);
  const user = useFrameworkUser()!;

  const read = async () => {
    setMessage({ ...message, read: !message.read });
    await fetch(`/api/messages/msg/${message.id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });
  };

  const archive = async () => {
    setMessage({ ...message, archived: !message.archived });
    await fetch(`/api/messages/msg/${message.id}/archive`, {
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
                <div>
                  <Text color="dimmed" weight={500} mb={6}>
                    Important
                  </Text>
                  <Badge
                    color={message.important ? "red" : "gray"}
                    variant="dot"
                  >
                    {message.important ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Text color="dimmed" weight={500} mb={6}>
                    System
                  </Text>
                  <Badge
                    color={message.system ? "orange" : "gray"}
                    variant="dot"
                  >
                    {message.system ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Text color="dimmed" weight={500} mb={6}>
                    Author
                  </Text>
                  <div className="flex items-center gap-4">
                    <UserContext user={message.sender}>
                      <Avatar
                        src={getMediaUrl(message.sender.avatarUri)}
                        radius={999}
                      />
                    </UserContext>
                    <Text>{message.sender.username}</Text>
                  </div>
                </div>
                <div>
                  <Text color="dimmed" weight={500} mb={6}>
                    Recipient
                  </Text>
                  <div className="flex items-center gap-4">
                    <UserContext user={message.recipient}>
                      <Avatar
                        src={getMediaUrl(message.recipient.avatarUri)}
                        radius={999}
                      />
                    </UserContext>
                    <Text>{message.recipient.username}</Text>
                  </div>
                </div>
              </div>
              <Divider mt={32} mb={32} label="Actions" labelPosition="center" />
              <div className="flex justify-between items-center">
                <Button.Group>
                  <Button
                    leftIcon={<HiEye />}
                    onClick={read}
                    disabled={message.recipientId !== user.id}
                  >
                    Mark as {message.read ? "Unread" : "Read"}
                  </Button>
                  <Button
                    leftIcon={<HiArchive />}
                    onClick={archive}
                    disabled={message.recipientId !== user.id}
                  >
                    {message.archived ? "Unarchive" : "Archive"}
                  </Button>
                </Button.Group>
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
            <motion.div whileHover={{ scale: 1.05 }}>
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
                      <Badge>{message.read ? "Read" : "Not Read"}</Badge>
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
                  <div className="flex justify-between items-center">
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
