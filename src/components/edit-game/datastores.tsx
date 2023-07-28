import Copy from "@/components/copy";
import EditGameTab from "@/components/edit-game/edit-game-tab";
import ModernEmptyState from "@/components/modern-empty-state";
import Stateful from "@/components/stateful";
import { GameWithDatastore } from "@/pages/game/[id]/edit/[edit]";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import {
  ActionIcon,
  Anchor,
  Button,
  Modal,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import React from "react";
import { HiPlus, HiTrash, HiXCircle } from "react-icons/hi";

interface DatastoreProps {
  game: GameWithDatastore;
}

interface DatastoreForm {
  name: string;
  desc: string;
}

const Datastores = ({ game }: DatastoreProps) => {
  const [datastores, setDatastores] = React.useState(game.datastores);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<DatastoreForm>({
    initialValues: {
      name: "",
      desc: "",
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required";
        if (value.length > 64) return "Name must be less than 64 characters";
      },
      desc: (value) => {
        if (!value) return "Description is required";
        if (value.length > 256)
          return "Description must be less than 256 characters";
      },
    },
  });

  return (
    <>
      <EditGameTab value="datastores">
        <Text mb="md">
          Datastores are used to store data for your game. You can use them to
          store player data, leaderboards, and more. You can read more about
          datastores in our{" "}
          <Anchor
            href="https://wiki.solarius.me/docs/cosmic/env"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cosmic documentation
          </Anchor>
          .
        </Text>
        <Stateful>
          {(opened, setOpened) => (
            <>
              <Button
                variant="subtle"
                mb={16}
                leftIcon={<HiPlus />}
                onClick={() => setOpened(true)}
              >
                Create a new datastore
              </Button>

              <Modal
                title="New datastore"
                opened={opened}
                onClose={() => setOpened(false)}
              >
                <Text mb={6}>
                  Datastores, as the name suggests, are used to store data for
                  your game.
                </Text>
                <Text mb={16}>
                  If you would rather want to host your own datastore, you can
                  read more about that in our Cosmic documentation. You are
                  currently creating a datastore on our servers, which is free
                  to use for up to 100MB of data per your 3 allowed datastores.
                </Text>

                <form
                  onSubmit={form.onSubmit(async (values) => {
                    const { name, desc } = values;
                    setLoading(true);

                    await fetch("/api/datastores/new", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: String(getCookie(".frameworksession")),
                      },
                      body: JSON.stringify({
                        name,
                        desc,
                        game: game.id,
                      }),
                    })
                      .then((res) => res.json())
                      .then((res) => {
                        if (!res.success) {
                          alert(res.error || "An error occurred.");
                          return;
                        }

                        setDatastores(datastores.concat(res.datastore));
                        setOpened(false);
                      })
                      .finally(() => setLoading(false));
                  })}
                >
                  <TextInput
                    label="Name"
                    description="What is this datastore for?"
                    mb={6}
                    {...form.getInputProps("name")}
                  />
                  <Textarea
                    label="Description"
                    description="Describe what this datastore is for, what data it stores, etc."
                    mb={16}
                    {...form.getInputProps("desc")}
                  />

                  <Button type="submit" loading={loading}>
                    Create datastore
                  </Button>
                </form>
              </Modal>
            </>
          )}
        </Stateful>

        <Table striped mb={16}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {datastores.length > 0 ? (
              datastores.map((datastore) => (
                <tr key={datastore.id}>
                  <td>
                    <Copy value={datastore.id} />
                  </td>
                  <td>
                    <Tooltip label={datastore.name}>
                      <span className="line-clamp-1 font-semibold">
                        {datastore.name}
                      </span>
                    </Tooltip>
                  </td>
                  <td>
                    <Tooltip label={datastore.desc}>
                      <span className="line-clamp-1 text-dimmed">
                        {datastore.desc}
                      </span>
                    </Tooltip>
                  </td>
                  <td>{new Date(datastore.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Tooltip label="Delete datastore">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() =>
                          openConfirmModal({
                            title: "Are you sure?",
                            labels: { confirm: "Delete", cancel: "Nevermind" },
                            children: (
                              <Stack spacing="sm">
                                <Text size="sm" color="dimmed">
                                  Are you sure you want to delete this
                                  datastore? This action cannot be undone.
                                </Text>
                                <Text size="sm" color="dimmed">
                                  All data in this datastore will be deleted.
                                </Text>
                              </Stack>
                            ),
                            confirmProps: {
                              color: "red",
                              leftIcon: <HiTrash />,
                            },
                            async onConfirm() {
                              await fetchJson<IResponseBase>(
                                "/api/datastores/" + datastore.id + "/delete",
                                {
                                  method: "DELETE",
                                  auth: true,
                                }
                              ).then((res) => {
                                if (!res.success) {
                                  showNotification({
                                    title: "Error",
                                    message: res.message,
                                    icon: <HiXCircle />,
                                    color: "red",
                                  });
                                  return;
                                }

                                setDatastores(
                                  datastores.filter(
                                    (d) => d.id !== datastore.id
                                  )
                                );
                              });
                            },
                          })
                        }
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
                    title="No datastores found"
                    body="Create a new datastore to get started with processing data in your game"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Text color="dimmed" size="sm">
          You cannot view the data in your datastores here. You can use the
          Datastore CLI to view data.
        </Text>
      </EditGameTab>
    </>
  );
};

export default Datastores;
