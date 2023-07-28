import ShadedButton from "@/components/shaded-button";
import {
  Anchor,
  Badge,
  Divider,
  Modal,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { EmployeeTask } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";

const TaskCard: React.FC<{
  task: EmployeeTask;
  setTasks: React.Dispatch<React.SetStateAction<EmployeeTask[]>>;
}> = ({ task, setTasks }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Modal title={task.title} opened={open} onClose={() => setOpen(false)}>
        <>
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: task.content }} />
          </TypographyStylesProvider>
          <Divider mt="lg" mb="lg" />
          <div className="flex items-center justify-between">
            <Badge color={task.completed ? "green" : "blue"}>
              {task.completed ? "Completed" : "In Progress"}
            </Badge>
            <Anchor
              onClick={async () => {
                setTasks((tasks) => {
                  return tasks.map((t) => {
                    if (t.id === task.id) {
                      return {
                        ...t,
                        completed: !t.completed,
                      };
                    }
                    return t;
                  });
                });

                await fetch(`/api/employee/my/tasks/${task.id}/update`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: String(getCookie(".frameworksession")),
                  },
                  body: JSON.stringify({ completed: !task.completed }),
                });
              }}
            >
              Mark as {task.completed ? "Incomplete" : "Complete"}
            </Anchor>
          </div>
        </>
      </Modal>
      <ShadedButton onClick={() => setOpen(true)}>
        <div className="flex flex-col w-full">
          <div className="mb-3">
            <Title order={5}>{task.title}</Title>
            <Text size="sm" lineClamp={2} color="dimmed">
              {task.content.replace(/(<([^>]+)>)/gi, "")}
            </Text>
          </div>
          <div className="flex flex-row justify-between">
            <Text size="sm" color="dimmed">
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
            <Badge color={task.completed ? "green" : "blue"}>
              {task.completed ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </div>
      </ShadedButton>
    </>
  );
};

export default TaskCard;
