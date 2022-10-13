import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Skeleton,
  Text,
  Textarea,
  Title,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { ChecklistItem } from "@prisma/client";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import { HiClock } from "react-icons/hi";
import Descriptive from "../Descriptive";
import Stateful from "../Stateful";
import ReactNoSSR from "react-no-ssr";

interface ChecklistTaskProps {
  task: ChecklistItem;
  setCurrentChecklist: (checklist: any) => void;
  currentChecklist: any;
  fetchChecklists: () => void;
  display: "cards" | "list";
}

const DueBy = ({ date }: { date: Date }) => {
  const { colorScheme } = useMantineTheme();
  return (
    <Group spacing={12}>
      <HiClock color={colorScheme === "dark" ? "#909296" : "#868e96"} />
      <Tooltip
        label={`Due by ${new Date(date).toLocaleDateString()}`}
        position="bottom"
      >
        <Text color="dimmed" size="sm">
          {new Date(date).toLocaleDateString()}
        </Text>
      </Tooltip>
    </Group>
  );
};

const ChecklistTask = ({
  task,
  setCurrentChecklist,
  currentChecklist,
  fetchChecklists,
  display = "cards",
}: ChecklistTaskProps) => {
  const deleteTask = async (id: string) => {
    await fetch(`/api/checklists/${currentChecklist.id}/tasks/${id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then(() => {
        fetchChecklists();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const setTaskCompleted = async (id: string, completed: boolean) => {
    await fetch(`/api/checklists/${currentChecklist.id}/tasks/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        finished: completed,
      }),
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <Stateful>
      {(state, setState) => (
        <>
          <ReactNoSSR onSSR={<Skeleton height={500} />}>
            <Modal
              opened={state}
              onClose={() => setState(false)}
              title="Edit Checklist"
              size="lg"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <Title order={3}>{task.name}</Title>
                  <Divider mt={25} mb={25} />
                  <Text weight={500} color="dimmed" mb={8}>
                    Description
                  </Text>
                  <Stateful>
                    {(state, setState) =>
                      state ? (
                        <>
                          <Textarea
                            defaultValue={task.description}
                            mb={12}
                            description="Editing description"
                          />
                          <Button onClick={() => setState(false)}>Save</Button>
                        </>
                      ) : (
                        <Text
                          onClick={() => setState(true)}
                          sx={{
                            cursor: "pointer",
                          }}
                        >
                          {task.description}
                        </Text>
                      )
                    }
                  </Stateful>
                  <Text weight={500} color="dimmed" mb={8} mt={18}>
                    Tags
                  </Text>
                  <Group spacing={6}>
                    {task.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </Group>
                  {task.scheduled && (
                    <>
                      <Text weight={500} color="dimmed" mb={8} mt={18}>
                        Due Date
                      </Text>
                      <DueBy date={task.scheduled} />
                    </>
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <p>Test</p>
                </div>
              </div>
            </Modal>
          </ReactNoSSR>

          <UnstyledButton
            sx={(theme) => ({
              borderRadius: theme.radius.md,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black,

              "&:hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
              width: display === "cards" ? "33%" : "100%",
              padding: "12px",
              opacity: task.completed ? 0.5 : 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            })}
            key={task.id}
            onClick={() => setState(true)}
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
              {task.scheduled && <DueBy date={task.scheduled} />}
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
        </>
      )}
    </Stateful>
  );
};

export default ChecklistTask;
