import {
  ActionIcon,
  MantineColor,
  Menu,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { FC, useState } from "react";
import { HiClipboard, HiDotsHorizontal, HiTrash } from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import usePreferences from "../../stores/usePreferences";
import clsx from "../../util/clsx";
import { ChatMessage } from "../../util/prisma-types";
import MessageContextMenu, { deleteMessage } from "./MessageContextMenu";

type ChatMessageProps = {
  message: ChatMessage;
  noActions?: boolean;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, noActions }) => {
  const { user } = useAuthorizedUserStore();
  const { preferences } = usePreferences();
  const { colors } = useMantineTheme();
  const [menuOpened, setMenuOpened] = useState(false);

  const color =
    colors[(preferences["@chat/my-color"] as MantineColor) || "blue"];

  const actionMenu = (
    <div
      className={clsx(
        "justify-center items-center transition-all",
        !menuOpened && "group-hover:opacity-100 md:delay-100 opacity-0"
      )}
    >
      <Menu
        opened={menuOpened}
        onOpen={() => setMenuOpened(true)}
        onClose={() => setMenuOpened(false)}
        withinPortal
      >
        <Menu.Target>
          <ActionIcon>
            <HiDotsHorizontal />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            {new Date(message.createdAt).toLocaleTimeString()} at{" "}
            {new Date(message.createdAt).toLocaleDateString()}
          </Menu.Label>
          <Menu.Item
            icon={<HiClipboard />}
            onClick={() => {
              navigator.clipboard.writeText(message.id);
              setMenuOpened(false);
            }}
          >
            Copy message ID
          </Menu.Item>
          {message.authorId === user?.id && (
            <Menu.Item
              icon={<HiTrash />}
              color="red"
              onClick={() => {
                deleteMessage(message.id);
                setMenuOpened(false);
              }}
            >
              Delete message
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </div>
  );

  return message.authorId === user?.id ? (
    <MessageContextMenu
      chatMessage={message}
      key={message.id}
      ignore={noActions}
    >
      <div className="group flex gap-2 items-center justify-end">
        {!noActions && actionMenu}
        <Paper
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === "dark" ? color[8] : color[3],
            textAlign: "right",
            alignSelf: "flex-end",
            maxWidth: "90%",
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark" ? color[9] : color[4],
            },
          })}
          className="transition-all w-fit max-w-full"
          p="sm"
        >
          <Text
            size="sm"
            style={{ wordBreak: "break-word" }}
            className="pointer-events-none dark:text-gray-300 text-black"
          >
            {message.content}
          </Text>
        </Paper>
      </div>
    </MessageContextMenu>
  ) : (
    <MessageContextMenu chatMessage={message} key={message.id}>
      <div className="w-full group flex items-center gap-2 justify-start">
        <Paper
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[3],
            textAlign: "left",
            width: "fit-content",
            alignSelf: "flex-start",
            maxWidth: "90%",
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[4],
            },
          })}
          className="transition-all"
          p="sm"
        >
          <Text
            size="sm"
            style={{ wordBreak: "break-word" }}
            className="pointer-events-none dark:text-gray-300 text-black"
          >
            {message.content}
          </Text>
        </Paper>
        {!noActions && actionMenu}
      </div>
    </MessageContextMenu>
  );
};

export default ChatMessage;
