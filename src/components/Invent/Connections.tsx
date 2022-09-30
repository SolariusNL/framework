import {
  ActionIcon,
  Badge,
  Button,
  Modal,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { Connection } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import { HiTrash } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface ConnectionsProps {
  user: User;
}

const Connections = ({ user }: ConnectionsProps) => {
  const [conns, setConns] = React.useState<Connection[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Connection | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/nucleus/my/connections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => setConns(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
      <InventTab tabValue="connections" tabTitle="Connections">
        <Text mb={16}>
          Connections are self-hosted servers that can be used as an alternative
          to dedicated servers. They allow for more flexibility, customization,
          and control, but requires a bit more technical knowledge to set up and
          maintain. If you&apos;re not sure what you&apos;re doing, it&apos;s
          recommended to use a dedicated server instead.
        </Text>

        <Title order={4} mb={6}>
          Your Connections
        </Title>
        <Table striped>
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
                  <td>
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
                <td colSpan={5}>No connections found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </InventTab>
    </>
  );
};

export default Connections;
