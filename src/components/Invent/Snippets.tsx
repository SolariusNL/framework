import {
  ActionIcon,
  Button,
  Modal,
  Table,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { HiPencil, HiPlus } from "react-icons/hi";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface SnippetsProps {
  user: User;
}

const Snippets = ({ user }: SnippetsProps) => {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [enteredName, setEnteredName] = React.useState("");
  const [enteredDescription, setEnteredDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const createSnippet = async () => {
    await fetch("/api/snippets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        name: enteredName,
        description: enteredDescription,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push(`/snippets/${res.id}/edit`);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
        setCreateModalOpen(false);
      });
  };

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create snippet"
      >
        <TextInput
          label="Name"
          description="Name of the snippet."
          value={enteredName}
          onChange={(e) => setEnteredName(e.target.value)}
          maxLength={50}
          mb={6}
        />

        <Textarea
          label="Description"
          description="Describe exactly what the snippet does. We recommend documenting every line, which will help others understand what the snippet does."
          value={enteredDescription}
          onChange={(e) => setEnteredDescription(e.target.value)}
          maxLength={500}
          mb={20}
        />

        <Button loading={loading} leftIcon={<HiPlus />} onClick={createSnippet}>
          Continue to code
        </Button>
      </Modal>

      <InventTab
        tabValue="snippets"
        tabTitle="Code Snippets"
        actions={
          <>
            <Button
              leftIcon={<HiPlus />}
              variant="outline"
              onClick={() => setCreateModalOpen(true)}
            >
              Create Code Snippet
            </Button>
          </>
        }
      >
        <Table striped>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {user.snippets.map((snippet) => (
              <tr key={snippet.id}>
                <td>{snippet.name}</td>
                <td>{snippet.description}</td>
                <td>
                  <Tooltip label="Edit snippet">
                    <ActionIcon
                      variant="light"
                      onClick={() =>
                        router.push(`/snippets/${snippet.id}/edit`)
                      }
                      size="md"
                    >
                      <HiPencil />
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

export default Snippets;
