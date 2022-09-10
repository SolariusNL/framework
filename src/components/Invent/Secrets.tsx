import {
  ActionIcon,
  Button,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiPlus, HiTrash } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface SecretsProps {
  user: User;
}

const Secrets = ({ user }: SecretsProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [enteredName, setEnteredName] = useState("");
  const [enteredValue, setEnteredValue] = useState("");

  const [shownIndexes, setShownIndexes] = useState<string[]>([]);
  const router = useRouter();

  const createSecret = async () => {
    await fetch("/api/secrets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        name: enteredName,
        value: enteredValue,
      }),
    }).then(() => router.reload());
  };

  const deleteSecret = async (id: string) => {
    await fetch(`/api/secrets/${id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => router.reload());
  };

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create secret"
      >
        <Stack spacing={10}>
          <TextInput
            label="Name"
            description="The name of the secret"
            value={enteredName}
            onChange={(e) => setEnteredName(e.currentTarget.value)}
            maxLength={32}
            minLength={1}
          />
          <TextInput
            label="Value"
            description="The value of the secret"
            value={enteredValue}
            onChange={(e) => setEnteredValue(e.currentTarget.value)}
            mb={10}
            maxLength={1024}
            minLength={1}
          />
          <Button onClick={createSecret}>Create</Button>
        </Stack>
      </Modal>
      <InventTab
        tabValue="secrets"
        tabTitle="Secrets"
        actions={
          <>
            <Button
              leftIcon={<HiPlus />}
              variant="outline"
              onClick={() => setCreateModalOpen(true)}
            >
              Create a Game
            </Button>
          </>
        }
      >
        <Text mb={16}>
          Secrets are hidden properties than can be referenced by public content
          (such as release actions) to safely use private info such as API
          credentials.
        </Text>

        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {user.secrets.map((secret) => (
              <tr key={secret.id}>
                <td>{secret.name}</td>
                <td>
                  {shownIndexes.includes(secret.id) ? (
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() =>
                        setShownIndexes(
                          shownIndexes.filter((i) => i !== secret.id)
                        )
                      }
                    >
                      {secret.code}
                    </Button>
                  ) : (
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() =>
                        setShownIndexes([...shownIndexes, secret.id])
                      }
                    >
                      {secret.code.slice(0, 3)}... show
                    </Button>
                  )}
                </td>
                <td>
                  <ActionIcon
                    color="red"
                    size="sm"
                    onClick={() => deleteSecret(secret.id)}
                  >
                    <HiTrash />
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

export default Secrets;
