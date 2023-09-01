import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Button,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { getCookie } from "cookies-next";
import { useState } from "react";
import {
  HiCheckCircle,
  HiDotsVertical,
  HiOutlineCode,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";
import ShadedButton from "../shaded-button";
import ShadedCard from "../shaded-card";

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
              maxLength={128}
              minLength={1}
              required
              placeholder="1234567890"
              {...form.getInputProps("value")}
            />
            <div className="flex justify-end">
              <Button type="submit" radius="xl" variant="light">
                Create
              </Button>
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
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {secrets.length > 0 ? (
            secrets.map((secret) => (
              <ShadedButton className="flex flex-col gap-2" key={secret.id}>
                <div className="flex justify-between gap-4 w-full">
                  <Title order={3}>{secret.name}</Title>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon radius="xl" variant="light">
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<HiOutlineCode />}
                        onClick={() =>
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
                          })
                        }
                      >
                        See code
                      </Menu.Item>
                      <Menu.Item
                        icon={<HiOutlineTrash />}
                        color="red"
                        onClick={() =>
                          openConfirmModal({
                            title: "Confirm deletion",
                            children: (
                              <Text size="sm" color="dimmed">
                                Are you sure you want to delete this secret? Any
                                code that references it will stop working.
                              </Text>
                            ),
                            labels: {
                              confirm: "Delete",
                              cancel: "Nevermind",
                            },
                            confirmProps: {
                              variant: "light",
                              radius: "xl",
                              color: "red",
                            },
                            cancelProps: {
                              variant: "light",
                              radius: "xl",
                              color: "gray",
                            },
                            onConfirm: () => deleteSecret(secret.id),
                          })
                        }
                      >
                        Delete secret
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
                <Text size="sm" color="dimmed">
                  Created on {new Date(secret.createdAt).toLocaleString()}
                </Text>
              </ShadedButton>
            ))
          ) : (
            <ShadedCard className="col-span-full flex justify-center">
              <ModernEmptyState
                title="No secrets"
                body="Get started by creating a secret to safely store your variables"
              />
            </ShadedCard>
          )}
        </div>
      </InventTab>
    </>
  );
};

export default Secrets;
