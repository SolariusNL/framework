import Descriptive from "@/components/descriptive";
import ShadedButton from "@/components/shaded-button";
import Stateful from "@/components/stateful";
import { ChecklistTaskUpdateBody } from "@/pages/api/checklists/[[...params]]";
import clsx from "@/util/clsx";
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
  useMantineTheme,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { ChecklistItem } from "@prisma/client";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import React from "react";
import { HiClock, HiTrash } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

interface ChecklistTaskProps {
  task: ChecklistItem;
  setCurrentChecklist: (checklist: any) => void;
  currentChecklist: any;
  fetchChecklists: () => void;
  display: "cards" | "list";
}

const DueBy = ({
  date,
  editable = false,
  onUpdate,
}: {
  date: Date;
  editable?: boolean;
  onUpdate?: (date: Date) => void;
}) => {
  const { colorScheme, colors } = useMantineTheme();

  return (
    <>
      <Stateful>
        {(editing, setEditing) => (
          <>
            <Modal
              opened={editing}
              onClose={() => setEditing(false)}
              title="Edit due date"
            >
              <Calendar
                minDate={dayjs(new Date()).add(1, "day").toDate()}
                defaultValue={new Date(date).toLocaleDateString()}
                onChange={(date) => {
                  onUpdate && onUpdate(new Date(date as Date));
                  setEditing(false);
                }}
                fullWidth
                size="lg"
              />
            </Modal>
            <Group
              spacing={12}
              sx={{
                ...(editable && {
                  "&:hover": {
                    backgroundColor:
                      colorScheme === "dark" ? colors.dark[5] : colors.gray[1],
                  },
                  width: "fit-content",
                  padding: "0.5rem",
                  cursor: "pointer",
                  borderRadius: 8,
                }),
              }}
              onClick={() => {
                if (editable) {
                  setEditing(true);
                }
              }}
            >
              <HiClock color={colorScheme === "dark" ? "#909296" : "#868e96"} />
              <Tooltip
                label={
                  editable
                    ? "Edit due date"
                    : `Due by ${new Date(date).toLocaleDateString()}`
                }
                position="bottom"
              >
                <Text
                  color={
                    new Date(date).getTime() < new Date().getTime()
                      ? "red"
                      : "dimmed"
                  }
                  size="sm"
                  weight={500}
                >
                  {new Date(date).toLocaleDateString()}
                </Text>
              </Tooltip>
            </Group>
          </>
        )}
      </Stateful>
    </>
  );
};

const ChecklistTask = ({
  task,
  setCurrentChecklist,
  currentChecklist,
  fetchChecklists,
  display = "cards",
}: ChecklistTaskProps) => {
  const [taskState, setTaskState] = React.useState(task);

  const deleteTask = async (id: string) => {
    await fetch(`/api/checklists/${currentChecklist.id}/tasks/${id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then(() => {
        setCurrentChecklist((prev: any) => ({
          ...prev,
          items: prev.items.filter((item: any) => item.id !== id),
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const updateTask = async (id: string, data: ChecklistTaskUpdateBody) => {
    setTaskState((prev) => ({ ...prev, ...data }));
    await fetch(`/api/checklists/${currentChecklist.id}/tasks/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(data),
    }).catch((err) => {
      console.error(err);
    });
  };

  const setTaskCompleted = async (id: string, completed: boolean) => {
    await updateTask(id, { completed });
    setTaskState((prev) => ({ ...prev, completed }));
  };

  const updateDescription = async (id: string, description: string) => {
    await updateTask(id, { description });
    setTaskState((prev) => ({ ...prev, description }));
  };

  const updateScheduledFor = async (id: string, scheduledFor: Date) => {
    await updateTask(id, { scheduled: scheduledFor });
    setTaskState((prev) => ({ ...prev, scheduled: scheduledFor }));
  };

  const checkboxRef = React.useRef<HTMLInputElement>(null);

  return (
    <Stateful>
      {(state, setState) => (
        <>
          <ReactNoSSR onSSR={<Skeleton height={500} />}>
            <Modal
              opened={state}
              onClose={() => setState(false)}
              title="Edit Checklist"
            >
              <Title
                order={3}
                {...(taskState.completed && {
                  sx: {
                    textDecoration: taskState.completed
                      ? "line-through"
                      : "none",
                  },
                })}
              >
                {taskState.name}
              </Title>
              <Divider mt={25} mb={25} />
              <Text weight={500} color="dimmed" mb={8}>
                Description
              </Text>
              <Stateful>
                {(state, setState) =>
                  state ? (
                    <>
                      <Stateful initialState={taskState.description}>
                        {(description, setDescription) => (
                          <>
                            <Textarea
                              defaultValue={description}
                              mb={12}
                              description="Editing description"
                              onChange={(e) =>
                                setDescription(e.currentTarget.value)
                              }
                            />
                            <Button
                              onClick={async () => {
                                await updateDescription(
                                  taskState.id,
                                  description
                                );

                                setState(false);
                              }}
                            >
                              Save
                            </Button>
                          </>
                        )}
                      </Stateful>
                    </>
                  ) : (
                    <Text
                      onClick={() => setState(true)}
                      sx={{
                        cursor: "pointer",
                      }}
                    >
                      {taskState.description}
                    </Text>
                  )
                }
              </Stateful>
              <Text weight={500} color="dimmed" mb={8} mt={18}>
                Tags
              </Text>
              <Group spacing={6}>
                {taskState.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </Group>
              {taskState.scheduled && (
                <>
                  <Text weight={500} color="dimmed" mb={8} mt={18}>
                    Due Date
                  </Text>
                  <DueBy
                    date={taskState.scheduled}
                    editable
                    onUpdate={(newDate) =>
                      updateScheduledFor(taskState.id, newDate)
                    }
                  />
                </>
              )}
              <Stateful>
                {(repeat, setRepeat) => (
                  <Button
                    color="red"
                    mt={18}
                    leftIcon={<HiTrash />}
                    onClick={() => {
                      if (repeat) {
                        deleteTask(taskState.id);
                      } else {
                        setRepeat(true);
                      }
                    }}
                    fullWidth
                  >
                    {repeat ? "Are you sure?" : "Delete"}
                  </Button>
                )}
              </Stateful>
            </Modal>
          </ReactNoSSR>

          <ShadedButton
            className={clsx(
              "h-fit flex flex-col",
              task.completed && "opacity-50"
            )}
            key={taskState.id}
            onClick={() => {
              if (checkboxRef.current?.contains(document.activeElement)) {
                return;
              }
              setState(true);
            }}
          >
            <Descriptive
              title={taskState.name}
              description={
                <span className="line-clamp-2">{taskState.description}</span>
              }
            >
              <Checkbox
                label="Completed"
                checked={taskState.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  taskState.completed = e.target.checked;
                  setCurrentChecklist({
                    ...currentChecklist,
                  });
                  setTaskCompleted(taskState.id, e.target.checked);
                }}
                ref={checkboxRef}
              />
            </Descriptive>
            <Group mt={12}>
              {taskState.scheduled && <DueBy date={taskState.scheduled} />}
              {taskState.tags && (
                <Group spacing={12}>
                  {taskState.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </Group>
              )}
            </Group>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: taskState.completed ? 1 : 0,
                height: taskState.completed ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: taskState.completed ? 12 : 0,
                width: "100%",
              }}
              className="relative"
            >
              <Button
                fullWidth
                color="red"
                onClick={(e: any) => {
                  e.stopPropagation();
                  deleteTask(taskState.id);
                }}
                leftIcon={<HiTrash />}
              >
                Delete
              </Button>
            </motion.div>
          </ShadedButton>
        </>
      )}
    </Stateful>
  );
};

export default ChecklistTask;
