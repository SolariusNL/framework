import {
  Badge,
  Button,
  Checkbox,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { ChecklistItem } from "@prisma/client";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import { HiClock } from "react-icons/hi";
import Descriptive from "../Descriptive";

interface ChecklistTaskProps {
  task: ChecklistItem;
  setCurrentChecklist: (checklist: any) => void;
  currentChecklist: any;
  fetchChecklists: () => void;
}

const ChecklistTask = ({
  task,
  setCurrentChecklist,
  currentChecklist,
  fetchChecklists,
}: ChecklistTaskProps) => {
  const { colorScheme } = useMantineTheme();

  const deleteTask = async (id: string) => {
    await fetch(
      `/api/users/@me/checklists/${currentChecklist.id}/tasks/${id}/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then(() => {
        fetchChecklists();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const setTaskCompleted = async (id: string, completed: boolean) => {
    await fetch(
      `/api/users/@me/checklists/${currentChecklist.id}/tasks/${id}/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
        body: JSON.stringify({
          finished: completed,
        }),
      }
    ).catch((err) => {
      console.error(err);
    });
  };

  return (
    <UnstyledButton
      sx={(theme) => ({
        borderRadius: theme.radius.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
        width: "33%",
        padding: "12px",
        opacity: task.completed ? 0.5 : 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      })}
      key={task.id}
    >
      <Descriptive title={task.name} description={task.description}>
        <Checkbox
          label="Completed"
          checked={task.completed}
          onChange={(e) => {
            task.completed = e.target.checked;
            setCurrentChecklist({
              ...currentChecklist,
            });
            setTaskCompleted(task.id, e.target.checked);
          }}
        />
      </Descriptive>
      <Group mt={12}>
        {task.scheduled && (
          <Group spacing={12}>
            <HiClock color={colorScheme === "dark" ? "#909296" : "#868e96"} />
            <Tooltip
              label={`Due by ${new Date(task.scheduled).toLocaleDateString()}`}
              position="bottom"
            >
              <Text color="dimmed" size="sm">
                {new Date(task.scheduled).toLocaleDateString()}
              </Text>
            </Tooltip>
          </Group>
        )}
        {task.tags && (
          <Group spacing={12}>
            {task.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </Group>
        )}
      </Group>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: task.completed ? 1 : 0,
          height: task.completed ? "auto" : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: task.completed ? 12 : 0,
        }}
      >
        <Button fullWidth color="red" onClick={() => deleteTask(task.id)}>
          Delete
        </Button>
      </motion.div>
    </UnstyledButton>
  );
};

export default ChecklistTask;
