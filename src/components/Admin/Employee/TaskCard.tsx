import { Badge, Text, Title } from "@mantine/core";
import { EmployeeTask } from "@prisma/client";
import ShadedButton from "../../ShadedButton";

const TaskCard: React.FC<{
  task: EmployeeTask;
}> = ({ task }) => {
  return (
    <ShadedButton>
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
  );
};

export default TaskCard;
