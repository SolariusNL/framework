import {
  ActionIcon,
  Button,
  Modal,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import React from "react";
import { HiPlus, HiTrash } from "react-icons/hi";
import { GameWithDatastore } from "../../pages/game/[id]/edit";
import ModernEmptyState from "../ModernEmptyState";
import Stateful from "../Stateful";
import EditGameTab from "./EditGameTab";

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
              <th>Name</th>
              <th>Description</th>
              <th>Created at</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {datastores.length > 0 ? (
              datastores.map((datastore) => (
                <tr key={datastore.id}>
                  <td>{datastore.name}</td>
                  <td>{datastore.desc}</td>
                  <td>{new Date(datastore.createdAt).toLocaleString()}</td>
                  <td>
                    <Tooltip label="Coming soon">
                      <ActionIcon color="red" disabled>
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
