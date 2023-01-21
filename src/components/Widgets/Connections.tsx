import {
  ActionIcon,
  Badge,
  Button,
  Modal,
  Skeleton,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { Connection } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { useEffect } from "react";
import { HiStop, HiTrash, HiWifi, HiXCircle } from "react-icons/hi";
import shutdownNucleus from "../../util/fetch/shutdownNucleus";
import ModernEmptyState from "../ModernEmptyState";

interface ConnectionsWidgetProps {
  filterId?: number;
  controlledData?: Connection[];
}

const ConnectionsWidget = ({
  filterId,
  controlledData,
}: ConnectionsWidgetProps) => {
  const [conns, setConns] = React.useState<Connection[] | null>(
    controlledData || null
  );
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Connection | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (!controlledData) {
      setLoading(true);
      fetch("/api/nucleus/my/connections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setConns(
            filterId
              ? res.filter((conn: Connection) => conn.gameId === filterId)
              : res
          );
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const deleteConnection = async () => {
    if (!selected) return;
    setLoading(true);
    await fetch(`/api/nucleus/connections/${selected.id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          console.error(res.error);
        } else {
          setConns(
            conns?.filter((conn) => conn.id !== selected.id) as Connection[]
          );
          setSelected(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (controlledData) setConns(controlledData);
  }, [controlledData]);

  return (
    <>
      <Modal
        title="Delete Connection"
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      >
        <Text mb={6}>Are you sure you want to delete this connection?</Text>
        <Table mb={16}>
          <thead>
            <tr>
              <th>IP</th>
              <th>Port</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selected?.ip}</td>
              <td>{selected?.port}</td>
            </tr>
          </tbody>
        </Table>
        <Button
          color="red"
          onClick={() => {
            deleteConnection();
            setDeleteOpen(false);
          }}
        >
          Delete
        </Button>
      </Modal>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Status</th>
            <th>IP Address</th>
            <th>Port</th>
            <th>Game ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td>
                  <Skeleton width={20} height={20} />
                </td>
                <td>
                  <Skeleton width={165} />
                </td>
                <td>
                  <Skeleton width={60} />
                </td>
                <td>
                  <Skeleton width={85} />
                </td>
                <td>
                  <Skeleton width={120} />
                </td>
              </tr>
            ))
          ) : conns && conns.length > 0 ? (
            conns.map((conn) => (
              <tr key={conn.id}>
                <td>
                  <Badge variant="dot" color={conn.online ? "green" : "red"}>
                    {conn.online ? "Online" : "Offline"}
                  </Badge>
                </td>
                <td>{conn.ip}</td>
                <td>{conn.port}</td>
                <td>{conn.gameId}</td>
                <td className="flex">
                  <Tooltip label="Test connection">
                    <ActionIcon
                      onClick={async () => {
                        await fetch(`/api/nucleus/test/${conn.gameId}`, {
                          method: "GET",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: String(
                              getCookie(".frameworksession")
                            ),
                          },
                        })
                          .then((res) => res.json())
                          .then((res) => {
                            if (res.success) {
                              openModal({
                                title: "Connection Test",
                                children: (
                                  <>
                                    <Text mb="md">
                                      Connection to {conn.ip}:{conn.port} was
                                      successful. Here is the response:
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
                                message: `Connection to ${conn.ip}:${conn.port} failed.`,
                                icon: <HiXCircle />,
                              });
                            }
                          });
                      }}
                    >
                      <HiWifi />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Shutdown">
                    <ActionIcon
                      onClick={async () => await shutdownNucleus(conn.gameId)}
                    >
                      <HiStop />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon
                      color="red"
                      onClick={() => {
                        setSelected(conn);
                        setDeleteOpen(true);
                      }}
                    >
                      <HiTrash />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <ModernEmptyState
                  title="No servers"
                  body="There are no servers to display"
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default ConnectionsWidget;
