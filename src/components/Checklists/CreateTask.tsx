import { Button, Modal, MultiSelect, Stack, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { useRouter } from "next/router";

interface CreateTaskProps {
  opened: boolean;
  checklistId: string;
  setOpened: (opened: boolean) => void;
}

interface CreatableTask {
  name: string;
  description: string;
  schedule: Date;
  tags: string[];
}

const CreateTask = ({ opened, checklistId, setOpened }: CreateTaskProps) => {
  const createTaskForm = useForm<CreatableTask>({
    initialValues: {
      name: "",
      description: "",
      schedule: new Date(),
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
    await fetch(`/api/users/@me/checklists/${checklistId}/tasks/create`, {
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
    <Modal title="Create task" opened={opened} onClose={() => setOpened(false)}>
      <form onSubmit={createTaskForm.onSubmit(() => createTask())}>
        <Stack spacing={12} mb={24}>
          <TextInput
            label="Name"
            description="Name of the task"
            {...createTaskForm.getInputProps("name")}
          />
          <TextInput
            label="Description"
            description="Describe what you want to accomplish"
            {...createTaskForm.getInputProps("description")}
          />
          <DatePicker
            placeholder="Choose a schedule for this task"
            label="Schedule"
            {...createTaskForm.getInputProps("schedule")}
            description="When do you want this to be done by?"
            dropdownType="modal"
            minDate={dayjs(new Date()).add(1, "day").toDate()}
          />
          <MultiSelect
            label="Tags"
            placeholder="Create tags for this task"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            data={[]}
            {...createTaskForm.getInputProps("tags")}
          />
        </Stack>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateTask;
