import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";

interface CreateChecklistProps {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

interface CreatableChecklist {
  name: string;
  description: string;
}

const CreateChecklist = ({ opened, setOpened }: CreateChecklistProps) => {
  const router = useRouter();
  const createForm = useForm<CreatableChecklist>({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value: any) => {
        if (value.length > 80 || value.length < 3) {
          return "Checklist name must be between 3 and 80 characters";
        }
      },
      description: (value: any) => {
        if (value.length > 500) {
          return "Checklist description must be less than 500 characters";
        }
      },
    },
  });

  const createChecklist = async () => {
    await fetch("/api/users/@me/checklists/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(createForm.values),
    })
      .then(() => {
        router.reload();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Modal
      title="Create checklist"
      opened={opened}
      onClose={() => setOpened(false)}
    >
      <Text mb={16}>
        Create a checklist to keep track of your progress on a project.
      </Text>
      <form onSubmit={createForm.onSubmit(() => createChecklist())}>
        <Stack spacing={12} mb={24}>
          <TextInput
            label="Name"
            description="The name of your checklist"
            {...createForm.getInputProps("name")}
          />
          <TextInput
            label="Description"
            description="The description of your checklist"
            {...createForm.getInputProps("description")}
          />
        </Stack>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateChecklist;
