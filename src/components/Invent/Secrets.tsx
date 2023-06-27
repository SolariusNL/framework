import InventTab from "@/components/Invent/InventTab";
import ModernEmptyState from "@/components/ModernEmptyState";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Button,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiCheckCircle, HiCode, HiPlus, HiTrash } from "react-icons/hi";

interface SecretsProps {
  user: User;
}

const Secrets = ({ user }: SecretsProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [secrets, setSecrets] = useState(user.secrets);

  const form = useForm<{
    name: string;
    value: string;
  }>({
    initialValues: {
      name: "",
      value: "",
    },
    validate: {
      name: (value) => {
        if (value.length < 1 || value.length > 32) {
          return "Name must be between 1 and 32 characters.";
        }
      },
      value: (value) => {
        if (value.length < 1 || value.length > 1024) {
          return "Value must be between 1 and 1024 characters.";
        }
      },
    },
  });

  const createSecret = async (values: { name: string; value: string }) => {
    await fetch("/api/secrets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          form.setFieldError("name", res.error);
          form.setFieldError("value", res.error);
        } else {
          setSecrets([
            ...secrets,
            {
              id: String(Math.random() * 100),
              name: values.name,
              code: values.value,
              userId: user.id,
              createdAt: new Date(),
            },
          ]);

          setCreateModalOpen(false);
          showNotification({
            title: "Success",
            message: "Secret successfully created.",
            icon: <HiCheckCircle />,
          });

          form.reset();
        }
      });
  };

  const deleteSecret = async (id: string) => {
    await fetch(`/api/secrets/${id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => {
      setSecrets(secrets.filter((secret) => secret.id !== id));
    });
  };

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create secret"
      >
        <form onSubmit={form.onSubmit(createSecret)}>
          <Stack spacing={10}>
            <TextInput
              label="Name"
              description="The name of the secret"
              maxLength={32}
              minLength={1}
              required
              placeholder="API key"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Value"
              description="The value of the secret"
              mb={10}
              maxLength={1024}
              minLength={1}
              required
              placeholder="1234567890"
              {...form.getInputProps("value")}
            />
            <div className="flex justify-end">
              <Button type="submit">Create</Button>
            </div>
          </Stack>
        </form>
      </Modal>
      <InventTab
        tabValue="secrets"
        tabTitle="Secrets"
        actions={
          <>
            <Button
              leftIcon={<HiPlus />}
              variant="default"
              onClick={() => setCreateModalOpen(true)}
            >
              Create a secret
            </Button>
          </>
        }
        tabSubtitle="Store secrets on Framework that can be accessed by your apps."
      >
        <Table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map((secret) => (
              <tr key={secret.id}>
                <td>
                  {new Date(secret.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(secret.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </td>
                <td>{secret.name}</td>
                <td>
                  <div className="flex gap-2 items-center">
                    <Tooltip label="See code">
                      <ActionIcon
                        size="md"
                        onClick={() => {
                          openModal({
                            title: "Secret usage",
                            children: (
                              <>
                                <Text size="sm" mb="md">
                                  To use this secret in your app, use the
                                  following code:
                                </Text>
                                <Prism language="typescript">
                                  {`Secrets.get("${secret.name}");`}
                                </Prism>
                              </>
                            ),
                          });
                        }}
                      >
                        <HiCode />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete secret">
                      <ActionIcon
                        color="red"
                        size="md"
                        onClick={() => deleteSecret(secret.id)}
                      >
                        <HiTrash />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
            {secrets.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <ModernEmptyState
                    title="No secrets"
                    body="Safely store secrets on Framework for your apps to access."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </InventTab>
    </>
  );
};

export default Secrets;
