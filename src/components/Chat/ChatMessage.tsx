import { Paper, Text, Tooltip } from "@mantine/core";
import { FC } from "react";
import { HiCheck } from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import { ChatMessage } from "../../util/prisma-types";
import MessageContextMenu from "./MessageContextMenu";

type ChatMessageProps = {
  message: ChatMessage;
};

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuthorizedUserStore();
  return message.authorId === user?.id ? (
    <MessageContextMenu chatMessage={message} key={message.id}>
      <div className="flex justify-center items-center">
        {message.seen && (
          <Tooltip withinPortal withArrow label="Message seen" className="mr-4">
            <div>
              <HiCheck className="text-dimmed" />
            </div>
          </Tooltip>
        )}
      </div>
      <Paper
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.blue[8]
              : theme.colors.blue[1],
          textAlign: "right",
          width: "fit-content",
          alignSelf: "flex-end",
          maxWidth: "90%",
          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.blue[9]
                : theme.colors.blue[3],
          },
        })}
        className="transition-all"
        p="sm"
      >
        <Text
          size="sm"
          style={{ wordBreak: "break-word" }}
          className="pointer-events-none"
        >
          {message.content}
        </Text>
      </Paper>
    </MessageContextMenu>
  ) : (
    <MessageContextMenu chatMessage={message} key={message.id}>
      <Paper
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[1],
          textAlign: "left",
          width: "fit-content",
          alignSelf: "flex-start",
          maxWidth: "90%",
          "&:hover": {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[3],
          },
        })}
        className="transition-all"
        p="sm"
      >
        <Text
          size="sm"
          style={{ wordBreak: "break-word" }}
          className="pointer-events-none"
        >
          {message.content}
        </Text>
      </Paper>
    </MessageContextMenu>
  );
};

export default ChatMessage;
