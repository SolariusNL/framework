import {
  ActionIcon,
  Alert,
  Button,
  Modal,
  NotificationProps,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { NucleusKey } from "@prisma/client";
import React from "react";
import { HiCheckCircle, HiPlus, HiXCircle } from "react-icons/hi";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface NucleusProps {
  user: User;
}

const Nucleus = ({ user }: NucleusProps) => {
  const [keys, setKeys] = React.useState<NucleusKey[]>(user.nucleusKeys);
  const [enteredKey, setEnteredKey] = React.useState("");
  const [keyCreateLoading, setKeyCreateLoading] = React.useState(false);
  const [error, setError] = React.useState<NotificationProps | null>(null);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const handleKeyCreate = async () => {
    setKeyCreateLoading(true);

    await fetch("/api/nucleus/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        name: enteredKey,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setKeys([...keys, res.key]);
          setEnteredKey("");
        } else {
          setError(res.message || "An error occurred.");
        }
      })
      .catch((err) => {
        setError(err.message || "An error occurred.");
      })
      .finally(() => {
        setKeyCreateLoading(false);
        setCreateModalOpen(false);
      });
  };

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
      })
      .catch((err) => {
        setError(err.message || "An error occurred.");
        setKeys(user.nucleusKeys);
      });
  };

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Nucelus key"
      >
        <TextInput
          label="Key name"
          description="This will be the name of the key that will be displayed in the key list for organizational purposes."
          value={enteredKey}
          onChange={(e) => setEnteredKey(e.target.value)}
          mb={16}
        />

        <Button
          fullWidth
          loading={keyCreateLoading}
          onClick={handleKeyCreate}
          disabled={enteredKey.length === 0}
        >
          Create
        </Button>
      </Modal>

      <InventTab
        tabValue="nucleus"
        tabTitle="Nucleus"
        actions={
          <>
            <Button
              leftIcon={<HiPlus />}
              variant="outline"
              onClick={() => setCreateModalOpen(true)}
            >
              Create Nucleus key
            </Button>
          </>
        }
      >
        <Title order={4} mb={10}>
          Your Nucleus keys
        </Title>

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
              <th>Key</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>{key.key}</td>
                <td>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => deleteKey(key.key)}
                  >
                    <HiXCircle />
                  </ActionIcon>
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
