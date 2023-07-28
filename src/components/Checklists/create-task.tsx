import {
  Button,
  Modal,
  MultiSelect,
  Stack,
  Textarea,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { HiCalendar, HiTag } from "react-icons/hi";
import Rocket from "@/icons/Rocket";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";

interface CreateTaskProps {
  opened: boolean;
  checklistId: string;
  setOpened: (opened: boolean) => void;
  existingtags: string[];
}

interface CreatableTask {
  name: string;
  description: string;
  schedule: Date;
  tags: string[];
}

const CreateTask = ({
  opened,
  checklistId,
  setOpened,
  existingtags,
}: CreateTaskProps) => {
  const createTaskForm = useForm<CreatableTask>({
    initialValues: {
      name: "",
      description: "",
      schedule: new Date(new Date().setDate(new Date().getDate() + 1)),
      tags: [],
    },
    validate: {
      name: (value: any) => {
        if (value.length > 80 || value.length < 3) {
          return "Task name must be between 3 and 80 characters";
        }
      },
      description: (value: any) => {
        if (value.length > 1024) {
          return "Task description must be less than 1024 characters";
        }
      },
      tags: (value: any) => value.some((tag: string) => tag.length > 20),
    },
  });
  const router = useRouter();

  const createTask = async () => {
    await fetch(`/api/checklists/${checklistId}/tasks/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(createTaskForm.values),
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
      title="Create task"
      opened={opened}
      onClose={() => setOpened(false)}
      className={useMantineColorScheme().colorScheme === "dark" ? "dark" : ""}
    >
      <form onSubmit={createTaskForm.onSubmit(() => createTask())}>
        <Stack spacing={12} mb={24}>
          <TextInput
            label="Name"
            description="Name of the task"
            classNames={BLACK}
            required
            placeholder="Do something"
            {...createTaskForm.getInputProps("name")}
          />
          <Textarea
            label="Description"
            description="Describe what you want to accomplish"
            classNames={BLACK}
            placeholder="I want to do something, but I don't know what"
            required
            {...createTaskForm.getInputProps("description")}
          />
          <DatePicker
            placeholder="Choose a schedule for this task"
            label="Schedule"
            {...createTaskForm.getInputProps("schedule")}
            description="When do you want this to be done by?"
            dropdownType="modal"
            required
            classNames={BLACK}
            icon={<HiCalendar />}
          />
          <MultiSelect
            label="Tags"
            placeholder="Create tags for this task"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            data={existingtags || []}
            description="Tags are used to categorize tasks and contribute to organization"
            required
            icon={<HiTag />}
            classNames={BLACK}
            {...createTaskForm.getInputProps("tags")}
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

export default CreateTask;
