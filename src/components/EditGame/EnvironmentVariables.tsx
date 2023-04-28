import {
  ActionIcon,
  Anchor,
  Button,
  CloseButton,
  Divider,
  Menu,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { GameEnvironment } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiDotsVertical,
  HiPlus,
  HiSearch,
  HiSortAscending,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { GameWithDatastore } from "../../pages/game/[id]/edit/[edit]";
import clsx from "../../util/clsx";
import { getRelativeTime } from "../../util/relative-time";
import LabelledRadio from "../LabelledRadio";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import Stateful from "../Stateful";
import EditGameTab from "./EditGameTab";

interface EnvironmentVariablesProps {
  game: GameWithDatastore;
}

interface EnvironmentVariableForm {
  envs: Array<{
    name: string;
    value: string;
  }>;
  environment: GameEnvironment;
}

interface EnvironmentVariableEditForm {
  name: string;
  value: string;
  environment: GameEnvironment;
}

const EnvironmentVariables = ({ game }: EnvironmentVariablesProps) => {
  const form = useForm<EnvironmentVariableForm>({
    initialValues: {
      envs: [
        {
          name: "",
          value: "",
        },
      ],
      environment: GameEnvironment.PRODUCTION,
    },
    validate: {
      envs: (
        values: Array<{
          name: string;
          value: string;
        }>
      ) => {
        for (const env of values) {
          if (!env.name) return "Name is required";
          if (env.name.length > 64)
            return "Name must be less than 64 characters";
          if (!env.value) return "Value is required";
          if (env.value.length > 1024)
            return "Value must be less than 1024 characters";
        }
      },
    },
  });
  const editForm = useForm<EnvironmentVariableEditForm>({
    initialValues: {
      name: "",
      value: "",
      environment: GameEnvironment.PRODUCTION,
    },
    validate: {
      name: (v) => {
        if (!v) return "Name is required";
        if (v.length > 64) return "Name must be less than 64 characters";
      },
      value: (v) => {
        if (!v) return "Value is required";
        if (v.length > 1024) return "Value must be less than 1024 characters";
      },
    },
  });
  const [filter, setFilter] = React.useState<
    "all" | "production" | "development"
  >("all");
  const [sort, setSort] = React.useState<"name" | "last_updated">("name");
  const [search, setSearch] = React.useState("");
  const [envs, setEnvs] = React.useState(game.envs);

  return (
    <>
      <EditGameTab value="envs">
        <Text mb="sm">
          Environment variables are used to store sensitive data for your game,
          such as API keys, passwords, etc. You can read more about environment
          variables in our{" "}
          <Anchor
            href="https://wiki.soodam.rocks/docs/cosmic/datastores"
            target="_blank"
            rel="noopener noreferrer"
          >
            environment variables documentation
          </Anchor>
          , where you will find usage examples, and more.
        </Text>
        <Text color="dimmed" size="sm" mb="lg">
          Depending on the architecture of your game, you may need to redeploy
          your game to apply changes to environment variables.
        </Text>
        <ShadedCard>
          <form
            onSubmit={form.onSubmit(async (values) => {
              values.envs.forEach(async (env) => {
                await fetch(`/api/games/envs/${game.id}/create`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: String(getCookie(".frameworksession")),
                  },
                  body: JSON.stringify({
                    name: env.name,
                    value: env.value,
                    environment: values.environment,
                  }),
                })
                  .then((res) => res.json())
                  .then((res) => {
                    if (res.success) {
                      form.reset();
                      showNotification({
                        title: "Success",
                        message: "Environment variable created successfully.",
                        icon: <HiCheckCircle />,
                      });

                      setEnvs((prev) => [
                        ...prev,
                        res.variable as GameWithDatastore["envs"][number],
                      ]);
                    }
                  })
                  .catch((err) => {
                    showNotification({
                      title: "Error",
                      message: `Error creating environment variable: ${err}. Please try again later.`,
                      icon: <HiXCircle />,
                      color: "red",
                    });
                  });
              });
            })}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-1 flex flex-col gap-2">
                <Text size="sm" color="dimmed" mb="sm">
                  Key
                </Text>
                {form.values.envs.map((env, i) => (
                  <TextInput
                    placeholder="e.g. API_KEY"
                    {...form.getInputProps(`envs.${i}.name` as const)}
                    key={i}
                  />
                ))}
              </div>
              <div className="col-span-1 flex flex-col gap-2">
                <Text size="sm" color="dimmed" mb="sm">
                  Value
                </Text>
                {form.values.envs.map((env, i) => (
                  <div className="flex items-center gap-2" key={i}>
                    <TextInput
                      placeholder="e.g. 1234567890"
                      {...form.getInputProps(`envs.${i}.value` as const)}
                      key={i}
                      className="flex-grow"
                    />
                    <CloseButton
                      onClick={() => {
                        form.removeListItem("envs", i);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="default"
              leftIcon={<HiPlus />}
              onClick={() => {
                form.setFieldValue(`envs.${form.values.envs.length}` as const, {
                  name: "",
                  value: "",
                });
              }}
            >
              Add another
            </Button>
            <Divider mt="xl" mb="xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Stack spacing="md">
                {[
                  [
                    GameEnvironment.PRODUCTION,
                    "Production",
                    "The production environment, which is used when your game is live and accessible to the public.",
                  ],
                  [
                    GameEnvironment.DEVELOPMENT,
                    "Development",
                    "The development environment, which is the version served to you through Framework Studio.",
                  ],
                ].map(([env, name, description]) => (
                  <LabelledRadio
                    key={env}
                    label={name}
                    description={description}
                    checked={form.values.environment === env}
                    onChange={() => {
                      form.setFieldValue("environment", env as GameEnvironment);
                    }}
                    value={env}
                  />
                ))}
              </Stack>
              <Button size="lg" type="submit">
                Save
              </Button>
            </div>
          </form>
        </ShadedCard>
        <div
          className={clsx(
            "flex-initial flex-col md:flex-row flex items-center gap-4 mt-8",
            "items-stretch md:items-center"
          )}
        >
          <TextInput
            icon={<HiSearch />}
            placeholder="Search for a key"
            sx={{
              flex: "0 0 45%",
            }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Select
            value={filter}
            onChange={(v) => {
              setFilter(v as "all" | "production" | "development");
            }}
            data={[
              { value: "all", label: "All" },
              { value: "production", label: "Production" },
              { value: "development", label: "Development" },
            ]}
            placeholder="Filter by environment"
          />
          <Select
            icon={<HiSortAscending />}
            value={sort}
            onChange={(v) => {
              setSort(v as "name" | "last_updated");
            }}
            data={[
              { value: "name", label: "Name" },
              { value: "last_updated", label: "Last updated" },
            ]}
            placeholder="Sort by"
          />
        </div>
        <Stack spacing={12} mt="lg">
          {envs.length === 0 ? (
            <div className="w-full flex items-center justify-center">
              <ModernEmptyState
                title="No environment variables"
                body="You can create environment variables using the form above."
              />
            </div>
          ) : (
            envs
              .filter((env) => {
                if (filter === "all") return true;
                return env.environment === filter.toUpperCase();
              })
              .sort((a, b) => {
                if (sort === "name") {
                  return a.name.localeCompare(b.name);
                } else if (sort === "last_updated") {
                  return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                  );
                }
                return 0;
              })
              .filter((env) => {
                return env.name.toLowerCase().includes(search.toLowerCase());
              })
              .map((env) => (
                <Stateful
                  key={env.id}
                  effect={(value) => {
                    if (value) {
                      editForm.setValues({
                        name: env.name,
                        value: env.value,
                        environment: env.environment,
                      });
                    }
                  }}
                >
                  {(opened, setOpened) => (
                    <>
                      <ShadedCard className="w-full flex justify-between">
                        <div className="flex flex-col gap-1">
                          <code className="text-bold text-lg">{env.name}</code>
                          <Text size="sm" color="dimmed">
                            {env.environment === "PRODUCTION"
                              ? "Production environment"
                              : "Development environment"}
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <Menu width={160}>
                            <Menu.Target>
                              <ActionIcon>
                                <HiDotsVertical />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Label>
                                Last updated{" "}
                                <span className="text-semibold">
                                  {getRelativeTime(new Date(env.updatedAt))}
                                </span>
                              </Menu.Label>
                              <Menu.Item onClick={() => setOpened(true)}>
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={async () => {
                                  openConfirmModal({
                                    title: "Delete environment variable",
                                    children: (
                                      <Text size="sm" color="dimmed">
                                        Do you really want to delete this
                                        environment variable? This action cannot
                                        be undone, and you will need to recreate
                                        it if you want to use it again. Think
                                        about potential consequences of deleting
                                        this environment variable.
                                      </Text>
                                    ),
                                    confirmProps: {
                                      color: "red",
                                      leftIcon: <HiTrash />,
                                    },
                                    labels: {
                                      confirm: "Delete",
                                      cancel: "Cancel",
                                    },
                                    onConfirm: async () => {
                                      await fetch(
                                        `/api/games/envs/${game.id}/delete/${env.id}`,
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Authorization: String(
                                              getCookie(".frameworksession")
                                            ),
                                          },
                                        }
                                      ).finally(() => {
                                        setEnvs(
                                          envs.filter((e) => e.id !== env.id)
                                        );
                                      });
                                    },
                                  });
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </div>
                      </ShadedCard>
                      <Modal
                        opened={opened}
                        onClose={() => setOpened(false)}
                        title="Edit environment variable"
                      >
                        <form
                          onSubmit={editForm.onSubmit(async (values) => {
                            await fetch(
                              `/api/games/envs/${game.id}/update/${env.id}`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: String(
                                    getCookie(".frameworksession")
                                  ),
                                },
                                body: JSON.stringify({
                                  name: values.name,
                                  value: values.value,
                                  environment: values.environment,
                                }),
                              }
                            ).finally(() => {
                              setEnvs(
                                envs.map((e) => {
                                  if (e.id === env.id) {
                                    return {
                                      ...e,
                                      name: values.name,
                                      value: values.value,
                                      environment: values.environment,
                                      lastUpdated: new Date(),
                                    };
                                  }
                                  return e;
                                })
                              );
                              showNotification({
                                title: "Environment variable updated",
                                message:
                                  "The environment variable has been updated successfully.",
                                icon: <HiCheckCircle />,
                              });
                              setOpened(false);
                            });
                          })}
                        >
                          <Stack spacing={12}>
                            <TextInput
                              label="Name"
                              description="The name of the environment variable."
                              {...editForm.getInputProps("name")}
                            />
                            <TextInput
                              label="Value"
                              description="The value of the environment variable."
                              {...editForm.getInputProps("value")}
                            />
                            <Stack spacing="md" mt="md">
                              {[
                                [
                                  GameEnvironment.PRODUCTION,
                                  "Production",
                                  "The production environment, which is used when your game is live and accessible to the public.",
                                ],
                                [
                                  GameEnvironment.DEVELOPMENT,
                                  "Development",
                                  "The development environment, which is the version served to you through Framework Studio.",
                                ],
                              ].map(([env, name, description]) => (
                                <LabelledRadio
                                  key={env}
                                  label={name}
                                  description={description}
                                  checked={editForm.values.environment === env}
                                  onChange={() => {
                                    editForm.setFieldValue(
                                      "environment",
                                      env as GameEnvironment
                                    );
                                  }}
                                  value={env}
                                />
                              ))}
                            </Stack>
                            <div className="flex justify-end">
                              <Button type="submit" leftIcon={<HiCheck />}>
                                Save
                              </Button>
                            </div>
                          </Stack>
                        </form>
                      </Modal>
                    </>
                  )}
                </Stateful>
              ))
          )}
        </Stack>
      </EditGameTab>
    </>
  );
};

export default EnvironmentVariables;
