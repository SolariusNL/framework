import ModernEmptyState from "@/components/ModernEmptyState";
import apiKeyPermissions from "@/data/apiKeyPermissions";
import Developer from "@/layouts/DeveloperLayout";
import ServiceUnavailable from "@/pages/503";
import authorizedRoute from "@/util/auth";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { ApiKey, ApiKeyPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiEye, HiTrash } from "react-icons/hi";

interface DeveloperProps {
  user: User;
}
const DeveloperAPIKeys: React.FC<DeveloperProps> = ({ user }) => {
  const [keys, setKeys] = useState<ApiKey[]>();
  const [createOpened, setCreateOpened] = useState(false);
  const { copy } = useClipboard();
  const createForm = useForm<{
    name: string;
    permissions: ApiKeyPermission[];
  }>({
    initialValues: {
      name: "",
      permissions: [ApiKeyPermission.USER_PROFILE_READ],
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required";
        if (value.length > 32) return "Name must be less than 32 characters";
      },
    },
  });

  const getApiKeys = async () => {
    const res = await fetch("/api/developer/@me/apikeys", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });
    const data = await res.json();
    setKeys(data);
  };

  useEffect(() => {
    getApiKeys();
  }, []);

  const createKeyForm = (
    <Modal
      title="Create key"
      opened={createOpened}
      onClose={() => setCreateOpened(false)}
    >
      <form
        onSubmit={createForm.onSubmit(async (values) => {
          const res = await fetch("/api/developer/@me/apikeys", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
            body: JSON.stringify(values),
          });
          const data = await res.json();
          if (data.error) {
            createForm.setFieldError("name", data.error);
            createForm.setFieldError("permissions", data.error);
          } else {
            setCreateOpened(false);
            openConfirmModal({
              title: "Key created",
              children: (
                <Text>
                  Your key has been created. Click Copy to copy the key to your
                  clipboard.
                </Text>
              ),
              labels: {
                confirm: "Copy",
                cancel: "Close",
              },
              cancelProps: {
                disabled: true,
              },
              onConfirm() {
                copy(data.key);
                showNotification({
                  title: "Key copied",
                  message: "Your key has been copied to your clipboard.",
                  icon: <HiCheckCircle />,
                });
              },
              closeOnCancel: false,
              withCloseButton: false,
              closeOnEscape: false,
              closeOnClickOutside: false,
            });
            setKeys((keys) => {
              if (keys) {
                return [...keys, data];
              } else {
                return [data];
              }
            });
            createForm.reset();
          }
        })}
      >
        <Stack spacing={12}>
          <TextInput
            placeholder="Name"
            label="Name"
            description="A name for your key."
            {...createForm.getInputProps("name")}
          />
          <Checkbox.Group
            label="Permissions"
            description="Select the permissions you want to grant to this key."
            {...createForm.getInputProps("permissions", { type: "checkbox" })}
          >
            {Object.values(ApiKeyPermission).map((permission) => (
              <Checkbox
                value={permission}
                key={permission}
                label={apiKeyPermissions.get(permission)!.name}
              />
            ))}
          </Checkbox.Group>
        </Stack>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="default" onClick={() => setCreateOpened(false)}>
            Cancel
          </Button>
          <Button type="submit">Create key</Button>
        </div>
      </form>
    </Modal>
  );

  return Fw.Feature.enabled(Fw.FeatureIdentifier.APIKeys) ? (
    <Developer
      user={user}
      title="API Keys"
      description="Manage your API keys and integrate your applications with Framework."
    >
      {createKeyForm}
      <div className="flex items-center gap-4 mb-3">
        <Title order={3}>Keys</Title>
        <Button variant="subtle" onClick={() => setCreateOpened(true)}>
          Create new key
        </Button>
      </div>
      <Text color="dimmed" mb="md">
        API keys allow you to access the Framework API programmatically. It is a
        safe alternative to using your account session token, as it allows
        fine-grained control over what your application can do.
      </Text>
      <ScrollArea className="overflow-visible">
        <Table highlightOnHover={keys && keys.length > 0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys && keys.length > 0 ? (
              keys.map((key) => (
                <tr key={key.id}>
                  <td className="font-semibold">{key.name}</td>
                  <td className="text-dimmed">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="flex items-center gap-2">
                    <Tooltip label="View details">
                      <ActionIcon
                        onClick={() => {
                          openModal({
                            title: key.name,
                            children: (
                              <Stack spacing={4}>
                                {[
                                  ["Name", key.name],
                                  [
                                    "Created at",
                                    new Date(
                                      key.createdAt as Date
                                    ).toLocaleDateString(),
                                  ],
                                  [
                                    "Permissions",
                                    <div
                                      key="permissions"
                                      className="flex flex-col text-right gap-y-2"
                                    >
                                      {key.permissions.map((permission) => (
                                        <Tooltip
                                          label={
                                            apiKeyPermissions.get(permission)!
                                              .description
                                          }
                                          key={permission}
                                        >
                                          <Text weight={500}>
                                            {
                                              apiKeyPermissions.get(permission)!
                                                .name
                                            }
                                          </Text>
                                        </Tooltip>
                                      ))}
                                    </div>,
                                  ],
                                ].map(([label, value]) => (
                                  <div
                                    className="flex justify-between gap-2"
                                    key={String(label)}
                                  >
                                    <Text
                                      color="dimmed"
                                      className="whitespace-nowrap"
                                    >
                                      {label}
                                    </Text>
                                    {typeof value === "string" ? (
                                      <Text weight={500}>{value}</Text>
                                    ) : (
                                      value
                                    )}
                                  </div>
                                ))}
                              </Stack>
                            ),
                          });
                        }}
                      >
                        <HiEye />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip
                      label={
                        <span>
                          Delete key
                          <br />
                          Recommended if it is compromised or no longer in use
                        </span>
                      }
                    >
                      <ActionIcon
                        color="red"
                        onClick={async () => {
                          await fetch(`/api/developer/@me/apikeys/${key.id}`, {
                            method: "DELETE",
                            headers: {
                              Authorization: String(
                                getCookie(".frameworksession")
                              ),
                            },
                          }).finally(() => {
                            showNotification({
                              title: "Key deleted",
                              message:
                                "Your key has been deleted successfully.",
                              icon: <HiCheckCircle />,
                            });
                            setKeys((keys) => {
                              if (keys) {
                                return keys.filter((k) => k.id !== key.id);
                              } else {
                                return [];
                              }
                            });
                          });
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
                <td colSpan={3}>
                  <ModernEmptyState
                    title="No keys"
                    body="You don't have any keys yet."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </Developer>
  ) : (
    <ServiceUnavailable />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default DeveloperAPIKeys;
