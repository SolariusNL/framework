import Descriptive from "@/components/descriptive";
import ModernEmptyState from "@/components/modern-empty-state";
import RichText from "@/components/rich-text";
import UserSelect from "@/components/user-select";
import {
  Button,
  Modal,
  Pagination,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { EmployeeTask } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiPencil } from "react-icons/hi";
import TaskCard from "./task-card";

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<"incomplete" | "complete" | "all">(
    "all"
  );
  const assignTaskForm = useForm<{
    user: number;
    title: string;
    content: string;
  }>({
    initialValues: {
      user: 0,
      title: "",
      content: "",
    },
    validate: {
      user: (value) => {
        if (value === 0) {
          return "You must select a user";
        }
      },
      title: (value) => {
        if (value.length === 0) {
          return "You must provide a title";
        }
      },
      content: (value) => {
        if (value.length === 0) {
          return "You must provide a content";
        }
      },
    },
  });
  const [assignFormOpen, setAssignFormOpen] = useState(false);

  const fetchTasks = async () => {
    await fetch(
      "/api/employee/my/tasks?" +
        new URLSearchParams({
          status,
          page: String(page),
        }).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
        setPages(data.pages);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [page, status]);

  return (
    <>
      <Modal
        title="Assign task"
        opened={assignFormOpen}
        onClose={() => setAssignFormOpen(false)}
      >
        <form
          onSubmit={assignTaskForm.onSubmit(async (values) => {
            await fetch("/api/employee/my/tasks/assign", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: String(getCookie(".frameworksession")),
              },
              body: JSON.stringify(values),
            })
              .then(() => {
                showNotification({
                  title: "Task assigned",
                  message:
                    "The task has been assigned to the provided user successfully",
                  icon: <HiCheckCircle />,
                  color: "green",
                });
              })
              .finally(() => {
                setAssignFormOpen(false);
                fetchTasks();
              });
          })}
        >
          <Stack spacing="md">
            <UserSelect
              onUserSelect={(user) => {
                assignTaskForm.setFieldValue("user", Number(user));
              }}
              placeholder="Choose a user"
              label="User"
              description="Choose a user to assign this task to"
              filter={(_, user) => user.role === "ADMIN"}
              required
            />
            <TextInput
              label="Title"
              placeholder="Task title"
              description="The title of the task, quite self explanatory"
              required
              {...assignTaskForm.getInputProps("title")}
            />
            <Descriptive
              title="Content"
              description="The content of the task, this can be anything you want"
            >
              <RichText
                {...assignTaskForm.getInputProps("content")}
                placeholder="Task content"
                controls={[
                  ["bold", "italic", "underline", "strikethrough"],
                  ["orderedList", "unorderedList"],
                  ["link"],
                  ["code", "blockquote"],
                ]}
              />
            </Descriptive>
          </Stack>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="default"
              onClick={() => {
                setAssignFormOpen(false);
                assignTaskForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Modal>
      <div className="flex md:items-center gap-4 md:gap-8 mb-8 flex-col md:flex-row justify-start">
        <Pagination
          total={pages}
          page={page}
          onChange={(page) => setPage(page)}
          radius="md"
        />
        <Select
          className="flex items-center gap-2"
          label="Status"
          value={status}
          onChange={(value) =>
            setStatus(value as "incomplete" | "complete" | "all")
          }
          data={[
            { label: "All", value: "all" },
            { label: "Incomplete", value: "incomplete" },
            { label: "Complete", value: "complete" },
          ]}
        />
        <div className="flex-1" />
        <Button
          variant="subtle"
          leftIcon={<HiPencil />}
          onClick={() => setAssignFormOpen(true)}
        >
          Assign
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tasks &&
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} setTasks={setTasks} />
          ))}
        {tasks.length === 0 && (
          <div className="col-span-3">
            <ModernEmptyState
              title="No tasks"
              body="You have no tasks with the given query"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
