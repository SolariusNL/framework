import {
  Button,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import Rocket from "@/icons/Rocket";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";

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
    await fetch("/api/checklists/create", {
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
      className={useMantineColorScheme().colorScheme === "dark" ? "dark" : ""}
    >
      <Text mb={16} size="sm" color="dimmed">
        Create a checklist to keep track of your progress on a project.
      </Text>
      <form onSubmit={createForm.onSubmit(() => createChecklist())}>
        <Stack spacing={12} mb={24}>
          <TextInput
            label="Name"
            description="The name of your checklist"
            required
            placeholder="My checklist"
            classNames={BLACK}
            {...createForm.getInputProps("name")}
          />
          <Textarea
            label="Description"
            description="The description of your checklist"
            required
            placeholder="Contains all the tasks I need to complete for this month"
            classNames={BLACK}
            {...createForm.getInputProps("description")}
          />
        </Stack>
        <div className="flex justify-end">
          <Button type="submit" leftIcon={<Rocket />}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChecklist;
