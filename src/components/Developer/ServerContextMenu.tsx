import { List, Menu, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { getCookie } from "cookies-next";
import { FC } from "react";
import {
  HiBeaker,
  HiClipboard,
  HiRefresh,
  HiStop,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { ConnectionWithGameAndKey } from "../../pages/developer/servers";
import shutdownNucleus from "../../util/fetch/shutdownNucleus";

type ServerContextMenuProps = {
  server: ConnectionWithGameAndKey;
  onRefresh: () => void;
};

const ServerContextMenu: FC<ServerContextMenuProps> = ({
  server,
  onRefresh,
}) => {
  const { copy } = useClipboard();
  const { colorScheme } = useMantineColorScheme();

  return (
    <>
      <Menu.Label>Actions</Menu.Label>
      <Menu.Item
        icon={<HiBeaker />}
        disabled={!server.online}
        onClick={async () => {
          await fetch(`/api/nucleus/test/${server.gameId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                openModal({
                  title: "Connection test",
                  children: (
                    <>
                      <Text mb="md" size="sm" color="dimmed">
                        Connection to {server.ip}:{server.port} was successful:
                      </Text>
                      <Prism language="json">
                        {JSON.stringify(res.data, null, 2)}
                      </Prism>
                    </>
                  ),
                });
              } else {
                showNotification({
                  title: "Connection Failed",
                  message: `Connection to ${server.ip}:${server.port} failed.`,
                  icon: <HiXCircle />,
                });
              }
            });
        }}
      >
        Test connection
      </Menu.Item>
      <Menu.Item icon={<HiClipboard />} onClick={() => copy(server.id)}>
        Copy ID
      </Menu.Item>
      <Menu.Item
        icon={<HiClipboard />}
        onClick={() => copy(`${server.ip}:${server.port}`)}
      >
        Copy IP & port
      </Menu.Item>
      <Menu.Item
        icon={<HiClipboard />}
        onClick={() => copy(server.nucleusKey.key)}
      >
        Copy Nucleus key
      </Menu.Item>
      <Menu.Item icon={<HiRefresh />} onClick={onRefresh}>
        Refresh
      </Menu.Item>
      <Menu.Divider />
      <Menu.Label>Danger zone</Menu.Label>
      <Menu.Item
        color="red"
        icon={<HiStop />}
        disabled={!server.online}
        onClick={async () =>
          await shutdownNucleus(server.gameId).then(() => {
            setTimeout(() => {
              onRefresh();
            }, 1500);
          })
        }
      >
        Stop server
      </Menu.Item>
      <Menu.Item
        color="red"
        icon={<HiTrash />}
        onClick={() => {
          openConfirmModal({
            title: "Delete server",
            className: colorScheme,
            children: (
              <Stack spacing="md">
                <Text size="sm" color="dimmed">
                  Are you sure you want to delete this server? This action is
                  irreversible. The following information will be erased:
                </Text>
                <List className="list-disc pl-4 text-sm text-dimmed">
                  <li>Synced files</li>
                  <li>CI/CD artifacts</li>
                  <li>Server logs</li>
                  <li>Server settings</li>
                  <li>Backups</li>
                </List>
              </Stack>
            ),
          });
        }}
      >
        Delete server
      </Menu.Item>
    </>
  );
};

export default ServerContextMenu;
