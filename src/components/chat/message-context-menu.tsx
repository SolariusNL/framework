import ContextMenu from "@/components/context-menu";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import IResponseBase from "@/types/api/IResponseBase";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Menu, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { ChatMessage } from "@prisma/client";
import { FC } from "react";
import { HiCheckCircle, HiClipboard, HiTrash } from "react-icons/hi";

type MessageContextMenuProps = {
  children: React.ReactNode;
  chatMessage: Pick<ChatMessage, "authorId" | "id" | "createdAt">;
  ignore?: boolean;
};

export const deleteMessage = async (id: string) => {
  openConfirmModal({
    title: "Confirm deletion",
    children: (
      <Text size="sm" color="dimmed">
        Are you sure you want to delete this message?
      </Text>
    ),
    labels: { confirm: "Yes", cancel: "Nevermind" },
    confirmProps: {
      color: "red",
      leftIcon: <HiTrash />,
    },
    async onConfirm() {
      await fetchJson<IResponseBase>("/api/chat/msg/" + id, {
        method: "DELETE",
        auth: true,
      }).then((res) => {
        if (res.success) {
          showNotification({
            title: "Message deleted",
            message: "Message successfully deleted.",
            icon: <HiCheckCircle />,
          });
        }
      });
    },
  });
};

const MessageContextMenu: FC<MessageContextMenuProps> = ({
  children,
  chatMessage,
  ignore,
}) => {
  const { copy } = useClipboard();
  const { user } = useAuthorizedUserStore();

  return (
    <>
      {ignore ? (
        children
      ) : (
        <ContextMenu
          dropdown={
            <>
              <Menu.Label>
                {new Date(chatMessage.createdAt).toLocaleTimeString()} at{" "}
                {new Date(chatMessage.createdAt).toLocaleDateString()}
              </Menu.Label>
              <Menu.Item
                icon={<HiClipboard />}
                onClick={() => copy(chatMessage.id)}
              >
                Copy ID
              </Menu.Item>
              {chatMessage.authorId === user?.id && (
                <Menu.Item
                  color="red"
                  icon={<HiTrash />}
                  onClick={() => {
                    deleteMessage(chatMessage.id);
                  }}
                >
                  Delete message
                </Menu.Item>
              )}
            </>
          }
          width={200}
        >
          <div
            className={clsx(
              "w-full flex",
              chatMessage.authorId === user?.id
                ? "justify-end"
                : "justify-start"
            )}
          >
            {children}
          </div>
        </ContextMenu>
      )}
    </>
  );
};

export default MessageContextMenu;
