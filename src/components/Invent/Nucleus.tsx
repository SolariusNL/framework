import InventTab from "@/components/Invent/InventTab";
import { getCookie } from "@/util/cookies";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Alert,
  NotificationProps,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { NucleusKey } from "@prisma/client";
import React from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

interface NucleusProps {
  user: User;
}

const Nucleus = ({ user }: NucleusProps) => {
  const [keys, setKeys] = React.useState<NucleusKey[]>(user.nucleusKeys);
  const [error, setError] = React.useState<NotificationProps | null>(null);

  const deleteKey = async (key: string) => {
    const newKeys = keys.filter((k) => k.key !== key);
    setKeys(newKeys);

    await fetch(`/api/nucleus/${key}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setError(res.message || "An error occurred.");
          setKeys(user.nucleusKeys);
        }

        showNotification({
          title: "Success",
          message: "Key successfully deleted.",
          icon: <HiCheckCircle />,
        });
      })
      .catch((err) => {
        setError(err.message || "An error occurred.");
        setKeys(user.nucleusKeys);
      });
  };

  return (
    <>
      <InventTab
        tabValue="nucleus"
        tabTitle="Nucleus"
        tabSubtitle="Nucleus is a self-hosted server for your games. Manage your Nucleus API keys here."
      >
        <Title order={4} mb={10}>
          Your Nucleus keys
        </Title>

        <Text color="dimmed" mb={10}>
          Starting 08/18/22, Nucleus keys are now created alongside game
          connections. By deleting a Nucleus key, you will also delete the game
          connection it is associated with.
        </Text>

        {error && (
          <Alert
            color="red"
            icon={<HiXCircle size="24" />}
            title="Error"
            mb={10}
          >
            {String(error) || "An error occurred."}
          </Alert>
        )}

        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Connection</th>
              <th>Key</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>{key.connectionId.substring(0, 10)}...</td>
                <td>{key.key}</td>
                <td>
                  <Tooltip label="Delete key and its assosciated connection">
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => deleteKey(key.key)}
                    >
                      <HiXCircle />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </InventTab>
    </>
  );
};

export default Nucleus;
